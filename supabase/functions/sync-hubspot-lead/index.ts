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
  monthly_debt_payments?: number | null;
  monthlyDebtPayments?: number | null;
  selected_institutions?: string[] | string;
  selectedInstitutions?: string[] | string;
  attribution?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    initial_referrer?: string;
  };
}

function splitName(fullName: string): { firstname: string; lastname: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstname: "Lead", lastname: "" };
  if (parts.length === 1) return { firstname: parts[0], lastname: "" };
  return { firstname: parts[0], lastname: parts.slice(1).join(" ") };
}

async function findContactByEmail(email: string): Promise<string | null> {
  try {
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
  } catch {
    return null;
  }
}

async function createContact(properties: Record<string, string>): Promise<string | null> {
  try {
    const resp = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ properties }),
    });

    if (resp.ok) {
      const data = await resp.json();
      return data.id ?? null;
    }

    // Fallback: minimal standard properties only
    const fallbackResp = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        properties: {
          email: properties.email,
          firstname: properties.firstname || "Lead",
        },
      }),
    });

    if (fallbackResp.ok) {
      const data = await fallbackResp.json();
      return data.id ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

async function updateContact(contactId: string, properties: Record<string, string>): Promise<void> {
  try {
    await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ properties }),
    });
  } catch (err) {
    console.error("HubSpot update error (ignored to preserve note creation):", err);
  }
}

function normalizeInstitutions(val: string[] | string | undefined | null): string {
  if (Array.isArray(val)) return val.join(", ");
  return val || "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const hasInternalSecret = secretMatches(req.headers.get("x-internal-secret") ?? "");
  const authHeader = req.headers.get("authorization") ?? "";
  const hasServiceAuth = authHeader.includes(SERVICE_ROLE_KEY);

  if (!hasInternalSecret && !hasServiceAuth && !authHeader) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const body: RequestBody = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !HUBSPOT_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Missing email or HubSpot not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let contactName = typeof body.name === "string" ? body.name.trim() : "";
    let phone = typeof body.phone === "string" ? body.phone : "";
    let requestType = (body.request_type || body.requestType || "general_inquiry").toLowerCase();
    let institutions = normalizeInstitutions(body.selected_institutions || body.selectedInstitutions);
    let loanAmount = body.loan_amount || body.loanAmount;
    let monthlyIncome = body.monthly_income || body.monthlyIncome;
    let investmentAmount = body.investment_amount || body.investmentAmount;
    let propertyValue = body.property_value || body.propertyValue;
    let downPayment = body.down_payment || body.downPayment;
    let combinedMonthlyDebt = body.combined_monthly_debt || body.combinedMonthlyDebt;
    let monthlyDebtPayments = body.monthly_debt_payments || body.monthlyDebtPayments;
    const quoteId = typeof body.quote_id === "string" ? body.quote_id : "";
    const referenceId = typeof body.reference_id === "string" ? body.reference_id : "";
    let tenure = body.tenure || null;
    const attribution = body.attribution ?? {};

    // Database lookup fallback if contactName was not passed
    if (!contactName) {
      const { data: quote } = await supabase
        .from("quote_requests")
        .select("id, name, phone, request_type, selected_institutions, loan_amount, monthly_income, investment_amount, property_value, down_payment, combined_monthly_debt, monthly_debt_payments, consent_given")
        .eq("email", email)
        .eq("consent_given", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (quote && quote.consent_given) {
        contactName = quote.name ?? "";
        phone = phone || (quote.phone ?? "");
        requestType = requestType !== "general_inquiry" ? requestType : (quote.request_type?.toLowerCase() ?? requestType);
        institutions = institutions || (Array.isArray(quote.selected_institutions) ? quote.selected_institutions.join(", ") : "");
        loanAmount = loanAmount || quote.loan_amount || null;
        monthlyIncome = monthlyIncome || quote.monthly_income || null;
        investmentAmount = investmentAmount || quote.investment_amount || null;
        propertyValue = propertyValue || quote.property_value || null;
        downPayment = downPayment || quote.down_payment || null;
        combinedMonthlyDebt = combinedMonthlyDebt || quote.combined_monthly_debt || null;
        monthlyDebtPayments = monthlyDebtPayments || quote.monthly_debt_payments || null;
      }
    }

    const { firstname, lastname } = splitName(contactName);

    // Build contact properties payload
    const properties: Record<string, string> = {
      email,
      firstname,
      lastname,
      phone,
    };

    if (requestType && requestType !== "general_inquiry") {
      properties.request_type = requestType;
    }
    if (loanAmount != null) properties.loan_amount = String(loanAmount);
    if (monthlyIncome != null) properties.monthly_income = String(monthlyIncome);
    if (investmentAmount != null) properties.investment_amount = String(investmentAmount);
    if (institutions) properties.requested_institutions = institutions;
    if (attribution.utm_source) properties.utm_source = attribution.utm_source;
    if (attribution.utm_medium) properties.utm_medium = attribution.utm_medium;
    if (attribution.utm_campaign) properties.utm_campaign = attribution.utm_campaign;
    if (attribution.initial_referrer) properties.initial_referrer = attribution.initial_referrer;

    // 1. Resolve Contact ID (Existing vs New)
    const existingId = await findContactByEmail(email);
    let contactId: string | null = null;

    if (existingId) {
      contactId = existingId;
      await updateContact(existingId, properties);
    } else {
      contactId = await createContact(properties);
    }

    // 2. Timeline Engagement Note Creation (Independent & Decoupled)
    if (contactId) {
      const noteLines = [
        `📝 Safe Methods Quote Request: ${requestType.toUpperCase()}`,
        `Reference ID: ${referenceId || quoteId || "N/A"}`,
        requestType === "mortgage"
          ? `• Property Value: ${propertyValue ? Number(propertyValue).toLocaleString() : "N/A"}\n• Down Payment: ${downPayment ? Number(downPayment).toLocaleString() : "N/A"}\n• Total Monthly Income: ${monthlyIncome ? Number(monthlyIncome).toLocaleString() : "N/A"}\n• Monthly Debt Payments: ${monthlyDebtPayments ? Number(monthlyDebtPayments).toLocaleString() : "N/A"}`
          : "",
        requestType === "loan"
          ? `• Loan Amount: $${loanAmount ? Number(loanAmount).toLocaleString() : "N/A"}\n• Monthly Income: $${monthlyIncome ? Number(monthlyIncome).toLocaleString() : "N/A"}`
          : "",
        requestType === "investment"
          ? `• Investment Amount: $${investmentAmount ? Number(investmentAmount).toLocaleString() : "N/A"}\n• Term: ${tenure ?? "N/A"}`
          : "",
        `• Selected Institutions: ${institutions || "None"}`,
        `• Submitted At: ${new Date().toISOString()}`,
        "",
        "Marketing Attribution:",
        `• utm_source: ${attribution.utm_source || "N/A"}`,
        `• utm_medium: ${attribution.utm_medium || "N/A"}`,
        `• utm_campaign: ${attribution.utm_campaign || "N/A"}`,
        `• initial_referrer: ${attribution.initial_referrer || "N/A"}`,
      ].filter(Boolean);

      const noteResp = await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            hs_timestamp: new Date().toISOString(),
            hs_note_body: noteLines.join("\n"),
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
        console.error("HubSpot note creation failed:", await noteResp.text());
      }
    }

    return new Response(
      JSON.stringify({ success: true, contactId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("sync-hubspot-lead error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});