import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, x-internal-secret",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const HUBSPOT_ACCESS_TOKEN = Deno.env.get("HUBSPOT_ACCESS_TOKEN") ?? "";
// Shared secret used only for function-to-function calls. Falls back to the
// service role key, which is server-side only and never shipped to browsers.
const INTERNAL_SECRET = Deno.env.get("INTERNAL_FUNCTION_SECRET") || SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Constant-time comparison so the gate cannot be probed byte by byte.
function secretMatches(presented: string): boolean {
  if (!INTERNAL_SECRET) return false;
  const a = new TextEncoder().encode(presented);
  const b = new TextEncoder().encode(INTERNAL_SECRET);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

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
      if (resp.ok || resp.status === 409) {
        available.add(prop.name);
      }
    } catch {
      // Property creation failed — will fall back to standard fields
    }
  }
  return available;
}

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

async function createContact(properties: Record<string, string>): Promise<{ id: string | null; ok: boolean }> {
  const resp = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ properties }),
  });

  if (!resp.ok) {
    // Upstream detail is logged server-side only; it never reaches the caller.
    const errBody = await resp.text();
    console.error(`HubSpot create failed (${resp.status}): ${errBody.slice(0, 300)}`);
    return { id: null, ok: false };
  }
  const data = await resp.json();
  return { id: data.id ?? null, ok: true };
}

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

// Every terminal path returns this identical body, so a caller cannot learn
// from the response whether an address exists or what the CRM did.
function accepted(): Response {
  return new Response(
    JSON.stringify({ accepted: true }),
    { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // This function is only ever called by other edge functions. Anything
  // without the shared secret is answered as if the route did not exist.
  if (!secretMatches(req.headers.get("x-internal-secret") ?? "")) {
    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
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

    const { data: quote, error: fetchError } = await supabase
      .from("quote_requests")
      .select("id, name, email, phone, request_type, selected_institutions, consent_given")
      .eq("email", email.toLowerCase())
      .eq("consent_given", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<QuoteRow>();

    if (fetchError || !quote) {
      return accepted();
    }

    // GR-CONSENT-01: double-check consent before sending to external CRM
    if (!quote.consent_given) {
      return accepted();
    }

    const availableProps = await ensureCustomProperties();

    const { firstname, lastname } = splitName(quote.name);

    const properties: Record<string, string> = {
      email: quote.email,
      firstname,
      lastname,
      phone: quote.phone ?? "",
    };

    if (availableProps.has("request_type")) {
      properties.request_type = quote.request_type;
    } else {
      properties.hs_lead_status = quote.request_type === "loan" ? "NEW" : "OPEN";
    }

    if (availableProps.has("selected_institutions")) {
      properties.selected_institutions = quote.selected_institutions.join(", ");
    } else {
      properties.jobtitle = `Quote: ${quote.selected_institutions.join(", ")}`;
    }

    const existingId = await findContactByEmail(quote.email);

    if (existingId) {
      const updated = await updateContact(existingId, properties);
      if (!updated) console.error("HubSpot update failed for contact", existingId);
    } else {
      const createResult = await createContact(properties);
      if (!createResult.ok) console.error("HubSpot contact creation failed");
    }

    return accepted();
  } catch (err) {
    console.error("sync-hubspot-lead error:", err instanceof Error ? err.message : String(err));
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
