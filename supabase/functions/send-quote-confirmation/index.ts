import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

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
  loan_amount: number | null;
  monthly_income: number | null;
  investment_amount: number | null;
  tenure: string | null;
  selected_institutions: string[];
  consent_given: boolean;
  created_at: string;
}

function buildEmailHtml(quote: QuoteRow): string {
  const isLoan = quote.request_type === "loan";
  const institutions = quote.selected_institutions.length > 0
    ? quote.selected_institutions.join(", ")
    : "all recommended institutions";

  const specifics = isLoan
    ? [
        quote.loan_amount != null ? `Loan Amount: $${quote.loan_amount.toLocaleString()}` : null,
        quote.monthly_income != null ? `Monthly Income: $${quote.monthly_income.toLocaleString()}` : null,
      ].filter(Boolean).join("<br/>")
    : [
        quote.investment_amount != null ? `Investment Amount: $${quote.investment_amount.toLocaleString()}` : null,
        quote.tenure ? `Term: ${quote.tenure}` : null,
      ].filter(Boolean).join("<br/>");

  return `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #0f4c5c;">Your Quote Request Has Been Received</h2>
  <p>Hi ${quote.name},</p>
  <p>Thank you for requesting quotes through Safe Methods. We've received your submission and forwarded your details to the following institutions:</p>
  <p style="padding: 12px; background: #f4f4f4; border-radius: 6px;"><strong>${institutions}</strong></p>

  <h3 style="color: #0f4c5c; margin-top: 24px;">Your Request Summary</h3>
  <p>
    <strong>Type:</strong> ${isLoan ? "Loan" : "Investment"}<br/>
    ${specifics || ""}
  </p>

  <p>You will receive offers from all selected advisors/banks within <strong>5 business days</strong>.</p>

  <h3 style="color: #0f4c5c; margin-top: 24px;">Free Consultation</h3>
  <p>As a Safe Methods client, you're entitled to a free 10-15 minute consultation with one of our senior advisors. <a href="https://safemethods.org/contact" style="color: #0f4c5c;">Book your call here</a>.</p>

  <h3 style="color: #0f4c5c; margin-top: 24px;">Related Reading</h3>
  <p>While you wait for your offers, check out our latest financial insights:</p>
  <ul>
    <li><a href="https://safemethods.org/blog" style="color: #0f4c5c;">5 Steps to Build an Emergency Fund</a></li>
    <li><a href="https://safemethods.org/blog" style="color: #0f4c5c;">Investing 101 for Beginners</a></li>
    <li><a href="https://safemethods.org/blog" style="color: #0f4c5c;">How to Improve Your Credit Score Fast</a></li>
  </ul>

  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;"/>
  <p style="font-size: 12px; color: #888;">
    Safe Methods — Mississauga, Ontario, Canada<br/>
    This email was sent because a quote request was submitted with this email address.
  </p>
</body>
</html>`;
}

function buildEmailText(quote: QuoteRow): string {
  const isLoan = quote.request_type === "loan";
  const institutions = quote.selected_institutions.length > 0
    ? quote.selected_institutions.join(", ")
    : "all recommended institutions";

  return `Your Quote Request Has Been Received

Hi ${quote.name},

Thank you for requesting quotes through Safe Methods. We've received your submission and forwarded your details to: ${institutions}

Request Type: ${isLoan ? "Loan" : "Investment"}
${isLoan
  ? [quote.loan_amount != null ? `Loan Amount: $${quote.loan_amount.toLocaleString()}` : "", quote.monthly_income != null ? `Monthly Income: $${quote.monthly_income.toLocaleString()}` : ""].filter(Boolean).join("\n")
  : [quote.investment_amount != null ? `Investment Amount: $${quote.investment_amount.toLocaleString()}` : "", quote.tenure ? `Term: ${quote.tenure}` : ""].filter(Boolean).join("\n")}

You will receive offers from all selected advisors/banks within 5 business days.

Free Consultation: Book your free 10-15 minute call at https://safemethods.org/contact

Related Reading: https://safemethods.org/blog

---
Safe Methods — Mississauga, Ontario, Canada
This email was sent because a quote request was submitted with this email address.`;
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
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: quote, error: fetchError } = await supabase
      .from("quote_requests")
      .select("id, name, email, phone, request_type, loan_amount, monthly_income, investment_amount, tenure, selected_institutions, consent_given, created_at")
      .eq("email", email.toLowerCase())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<QuoteRow>();

    if (fetchError || !quote) {
      return new Response(
        JSON.stringify({ error: "Quote request not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = buildEmailHtml(quote);
    const text = buildEmailText(quote);
    const { error: insertError } = await supabase
      .from("outbound_emails")
      .insert({
        to_email: quote.email,
        subject: "Your Safe Methods Quote Request Has Been Received",
        html_body: html,
        text_body: text,
        status: "pending",
      });

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to queue email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Confirmation email queued" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
