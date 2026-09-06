import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import nodemailer from "npm:nodemailer@6.9.14";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const INTERNAL_SECRET = Deno.env.get("INTERNAL_FUNCTION_SECRET") || SERVICE_ROLE_KEY;

const ZOHO_SMTP_HOST = "smtppro.zoho.in";
const ZOHO_SMTP_PORT = 587;
const ZOHO_SMTP_USER = Deno.env.get("ZOHO_SMTP_USER") ?? "";
const ZOHO_SMTP_PASS = Deno.env.get("ZOHO_SMTP_PASS") ?? "";
const ZOHO_FROM_EMAIL = Deno.env.get("ZOHO_FROM_EMAIL") || ZOHO_SMTP_USER || "info@safemethods.org";
const SITE_URL = Deno.env.get("SITE_URL") || "https://safemethods.org";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const RESUBMIT_WINDOW_MINUTES = 60;
const MAX_NAME_LENGTH = 120;
const MAX_INSTITUTIONS = 10;
const MAX_AMOUNT = 1_000_000_000;
const SLA_BUSINESS_DAYS = 5;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d\s()+\-]{7,}$/;
const ALLOWED_TENURES = new Set(["1-year", "3-year", "5-year", "10-year"]);

interface RequestBody {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  requestType?: unknown;
  request_type?: unknown;
  loanAmount?: unknown;
  loan_amount?: unknown;
  monthlyIncome?: unknown;
  monthly_income?: unknown;
  investmentAmount?: unknown;
  investment_amount?: unknown;
  tenure?: unknown;
  selectedInstitutions?: unknown;
  selected_institutions?: unknown;
  consent?: unknown;
  sessionToken?: unknown;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function parseAmount(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0 || n > MAX_AMOUNT) return null;
  return n;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function generateReferenceId(): string {
  const year = new Date().getFullYear();
  const hex = crypto.getRandomValues(new Uint8Array(4));
  const hexStr = Array.from(hex).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `SM-${year}-${hexStr}`;
}

function generateAccessToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

const smtpTransport = (ZOHO_SMTP_USER && ZOHO_SMTP_PASS)
  ? nodemailer.createTransport({
      host: ZOHO_SMTP_HOST,
      port: ZOHO_SMTP_PORT,
      secure: false,
      auth: { user: ZOHO_SMTP_USER, pass: ZOHO_SMTP_PASS },
    })
  : null;

async function sendEmailViaSMTP(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<boolean> {
  if (!smtpTransport) return false;

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
    return false;
  }
}

function buildCustomerWelcomeHtml(
  customerName: string,
  requestType: string,
  institutions: string[],
  loanAmount: number | null,
  monthlyIncome: number | null,
  investmentAmount: number | null,
  tenure: string | null,
): string {
  const safeName = escapeHtml(customerName);
  const isLoan = requestType === "loan";
  const instList = institutions.length > 0
    ? escapeHtml(institutions.join(", "))
    : "all recommended institutions";

  const specifics = isLoan
    ? [
        loanAmount != null ? `Loan Amount: $${loanAmount.toLocaleString()}` : null,
        monthlyIncome != null ? `Monthly Income: $${monthlyIncome.toLocaleString()}` : null,
      ].filter(Boolean).join("<br/>")
    : [
        investmentAmount != null ? `Investment Amount: $${investmentAmount.toLocaleString()}` : null,
        tenure ? `Term: ${tenure}` : null,
      ].filter(Boolean).join("<br/>");

  return `<!DOCTYPE html>
<html>
<body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #0f4c5c; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; margin: 0;">Safe Methods</h1>
  </div>

  <h2 style="color: #0f4c5c;">Welcome! Your Quote Request Is Being Processed</h2>
  <p>Hi ${safeName},</p>
  <p>Thank you for choosing Safe Methods to help you find the best financial offers. We have received your submission and our matched advisors at the following institutions have been notified:</p>
  <p style="padding: 12px; background: #f4f4f4; border-radius: 6px;"><strong>${instList}</strong></p>

  <h3 style="color: #0f4c5c; margin-top: 24px;">Your Request Summary</h3>
  <p>
    <strong>Type:</strong> ${isLoan ? "Loan" : "Investment"}<br/>
    ${specifics || ""}
  </p>

  <div style="padding: 16px; background: #e8f5e9; border-radius: 8px; margin: 24px 0;">
    <p style="margin: 0; font-weight: 600; color: #2e7d32;">What Happens Next?</p>
    <p style="margin: 8px 0 0;">You will receive personalized, competitive offers from all selected advisors within <strong>5 business days</strong>. Our team reviews every offer to ensure quality and fairness before presenting them to you.</p>
  </div>

  <h3 style="color: #0f4c5c; margin-top: 24px;">Free Expert Consultation</h3>
  <p>As a Safe Methods client, you are entitled to a complimentary 10&ndash;15 minute consultation with one of our senior financial advisors.</p>
  <p style="text-align: center;">
    <a href="${SITE_URL}/contact" style="display: inline-block; padding: 12px 28px; background: #0f4c5c; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600;">Book Your Free Call</a>
  </p>

  <h3 style="color: #0f4c5c; margin-top: 24px;">While You Wait</h3>
  <p>Explore our latest financial insights:</p>
  <ul>
    <li><a href="${SITE_URL}/blog" style="color: #0f4c5c;">5 Steps to Build an Emergency Fund</a></li>
    <li><a href="${SITE_URL}/blog" style="color: #0f4c5c;">Investing 101 for Beginners</a></li>
    <li><a href="${SITE_URL}/blog" style="color: #0f4c5c;">How to Improve Your Credit Score Fast</a></li>
  </ul>

  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;"/>
  <p style="font-size: 12px; color: #888;">
    Safe Methods &mdash; Mississauga, Ontario, Canada<br/>
    This email was sent because a quote request was submitted with this email address.
  </p>
</body>
</html>`;
}

function buildCustomerWelcomeText(
  customerName: string,
  requestType: string,
  institutions: string[],
  loanAmount: number | null,
  monthlyIncome: number | null,
  investmentAmount: number | null,
  tenure: string | null,
): string {
  const isLoan = requestType === "loan";
  const instList = institutions.length > 0
    ? institutions.join(", ")
    : "all recommended institutions";

  const specifics = isLoan
    ? [loanAmount != null ? `Loan Amount: $${loanAmount.toLocaleString()}` : "", monthlyIncome != null ? `Monthly Income: $${monthlyIncome.toLocaleString()}` : ""].filter(Boolean).join("\n")
    : [investmentAmount != null ? `Investment Amount: $${investmentAmount.toLocaleString()}` : "", tenure ? `Term: ${tenure}` : ""].filter(Boolean).join("\n");

  return `Welcome! Your Quote Request Is Being Processed

Hi ${customerName},

Thank you for choosing Safe Methods. We have received your submission and notified advisors at: ${instList}

Request Type: ${isLoan ? "Loan" : "Investment"}
${specifics}

WHAT HAPPENS NEXT?
You will receive personalized, competitive offers from all selected advisors within 5 business days. Our team reviews every offer to ensure quality and fairness.

FREE EXPERT CONSULTATION
Book your free 10-15 minute call: ${SITE_URL}/contact

WHILE YOU WAIT
Explore our latest insights: ${SITE_URL}/blog

---
Safe Methods - Mississauga, Ontario, Canada
This email was sent because a quote request was submitted with this email address.`;
}

function buildConsultantBriefHtml(
  consultantName: string,
  referenceId: string,
  requestType: string,
  loanAmount: number | null,
  monthlyIncome: number | null,
  investmentAmount: number | null,
  tenure: string | null,
  portalUrl: string,
  expiresAt: string,
): string {
  const isLoan = requestType === "loan";
  const specifics = isLoan
    ? [
        loanAmount != null ? `<li><strong>Loan Amount:</strong> $${loanAmount.toLocaleString()}</li>` : "",
        monthlyIncome != null ? `<li><strong>Monthly Income:</strong> $${monthlyIncome.toLocaleString()}</li>` : "",
      ].filter(Boolean).join("")
    : [
        investmentAmount != null ? `<li><strong>Investment Amount:</strong> $${investmentAmount.toLocaleString()}</li>` : "",
        tenure ? `<li><strong>Preferred Term:</strong> ${escapeHtml(tenure)}</li>` : "",
      ].filter(Boolean).join("");

  return `<!DOCTYPE html>
<html>
<body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #0f4c5c; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; margin: 0;">Safe Methods</h1>
    <p style="color: #888; font-size: 14px; margin: 4px 0 0;">Consultant Lead Brief</p>
  </div>

  <h2 style="color: #0f4c5c;">New Quote Request: ${escapeHtml(referenceId)}</h2>
  <p>Hi ${escapeHtml(consultantName)},</p>
  <p>A prospective client has requested a competitive ${isLoan ? "loan" : "investment"} quote through Safe Methods. Below are the anonymized financial parameters for your review:</p>

  <div style="padding: 16px; background: #f4f4f4; border-radius: 8px; margin: 16px 0;">
    <p style="margin: 0 0 8px; font-weight: 600;">Request Details</p>
    <ul style="margin: 0; padding-left: 20px;">
      <li><strong>Type:</strong> ${isLoan ? "Loan" : "Investment"}</li>
      ${specifics}
    </ul>
  </div>

  <div style="padding: 16px; background: #fff3e0; border-radius: 8px; margin: 16px 0;">
    <p style="margin: 0; font-weight: 600; color: #e65100;">5-Day SLA Deadline</p>
    <p style="margin: 8px 0 0;">Please submit your proposed rate and terms by <strong>${escapeHtml(expiresAt)}</strong>. Unsubmitted bids will expire automatically.</p>
  </div>

  <p style="text-align: center; margin: 24px 0;">
    <a href="${escapeHtml(portalUrl)}" style="display: inline-block; padding: 14px 32px; background: #0f4c5c; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600;">Submit Your Bid</a>
  </p>

  <p style="font-size: 13px; color: #666;">
    <strong>Privacy Notice:</strong> Per Safe Methods policy, customer contact details are not disclosed. You will interact with the client only after administrative approval of your bid.
  </p>

  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;"/>
  <p style="font-size: 12px; color: #888;">
    Safe Methods &mdash; Mississauga, Ontario, Canada<br/>
    This is an automated lead brief. Do not reply to this email.
  </p>
</body>
</html>`;
}

function buildConsultantBriefText(
  consultantName: string,
  referenceId: string,
  requestType: string,
  loanAmount: number | null,
  monthlyIncome: number | null,
  investmentAmount: number | null,
  tenure: string | null,
  portalUrl: string,
  expiresAt: string,
): string {
  const isLoan = requestType === "loan";
  const specifics = isLoan
    ? [loanAmount != null ? `Loan Amount: $${loanAmount.toLocaleString()}` : "", monthlyIncome != null ? `Monthly Income: $${monthlyIncome.toLocaleString()}` : ""].filter(Boolean).join("\n")
    : [investmentAmount != null ? `Investment Amount: $${investmentAmount.toLocaleString()}` : "", tenure ? `Preferred Term: ${tenure}` : ""].filter(Boolean).join("\n");

  return `SAFE METHODS - Consultant Lead Brief

New Quote Request: ${referenceId}

Hi ${consultantName},

A prospective client has requested a competitive ${isLoan ? "loan" : "investment"} quote.

REQUEST DETAILS
Type: ${isLoan ? "Loan" : "Investment"}
${specifics}

5-DAY SLA DEADLINE
Please submit your proposed rate and terms by ${expiresAt}.
Unsubmitted bids will expire automatically.

Submit your bid here: ${portalUrl}

PRIVACY NOTICE: Customer contact details are not disclosed per Safe Methods policy.

---
Safe Methods - Mississauga, Ontario, Canada
This is an automated lead brief. Do not reply to this email.`;
}

async function callInternal(slug: string, payload: Record<string, unknown>) {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/${slug}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
        "x-internal-secret": INTERNAL_SECRET,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Best-effort
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > MAX_NAME_LENGTH) {
      return jsonResponse({ error: "Please provide a valid name." }, 400);
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !emailRegex.test(email)) {
      return jsonResponse({ error: "Please provide a valid email address." }, 400);
    }

