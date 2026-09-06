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
const CALENDLY_WEBHOOK_SIGNING_KEY =
  Deno.env.get("CALENDLY_WEBHOOK_SIGNING_KEY") ?? "";
const HUBSPOT_ACCESS_TOKEN = Deno.env.get("HUBSPOT_ACCESS_TOKEN") ?? "";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function verifyCalendlySignature(
  req: Request,
  body: string
): Promise<boolean> {
  if (!CALENDLY_WEBHOOK_SIGNING_KEY) return true;

  const signature = req.headers.get("Calendly-Webhook-Signature") ?? "";
  const parts = signature.split(",");
  let timestamp = "";
  let sig = "";
  for (const part of parts) {
    const [key, val] = part.split("=");
    if (key === "t") timestamp = val;
    if (key === "v1") sig = val;
  }

  if (!timestamp || !sig) return false;

  const tolerance = 300_000; // 5 minutes
  if (Math.abs(Date.now() - Number(timestamp) * 1000) > tolerance) return false;

  const payload = `${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(CALENDLY_WEBHOOK_SIGNING_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0;
}

function splitName(
  fullName: string
): { firstname: string; lastname: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstname: "", lastname: "" };
  if (parts.length === 1) return { firstname: parts[0], lastname: "" };
  return { firstname: parts[0], lastname: parts.slice(1).join(" ") };
}

async function findHubSpotContact(
  email: string
): Promise<string | null> {
  if (!HUBSPOT_ACCESS_TOKEN) return null;
  try {
    const resp = await fetch(
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
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.results?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

async function upsertHubSpotContact(
  email: string,
  name: string,
  phone: string,
  eventStart: string
): Promise<void> {
  if (!HUBSPOT_ACCESS_TOKEN) return;

  const { firstname, lastname } = splitName(name);
  const properties: Record<string, string> = {
    email,
    firstname: firstname || "Calendly",
    lastname: lastname || "Lead",
    phone: phone || "",
    message: `Calendly Direct Booking — scheduled for ${eventStart || "TBD"}`,
    hs_lead_status: "NEW",
  };

  try {
    const existingId = await findHubSpotContact(email);
    if (existingId) {
      await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${existingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({ properties }),
        }
      );
    } else {
      await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({ properties }),
      });
    }
  } catch (err) {
    console.error(
      "HubSpot sync failed:",
      (err as Error).message
    );
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();

    const signatureValid = await verifyCalendlySignature(req, rawBody);
    if (!signatureValid) {
      return jsonResponse({ error: "Invalid signature" }, 401);
    }

    const payload = JSON.parse(rawBody);
    const event = payload?.event;

    // Only process invitee.created events
    if (event !== "invitee.created") {
      return jsonResponse({ accepted: true });
    }

    const inviteePayload = payload?.payload;
    if (!inviteePayload) {
      return jsonResponse({ error: "Missing payload" }, 400);
    }

    const name: string = inviteePayload.name ?? "";
    const email: string =
      (inviteePayload.email ?? "").trim().toLowerCase();
    const eventUri: string = inviteePayload.event ?? "";
    const calendlyEventId: string =
      inviteePayload.uri ?? eventUri ?? "";

    // Extract phone from questions_and_answers if available
    let phone = "";
    const qa = inviteePayload.questions_and_answers;
    if (Array.isArray(qa)) {
      const phoneAnswer = qa.find(
        (q: Record<string, unknown>) =>
          typeof q.question === "string" &&
          /phone|mobile|cell/i.test(q.question)
      );
      if (phoneAnswer && typeof phoneAnswer.answer === "string") {
        phone = phoneAnswer.answer.trim();
      }
    }

    // Extract event start time from scheduled_event
    let eventStartTime: string | null = null;
    const scheduledEvent = inviteePayload.scheduled_event;
    if (scheduledEvent && typeof scheduledEvent.start_time === "string") {
      eventStartTime = scheduledEvent.start_time;
    }

    if (!email) {
      return jsonResponse({ error: "Missing invitee email" }, 400);
    }

    // Deduplicate: check if this calendly event was already ingested
    const { data: existing } = await supabase
      .from("consultations")
      .select("id")
      .eq("calendly_event_id", calendlyEventId)
      .maybeSingle();

    if (existing) {
      return jsonResponse({ accepted: true, duplicate: true });
    }

    // Insert into consultations table
    const { error: insertError } = await supabase
      .from("consultations")
      .insert({
        name: name || "Calendly Visitor",
        email,
        phone: phone || null,
        calendly_event_id: calendlyEventId || null,
        event_start_time: eventStartTime,
        status: "scheduled",
      });

    if (insertError) {
      console.error(
        "consultations insert failed:",
        insertError.message
      );
      return jsonResponse(
        { error: "Failed to record consultation" },
        500
      );
    }

    // Sync to HubSpot CRM as a lead with source 'Calendly Direct Booking' (BR-ROUT-06)
    await upsertHubSpotContact(
      email,
      name,
      phone,
      eventStartTime ?? ""
    );

    return jsonResponse({ accepted: true });
  } catch (err) {
    console.error(
      "calendly-webhook error:",
      (err as Error).message
    );
    return jsonResponse(
      { error: "Webhook processing failed" },
      500
    );
  }
});
