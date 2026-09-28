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
  requestType?: string;
  message?: string;
  quote_id?: string;
  reference_id?: string;
  loan_amount?: number | null;
  loanAmount?: number | null;
  monthly_income?: number | null;
  monthlyIncome?: number | null;
  investment_amount?: number | null;
  investmentAmount?: number | null;
  tenure?: string | null;
  property_value?: number | null;
  propertyValue?: number | null;
  down_payment?: number | null;
  downPayment?: number | null;
  combined_monthly_debt?: number | null;
  combinedMonthlyDebt?: number | null;
  selected_institutions?: string[] | string;
  selectedInstitutions?: string[] | string;
}

function splitName(fullName: string): { firstname: string; lastname: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstname: "", lastname: "" };
  if (parts.length === 1) return { firstname: parts[0], lastname: "" };
  return { firstname: parts[0], lastname: parts.slice(1).join(" ") };
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

async function createContact(properties: Record<string, string>): Promise<{ id: string | null; ok: boolean; status: number }> {
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
    console.error(`HubSpot contact create failed (${resp.status}): ${errBody.slice(0, 500)}`);
    return { id: null, ok: false, status: resp.status };
  }
  const data = await resp.json();
  return { id: data.id ?? null, ok: true, status: resp.status };
}

async function updateContact(contactId: string, properties: Record<string, string>): Promise<number> {
  const resp = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ properties }),
  });
  if (!resp.ok) {
    const errBody = await resp.text();
    console.error(`HubSpot contact update failed (${resp.status}) for ${contactId}: ${errBody.slice(0, 500)}`);
  }
  return resp.status;
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
    let requestType = body.request_type || body.requestType || "general_inquiry";
    let institutions = normalizeInstitutions(body.selected_institutions || body.selectedInstitutions);
    let loanAmount = body.loan_amount || body.loanAmount;
    let monthlyIncome = body.monthly_income || body.monthlyIncome;
    let investmentAmount = body.investment_amount || body.investmentAmount;
    let propertyValue = body.property_value || body.propertyValue;
    let downPayment = body.down_payment || body.downPayment;
    let combinedMonthlyDebt = body.combined_monthly_debt || body.combinedMonthlyDebt;
    const quoteId = typeof body.quote_id === "string" ? body.quote_id : "";
    const referenceId = typeof body.reference_id === "string" ? body.reference_id : "";
    const messageText = typeof body.message === "string" ? body.message : "";
    let tenure = body.tenure || null;

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
        requestType = requestType !== "general_inquiry" ? requestType : (quote.request_type ?? requestType);
        institutions = institutions || (Array.isArray(quote.selected_institutions) ? quote.selected_institutions.join(", ") : "");
        loanAmount = loanAmount || quote.loan_amount || null;
        monthlyIncome = monthlyIncome || quote.monthly_income || null;
        investmentAmount = investmentAmount || quote.investment_amount || null;
        propertyValue = propertyValue || quote.property_value || null;
        downPayment = downPayment || quote.down_payment || null;
        combinedMonthlyDebt = combinedMonthlyDebt || quote.combined_monthly_debt || null;
      }
    }

    if (!contactName) {
      return accepted();
    }

    const { firstname, lastname } = splitName(contactName);

    // Populate contact properties that exist in the HubSpot layout.
    // Custom fields like request_type / loan_amount / etc. may or may not
    // be pre-configured in HubSpot Settings — if a 400 comes back we retry
    // with only the guaranteed-standard fields as a fallback.
    const properties: Record<string, string> = {
      email,
      firstname: firstname || contactName || "Lead",
      lastname: lastname || "",
      phone: phone || "",
    };

    if (requestType) properties.request_type = String(requestType).toLowerCase();
    if (loanAmount != null) properties.loan_amount = String(loanAmount);
    if (monthlyIncome != null) properties.monthly_income = String(monthlyIncome);
    if (investmentAmount != null) properties.investment_amount = String(investmentAmount);
    if (institutions) properties.requested_institutions = String(institutions);

    const standardFallback: Record<string, string> = {
      firstname: firstname || contactName || "Lead",
      lastname: lastname || "",
      phone: phone || "",
    };

    const existingId = await findContactByEmail(email);
    let contactId: string | null = null;

    if (existingId) {
      contactId = existingId;
      const updateStatus = await updateContact(existingId, properties);
      if (updateStatus >= 400) {
        console.error(`HubSpot contact update failed (${updateStatus}), retrying with standard fields only`);
        await updateContact(existingId, standardFallback);
      }
    } else {
      const createResult = await createContact(properties);
      if (!createResult.ok) {
        console.error(`HubSpot contact creation failed (${createResult.status}), retrying with standard fields only`);
        const fallback = await createContact({ email, firstname: firstname || "Lead", lastname: lastname || "", phone: phone || "" });
        if (fallback.ok && fallback.id) {
          contactId = fallback.id;
        } else {
          console.error("HubSpot fallback contact creation also failed");
        }
      } else {
        contactId = createResult.id;
      }
    }

    if (contactId) {
      const noteLines = [
        `\u{1F4DD} Safe Methods Quote Request: ${String(requestType).toUpperCase()}`,
        `Reference ID: ${referenceId || quoteId || "N/A"}`,
        requestType === "mortgage"
          ? `\u2022 Property Value: ${propertyValue ? Number(propertyValue).toLocaleString() : "N/A"}\n\u2022 Down Payment: ${downPayment ? Number(downPayment).toLocaleString() : "N/A"}\n\u2022 Combined Monthly Debt: ${combinedMonthlyDebt ? Number(combinedMonthlyDebt).toLocaleString() : "N/A"}`
          : "",
        requestType === "loan"
          ? `\u2022 Loan Amount: ${loanAmount ? Number(loanAmount).toLocaleString() : "N/A"}\n\u2022 Monthly Income: ${monthlyIncome ? Number(monthlyIncome).toLocaleString() : "N/A"}`
          : "",
        requestType === "investment"
          ? `\u2022 Investment Amount: ${investmentAmount ? Number(investmentAmount).toLocaleString() : "N/A"}\n\u2022 Term: ${tenure ?? "N/A"}`
          : "",
        `\u2022 Selected Institutions: ${institutions || "None"}`,
        `\u2022 Submitted At: ${new Date().toISOString()}`,
      ].filter(Boolean);
      const noteContent = noteLines.join("\n");

      try {
        const noteResp = await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            properties: {
              hs_timestamp: new Date().toISOString(),
              hs_note_body: noteContent,
            },
            associations: [
              {
                to: { id: contactId },
                types: [
                  {
                    associationCategory: "HUBSPOT_DEFINED",
                    associationTypeId: 202,
                  },
                ],
              },
            ],
          }),
        });
        if (!noteResp.ok) {
          const noteErrBody = await noteResp.text();
          console.error(`HubSpot note creation failed (${noteResp.status}): ${noteErrBody.slice(0, 500)}`);
        }
      } catch (noteErr) {
        console.error("HubSpot note creation failed:", noteErr instanceof Error ? noteErr.message : String(noteErr));
      }
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
