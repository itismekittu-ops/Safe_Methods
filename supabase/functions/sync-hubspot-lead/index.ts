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
const INTERNAL_SECRET = Deno.env.get("INTERNAL_FUNCTION_SECRET") || SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

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
  name?: string;
  phone?: string;
  request_type?: string;
  message?: string;
  quote_id?: string;
  loan_amount?: number | null;
  monthly_income?: number | null;
  investment_amount?: number | null;
  tenure?: string | null;
  selected_institutions?: string[] | string;
}

function splitName(fullName: string): { firstname: string; lastname: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstname: "", lastname: "" };
  if (parts.length === 1) return { firstname: parts[0], lastname: "" };
  return { firstname: parts[0], lastname: parts.slice(1).join(" ") };
}

async function ensureCustomProperties(): Promise<Set<string>> {
  const available = new Set<string>();
  const customProps = [
    { name: "request_type", label: "Request Type", type: "string", fieldType: "text", groupName: "contactinformation" },
    { name: "requested_institutions", label: "Requested Institutions", type: "string", fieldType: "textarea", groupName: "contactinformation" },
    { name: "loan_amount", label: "Loan Amount", type: "string", fieldType: "text", groupName: "contactinformation" },
    { name: "monthly_income", label: "Monthly Income", type: "string", fieldType: "text", groupName: "contactinformation" },
    { name: "investment_amount", label: "Investment Amount", type: "string", fieldType: "text", groupName: "contactinformation" },
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
      // Property creation failed -- fall back to standard fields
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
      filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: email }] }],
      properties: ["email"],
      limit: 1,
    }),
  });

  if (!resp.ok) return null;
  const data = await resp.json();
  return data.results?.[0]?.id ?? null;
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

function accepted(): Response {
  return new Response(
    JSON.stringify({ accepted: true }),
    { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

function normalizeInstitutions(val: string[] | string | undefined | null): string {
  if (Array.isArray(val)) return val.join(", ");
  return val || "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Accept calls from sibling functions (internal secret) OR from the
  // browser contact form (anon key via Authorization header, verified by
  // Supabase gateway). Both are legitimate callers.
  const hasInternalSecret = secretMatches(req.headers.get("x-internal-secret") ?? "");
  const authHeader = req.headers.get("authorization") ?? "";
  const hasServiceAuth = authHeader.includes(SERVICE_ROLE_KEY);

  // If neither internal secret nor any Authorization header is present,
  // treat as unauthenticated. The Supabase gateway already validates the
  // anon key in the Authorization header for browser calls, so we only
  // need to block truly unauthenticated requests here.
  if (!hasInternalSecret && !hasServiceAuth && !authHeader) {
    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const body: RequestBody = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

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

    // Build contact properties from the payload directly.
    // For quote submissions, submit-quote passes all fields inline.
    // For contact form submissions, the browser passes name/email/phone/message.
    // If name is missing, fall back to looking up the most recent quote_request.
    let contactName = typeof body.name === "string" ? body.name.trim() : "";
    let phone = typeof body.phone === "string" ? body.phone : "";
    let requestType = typeof body.request_type === "string" ? body.request_type : "general_inquiry";
    let institutions = normalizeInstitutions(body.selected_institutions);
    let loanAmount = body.loan_amount ? String(body.loan_amount) : "";
    let monthlyIncome = body.monthly_income ? String(body.monthly_income) : "";
    let investmentAmount = body.investment_amount ? String(body.investment_amount) : "";
    const quoteId = typeof body.quote_id === "string" ? body.quote_id : "";
    const messageText = typeof body.message === "string" ? body.message : "";

    // If called with only an email (legacy path), try to enrich from the DB.
    if (!contactName) {
      const { data: quote } = await supabase
        .from("quote_requests")
        .select("id, name, phone, request_type, selected_institutions, loan_amount, monthly_income, investment_amount, consent_given")
        .eq("email", email)
        .eq("consent_given", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (quote && quote.consent_given) {
        contactName = quote.name ?? "";
        phone = phone || (quote.phone ?? "");
        requestType = quote.request_type ?? requestType;
        institutions = institutions || (Array.isArray(quote.selected_institutions) ? quote.selected_institutions.join(", ") : "");
        loanAmount = loanAmount || (quote.loan_amount ? String(quote.loan_amount) : "");
        monthlyIncome = monthlyIncome || (quote.monthly_income ? String(quote.monthly_income) : "");
        investmentAmount = investmentAmount || (quote.investment_amount ? String(quote.investment_amount) : "");
      }
    }

    if (!contactName) {
      return accepted();
    }

    const availableProps = await ensureCustomProperties();
    const { firstname, lastname } = splitName(contactName);

    // Build the message field: for contact inquiries use the actual message,
    // for quote requests build a structured summary.
    let messageValue = messageText;
    if (!messageValue && requestType !== "contact_inquiry") {
      const amt = loanAmount || investmentAmount || "0";
      messageValue = `Quote Request [Ref: ${quoteId || "N/A"}]: ${requestType.toUpperCase()} | Amount: $${amt} | FIs: ${institutions || "None"}`;
    }

    const properties: Record<string, string> = {
      email,
      firstname,
      lastname,
      phone: phone || "",
    };

    if (availableProps.has("request_type")) {
      properties.request_type = requestType || "";
    }
    if (availableProps.has("loan_amount")) {
      properties.loan_amount = loanAmount;
    }
    if (availableProps.has("monthly_income")) {
      properties.monthly_income = monthlyIncome;
    }
    if (availableProps.has("investment_amount")) {
      properties.investment_amount = investmentAmount;
    }
    if (availableProps.has("requested_institutions")) {
      properties.requested_institutions = institutions;
    }

    if (messageValue) {
      properties.message = messageValue;
    }

    const existingId = await findContactByEmail(email);

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