    const rawPhone = typeof body.phone === "string" ? body.phone.trim() : "";
    if (rawPhone && !phoneRegex.test(rawPhone)) {
      return jsonResponse({ error: "Please provide a valid phone number." }, 400);
    }
    const phone = rawPhone ? rawPhone.replace(/\s+/g, "") : null;

    const rawType = body.requestType ?? body.request_type;
    const requestType = rawType === "investment" ? "investment" : "loan";

    if (body.consent !== true) {
      return jsonResponse({ error: "Consent is required to submit a request." }, 400);
    }

    let selectedInstitutions: string[] = [];
    const rawInst = body.selectedInstitutions ?? body.selected_institutions;
    if (Array.isArray(rawInst)) {
      selectedInstitutions = rawInst
        .filter((v): v is string => typeof v === "string")
        .slice(0, MAX_INSTITUTIONS)
        .map((v) => v.trim())
        .filter((v) => v.length > 0 && v.length <= MAX_NAME_LENGTH);
    }

    const referenceId = generateReferenceId();
    const now = new Date();
    const slaDeadline = addBusinessDays(now, SLA_BUSINESS_DAYS);

    const insertPayload: Record<string, unknown> = {
      name,
      email,
      phone,
      request_type: requestType,
      selected_institutions: selectedInstitutions,
      consent_given: true,
      consent_timestamp: now.toISOString(),
      status: "pending",
      reference_id: referenceId,
      sla_deadline: slaDeadline.toISOString(),
      aggregated_quotes_sent: false,
    };

