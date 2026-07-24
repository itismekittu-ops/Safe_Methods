import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import {
  createTraceContext,
  addTrace,
  addSpan,
  addGeneration,
  addTag,
  flush,
  type TraceContext,
} from "./langfuse.ts";
import {
  detectSensitivePii,
  redactPii,
  checkMultiTurnAssembly,
} from "./pii.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";

const MODEL_NAME = "gpt-5.6-luna";
const MODEL_VERSION = "2025-07";
const PROMPT_VERSION = "v1";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ─── Types ────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  message: string;
  sessionToken?: string;
  history?: ChatMessage[];
}

interface BankRanking {
  name: string;
  productType: string;
  term: string | null;
  rate: number;
  rank: number;
  isBest: boolean;
  consultantId: string | null;
  consultantName: string | null;
  consultantTitle: string | null;
  consultantAvatarUrl: string | null;
}

interface FunctionResponse {
  reply: string;
  banks: BankRanking[];
  followUps: string[];
  sessionToken: string;
  blocked?: boolean;
  blockReason?: string;
}

// ─── Input Guardrails (non-PII) ──────────────────────

const MAX_MESSAGE_LENGTH = 2000;
const JAILBREAK_PATTERNS = [
  /ignore (all )?(previous )?instructions/i,
  /you are (now )?(a|an) (different|new)/i,
  /disregard (your )?(system )?prompt/i,
  /reveal (your )?(system )?prompt/i,
  /act as (if you are )?(a|an) (different|new|jailbroken)/i,
];

function checkJailbreak(message: string): boolean {
  return JAILBREAK_PATTERNS.some((p) => p.test(message));
}

// ─── Output Guardrails ─────────────────────────────────

function runOutputGuardrails(response: string): { passed: boolean; reason?: string } {
  if (response.length > 4000) {
    return { passed: false, reason: "I'm having trouble generating a concise response right now. Please try again." };
  }
  // GR-OUT-03: check for sensitive PII in LLM output
  const piiFound = detectSensitivePii(response);
  if (piiFound.length > 0) {
    return { passed: false, reason: "I apologize, but I couldn't generate a safe response. Please try rephrasing your question." };
  }
  return { passed: true };
}

// ─── Topic Detection ───────────────────────────────────

type ProductType = "mortgage" | "personal_loan" | "gic" | "investment";

function detectProductType(message: string): ProductType | null {
  const lower = message.toLowerCase();
  if (/\bmortgage\b|\bhome loan\b|\bhouse\b|\bproperty\b|\brefinanc/.test(lower)) return "mortgage";
  if (/\bpersonal loan\b|\bdebt consolidat|\bcredit\b|\bborrow/.test(lower)) return "personal_loan";
  if (/\bgic\b|\bfixed deposit\b|\bguaranteed/.test(lower)) return "gic";
  if (/\binvest|\bmutual fund\b|\bportfolio\b|\bstock\b|\bretirement\b|\brrsp\b|\btfsa\b/.test(lower)) return "investment";
  if (/\bbudget\b|\bsave\b|\bsaving\b/.test(lower)) return "investment";
  if (/\btax\b/.test(lower)) return "investment";
  return null;
}

// ─── Bank Ranking ──────────────────────────────────────

interface RateWithConsultant {
  bank_name: string;
  product_type: string;
  term: string | null;
  rate_percent: number;
  consultant_id: string | null;
  consultant_name: string | null;
  consultant_title: string | null;
  consultant_avatar_url: string | null;
}

function rankBanks(
  rates: RateWithConsultant[],
  productType: ProductType
): BankRanking[] {
  const lowerIsBetter = productType === "mortgage" || productType === "personal_loan";
  const sorted = [...rates].sort((a, b) => {
    const diff = lowerIsBetter
      ? a.rate_percent - b.rate_percent
      : b.rate_percent - a.rate_percent;
    if (diff !== 0) return diff;
    return a.bank_name.localeCompare(b.bank_name);
  });
  return sorted.slice(0, 5).map((r, idx) => ({
    name: r.bank_name,
    productType: r.product_type,
    term: r.term,
    rate: Number(r.rate_percent),
    rank: idx + 1,
    isBest: idx === 0,
    consultantId: r.consultant_id,
    consultantName: r.consultant_name,
    consultantTitle: r.consultant_title,
    consultantAvatarUrl: r.consultant_avatar_url,
  }));
}

// ─── Knowledge Base Context ────────────────────────────

