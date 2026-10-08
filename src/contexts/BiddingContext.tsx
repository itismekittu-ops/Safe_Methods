import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useBiddingArena } from '../hooks/useBiddingArena';
import { rateCategories, terms as fallbackTerms, advisors } from '../data/rates';
import { rankQuotes, resolveIntent } from '../utils/ranking';
import { supabase } from '../lib/supabase';
import { findPreCannedMatch, formatPreCannedResponse } from '../data/preCannedQuestions';
import type { ArenaState } from '../types/arena';
import type { CategoryId, RateCategory, RateOption, Quote } from '../types/rates';

interface DbRate {
  product_type: string;
  term: string;
  rate_percent: string;
  consultant_id: string | null;
  banks: { name: string } | null;
  consultants: { name: string; title: string } | null;
}

interface ChatResponse {
  reply: string;
  sessionToken?: string;
  banks?: Array<{ name: string; productType: string; rate: number; rank: number }>;
  followUps?: string[];
}

export interface BiddingContextValue {
  categoryId: CategoryId;
  optionId: string;
  termId: string;
  revealKey: number;
  selectCategory: (id: CategoryId) => void;
  setOptionId: (id: string) => void;
  setTermId: (id: string) => void;
  arena: ArenaState;
  ask: (question: string) => void;
  skip: () => void;
  /** Pre-canned answer text ready when the arena finishes, or null. */
  cachedAnswer: string | null;
  /** AI chat reply from safebot-chat for novel questions, or null. */
  chatReply: string | null;
  /** Follow-up chips from the last answer. */
  followUps: string[];
  /** Session token from safebot-chat. */
  sessionToken: string | null;
}

const BiddingContext = createContext<BiddingContextValue | null>(null);

const SESSION_KEY = 'safebot_session_token';

/** Map Supabase product_type + rate-type to our CategoryId/optionId structure. */
function dbRateToQuote(db: DbRate[], categoryId: CategoryId, optionId: string): Quote[] {
  const matching = db.filter((r) => {
    if (categoryId === 'loan') {
      return r.product_type === 'personal_loan' && (optionId === 'variable' ? r.term.toLowerCase().includes('variable') : r.term.toLowerCase().includes('fixed'));
    }
    if (categoryId === 'mortgage') {
      return r.product_type === 'mortgage' && (optionId === 'variable' ? r.term.toLowerCase().includes('variable') : r.term.toLowerCase().includes('fixed'));
    }
    if (categoryId === 'investment') {
      if (optionId === 'gic') return r.product_type === 'gic';
      return r.product_type === 'market_linked';
    }
    if (categoryId === 'funds') {
      return r.product_type === 'mutual_fund' || r.product_type === 'investment';
    }
    if (categoryId === 'debt') {
      return r.product_type === 'personal_loan' || r.product_type === 'debt_consolidation';
    }
    return false;
  });

  if (matching.length === 0) return [];

  // Map bank names to advisor IDs
  const firmToAdvisor: Record<string, string> = {
    BMO: 'david', RBC: 'victor', TD: 'sarah', Scotiabank: 'emily', CIBC: 'daniel',
  };

  const quotes: Quote[] = [];
  const seen = new Set<string>();
  for (const r of matching) {
    const firm = r.banks?.name ?? '';
    const advisorId = firmToAdvisor[firm];
    if (!advisorId || seen.has(advisorId)) continue;
    seen.add(advisorId);
    quotes.push({ advisorId, rate: parseFloat(r.rate_percent) });
  }

  return quotes;
}

/** Build live rate categories by merging Supabase data into the fallback structure. */
function buildLiveCategories(db: DbRate[]): RateCategory[] {
  return rateCategories.map((cat) => {
    const liveOptions = cat.options.map((opt) => {
      const liveQuotes = dbRateToQuote(db, cat.id, opt.id);
      if (liveQuotes.length > 0) {
        return { ...opt, quotes: liveQuotes, caption: 'Live rate' };
      }
      return { ...opt, caption: 'Sample rate' };
    });
    return { ...cat, options: liveOptions };
  });
}

