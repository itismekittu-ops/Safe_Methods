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

const ZOHO_SMTP_HOST = "smtppro.zoho.in";
const ZOHO_SMTP_PORT = 587;
const ZOHO_SMTP_USER = Deno.env.get("ZOHO_SMTP_USER") ?? "";
const ZOHO_SMTP_PASS = Deno.env.get("ZOHO_SMTP_PASS") ?? "";
const ZOHO_FROM_EMAIL =
  Deno.env.get("ZOHO_FROM_EMAIL") || ZOHO_SMTP_USER || "info@safemethods.org";
const ADMIN_EMAIL = "info@safemethods.org";

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

interface BidPayload {
  token?: unknown;
  _preflight?: unknown;
  proposed_rate?: unknown;
  product_name?: unknown;
  tenure_months?: unknown;
  advisor_notes?: unknown;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: BidPayload = await req.json();

    const token =
      typeof body.token === "string" ? body.token.trim() : "";
    if (!token) {
      return jsonResponse({ error: "Access token is required." }, 400);
    }

    // Look up the bid by its unique access token
    const { data: bid, error: bidError } = await supabase
      .from("consultant_bids")
      .select(
        "id, quote_request_id, consultant_id, bank_id, status, token_expires_at"
      )
      .eq("access_token", token)
      .maybeSingle();

    if (bidError || !bid) {
      return jsonResponse(
        { error: "Invalid or expired access link." },
        404
      );
    }

    if (bid.status !== "pending_consultant_submission") {
      return jsonResponse(
        { error: "This bid has already been submitted or has expired." },
        409
      );
    }

    if (new Date(bid.token_expires_at) < new Date()) {
      await supabase
        .from("consultant_bids")
        .update({ status: "expired" })
        .eq("id", bid.id);
      return jsonResponse({ error: "This access link has expired." }, 410);
    }

    // Preflight: just check the token is valid without submitting
    if (body._preflight === true) {
      return jsonResponse({ valid: true });
    }

    // Validate the submitted fields
    const proposedRate = Number(body.proposed_rate);
    if (
      !Number.isFinite(proposedRate) ||
      proposedRate <= 0 ||
      proposedRate > 99.99
    ) {
      return jsonResponse(
        { error: "Please provide a valid proposed rate (0.01 - 99.99%)." },
        400
      );
    }

    const productName =
      typeof body.product_name === "string"
        ? body.product_name.trim()
        : "";
    if (!productName || productName.length > 200) {
      return jsonResponse(
        { error: "Please provide a valid product name." },
        400
      );
    }

    const tenureMonths =
      body.tenure_months != null ? Number(body.tenure_months) : null;
    if (
      tenureMonths !== null &&
      (!Number.isInteger(tenureMonths) ||
        tenureMonths < 1 ||
        tenureMonths > 600)
    ) {
      return jsonResponse(
        { error: "Please provide a valid tenure in months (1-600)." },
        400
      );
    }

    const advisorNotes =
      typeof body.advisor_notes === "string"
        ? body.advisor_notes.trim().slice(0, 2000)
        : null;

    // Update the bid to pending_admin_review (BR-ROUT-02)
    const { error: updateError } = await supabase
      .from("consultant_bids")
      .update({
        proposed_rate: proposedRate,
        product_name: productName,
        tenure_months: tenureMonths,
        advisor_notes: advisorNotes,
        status: "pending_admin_review",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", bid.id);

    if (updateError) {
      console.error("Bid update failed:", updateError.message);
      return jsonResponse(
        { error: "Failed to submit your bid. Please try again." },
        500
      );
    }

    // Fetch consultant + bank name for the admin alert
    const { data: consultant } = await supabase
      .from("consultants")
      .select("name, banks!inner(name)")
      .eq("id", bid.consultant_id)
      .maybeSingle();

    // Fetch the quote_request reference_id
    const { data: qr } = await supabase
      .from("quote_requests")
      .select("reference_id")
      .eq("id", bid.quote_request_id)
      .maybeSingle();

    const consultantName =
      (consultant as Record<string, unknown>)?.name ?? "A consultant";
    const bankName =
      ((consultant as Record<string, unknown>)?.banks as Record<string, unknown>)?.name ?? "Unknown Bank";
    const refId = (qr as Record<string, unknown>)?.reference_id ?? bid.quote_request_id;

    // Send admin alert (F3-US14)
    const alertSubject = `New Bid Submitted: ${refId} — ${bankName}`;
    const alertHtml = `<!DOCTYPE html>
<html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #0f4c5c;">New Consultant Bid Received</h2>
  <p>A consultant has submitted a rate bid that requires your review.</p>
  <div style="padding: 16px; background: #f4f4f4; border-radius: 8px; margin: 16px 0;">
    <p style="margin: 0;"><strong>Reference:</strong> ${escapeHtml(String(refId))}</p>
    <p style="margin: 8px 0 0;"><strong>Consultant:</strong> ${escapeHtml(String(consultantName))} (${escapeHtml(String(bankName))})</p>
    <p style="margin: 8px 0 0;"><strong>Proposed Rate:</strong> ${proposedRate}%</p>
    <p style="margin: 8px 0 0;"><strong>Product:</strong> ${escapeHtml(productName)}</p>
    ${tenureMonths ? `<p style="margin: 8px 0 0;"><strong>Tenure:</strong> ${tenureMonths} months</p>` : ""}
  </div>
  <p>Please review and approve or reject this bid in the <a href="https://safemethods.org/admin/quotes" style="color: #0f4c5c;">Admin Dashboard</a>.</p>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;"/>
  <p style="font-size: 12px; color: #888;">Safe Methods &mdash; Automated Admin Alert</p>
</body></html>`;

    const alertText = `New Consultant Bid Received

Reference: ${refId}
Consultant: ${consultantName} (${bankName})
Proposed Rate: ${proposedRate}%
Product: ${productName}
${tenureMonths ? `Tenure: ${tenureMonths} months` : ""}

Review at: https://safemethods.org/admin/quotes`;

    await sendEmail(ADMIN_EMAIL, alertSubject, alertHtml, alertText);

    return jsonResponse({ success: true });
  } catch (err) {
    console.error("submit-consultant-bid error:", (err as Error).message);
    return jsonResponse(
      { error: "Something went wrong. Please try again." },
      500
    );
  }
});