function buildRateContext(
  productType: ProductType,
  rates: Array<{ bank_name: string; term: string | null; rate_percent: number }>
): string {
  const lowerIsBetter = productType === "mortgage" || productType === "personal_loan";
  const sorted = [...rates].sort((a, b) =>
    lowerIsBetter ? a.rate_percent - b.rate_percent : b.rate_percent - a.rate_percent
  );
  const lines = sorted.map(
    (r) => `  • ${r.bank_name}: ${r.rate_percent}% (${r.term ?? "standard term"})`
  );
  return `Current ${productType.replace("_", " ")} rates from our partner institutions:\n${lines.join("\n")}`;
}

// ─── Follow-up Suggestions ─────────────────────────────

function generateFollowUps(productType: ProductType | null): string[] {
  const map: Record<ProductType, string[]> = {
    mortgage: ["What are their fees?", "Can I schedule a call?", "Compare interest rates"],
    personal_loan: ["What are their fees?", "How do I consolidate my debt?", "Can I schedule a call?"],
    gic: ["Which bank has the highest return?", "What are the terms?", "Can I schedule a call?"],
    investment: ["What are the risks?", "How do I start investing?", "Can I schedule a call?"],
  };
  if (productType && map[productType]) return map[productType];
  return ["How do I create a monthly budget?", "Should I pay off debt or invest first?", "Can I schedule a call?"];
}

// ─── Fallback Response (no LLM key) ────────────────────

function buildFallbackResponse(
  message: string,
  productType: ProductType | null,
  rateContext: string | null
): string {
  if (!productType || !rateContext) {
    return "I'd be happy to help with your financial questions. I can provide guidance on mortgages, personal loans, GICs, investments, budgeting, and debt management. Could you share a bit more about what you're looking for?";
  }

  const topicLabels: Record<ProductType, string> = {
    mortgage: "mortgage rates",
    personal_loan: "personal loan rates",
    gic: "GIC rates",
    investment: "investment returns",
  };

  const lowerIsBetter = productType === "mortgage" || productType === "personal_loan";
  const bestLabel = lowerIsBetter ? "lowest" : "highest";

  return `Based on your inquiry about ${topicLabels[productType]}, here's what I found from our partner institutions:\n\n${rateContext}\n\nThe ${bestLabel} rate is highlighted as the top match in the sidebar. Prices are indicative and subject to change — for best results, it's recommended to connect directly with the advisor for a personalized offer.`;
}

// ─── LLM Call (OpenAI) ─────────────────────────────────

async function callLLM(
  message: string,
  history: ChatMessage[],
  rateContext: string | null
): Promise<string> {
  if (!OPENAI_API_KEY) {
    return "";
  }

  const systemPrompt = `You are SafeBot, a knowledgeable and discreet financial advisory assistant for Safe Methods, a Canadian financial advisory platform. You provide concise, factual, and unbiased financial guidance.

Guidelines:
- Keep responses to 2-3 sentences for factual questions, slightly longer for educational explanations.
- When rate data is provided below, use ONLY those figures — never invent rates or numbers.
- Clearly separate general educational information from specific product recommendations.
- Always recommend that users connect with a financial advisor for personalized advice.
- If asked about topics outside personal finance, politely redirect.
- Never ask for or reference sensitive personal information (SIN, account numbers, etc.).

${rateContext ? `--- Current Rate Data ---\n${rateContext}\n--- End Rate Data ---` : ""}`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-8).map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages,
      max_tokens: 500,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    return "";
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ─── Session Persistence ───────────────────────────────

async function ensureSession(sessionToken?: string): Promise<string> {
  if (sessionToken) {
    const { data } = await supabase
      .from("chat_sessions")
      .select("session_token")
      .eq("session_token", sessionToken)
      .maybeSingle();
    if (data) return sessionToken;
  }

  const newToken = crypto.randomUUID();
  await supabase.from("chat_sessions").insert({ session_token: newToken });
  return newToken;
}

async function saveMessages(sessionToken: string, userMsg: string, assistantMsg: string) {
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("session_token", sessionToken)
    .maybeSingle();

  if (!session) return;

  await supabase.from("chat_messages").insert([
    { session_id: session.id, role: "user", content: userMsg },
    { session_id: session.id, role: "assistant", content: assistantMsg },
  ]);
}

// ─── Fetch session history for multi-turn PII ──────────

