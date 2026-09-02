import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { validateInput, validateOutput } from "./pii.ts";

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

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { message, history = [] } = body;

    // 1. Input Validation
    const inputCheck = validateInput(message);
    if (!inputCheck.valid) {
      return new Response(
        JSON.stringify({ reply: inputCheck.error, banks: [], followUps: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch Rates for Grounding Context
    const { data: rates } = await supabase
      .from("rates")
      .select(`
        product_type,
        term,
        rate_percent,
        banks!inner(name),
        consultants!left(id, name, title, avatar_url)
      `);

    let rateContext = "";
    let flatRates: any[] = [];

    if (rates && rates.length > 0) {
      flatRates = rates.map((r: any) => ({
        bank_name: r.banks.name,
        product_type: r.product_type,
        term: r.term,
        rate_percent: Number(r.rate_percent),
        consultant_id: r.consultants?.id ?? null,
        consultant_name: r.consultants?.name ?? null,
        consultant_title: r.consultants?.title ?? null,
        consultant_avatar_url: r.consultants?.avatar_url ?? null,
      }));

      rateContext = flatRates
        .map((r) => `• ${r.bank_name} (${r.product_type}, ${r.term ?? "standard"}): ${r.rate_percent}%`)
        .join("\n");
    }

    // 3. System Prompt & LLM Call
    const systemPrompt = `You are SafeBot, a knowledgeable financial advisory assistant for Safe Methods, a Canadian financial platform.

Formatting & Response Rules:
- For general financial education (e.g., "How do RRSPs work?"):
  • Rely on your broad knowledge to provide the answer.
  • Format your response as exactly 2 to 3 bullet points.
  • Highlight critical concepts using **bold text**.
- For product definitions (e.g., "What is a GIC?", "What is a mortgage rate?"):
  • Handle minor user typos gracefully (e.g., "morgage" -> mortgage).
  • First, explain the concept in 2 to 3 bullet points using general knowledge.
  • Then, append a Markdown comparison table below the explanation showcasing the current rates.
- For direct rate inquiries AND product definitions, you MUST format the data as a Markdown table exactly like this:
  | Institution | Term | Rate |
  |---|---|---|
  | RBC | 3-year | 3.45% |
  • Populate this table ONLY using the numbers supplied in the "Current Rate Data" section below. Never invent rates.
- Boundary Guidelines:
  • Clearly distinguish educational insights from specific product recommendations.
  • Always recommend consulting a qualified financial advisor.
  • Never solicit or store sensitive PII.

${rateContext ? `--- Current Rate Data ---\n${rateContext}\n--- End Rate Data ---` : ""}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-8).map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
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

    const openaiData = await openaiRes.json();
    let reply = openaiData.choices?.[0]?.message?.content ?? "I'm sorry, I wasn't able to generate a response right now.";

    // 4. Output Guardrail Check
    const outputCheck = validateOutput(reply);
    if (!outputCheck.valid) {
      reply = "I apologize, but I'm having trouble generating a safe response. Please try rephrasing your question.";
    }

    // 5. Rank & Deduplicate Sidebar Matches (Max 3 unique banks)
    const lowerMsg = message.toLowerCase();
    const isMortgageOrLoan = lowerMsg.includes("mortgage") || lowerMsg.includes("loan");
    
    const sorted = [...flatRates].sort((a, b) => {
      const diff = isMortgageOrLoan ? a.rate_percent - b.rate_percent : b.rate_percent - a.rate_percent;
      if (diff !== 0) return diff;
      return a.bank_name.localeCompare(b.bank_name);
    });

    const seenBanks = new Set<string>();
    const bankRankings = sorted
      .filter((r) => {
        if (seenBanks.has(r.bank_name)) return false;
        seenBanks.add(r.bank_name);
        return true;
      })
      .slice(0, 3)
      .map((r, idx) => ({
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

    return new Response(
      JSON.stringify({
        reply,
        banks: bankRankings,
        followUps: ["What are their fees?", "Can I schedule a call?", "Compare interest rates"],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        reply: "I'm experiencing a temporary issue. Please try again in a moment.",
        banks: [],
        followUps: [],
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});