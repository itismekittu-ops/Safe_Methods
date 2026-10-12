import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useBiddingArena } from '../hooks/useBiddingArena';
import { rateCategories, terms, advisors } from '../data/rates';
import { rankQuotes, resolveIntent, lowerWins } from '../utils/ranking';
import { supabase } from '../lib/supabase';
import type { ArenaState } from '../types/arena';
import type { CategoryId, Quote } from '../types/rates';

interface LiveDbRate {
  id: string;
  rate_percent: number;
  product_type: string;
  term: string;
  consultant_id?: string;
  banks?: { name: string } | null;
  consultants?: { name: string; title: string } | null;
}

interface BiddingContextValue {
  categoryId: CategoryId;
  optionId: string;
  termId: string;
  revealKey: number;
  sessionToken: string;
  liveQuotes: Quote[];
  selectCategory: (id: CategoryId) => void;
  setOptionId: (id: string) => void;
  setTermId: (id: string) => void;
  arena: ArenaState;
  ask: (question: string) => void;
  skip: () => void;
}

const BiddingContext = createContext<BiddingContextValue | null>(null);

export function BiddingProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion() ?? false;
  const [categoryId, setCategoryId] = useState<CategoryId>('mortgage');
  const [optionId, setOptionId] = useState('fixed');
  const [termId, setTermId] = useState('5y');
  const [revealKey, setRevealKey] = useState(0);
  const [sessionToken] = useState(() => `session_${Math.random().toString(36).substring(2, 9)}`);
  const [dbRates, setDbRates] = useState<LiveDbRate[]>([]);

  const { state: arena, start, skip } = useBiddingArena();

  useEffect(() => {
    async function loadLiveRates() {
      try {
        const { data, error } = await supabase
          .from('rates')
          .select(`
            id,
            product_type,
            term,
            rate_percent,
            consultant_id,
            banks!bank_id (name),
            consultants!consultant_id (name, title)
          `);

        if (!error && data && data.length > 0) {
          setDbRates(data as LiveDbRate[]);
        }
      } catch (err) {
        console.warn('Could not load live rates from Supabase, using fallback', err);
      }
    }

    loadLiveRates();
  }, []);

  const liveQuotes: Quote[] = useMemo(() => {
    const category = rateCategories.find((c) => c.id === categoryId) ?? rateCategories[0];
    const option = category.options.find((o) => o.id === optionId) ?? category.options[0];
    const term = terms.find((t) => t.id === termId) ?? terms[0];

    if (dbRates.length > 0) {
      const yearCount = term.id.replace('y', '');
      const searchNeedle = `${yearCount} year`;

      const matchedRows = dbRates.filter((r) => {
        const tLower = r.term.toLowerCase();

        const pMatch =
          categoryId === 'mortgage' ? r.product_type === 'mortgage' :
          categoryId === 'investment' ? (optionId === 'market-linked' ? r.product_type === 'market_linked' : r.product_type === 'gic') :
          categoryId === 'funds' ? r.product_type === 'investment' && tLower.includes('mutual_funds') :
          categoryId === 'debt' ? r.product_type === 'debt_consolidation' :
          r.product_type === 'personal_loan';

        const tMatch =
          categoryId === 'mortgage' || categoryId === 'loan'
            ? tLower.includes(searchNeedle) && tLower.includes(optionId)
            : tLower.includes(searchNeedle);

        return pMatch && tMatch;
      });

      if (matchedRows.length >= 3) {
        const mappedQuotes: Quote[] = matchedRows.map((r) => {
          const bankName = r.banks?.name?.toLowerCase() || '';
          const advisor = advisors.find((a) => a.firm.toLowerCase().includes(bankName)) || advisors[0];
          return {
            advisorId: advisor.id,
            rate: Number(r.rate_percent),
          };
        });

        const bestPerAdvisor = new Map<string, number>();
        mappedQuotes.forEach((q) => {
          if (!bestPerAdvisor.has(q.advisorId)) {
            bestPerAdvisor.set(q.advisorId, q.rate);
          } else {
            const cur = bestPerAdvisor.get(q.advisorId)!;
            bestPerAdvisor.set(
              q.advisorId,
              lowerWins(categoryId) ? Math.min(cur, q.rate) : Math.max(cur, q.rate)
            );
          }
        });

        const quotesArr = Array.from(bestPerAdvisor.entries()).map(([advisorId, rate]) => ({
          advisorId,
          rate,
        }));

        return rankQuotes(quotesArr, categoryId, 0);
      }
    }

    return rankQuotes(option.quotes, category.id, term.offset);
  }, [categoryId, optionId, termId, dbRates]);

  const selectCategory = useCallback((id: CategoryId) => {
    setCategoryId(id);
    const next = rateCategories.find((c) => c.id === id);
    if (next) setOptionId(next.options[0].id);
  }, []);

  const ask = useCallback(
    (question: string) => {
      const intent = resolveIntent(question);
      const category = rateCategories.find((c) => c.id === intent.categoryId) ?? rateCategories[0];
      const option = category.options.find((o) => o.id === intent.optionId) ?? category.options[0];
      const nextTermId = intent.termId ?? termId;
      const term = terms.find((t) => t.id === nextTermId) ?? terms[0];

      setCategoryId(category.id);
      setOptionId(option.id);
      setTermId(term.id);
      setRevealKey((k) => k + 1);

      if (reduced) return;
      start({
        question,
        categoryId: category.id,
        ranked: liveQuotes.length > 0 ? liveQuotes : rankQuotes(option.quotes, category.id, term.offset),
      });
    },
    [reduced, start, termId, liveQuotes]
  );

  const value = useMemo(
    () => ({
      categoryId,
      optionId,
      termId,
      revealKey,
      sessionToken,
      liveQuotes,
      selectCategory,
      setOptionId,
      setTermId,
      arena,
      ask,
      skip,
    }),
    [categoryId, optionId, termId, revealKey, sessionToken, liveQuotes, selectCategory, arena, ask, skip]
  );

  return <BiddingContext.Provider value={value}>{children}</BiddingContext.Provider>;
}

export function useBidding() {
  const ctx = useContext(BiddingContext);
  if (!ctx) throw new Error('useBidding must be used inside BiddingProvider');
  return ctx;
}