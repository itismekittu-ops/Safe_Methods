import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";

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
}

interface FunctionResponse {
  reply: string;
  banks: BankRanking[];
  followUps: string[];
  sessionToken: string;
  blocked?: boolean;
  blockReason?: string;
}

// ─── Input Guardrails ──────────────────────────────────

const PII_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b/, label: "sin_number" },
  { pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/, label: "ssn" },
  { pattern: /\b(?:\d[ -]*?){13,16}\b/, label: "credit_card" },
  { pattern: /\b\d{9}\b/, label: "government_id" },
];

const MAX_MESSAGE_LENGTH = 2000;
const JAILBREAK_PATTERNS = [
  /ignore (all )?(previous )?instructions/i,
  /you are (now )?(a|an) (different|new)/i,
  /disregard (your )?(system )?prompt/i,
  /reveal (your )?(system )?prompt/i,
  /act as (if you are )?(a|an) (different|new|jailbroken)/i,
];

function runInputGuardrails(message: string): { passed: boolean; reason?: string } {
  if (!message || message.trim().length === 0) {
    return { passed: false, reason: "Your message appears to be empty. Please type a question and try again." };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { passed: false, reason: "Your message is too long. Please keep it under 2000 characters." };
  }
  for (const { pattern, label } of PII_PATTERNS) {
    if (pattern.test(message)) {
      return { passed: false, reason: `For your security, please don't share sensitive information like ${label.replace("_", " ")}s in this chat. Please remove any personal identification numbers and try again.` };
    }
  }
  for (const pattern of JAILBREAK_PATTERNS) {
    if (pattern.test(message)) {
      return { passed: false, reason: "I'm here to help with financial questions. I can't process that type of request." };
    }
  }
  return { passed: true };
}

// ─── Output Guardrails ─────────────────────────────────

function runOutputGuardrails(response: string): { passed: boolean; reason?: string } {
  if (response.length > 4000) {
    return { passed: false, reason: "I'm having trouble generating a concise response right now. Please try again." };
  }
  for (const { pattern, label } of PII_PATTERNS) {
    if (pattern.test(response)) {
      return { passed: false, reason: "I apologize, but I couldn't generate a safe response. Please try rephrasing your question." };
    }
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

function rankBanks(
  rates: Array<{ bank_name: string; product_type: string; term: string | null; rate_percent: number }>,
  productType: ProductType
): BankRanking[] {
  const lowerIsBetter = productType === "mortgage" || productType === "personal_loan";
  const sorted = [...rates].sort((a, b) =>
    lowerIsBetter ? a.rate_percent - b.rate_percent : b.rate_percent - a.rate_percent
  );
  return sorted.slice(0, 5).map((r, idx) => ({
    name: r.bank_name,
    productType: r.product_type,
    term: r.term,
    rate: Number(r.rate_percent),
    rank: idx + 1,
    isBest: idx === 0,
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
      model: "gpt-4o-mini",
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

// ─── Main Handler ──────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { message, sessionToken, history = [] } = body;

    // 1. Input guardrails
    const guardResult = runInputGuardrails(message);
    if (!guardResult.passed) {
      const token = await ensureSession(sessionToken);
      return new Response(
        JSON.stringify({
          reply: guardResult.reason ?? "Your message was blocked by safety filters.",
          banks: [],
          followUps: [],
          sessionToken: token,
          blocked: true,
          blockReason: guardResult.reason,
        } satisfies FunctionResponse),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Detect topic and fetch rates
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
          banks!inner(name)
        `)
        .eq("product_type", productType);

      if (rates && rates.length > 0) {
        const flatRates = rates.map((r: any) => ({
          bank_name: r.banks.name,
          product_type: r.product_type,
          term: r.term,
          rate_percent: Number(r.rate_percent),
        }));
        bankRankings = rankBanks(flatRates, productType);
        rateContext = buildRateContext(
          productType,
          flatRates.map((r) => ({ bank_name: r.bank_name, term: r.term, rate_percent: r.rate_percent }))
        );
      }
    }

    // 3. Generate response (LLM or fallback)
    let reply = await callLLM(message, history, rateContext);
    if (!reply) {
      reply = buildFallbackResponse(message, productType, rateContext);
    }

    // 4. Output guardrails
    const outputGuard = runOutputGuardrails(reply);
    if (!outputGuard.passed) {
      reply = "I apologize, but I'm having trouble generating a response right now. Please try rephrasing your question.";
    }

    // 5. Follow-up suggestions
    const followUps = generateFollowUps(productType);

    // 6. Persist session + messages
    const token = await ensureSession(sessionToken);
    await saveMessages(token, message, reply);

    // 7. Return response
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
