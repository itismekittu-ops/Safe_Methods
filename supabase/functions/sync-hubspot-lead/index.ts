import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const HUBSPOT_ACCESS_TOKEN = Deno.env.get("HUBSPOT_ACCESS_TOKEN") ?? "";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

interface RequestBody {
  email: string;
}

interface QuoteRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  request_type: string;
  selected_institutions: string[];
  consent_given: boolean;
}

function splitName(fullName: string): { firstname: string; lastname: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstname: "", lastname: "" };
  if (parts.length === 1) return { firstname: parts[0], lastname: "" };
  return { firstname: parts[0], lastname: parts.slice(1).join(" ") };
}

// Ensure custom contact properties exist in HubSpot (idempotent).
// Returns the set of custom property names that are confirmed available.
// If property creation fails (e.g. insufficient permissions), the
// caller will fall back to storing custom data in standard fields.
async function ensureCustomProperties(): Promise<Set<string>> {
  const available = new Set<string>();
  const customProps = [
    {
      name: "request_type",
      label: "Request Type",
      type: "string",
      fieldType: "text",
      groupName: "contactinformation",
    },
    {
      name: "selected_institutions",
      label: "Selected Institutions",
      type: "string",
      fieldType: "textarea",
      groupName: "contactinformation",
    },
  ];

  for (const prop of customProps) {
    try {
      const resp = await fetch("https://api.hubapi.com/crm/v3/properties/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(prop),
      });
      // 200 = created, 409 = already exists — both are success
      if (resp.ok || resp.status === 409) {
        available.add(prop.name);
      }
    } catch {
      // Property creation failed — will fall back to standard fields
    }
  }
  return available;
}

// Search HubSpot for an existing contact by email using the v3 search API.
async function findContactByEmail(email: string): Promise<string | null> {
  const resp = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      filterGroups: [{
        filters: [{
          propertyName: "email",
          operator: "EQ",
          value: email,
        }],
      }],
      properties: ["email"],
      limit: 1,
    }),
  });

  if (!resp.ok) return null;
  const data = await resp.json();
  const contact = data.results?.[0];
  return contact?.id ?? null;
}

// Create a new contact in HubSpot using the v3 API.
async function createContact(properties: Record<string, string>): Promise<{ id: string | null; error: string | null }> {
  const resp = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ properties }),
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    return { id: null, error: `HubSpot create failed (${resp.status}): ${errBody.slice(0, 300)}` };
  }
  const data = await resp.json();
  return { id: data.id ?? null, error: null };
}

// Update an existing contact in HubSpot using the v3 API.
async function updateContact(contactId: string, properties: Record<string, string>): Promise<boolean> {
  const resp = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ properties }),
  });

  return resp.ok;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { email } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!HUBSPOT_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: "HubSpot not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch the latest consented quote request for this email
    const { data: quote, error: fetchError } = await supabase
      .from("quote_requests")
      .select("id, name, email, phone, request_type, selected_institutions, consent_given")
      .eq("email", email.toLowerCase())
      .eq("consent_given", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<QuoteRow>();

    if (fetchError || !quote) {
      return new Response(
        JSON.stringify({ error: "Consented quote request not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // GR-CONSENT-01: double-check consent before sending to external CRM
    if (!quote.consent_given) {
      return new Response(
        JSON.stringify({ error: "Consent not given — not syncing to CRM" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Ensure custom properties exist; fall back to standard fields if not
    const availableProps = await ensureCustomProperties();

    const { firstname, lastname } = splitName(quote.name);

    const properties: Record<string, string> = {
      email: quote.email,
      firstname,
      lastname,
      phone: quote.phone ?? "",
    };

    // Use custom properties if available, otherwise fall back to standard fields
    if (availableProps.has("request_type")) {
      properties.request_type = quote.request_type;
    } else {
      // Map request_type to the standard lifecyclestage or lead_status field
      properties.hs_lead_status = quote.request_type === "loan" ? "NEW" : "OPEN";
    }

    if (availableProps.has("selected_institutions")) {
      properties.selected_institutions = quote.selected_institutions.join(", ");
    } else {
      // Store institutions in the jobtitle field as a fallback
      properties.jobtitle = `Quote: ${quote.selected_institutions.join(", ")}`;
    }

    // Create-or-update: search first, then create or patch
    const existingId = await findContactByEmail(quote.email);

    if (existingId) {
      const updated = await updateContact(existingId, properties);
      return new Response(
        JSON.stringify({
          success: true,
          action: "updated",
          contactId: existingId,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } else {
      const createResult = await createContact(properties);
      return new Response(
        JSON.stringify({
          success: createResult.id !== null,
          action: "created",
          contactId: createResult.id,
          error: createResult.error,
          customPropsUsed: Array.from(availableProps),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch {
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
