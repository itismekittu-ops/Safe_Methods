import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ADMIN_EMAILS = ["info@safemethods.org"];

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function verifyAdmin(req: Request): Promise<boolean> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.replace("Bearer ", "");

  if (token === SERVICE_ROLE_KEY) return true;

  const authClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { data: { user }, error } = await authClient.auth.getUser(token);
  if (error || !user) return false;

  return ADMIN_EMAILS.includes(user.email ?? "");
}

interface ActionPayload {
  action: string;
  bid_id?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return jsonResponse({ error: "Not found" }, 404);
    }

    const body: ActionPayload = await req.json();

    if (body.action === "list") {
      // Fetch all quote_requests with their bids
      const { data: quoteRequests, error: qrError } = await supabase
        .from("quote_requests")
        .select(
          "id, reference_id, name, email, request_type, loan_amount, monthly_income, investment_amount, tenure, sla_deadline, aggregated_quotes_sent, aggregated_quotes_sent_at, created_at"
        )
        .not("reference_id", "is", null)
        .order("created_at", { ascending: false });

      if (qrError) {
        console.error("Failed to fetch quotes:", qrError.message);
        return jsonResponse({ error: "Failed to load quotes." }, 500);
      }

      const quotes = [];
      for (const qr of quoteRequests ?? []) {
        const { data: bids } = await supabase
          .from("consultant_bids")
          .select(
            "id, status, proposed_rate, product_name, tenure_months, advisor_notes, submitted_at, reviewed_at, admin_notes, consultant_id, bank_id"
          )
          .eq("quote_request_id", qr.id)
          .order("created_at", { ascending: true });

        const enrichedBids = [];
        for (const bid of bids ?? []) {
          const { data: c } = await supabase
            .from("consultants")
            .select("name, banks!inner(name)")
            .eq("id", bid.consultant_id)
            .maybeSingle();

          enrichedBids.push({
            ...bid,
            consultant_name:
              (c as Record<string, unknown>)?.name ?? "Unknown",
            bank_name:
              ((c as Record<string, unknown>)?.banks as Record<string, unknown>)
                ?.name ?? "Unknown",
          });
        }

        quotes.push({ ...qr, bids: enrichedBids });
      }

      return jsonResponse({ quotes });
    }

    if (body.action === "approve" || body.action === "reject") {
      const bidId = body.bid_id;
      if (!bidId) {
        return jsonResponse({ error: "bid_id is required." }, 400);
      }

      const newStatus =
        body.action === "approve" ? "approved" : "rejected";

      const { error: updateError } = await supabase
        .from("consultant_bids")
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", bidId)
        .eq("status", "pending_admin_review");

      if (updateError) {
        console.error("Bid action failed:", updateError.message);
        return jsonResponse({ error: "Failed to update bid." }, 500);
      }

      return jsonResponse({ success: true, status: newStatus });
    }

    return jsonResponse({ error: "Unknown action." }, 400);
  } catch (err) {
    console.error("admin-quotes-data error:", (err as Error).message);
    return jsonResponse({ error: "Something went wrong." }, 500);
  }
});