async function getSessionHistory(sessionToken: string): Promise<string[]> {
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("session_token", sessionToken)
    .maybeSingle();

  if (!session) return [];

  const { data: rows } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  if (!rows) return [];

  // Only user messages matter for PII assembly detection
  return rows
    .filter((r: { role: string }) => r.role === "user")
    .map((r: { content: string }) => r.content);
}

// ─── Main Handler ──────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const traceCtx: TraceContext = createTraceContext("");
  const traceStart = Date.now();

  try {
    const body: RequestBody = await req.json();
    const { message, sessionToken, history = [] } = body;

    // Ensure session early so we can fetch history for multi-turn PII
    const token = await ensureSession(sessionToken);
    traceCtx.sessionId = token;

    // Fetch authoritative session history from DB for multi-turn PII
    const dbHistory = await getSessionHistory(token);

    // ── Stage 1: Input Guardrails (GR-IN-01 through GR-IN-06) ──
    const guardStart = Date.now();
    const guardSpanId = crypto.randomUUID();

    // GR-IN-01: empty message
    if (!message || message.trim().length === 0) {
      const guardEnd = Date.now();
      addSpan(traceCtx, {
        id: guardSpanId,
        traceId: traceCtx.traceId,
        name: "input_guardrail",
        startTime: new Date(guardStart).toISOString(),
        endTime: new Date(guardEnd).toISOString(),
        input: { message: "[EMPTY]" },
        output: { passed: false, reason: "empty_message" },
        level: "WARNING",
      });
      addTag(traceCtx, "guardrail:empty_message");
      addTag(traceCtx, "blocked");

      // OBS-PII-01/02: redact even in guardrail failure traces
      addTrace(traceCtx, {
        id: traceCtx.traceId,
        name: "chat_turn",
        sessionId: token,
        metadata: { prompt_version: PROMPT_VERSION },
        tags: [],
      });
      // Fire-and-forget trace flush
      flush(traceCtx);

      return new Response(
        JSON.stringify({
          reply: "Your message appears to be empty. Please type a question and try again.",
          banks: [],
          followUps: [],
          sessionToken: token,
          blocked: true,
          blockReason: "empty_message",
        } satisfies FunctionResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GR-IN-02: length limit
    if (message.length > MAX_MESSAGE_LENGTH) {
      const guardEnd = Date.now();
      addSpan(traceCtx, {
        id: guardSpanId,
        traceId: traceCtx.traceId,
        name: "input_guardrail",
        startTime: new Date(guardStart).toISOString(),
        endTime: new Date(guardEnd).toISOString(),
        input: { length: message.length },
        output: { passed: false, reason: "length_exceeded" },
        level: "WARNING",
      });
      addTag(traceCtx, "guardrail:length_exceeded");
      addTag(traceCtx, "blocked");

      addTrace(traceCtx, {
        id: traceCtx.traceId,
        name: "chat_turn",
        sessionId: token,
        metadata: { prompt_version: PROMPT_VERSION },
        tags: [],
      });
      flush(traceCtx);

      return new Response(
        JSON.stringify({
          reply: "Your message is too long. Please keep it under 2000 characters.",
          banks: [],
          followUps: [],
          sessionToken: token,
          blocked: true,
          blockReason: "length_exceeded",
        } satisfies FunctionResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GR-IN-04: per-message sensitive PII (SIN/SSN/card/government ID)
    const sensitivePii = detectSensitivePii(message);
    if (sensitivePii.length > 0) {
      const guardEnd = Date.now();
      // OBS-PII-01/02/03: redact before tracing — never log raw PII
      const piiLabels = sensitivePii.map((p) => `[PII_DETECTED:${p.label}]`);
      addSpan(traceCtx, {
        id: guardSpanId,
        traceId: traceCtx.traceId,
        name: "input_guardrail",
        startTime: new Date(guardStart).toISOString(),
        endTime: new Date(guardEnd).toISOString(),
        input: { message: redactPii(message) },
        output: { passed: false, reason: "sensitive_pii", pii_types: piiLabels },
        level: "WARNING",
      });
      addTag(traceCtx, "guardrail:sensitive_pii");
      addTag(traceCtx, "blocked");

      addTrace(traceCtx, {
        id: traceCtx.traceId,
        name: "chat_turn",
        sessionId: token,
        metadata: { prompt_version: PROMPT_VERSION },
        tags: [],
      });
      flush(traceCtx);

      return new Response(
        JSON.stringify({
          reply: "For your security, please don't share sensitive identification numbers (like SIN, SSN, or card numbers) in this chat. Please remove any personal identification numbers and try again. If you need to share details for a quote, use the \"Get Quotes\" button to submit through our secure form.",
          banks: [],
          followUps: [],
          sessionToken: token,
          blocked: true,
          blockReason: "sensitive_pii",
        } satisfies FunctionResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GR-IN-03: jailbreak detection
    if (checkJailbreak(message)) {
      const guardEnd = Date.now();
      addSpan(traceCtx, {
        id: guardSpanId,
        traceId: traceCtx.traceId,
        name: "input_guardrail",
        startTime: new Date(guardStart).toISOString(),
        endTime: new Date(guardEnd).toISOString(),
        input: { message: redactPii(message) },
        output: { passed: false, reason: "jailbreak_attempt" },
        level: "WARNING",
      });
      addTag(traceCtx, "guardrail:jailbreak");
      addTag(traceCtx, "blocked");

      addTrace(traceCtx, {
        id: traceCtx.traceId,
        name: "chat_turn",
        sessionId: token,
        metadata: { prompt_version: PROMPT_VERSION },
        tags: [],
      });
      flush(traceCtx);

      return new Response(
        JSON.stringify({
          reply: "I'm here to help with financial questions. I can't process that type of request.",
          banks: [],
          followUps: [],
          sessionToken: token,
          blocked: true,
          blockReason: "jailbreak_attempt",
        } satisfies FunctionResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GR-IN-05: multi-turn PII assembly detection
    // Uses authoritative DB history + current message
    const assembly = checkMultiTurnAssembly(message, dbHistory);
    if (assembly.blocked) {
      const guardEnd = Date.now();
      addSpan(traceCtx, {
        id: guardSpanId,
        traceId: traceCtx.traceId,
        name: "input_guardrail",
        startTime: new Date(guardStart).toISOString(),
        endTime: new Date(guardEnd).toISOString(),
        input: { message: redactPii(message) },
        output: { passed: false, reason: "multi_turn_pii_assembly", categories: assembly.categories },
        level: "WARNING",
      });
      addTag(traceCtx, "guardrail:multi_turn_pii_assembly");
      addTag(traceCtx, "blocked");

      addTrace(traceCtx, {
        id: traceCtx.traceId,
        name: "chat_turn",
        sessionId: token,
        metadata: { prompt_version: PROMPT_VERSION },
        tags: [],
      });
      flush(traceCtx);

      return new Response(
        JSON.stringify({
          reply: assembly.reason,
          banks: [],
          followUps: [],
          sessionToken: token,
          blocked: true,
          blockReason: "multi_turn_pii_assembly",
        } satisfies FunctionResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Guardrails passed — log the span
    const guardEnd = Date.now();
    addSpan(traceCtx, {
      id: guardSpanId,
      traceId: traceCtx.traceId,
      name: "input_guardrail",
      startTime: new Date(guardStart).toISOString(),
      endTime: new Date(guardEnd).toISOString(),
      input: { message: redactPii(message) },
      output: { passed: true, latency_ms: guardEnd - guardStart },
    });

    // ── Stage 2: Retrieval (RAG) ──
    const retrievalStart = Date.now();
    const retrievalSpanId = crypto.randomUUID();
    const productType = detectProductType(message);
    let bankRankings: BankRanking[] = [];
    let rateContext: string | null = null;

    if (productType) {
      const { data: rates } = await supabase
        .from("rates")
        .select(`
          product_type,
          term,
          rate_percent,
          banks!inner(name),
          consultants!left(id, name, title, avatar_url)
        `)
        .eq("product_type", productType);

      if (rates && rates.length > 0) {
        const flatRates: RateWithConsultant[] = rates.map((r: any) => ({
          bank_name: r.banks.name,
          product_type: r.product_type,
          term: r.term,
          rate_percent: Number(r.rate_percent),
          consultant_id: r.consultants?.id ?? null,
          consultant_name: r.consultants?.name ?? null,
          consultant_title: r.consultants?.title ?? null,
          consultant_avatar_url: r.consultants?.avatar_url ?? null,
        }));
        bankRankings = rankBanks(flatRates, productType);
        rateContext = buildRateContext(
          productType,
          flatRates.map((r) => ({ bank_name: r.bank_name, term: r.term, rate_percent: r.rate_percent }))
        );
      }
    }

    const retrievalEnd = Date.now();
    // OBS-TRACE-03: retrieved RAG chunks attached to the trace
    addSpan(traceCtx, {
      id: retrievalSpanId,
      traceId: traceCtx.traceId,
      name: "retrieval",
      startTime: new Date(retrievalStart).toISOString(),
      endTime: new Date(retrievalEnd).toISOString(),
      input: { product_type: productType },
      output: {
        chunks_count: bankRankings.length,
        rate_context: rateContext ? "[REDACTED_RATES]" : null,
        banks: bankRankings.map((b) => ({ name: b.name, rate: b.rate })),
      },
    });
    if (productType) addTag(traceCtx, `rag:${productType}`);

    // ── Stage 3: Generation (LLM) ──
    const genStart = Date.now();
    let reply = await callLLM(message, history, rateContext);
    const genEnd = Date.now();

    // OBS-TRACE-04: model name, model version, and prompt version attached
    addGeneration(traceCtx, {
      id: crypto.randomUUID(),
      traceId: traceCtx.traceId,
      parentId: retrievalSpanId,
      name: "generation",
      startTime: new Date(genStart).toISOString(),
      endTime: new Date(genEnd).toISOString(),
      model: MODEL_NAME,
      modelParameters: { temperature: 0.3, max_tokens: 500 },
      input: { message: redactPii(message), prompt_version: PROMPT_VERSION },
      output: reply ? { response: redactPii(reply) } : { response: "[FALLBACK]" },
      metadata: { model_version: MODEL_VERSION, prompt_version: PROMPT_VERSION },
    });

    if (!reply) {
      reply = buildFallbackResponse(message, productType, rateContext);
    }

    // ── Stage 4: Output Guardrails ──
    const outputGuardStart = Date.now();
    const outputGuard = runOutputGuardrails(reply);
    const outputGuardEnd = Date.now();

    addSpan(traceCtx, {
      id: crypto.randomUUID(),
      traceId: traceCtx.traceId,
      name: "output_guardrail",
      startTime: new Date(outputGuardStart).toISOString(),
      endTime: new Date(outputGuardEnd).toISOString(),
      input: { response: redactPii(reply) },
      output: outputGuard.passed
        ? { passed: true, latency_ms: outputGuardEnd - outputGuardStart }
        : { passed: false, reason: outputGuard.reason },
      level: outputGuard.passed ? "DEFAULT" : "WARNING",
    });

    if (!outputGuard.passed) {
      reply = "I apologize, but I'm having trouble generating a response right now. Please try rephrasing your question.";
      addTag(traceCtx, "guardrail:output_blocked");
    }

    // ── Stage 5: Follow-up suggestions ──
    const followUps = generateFollowUps(productType);

    // ── Persist session + messages ──
    await saveMessages(token, message, reply);

    // ── Finalize trace ──
    // OBS-TRACE-01: one trace per conversation turn, linked to persistent session ID
    // OBS-TRACE-05: end-to-end latency
    const traceEnd = Date.now();
    addTrace(traceCtx, {
      id: traceCtx.traceId,
      name: "chat_turn",
      sessionId: token,
      metadata: {
        prompt_version: PROMPT_VERSION,
        model: MODEL_NAME,
        model_version: MODEL_VERSION,
        end_to_end_ms: traceEnd - traceStart,
        guardrail_ms: guardEnd - guardStart,
        retrieval_ms: retrievalEnd - retrievalStart,
        generation_ms: genEnd - genStart,
      },
      tags: [],
    });

    // OBS-ARCH-02: fire-and-forget, never blocks
    flush(traceCtx);

    // ── Return response ──
    return new Response(
      JSON.stringify({
        reply,
        banks: bankRankings,
        followUps,
        sessionToken: token,
      } satisfies FunctionResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    // OBS-ARCH-02: even on error, attempt to flush trace (best-effort)
    addTrace(traceCtx, {
      id: traceCtx.traceId,
      name: "chat_turn",
      metadata: { error: "unhandled_exception", prompt_version: PROMPT_VERSION },
      tags: [],
    });
    addTag(traceCtx, "error");
    flush(traceCtx);

    return new Response(
      JSON.stringify({
        reply: "I'm experiencing a temporary issue. Please try again in a moment.",
        banks: [],
        followUps: [],
        sessionToken: "",
        blocked: true,
        blockReason: "Service temporarily unavailable.",
      } satisfies FunctionResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
