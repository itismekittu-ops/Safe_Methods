import React, { useEffect, useState, useRef, useCallback } from "react";
import { SearchIcon, BuildingIcon, CheckIcon, LoaderIcon, FileTextIcon, CalendarIcon, ArrowRightIcon, ArrowDownIcon } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GetQuotesModal } from "./GetQuotesModal";
import type { BankMatchRef } from "./GetQuotesModal";
import { Button } from "./Button";
import { PRE_CANNED_QUESTIONS, findPreCannedMatch, formatPreCannedResponse } from "../data/preCannedQuestions";
import type { PreCannedQA } from "../data/preCannedQuestions";
import { supabase } from "../lib/supabase";

const SESSION_KEY = "safebot_session_token";

type CategoryFilter = "loan" | "investment" | "mortgage";
type RateTypeFilter = "variable" | "fixed";

const TENURE_OPTIONS = ["1 year", "2 years", "3 years", "4 years", "5 years"];

const PLACEHOLDER_TERMS = [
  "loans...",
  "mortgages...",
  "personal investments...",
  "mutual funds...",
  "debt consolidation...",
];

function useRotatingPlaceholder(intervalMs: number, enabled: boolean) {
  const [termIndex, setTermIndex] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      setTermIndex((prev) => (prev + 1) % PLACEHOLDER_TERMS.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
  return `Ask me anything about ${PLACEHOLDER_TERMS[termIndex]}`;
}

interface BankMatch {
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

interface ChatMessage {
  role: "user" | "bot";
  content: string;
}

interface DbRate {
  product_type: string;
  term: string;
  rate_percent: string;
  consultant_id: string | null;
  banks: { name: string } | null;
  consultants: { name: string; title: string } | null;
}

const DEFAULT_BANKS: BankMatch[] = [
  { name: "RBC", productType: "general", term: null, rate: 0, rank: 1, isBest: true, consultantId: null, consultantName: "Victor Gaur", consultantTitle: "Principal Financial Advisor", consultantAvatarUrl: null },
  { name: "TD", productType: "general", term: null, rate: 0, rank: 2, isBest: false, consultantId: null, consultantName: "Sarah Mitchell", consultantTitle: "Senior Investment Advisor", consultantAvatarUrl: null },
  { name: "BMO", productType: "general", term: null, rate: 0, rank: 3, isBest: false, consultantId: null, consultantName: "David Chen", consultantTitle: "Wealth Management Specialist", consultantAvatarUrl: null },
];

function extractYear(term: string): number | null {
  const match = term.match(/(\d+)\s*[-]?\s*year/i);
  return match ? parseInt(match[1], 10) : null;
}

function tenureToYear(tenure: string): number {
  const match = tenure.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 2;
}

function computeRankedMatches(
  category: CategoryFilter,
  rateType: RateTypeFilter,
  tenure: string,
  allRates: DbRate[]
): BankMatch[] {
  const targetYear = tenureToYear(tenure);

  let filtered: DbRate[];

  if (category === "mortgage") {
    filtered = allRates.filter((r) => r.product_type === "mortgage");
    if (rateType === "variable") {
      filtered = filtered.filter((r) => r.term.toLowerCase().includes("variable"));
    } else {
      filtered = filtered.filter((r) => r.term.toLowerCase().includes("fixed"));
    }
  } else if (category === "investment") {
    if (rateType === "fixed") {
      filtered = allRates.filter((r) => r.product_type === "gic");
    } else {
      filtered = allRates.filter((r) => r.product_type === "market_linked");
    }
  } else {
    filtered = allRates.filter((r) => r.product_type === "mortgage");
    if (rateType === "variable") {
      filtered = filtered.filter((r) => r.term.toLowerCase().includes("variable"));
    } else {
      filtered = filtered.filter((r) => r.term.toLowerCase().includes("fixed"));
    }
  }

  if (filtered.length === 0) {
    if (category === "investment") {
      filtered = allRates.filter((r) => r.product_type === "gic" || r.product_type === "market_linked");
    } else {
      filtered = allRates.filter((r) => r.product_type === "mortgage");
    }
    if (filtered.length === 0) return [];
  }

  let matched = filtered.filter((r) => extractYear(r.term) === targetYear);

  if (matched.length === 0) {
    const withYears = filtered
      .map((r) => ({ rate: r, year: extractYear(r.term) }))
      .filter((x) => x.year !== null);

    if (withYears.length > 0) {
      withYears.sort((a, b) => Math.abs(a.year! - targetYear) - Math.abs(b.year! - targetYear));
      const closestYear = withYears[0].year;
      matched = withYears.filter((x) => x.year === closestYear).map((x) => x.rate);
    }
  }

  if (matched.length === 0) return [];

  if (category === "investment") {
    matched.sort((a, b) => parseFloat(b.rate_percent) - parseFloat(a.rate_percent));
  } else {
    matched.sort((a, b) => parseFloat(a.rate_percent) - parseFloat(b.rate_percent));
  }

  const seen = new Set<string>();
  const top: BankMatch[] = [];
  for (const r of matched) {
    const instName = r.banks?.name ?? "";
    if (!instName || seen.has(instName)) continue;
    seen.add(instName);
    top.push({
      name: instName,
      productType: r.product_type,
      term: r.term,
      rate: parseFloat(r.rate_percent),
      rank: top.length + 1,
      isBest: top.length === 0,
      consultantId: r.consultant_id,
      consultantName: r.consultants?.name ?? null,
      consultantTitle: r.consultants?.title ?? null,
      consultantAvatarUrl: null,
    });
    if (top.length >= 3) break;
  }

  return top;
}

export function HeroSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [banks, setBanks] = useState<BankMatch[]>([]);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [quotesOpen, setQuotesOpen] = useState(false);
  const [detectedTopic, setDetectedTopic] = useState<"loan" | "investment">("loan");
  const [highlightMatches, setHighlightMatches] = useState(false);
  const matchesRef = useRef<HTMLDivElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("loan");
  const [selectedRateType, setSelectedRateType] = useState<RateTypeFilter>("variable");
  const [selectedTenure, setSelectedTenure] = useState("2 years");
  const [allRates, setAllRates] = useState<DbRate[]>([]);
  const [ratesLoading, setRatesLoading] = useState(true);

  const isEmpty = messages.length === 0;
  const rotatingPlaceholder = useRotatingPlaceholder(2200, true);

  const triggerMatchFocus = () => {
    matchesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setHighlightMatches(true);
    window.setTimeout(() => setHighlightMatches(false), 1800);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('rates')
          .select(`
            product_type,
            term,
            rate_percent,
            consultant_id,
            banks!bank_id (name),
            consultants!consultant_id (name, title)
          `);
        if (!error && data) {
          setAllRates(data as DbRate[]);
        }
      } catch {
        // ignore — will fall back to DEFAULT_BANKS
      } finally {
        setRatesLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (allRates.length === 0) return;
    const ranked = computeRankedMatches(selectedCategory, selectedRateType, selectedTenure, allRates);
    setBanks(ranked.length > 0 ? ranked : DEFAULT_BANKS);
    setDetectedTopic(selectedCategory === "investment" ? "investment" : "loan");
  }, [selectedCategory, selectedRateType, selectedTenure, allRates]);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) return;
    setSessionToken(stored);

    (async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
        const resp = await fetch(`${supabaseUrl}/functions/v1/safebot-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          },
          body: JSON.stringify({ action: "history", sessionToken: stored, message: "" }),
        });

        if (!resp.ok) return;
        const { messages: rows } = (await resp.json()) as {
          messages?: Array<{ role: string; content: string }>;
        };

        if (rows && rows.length > 0) {
          setMessages(
            rows.map((r) => ({
              role: r.role === "user" ? "user" as const : "bot" as const,
              content: r.content,
            }))
          );
        }
      } catch {
        // Silently ignore — user starts with a fresh chat
      }
    })();
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: ChatMessage = { role: "user", content: text };

      const match = findPreCannedMatch(text);
      if (match) {
        const botReply = formatPreCannedResponse(match);
        setMessages((prev) => [...prev, userMessage, { role: "bot", content: botReply }]);
        setInputValue("");
        setFollowUps(match.followUpChips);
        setSelectedRateType("variable");

        const matchId = match.id;
        if (matchId === "personal_investments" || matchId === "mutual_funds") {
          setSelectedCategory("investment");
        } else if (matchId === "mortgage") {
          setSelectedCategory("mortgage");
        } else {
          setSelectedCategory("loan");
        }
        return;
      }

      const currentMessages = [...messages, userMessage];
      setMessages(currentMessages);
      setInputValue("");
      setIsLoading(true);

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
        const apiUrl = `${supabaseUrl}/functions/v1/safebot-chat`;

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          },
          body: JSON.stringify({
            message: text,
            sessionToken: sessionToken,
            history: currentMessages.map((m) => ({
              role: m.role === "user" ? "user" : "assistant",
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }

        const data = await response.json();

        if (!data || typeof data.reply !== "string") {
          throw new Error("Invalid response from server");
        }

        if (data.sessionToken) {
          setSessionToken(data.sessionToken);
          sessionStorage.setItem(SESSION_KEY, data.sessionToken);
        }

        setMessages((prev) => [...prev, { role: "bot", content: data.reply }]);

        if (data.banks && Array.isArray(data.banks) && data.banks.length > 0) {
          setBanks(data.banks);
        }

        const combinedText = (text + " " + (data.reply || "")).toLowerCase();
        const investmentKeywords = /\b(gic|investment|invest|stocks?|mutual fund|etf|rrsp|tfsa|portfolio|dividend|bond|savings? rate|compound|market-linked)\b/;
        const mortgageKeywords = /\b(mortgage|renew|refinanc|amortiz|down payment|pre-approval)\b/;
        const loanKeywords = /\b(loan|credit|debt|borrow|lending|consolidat|interest rate|line of credit|heloc)\b/;
        if (investmentKeywords.test(combinedText)) {
          setDetectedTopic("investment");
          setSelectedCategory("investment");
        } else if (mortgageKeywords.test(combinedText)) {
          setDetectedTopic("loan");
          setSelectedCategory("mortgage");
        } else if (loanKeywords.test(combinedText)) {
          setDetectedTopic("loan");
          setSelectedCategory("loan");
        }

        if (data.followUps && Array.isArray(data.followUps)) {
          setFollowUps(data.followUps);
        } else {
          setFollowUps([]);
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content:
              "I'm experiencing a temporary issue connecting to my knowledge base. Please try again in a moment.",
          },
        ]);
        setFollowUps([]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, sessionToken]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend(inputValue);
    }
  };

  const showSkeletons = isLoading || ratesLoading;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Left Column: Chat / Demo */}
      <div className="lg:col-span-2 bg-surface border border-border-subtle rounded-2xl p-5 shadow-soft flex flex-col justify-between overflow-hidden h-[620px] max-h-[620px]">
        {isEmpty ? (
          <>
            <div className="shrink-0 text-center mb-3">
              <p className="text-sm md:text-base font-semibold text-foreground tracking-tight">
                Only 1 in 4 (25%) Canadians turn to a financial advisor or planner for advice
              </p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-lg mx-auto">
                We bring financial experts from top big firms so you can compare & choose the best product or interest rate.
              </p>
            </div>

            <div className="flex-1 flex flex-col justify-center my-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRE_CANNED_QUESTIONS.slice(0, 6).map((item: PreCannedQA) => (
                  <button
                    key={item.id}
                    onClick={() => handleSend(item.question)}
                    className="p-3 rounded-xl border border-border-subtle bg-background hover:bg-muted/40 hover:border-primary/40 transition-all text-left flex items-center justify-between gap-3 group shadow-xs cursor-pointer"
                  >
                    <span className="text-xs md:text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{item.question}</span>
                    <SearchIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            <div className="shrink-0 pt-3 border-t border-border-subtle/40">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder={rotatingPlaceholder}
                  className="w-full pl-6 pr-14 py-3.5 bg-background border border-border-subtle text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-soft disabled:opacity-60"
                  style={{ borderRadius: "9999px" }}
                />
                <button
                  onClick={() => handleSend(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                  aria-label="Search"
                >
                  {isLoading ? (
                    <LoaderIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <SearchIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    {msg.role === "bot" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="text-gray-800 text-sm leading-relaxed"
                        components={{
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-4">
                              <table className="w-full border-collapse border border-gray-300 text-sm" {...props} />
                            </div>
                          ),
                          thead: ({ node, ...props }) => <thead className="bg-gray-100" {...props} />,
                          th: ({ node, ...props }) => (
                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-800" {...props} />
                          ),
                          td: ({ node, ...props }) => (
                            <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc pl-6 my-3 space-y-1 text-gray-800" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal pl-6 my-3 space-y-1 text-gray-800" {...props} />
                          ),
                          li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground rounded-2xl rounded-tl-sm p-4">
                    <div className="flex items-center gap-2">
                      <LoaderIcon className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">SafeBot is analyzing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {!isLoading && messages[messages.length - 1]?.role === "bot" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="shrink-0 mx-auto my-3 flex w-full max-w-md flex-col items-center gap-2 rounded-lg border border-accent/60 bg-background px-6 py-3 text-center shadow-soft"
              >
                <button
                  type="button"
                  onClick={triggerMatchFocus}
                  className="group inline-flex items-center gap-2 font-heading text-lg font-semibold text-primary focus:outline-none focus-visible:underline cursor-pointer"
                >
                  <span>Your best options are on the right</span>
                  <ArrowRightIcon className="hidden h-4 w-4 text-accent transition-transform group-hover:translate-x-1.5 lg:block" aria-hidden="true" />
                  <ArrowDownIcon className="h-4 w-4 text-accent transition-transform group-hover:translate-y-1.5 lg:hidden" aria-hidden="true" />
                </button>
                <p className="-mt-1 text-sm font-medium text-foreground">
                  Get <span className="font-semibold text-emerald-700">free</span>, no-obligation quotes in your inbox
                </p>
                <Button onClick={() => setQuotesOpen(true)} className="px-6 py-2">
                  <span className="inline-flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4" aria-hidden="true" />
                    Get Quotes
                  </span>
                </Button>
              </motion.div>
            )}

            {followUps.length > 0 && !isLoading && (
              <div className="shrink-0 py-2 flex flex-wrap gap-1.5">
                {followUps.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="text-xs px-4 py-1.5 border border-border-subtle bg-background hover:bg-muted text-foreground transition-colors"
                    style={{ borderRadius: "9999px" }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            <div className="shrink-0 pt-3 border-t border-border-subtle/40">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder={rotatingPlaceholder}
                  className="w-full pl-6 pr-14 py-3.5 bg-background border border-border-subtle text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-soft disabled:opacity-60"
                  style={{ borderRadius: "9999px" }}
                />
                <button
                  onClick={() => handleSend(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                  aria-label="Search"
                >
                  {isLoading ? (
                    <LoaderIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <SearchIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Column: Top Matches */}
      <motion.div
        ref={matchesRef}
        animate={highlightMatches ? { scale: [1, 1.015, 1], y: [0, -6, 0] } : { scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`lg:col-span-1 bg-surface border border-border-subtle rounded-2xl p-5 shadow-soft flex flex-col justify-between overflow-hidden h-[620px] max-h-[620px] ${highlightMatches ? 'ring-2 ring-accent ring-offset-4 ring-offset-background' : ''} transition-all duration-300`}
      >
        <div className="shrink-0">
          <h3 className="font-heading text-2xl text-foreground mb-3">
            Top Matches
          </h3>

          {/* Row 1: Category Switcher */}
          <div className="bg-muted/40 p-1 rounded-xl border border-border-subtle flex gap-1 w-full">
            {(["loan", "investment", "mortgage"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-1 text-center py-1 text-xs rounded-lg transition-colors capitalize ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Row 2: Rate Structure + Tenure in one line */}
          <div className="flex items-center justify-between gap-2 mt-2 w-full">
            <div className="bg-muted/40 p-1 rounded-xl border border-border-subtle flex gap-1 flex-1">
              {(["fixed", "variable"] as const).map((rt) => {
                const label = selectedCategory === "investment"
                  ? (rt === "fixed" ? "Fixed Rate GIC" : "Market Linked GIC")
                  : (rt === "fixed" ? "Fixed" : "Variable");
                return (
                  <button
                    key={rt}
                    onClick={() => setSelectedRateType(rt)}
                    className={`flex-1 text-center py-1 text-xs rounded-lg transition-colors ${
                      selectedRateType === rt
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <select
              value={selectedTenure}
              onChange={(e) => setSelectedTenure(e.target.value)}
              className="shrink-0 w-[105px] py-1 text-xs border border-border-subtle rounded-xl bg-background px-2 font-medium focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {TENURE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Match Cards */}
        <div className="flex-1 flex flex-col gap-3 my-3 overflow-y-auto">
          {showSkeletons ? (
            <>
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="flex items-center gap-3 p-4 rounded-lg border bg-surface border-border-subtle animate-pulse"
                >
                  <div className="w-11 h-11 rounded-lg bg-muted shrink-0" />
                  <div className="flex-grow min-w-0 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                  <div className="w-10 h-6 bg-muted rounded shrink-0" />
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Analyzing market rates & matching experts...
              </p>
            </>
          ) : (
            <>
              {(banks.length > 0 ? banks : DEFAULT_BANKS).map((bank) => (
                <div
                  key={bank.rank}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                    bank.isBest
                      ? "bg-accent/10 border-accent/40 shadow-soft"
                      : "bg-surface border-border-subtle"
                  }`}
                >
                  <div
                    className={`relative w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                      bank.isBest
                        ? "bg-accent/20 border border-accent/50"
                        : "bg-muted border border-border-subtle"
                    }`}
                  >
                    <BuildingIcon
                      className={`w-5 h-5 ${
                        bank.isBest ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    {bank.isBest && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                        <CheckIcon className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {bank.consultantName ?? bank.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {bank.name}
                      {bank.consultantTitle ? ` · ${bank.consultantTitle}` : ""}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    {bank.rate > 0 ? (
                      <span
                        className={`font-heading text-lg font-bold ${
                          bank.isBest ? "text-accent" : "text-foreground"
                        }`}
                      >
                        {bank.rate}%
                      </span>
                    ) : (
                      <span className="font-heading text-lg font-bold text-muted-foreground">&mdash;</span>
                    )}
                  </div>
                </div>
              ))}

              <p className="text-xs text-muted-foreground mt-1 leading-relaxed text-center">
                AI can make mistakes, We encourage you to speak to real advisors for personalized offers.
              </p>
            </>
          )}
        </div>

        {/* Bottom CTAs */}
        <div className="shrink-0 flex flex-col gap-2">
          <Button
            variant="primary"
            className="w-full bg-accent text-primary hover:bg-accent/90 border-transparent"
            onClick={() => setQuotesOpen(true)}
          >
            <FileTextIcon className="h-4 w-4 mr-2" />
            Get <span className="text-accent font-bold">Free</span> Quotes
          </Button>

          <p className="text-xs font-medium text-foreground text-center">
            Make institutions <span className="text-primary font-bold underline decoration-accent underline-offset-2">Bid</span> for you
          </p>

          <button
            type="button"
            onClick={() => {
              const url = import.meta.env.VITE_CALENDLY_URL || "https://calendly.com/safemethods";
              window.open(url, "_blank", "noopener,noreferrer");
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md border border-border-subtle bg-surface text-foreground hover:border-border hover:bg-muted transition-colors"
          >
            <CalendarIcon className="h-4 w-4" />
            Book a Consultant
          </button>
        </div>
      </motion.div>

      <GetQuotesModal
        open={quotesOpen}
        onClose={() => setQuotesOpen(false)}
        banks={(banks.length > 0 ? banks : DEFAULT_BANKS).map((b): BankMatchRef => ({
          name: b.name,
          productType: detectedTopic === "investment" ? "gic" : b.productType,
          rate: b.rate,
          rank: b.rank,
          consultantId: b.consultantId,
          consultantName: b.consultantName,
        }))}
        sessionToken={sessionToken}
      />
    </div>
  );
}
