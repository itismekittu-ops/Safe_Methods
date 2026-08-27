import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
// Shared secret used only for function-to-function calls. Falls back to the
// service role key, which is server-side only and never shipped to browsers.
const INTERNAL_SECRET = Deno.env.get("INTERNAL_FUNCTION_SECRET") || SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// A quote request may only be submitted once per email in this window.
// Enforced server-side; the browser's sessionStorage flag is a convenience
// only and is trivially cleared.
const RESUBMIT_WINDOW_MINUTES = 60;

const MAX_NAME_LENGTH = 120;
const MAX_INSTITUTIONS = 10;
const MAX_AMOUNT = 1_000_000_000;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d\s()+\-]{7,}$/;
const ALLOWED_TENURES = new Set(["1-year", "3-year", "5-year", "10-year"]);

interface RequestBody {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  requestType?: unknown;
  loanAmount?: unknown;
  monthlyIncome?: unknown;
  investmentAmount?: unknown;
  tenure?: unknown;
  selectedInstitutions?: unknown;
  consent?: unknown;
  sessionToken?: unknown;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Validate a monetary quantity server-side. The browser's checks are advisory.
function parseAmount(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0 || n > MAX_AMOUNT) return null;
  return n;
}

// Call a sibling function with the internal shared secret so it will accept
// the request. These functions are not reachable with the public anon key.
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
    // Downstream delivery is best-effort and must not fail the submission.
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();

    // ── Server-side validation. Nothing here trusts the browser. ──
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

    const requestType = body.requestType === "investment" ? "investment" : "loan";

    // Consent is a legal precondition and is re-checked here, not taken from
    // whatever the form happened to post.
    if (body.consent !== true) {
      return jsonResponse({ error: "Consent is required to submit a request." }, 400);
    }

    let selectedInstitutions: string[] = [];
    if (Array.isArray(body.selectedInstitutions)) {
      selectedInstitutions = body.selectedInstitutions
        .filter((v): v is string => typeof v === "string")
        .slice(0, MAX_INSTITUTIONS)
        .map((v) => v.trim())
        .filter((v) => v.length > 0 && v.length <= MAX_NAME_LENGTH);
    }

    const insertPayload: Record<string, unknown> = {
      name,
      email,
      phone,
      request_type: requestType,
      selected_institutions: selectedInstitutions,
      consent_given: true,
      consent_timestamp: new Date().toISOString(),
      status: "pending",
    };

    if (requestType === "loan") {
      const loanAmount = parseAmount(body.loanAmount);
      const monthlyIncome = parseAmount(body.monthlyIncome);
      if (loanAmount === null) {
        return jsonResponse({ error: "Please provide a valid loan amount." }, 400);
      }
      if (monthlyIncome === null) {
        return jsonResponse({ error: "Please provide a valid monthly income." }, 400);
      }
      insertPayload.loan_amount = loanAmount;
      insertPayload.monthly_income = monthlyIncome;
    } else {
      const investmentAmount = parseAmount(body.investmentAmount);
      if (investmentAmount === null) {
        return jsonResponse({ error: "Please provide a valid investment amount." }, 400);
      }
      const tenure = typeof body.tenure === "string" && ALLOWED_TENURES.has(body.tenure)
        ? body.tenure
        : "5-year";
      insertPayload.investment_amount = investmentAmount;
      insertPayload.tenure = tenure;
    }

    // Link the chat session only if the presented token really exists.
    if (typeof body.sessionToken === "string" && body.sessionToken) {
      const { data: session } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("session_token", body.sessionToken)
        .maybeSingle();
      if (session) insertPayload.session_id = session.id;
    }

    // ── Repeat-submission window, enforced server-side ──
    const cutoff = new Date(Date.now() - RESUBMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("quote_requests")
      .select("id")
      .eq("email", email)
      .gte("created_at", cutoff)
      .limit(1)
      .maybeSingle();

    if (recent) {
      // Same shape as success: a caller cannot use this to probe for an email.
      return jsonResponse({ success: true, alreadySubmitted: true });
    }

    const { error: insertError } = await supabase
      .from("quote_requests")
      .insert(insertPayload);

    if (insertError) {
      console.error("submit-quote insert failed:", insertError.message);
      return jsonResponse({ error: "We couldn't submit your request. Please try again." }, 500);
    }

    // Downstream delivery, best-effort and non-blocking for the user.
    await callInternal("send-quote-confirmation", { email });
    await callInternal("sync-hubspot-lead", { email });

    return jsonResponse({ success: true, alreadySubmitted: false });
  } catch {
    return jsonResponse({ error: "We couldn't submit your request. Please try again." }, 500);
  }
});