    let loanAmount: number | null = null;
    let monthlyIncome: number | null = null;
    let investmentAmount: number | null = null;
    let tenure: string | null = null;

    if (requestType === "loan") {
      loanAmount = parseAmount(body.loanAmount ?? body.loan_amount);
      monthlyIncome = parseAmount(body.monthlyIncome ?? body.monthly_income);
      if (loanAmount === null) {
        return jsonResponse({ error: "Please provide a valid loan amount." }, 400);
      }
      if (monthlyIncome === null) {
        return jsonResponse({ error: "Please provide a valid monthly income." }, 400);
      }
      insertPayload.loan_amount = loanAmount;
      insertPayload.monthly_income = monthlyIncome;
    } else {
      investmentAmount = parseAmount(body.investmentAmount ?? body.investment_amount);
      if (investmentAmount === null) {
        return jsonResponse({ error: "Please provide a valid investment amount." }, 400);
      }
      const rawTenure = typeof body.tenure === "string" && ALLOWED_TENURES.has(body.tenure)
        ? body.tenure
        : "5-year";
      tenure = rawTenure;
      insertPayload.investment_amount = investmentAmount;
      insertPayload.tenure = tenure;
    }

    if (typeof body.sessionToken === "string" && body.sessionToken) {
      const { data: session } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("session_token", body.sessionToken)
        .maybeSingle();
      if (session) insertPayload.session_id = session.id;
    }