export function BiddingProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion() ?? false;
  const [categoryId, setCategoryId] = useState<CategoryId>('loan');
  const [optionId, setOptionId] = useState('fixed');
  const [termId, setTermId] = useState('5y');
  const [revealKey, setRevealKey] = useState(0);
  const { state: arena, start, skip } = useBiddingArena();
  const [liveCategories, setLiveCategories] = useState<RateCategory[] | null>(null);
  const [cachedAnswer, setCachedAnswer] = useState<string | null>(null);
  const [chatReply, setChatReply] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const sessionTokenRef = useRef<string | null>(null);

  const categories = liveCategories ?? rateCategories;
  const termsList = fallbackTerms;

  // Fetch live rates from Supabase on mount
  useEffect(() => {
    let cancelled = false;
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
        if (!cancelled && !error && data && data.length > 0) {
          setLiveCategories(buildLiveCategories(data as DbRate[]));
        }
      } catch {
        // Fall back to static rates
      }
    })();

    // Restore session token
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        setSessionToken(stored);
        sessionTokenRef.current = stored;
      }
    } catch { /* sessionStorage unavailable */ }

    return () => { cancelled = true; };
  }, []);

  const selectCategory = useCallback((id: CategoryId) => {
    setCategoryId(id);
    const next = categories.find((c) => c.id === id);
    if (next) setOptionId(next.options[0].id);
  }, [categories]);

  const ask = useCallback(
    (question: string) => {
      const intent = resolveIntent(question);
      const category = categories.find((c) => c.id === intent.categoryId) ?? categories[0];
      const option = category.options.find((o) => o.id === intent.optionId) ?? category.options[0];
      const nextTermId = intent.termId ?? termId;
      const term = termsList.find((t) => t.id === nextTermId) ?? termsList[0];

      setCategoryId(category.id);
      setOptionId(option.id);
      setTermId(term.id);
      setRevealKey((k) => k + 1);
      setCachedAnswer(null);
      setChatReply(null);
      setFollowUps([]);

      if (!reduced) {
        start({ question, categoryId: category.id, ranked: rankQuotes(option.quotes, category.id, term.offset) });
      }

      // Check pre-canned questions first
      const canned = findPreCannedMatch(question);
      if (canned) {
        const answer = formatPreCannedResponse(canned);
        setCachedAnswer(answer);
        setFollowUps(canned.followUpChips);
        return;
      }

      // Novel question: dispatch to safebot-chat edge function
      (async () => {
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
          const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
          const resp = await fetch(`${supabaseUrl}/functions/v1/safebot-chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${anonKey}`,
              apikey: anonKey,
            },
            body: JSON.stringify({
              message: question,
              sessionToken: sessionTokenRef.current,
              history: [],
            }),
          });

          if (!resp.ok) return;
          const data = (await resp.json()) as ChatResponse;

          if (data.sessionToken) {
            sessionTokenRef.current = data.sessionToken;
            setSessionToken(data.sessionToken);
            try { sessionStorage.setItem(SESSION_KEY, data.sessionToken); } catch { /* */ }
          }

          if (typeof data.reply === 'string') {
            setChatReply(data.reply);
          }
          if (data.followUps && Array.isArray(data.followUps)) {
            setFollowUps(data.followUps);
          }
        } catch {
          // Network/API error — arena still plays, user can retry
        }
      })();
    },
    [reduced, start, termId, categories, termsList]
  );

  const value = useMemo(
    () => ({
      categoryId, optionId, termId, revealKey,
      selectCategory, setOptionId, setTermId,
      arena, ask, skip,
      cachedAnswer, chatReply, followUps, sessionToken,
    }),
    [categoryId, optionId, termId, revealKey, selectCategory, arena, ask, skip, cachedAnswer, chatReply, followUps, sessionToken]
  );

  return <BiddingContext.Provider value={value}>{children}</BiddingContext.Provider>;
}

export function useBidding() {
  const ctx = useContext(BiddingContext);
  if (!ctx) throw new Error('useBidding must be used inside BiddingProvider');
  return ctx;
}
