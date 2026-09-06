import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import nodemailer from "npm:nodemailer@6.9.14";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const INTERNAL_SECRET =
  Deno.env.get("INTERNAL_FUNCTION_SECRET") || SERVICE_ROLE_KEY;
const ADMIN_EMAILS = ["info@safemethods.org"];

const ZOHO_SMTP_HOST = "smtppro.zoho.in";
const ZOHO_SMTP_PORT = 587;
const ZOHO_SMTP_USER = Deno.env.get("ZOHO_SMTP_USER") ?? "";
const ZOHO_SMTP_PASS = Deno.env.get("ZOHO_SMTP_PASS") ?? "";
const ZOHO_FROM_EMAIL =
  Deno.env.get("ZOHO_FROM_EMAIL") || ZOHO_SMTP_USER || "info@safemethods.org";
const SITE_URL = Deno.env.get("SITE_URL") || "https://safemethods.org";
const HUBSPOT_ACCESS_TOKEN = Deno.env.get("HUBSPOT_ACCESS_TOKEN") ?? "";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const smtpTransport =
  ZOHO_SMTP_USER && ZOHO_SMTP_PASS
    ? nodemailer.createTransport({
        host: ZOHO_SMTP_HOST,
        port: ZOHO_SMTP_PORT,
        secure: false,
        auth: { user: ZOHO_SMTP_USER, pass: ZOHO_SMTP_PASS },
      })
    : null;

function secretMatches(presented: string): boolean {
  if (!INTERNAL_SECRET || presented.length !== INTERNAL_SECRET.length)
    return false;
  let diff = 0;
  for (let i = 0; i < INTERNAL_SECRET.length; i++) {
    diff |= presented.charCodeAt(i) ^ INTERNAL_SECRET.charCodeAt(i);
  }
  return diff === 0;
}

async function verifyAdminOrService(req: Request): Promise<boolean> {
  const authHeader = req.headers.get("Authorization") ?? "";
  const internalHeader = req.headers.get("x-internal-secret") ?? "";

  if (authHeader === `Bearer ${SERVICE_ROLE_KEY}`) return true;
  if (secretMatches(internalHeader)) return true;

  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    const authClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    const {
      data: { user },
      error,
    } = await authClient.auth.getUser(token);
    if (!error && user && ADMIN_EMAILS.includes(user.email ?? "")) {
      return true;
    }
  }

  return false;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<boolean> {
  if (smtpTransport) {
    try {
      await smtpTransport.sendMail({
        from: ZOHO_FROM_EMAIL,
        to,
        subject,
        html,
        text,
      });
      return true;
    } catch (err) {
      console.error("SMTP send failed:", (err as Error).message);
    }
  }
  await supabase
    .from("outbound_emails")
    .insert({
      to_email: to,
      subject,
      html_body: html,
      text_body: text,
      status: "pending",
    })
    .then(
      () => {},
      () => {}
    );
  return false;
}

interface ApprovedBid {
  id: string;
  proposed_rate: number;
  product_name: string;
  tenure_months: number | null;
  advisor_notes: string | null;
  consultant_name: string;
  bank_name: string;
}

interface QuoteRequest {
  id: string;
  reference_id: string;
  name: string;
  email: string;
  request_type: string;
  loan_amount: number | null;
  monthly_income: number | null;
  investment_amount: number | null;
  tenure: string | null;
  selected_institutions: string[];
  sla_deadline: string;
}