    const cutoff = new Date(Date.now() - RESUBMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("quote_requests")
      .select("id")
      .eq("email", email)
      .gte("created_at", cutoff)
      .limit(1)
      .maybeSingle();

    if (recent) {
      return jsonResponse({ success: true, alreadySubmitted: true });
    }

    const { data: insertedRow, error: insertError } = await supabase
      .from("quote_requests")
      .insert(insertPayload)
      .select("id")
      .single();

    if (insertError || !insertedRow) {
      console.error("submit-quote insert failed:", insertError?.message);
      return jsonResponse({ error: "We couldn't submit your request. Please try again." }, 500);
    }

    const quoteRequestId = insertedRow.id;

    // ── Stage consultant_bids (BR-ROUT-01) ──
    // Look up all consultants whose bank was selected (or all if none specified)
    let consultantQuery = supabase
      .from("consultants")
      .select("id, name, email, bank_id, banks!inner(name)")
      .not("email", "is", null);

    if (selectedInstitutions.length > 0) {
      consultantQuery = consultantQuery.in("banks.name", selectedInstitutions);
    }

    const { data: consultants } = await consultantQuery;

    const bidRows: Array<Record<string, unknown>> = [];

    if (consultants && consultants.length > 0) {
      for (const c of consultants) {
        const token = generateAccessToken();
        bidRows.push({
          quote_request_id: quoteRequestId,
          consultant_id: c.id,
          bank_id: c.bank_id,
          access_token: token,
          token_expires_at: slaDeadline.toISOString(),
          status: "pending_consultant_submission",
        });
      }

      const { error: bidError } = await supabase
        .from("consultant_bids")
        .insert(bidRows);

      if (bidError) {
        console.error("consultant_bids insert failed:", bidError.message);
      }
    }

    // ── Send welcome email to customer (F3-US9, BR-ROUT-05: no reference_id) ──
    const welcomeHtml = buildCustomerWelcomeHtml(
      name, requestType, selectedInstitutions,
      loanAmount, monthlyIncome, investmentAmount, tenure,
    );
    const welcomeText = buildCustomerWelcomeText(
      name, requestType, selectedInstitutions,
      loanAmount, monthlyIncome, investmentAmount, tenure,
    );

    const smtpSent = await sendEmailViaSMTP(
      email,
      "Welcome! Your Safe Methods Quote Request Is Being Processed",
      welcomeHtml,
      welcomeText,
    );

    if (!smtpSent) {
      await supabase.from("outbound_emails").insert({
        to_email: email,
        subject: "Welcome! Your Safe Methods Quote Request Is Being Processed",
        html_body: welcomeHtml,
        text_body: welcomeText,
        status: "pending",
      }).then(() => {}, () => {});
    }

    // ── Send anonymized briefs to consultants (BR-ROUT-01: no PII) ──
    const slaDateStr = slaDeadline.toLocaleDateString("en-CA", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    if (consultants && bidRows.length > 0) {
      for (let i = 0; i < consultants.length; i++) {
        const c = consultants[i];
        const bid = bidRows[i];
        if (!c.email) continue;

        const portalUrl = `${SITE_URL}/consultant-portal?token=${bid.access_token}`;

        const briefHtml = buildConsultantBriefHtml(
          c.name, referenceId, requestType,
          loanAmount, monthlyIncome, investmentAmount, tenure,
          portalUrl, slaDateStr,
        );
        const briefText = buildConsultantBriefText(
          c.name, referenceId, requestType,
          loanAmount, monthlyIncome, investmentAmount, tenure,
          portalUrl, slaDateStr,
        );

        const sent = await sendEmailViaSMTP(
          c.email,
          `New Lead Brief: ${referenceId} — Action Required`,
          briefHtml,
          briefText,
        );

        if (!sent) {
          await supabase.from("outbound_emails").insert({
            to_email: c.email,
            subject: `New Lead Brief: ${referenceId} — Action Required`,
            html_body: briefHtml,
            text_body: briefText,
            status: "pending",
          }).then(() => {}, () => {});
        }
      }
    }

    // ── CRM sync (best-effort) ──
    callInternal("sync-hubspot-lead", {
      email,
      name,
      phone: phone ?? "",
      quote_id: quoteRequestId,
      request_type: requestType,
      loan_amount: loanAmount,
      monthly_income: monthlyIncome,
      investment_amount: investmentAmount,
      tenure,
      selected_institutions: selectedInstitutions,
    }).catch(() => {});

    return jsonResponse({ success: true, alreadySubmitted: false });
  } catch (err) {
    console.error("submit-quote error:", (err as Error).message);
    return jsonResponse({ error: "We couldn't submit your request. Please try again." }, 500);
  }
});