function buildOfferSheetHtml(
  qr: QuoteRequest,
  bids: ApprovedBid[]
): string {
  const safeName = escapeHtml(qr.name);
  const isLoan = qr.request_type === "loan";

  const bidRows = bids
    .map(
      (b) => `
    <tr>
      <td style="padding: 12px; border: 1px solid #e0e0e0; font-weight: 600;">${escapeHtml(b.bank_name)}</td>
      <td style="padding: 12px; border: 1px solid #e0e0e0;">${escapeHtml(b.consultant_name)}</td>
      <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: center; font-weight: 600; color: #0f4c5c;">${b.proposed_rate}%</td>
      <td style="padding: 12px; border: 1px solid #e0e0e0;">${escapeHtml(b.product_name)}</td>
      <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: center;">${b.tenure_months ? `${b.tenure_months} mo` : "&mdash;"}</td>
    </tr>`
    )
    .join("");

  const notesSection = bids
    .filter((b) => b.advisor_notes)
    .map(
      (b) => `
    <div style="margin-bottom: 12px;">
      <p style="margin: 0; font-weight: 600;">${escapeHtml(b.bank_name)} &mdash; ${escapeHtml(b.consultant_name)}</p>
      <p style="margin: 4px 0 0; color: #555;">${escapeHtml(b.advisor_notes!)}</p>
    </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 700px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #0f4c5c; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; margin: 0;">Safe Methods</h1>
  </div>

  <h2 style="color: #0f4c5c;">Your Personalized Offer Comparison</h2>
  <p>Hi ${safeName},</p>
  <p>Great news! Our matched financial advisors have reviewed your ${isLoan ? "loan" : "investment"} request and submitted their competitive offers. Below is your side-by-side comparison:</p>

  <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
    <thead>
      <tr style="background: #0f4c5c; color: #fff;">
        <th style="padding: 12px; text-align: left;">Institution</th>
        <th style="padding: 12px; text-align: left;">Advisor</th>
        <th style="padding: 12px; text-align: center;">Rate</th>
        <th style="padding: 12px; text-align: left;">Product</th>
        <th style="padding: 12px; text-align: center;">Tenure</th>
      </tr>
    </thead>
    <tbody>
      ${bidRows}
    </tbody>
  </table>

  ${
    notesSection
      ? `<h3 style="color: #0f4c5c; margin-top: 24px;">Advisor Notes</h3>${notesSection}`
      : ""
  }

  <div style="padding: 16px; background: #e8f5e9; border-radius: 8px; margin: 24px 0;">
    <p style="margin: 0; font-weight: 600; color: #2e7d32;">What Should You Do Next?</p>
    <p style="margin: 8px 0 0;">Review the offers above and contact the advisor whose terms best fit your needs. You can also schedule a free consultation with our team to discuss your options.</p>
  </div>

  <p style="text-align: center;">
    <a href="${SITE_URL}/contact" style="display: inline-block; padding: 12px 28px; background: #0f4c5c; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600;">Book a Free Consultation</a>
  </p>

  <p style="font-size: 13px; color: #666; margin-top: 24px;">
    <strong>Disclaimer:</strong> Rates shown are as submitted by each institution's advisor and may be subject to final approval, credit assessment, and terms. Safe Methods does not guarantee any specific rate or outcome.
  </p>

  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;"/>
  <p style="font-size: 12px; color: #888;">
    Safe Methods &mdash; Mississauga, Ontario, Canada<br/>
    This email was sent because you requested financial offers through Safe Methods.
  </p>
</body>
</html>`;
}

function buildOfferSheetText(
  qr: QuoteRequest,
  bids: ApprovedBid[]
): string {
  const isLoan = qr.request_type === "loan";

  const bidLines = bids
    .map(
      (b) =>
        `  ${b.bank_name} | ${b.consultant_name} | ${b.proposed_rate}% | ${b.product_name} | ${b.tenure_months ? `${b.tenure_months} mo` : "-"}`
    )
    .join("\n");

  const notesLines = bids
    .filter((b) => b.advisor_notes)
    .map((b) => `${b.bank_name} (${b.consultant_name}): ${b.advisor_notes}`)
    .join("\n\n");

  return `SAFE METHODS - Your Personalized Offer Comparison

Hi ${qr.name},

Our matched financial advisors have reviewed your ${isLoan ? "loan" : "investment"} request. Here are your offers:

  Institution | Advisor | Rate | Product | Tenure
${bidLines}

${notesLines ? `ADVISOR NOTES\n${notesLines}\n` : ""}
WHAT SHOULD YOU DO NEXT?
Review the offers and contact the advisor whose terms best fit your needs.
Book a free consultation: ${SITE_URL}/contact

Disclaimer: Rates shown are as submitted by each institution's advisor and may be subject to final approval, credit assessment, and terms.

---
Safe Methods - Mississauga, Ontario, Canada`;
}

async function logDispatchToHubSpot(
  email: string,
  bids: ApprovedBid[]
): Promise<void> {
  if (!HUBSPOT_ACCESS_TOKEN) return;

  try {
    // Find the HubSpot contact by email
    const searchResp = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts/search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                { propertyName: "email", operator: "EQ", value: email },
              ],
            },
          ],
          properties: ["email"],
          limit: 1,
        }),
      }
    );

    if (!searchResp.ok) {
      console.warn(
        `HubSpot contact search failed (${searchResp.status})`
      );
      return;
    }

    const searchData = await searchResp.json();
    const contactId: string | undefined =
      searchData.results?.[0]?.id;

    if (!contactId) {
      console.warn(
        `HubSpot contact not found for ${email}, skipping note`
      );
      return;
    }

    // Build the note body
    const bidLines = bids
      .map(
        (b) =>
          `- ${b.bank_name} (${b.consultant_name}): ${b.proposed_rate}%${b.tenure_months ? ` (${b.tenure_months} mo)` : ""}`
      )
      .join("\n");

    const noteBody =
      `Dispatched Offer Comparison:\n${bidLines}\nStatus: Sent to customer via Zoho SMTP`;

    // Create the note
    const noteResp = await fetch(
      "https://api.hubapi.com/crm/v3/objects/notes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          properties: {
            hs_note_body: noteBody,
            hs_timestamp: new Date().toISOString(),
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
      }
    );

    if (!noteResp.ok) {
      const errText = await noteResp.text().catch(() => "");
      console.warn(
        `HubSpot note creation failed (${noteResp.status}): ${errText.slice(0, 300)}`
      );
    }
  } catch (err) {
    console.warn(
      "HubSpot engagement logging failed:",
      (err as Error).message
    );
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const authorized = await verifyAdminOrService(req);
  if (!authorized) {
    return jsonResponse({ error: "Not found" }, 404);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const targetId =
      body.quote_request_id ||
      body.quoteRequestId ||
      body.id ||
      body.reference_id;
    const force = body.force === true;

    // Resolve the quote request by UUID or reference_id
    let qr: Record<string, unknown> | null = null;
    let qrError: unknown = null;

    if (targetId) {
      const isRefId =
        typeof targetId === "string" && targetId.startsWith("SM-");
      const column = isRefId ? "reference_id" : "id";

      const result = await supabase
        .from("quote_requests")
        .select(
          "id, reference_id, name, email, request_type, loan_amount, monthly_income, investment_amount, tenure, selected_institutions, sla_deadline, aggregated_quotes_sent"
        )
        .eq(column, targetId)
        .maybeSingle();

      qr = result.data;
      qrError = result.error;
    } else {
      const result = await supabase
        .from("quote_requests")
        .select(
          "id, reference_id, name, email, request_type, loan_amount, monthly_income, investment_amount, tenure, selected_institutions, sla_deadline, aggregated_quotes_sent"
        )
        .eq("aggregated_quotes_sent", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      qr = result.data;
      qrError = result.error;
    }

    if (qrError || !qr) {
      return jsonResponse({ error: "Quote request not found." }, 404);
    }

    if (qr.aggregated_quotes_sent) {
      return jsonResponse(
        {
          error:
            "Aggregated quotes have already been sent for this request.",
        },
        409
      );
    }

    const quoteRequestId = qr.id as string;

    // Fetch all bids for this quote request
    const { data: allBids } = await supabase
      .from("consultant_bids")
      .select(
        "id, status, proposed_rate, product_name, tenure_months, advisor_notes, consultant_id, bank_id"
      )
      .eq("quote_request_id", quoteRequestId);

    if (!allBids || allBids.length === 0) {
      return jsonResponse(
        { error: "No bids found for this request." },
        404
      );
    }

    const approvedBids = allBids.filter(
      (b) => b.status === "approved"
    );
    const pendingBids = allBids.filter(
      (b) => b.status === "pending_consultant_submission"
    );
    const allApproved =
      approvedBids.length === allBids.length && approvedBids.length > 0;
    const slaExpired =
      qr.sla_deadline &&
      new Date(qr.sla_deadline as string) <= new Date();

    const shouldDispatch = force || allApproved || slaExpired;

    if (!shouldDispatch) {
      return jsonResponse(
        {
          error:
            "Not ready to dispatch. Not all bids are approved and the SLA deadline has not passed.",
          approved: approvedBids.length,
          total: allBids.length,
          sla_deadline: qr.sla_deadline,
        },
        400
      );
    }

    // Expire any pending bids (BR-ROUT-04)
    if (pendingBids.length > 0) {
      await supabase
        .from("consultant_bids")
        .update({ status: "expired" })
        .in(
          "id",
          pendingBids.map((b) => b.id)
        );
    }

    // Also expire pending_admin_review bids when force-dispatching
    if (slaExpired || force) {
      const reviewBids = allBids.filter(
        (b) => b.status === "pending_admin_review"
      );
      if (reviewBids.length > 0) {
        await supabase
          .from("consultant_bids")
          .update({ status: "expired" })
          .in(
            "id",
            reviewBids.map((b) => b.id)
          );
      }
    }

    if (approvedBids.length === 0) {
      await supabase
        .from("quote_requests")
        .update({
          aggregated_quotes_sent: true,
          aggregated_quotes_sent_at: new Date().toISOString(),
        })
        .eq("id", quoteRequestId);

      return jsonResponse({
        success: true,
        message:
          "No approved bids to send. Quote request marked as complete.",
        dispatched: 0,
      });
    }

    // Enrich approved bids with consultant/bank names
    const enrichedBids: ApprovedBid[] = [];
    for (const bid of approvedBids) {
      const { data: c } = await supabase
        .from("consultants")
        .select("name, banks!inner(name)")
        .eq("id", bid.consultant_id)
        .maybeSingle();

      enrichedBids.push({
        id: bid.id,
        proposed_rate: bid.proposed_rate,
        product_name: bid.product_name,
        tenure_months: bid.tenure_months,
        advisor_notes: bid.advisor_notes,
        consultant_name:
          ((c as Record<string, unknown>)?.name as string) ?? "Advisor",
        bank_name:
          (
            (c as Record<string, unknown>)?.banks as Record<
              string,
              unknown
            >
          )?.name as string ?? "Institution",
      });
    }

    // Sort by rate: lowest first for loans, highest first for investments
    if (qr.request_type === "loan") {
      enrichedBids.sort((a, b) => a.proposed_rate - b.proposed_rate);
    } else {
      enrichedBids.sort((a, b) => b.proposed_rate - a.proposed_rate);
    }

    // Build and send the consolidated offer sheet (BR-ROUT-03)
    const html = buildOfferSheetHtml(
      qr as unknown as QuoteRequest,
      enrichedBids
    );
    const text = buildOfferSheetText(
      qr as unknown as QuoteRequest,
      enrichedBids
    );
    const subject = "Your Safe Methods Offer Comparison Is Ready";

    await sendEmail(qr.email as string, subject, html, text);

    // Mark the quote request as dispatched
    await supabase
      .from("quote_requests")
      .update({
        aggregated_quotes_sent: true,
        aggregated_quotes_sent_at: new Date().toISOString(),
      })
      .eq("id", quoteRequestId);

    // Log the dispatched offers to HubSpot as an engagement note
    await logDispatchToHubSpot(qr.email as string, enrichedBids);

    return jsonResponse({
      success: true,
      dispatched: enrichedBids.length,
    });
  } catch (err) {
    console.error(
      "dispatch-aggregated-quotes error:",
      (err as Error).message
    );
    return jsonResponse(
      { error: "Something went wrong. Please try again." },
      500
    );
  }
});
