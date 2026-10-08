import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useBiddingArena } from '../hooks/useBiddingArena';
import { rateCategories, terms } from '../data/rates';
import { rankQuotes, resolveIntent } from '../utils/ranking';
import type { ArenaState } from '../types/arena';
import type { CategoryId } from '../types/rates';

interface BiddingContextValue {
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
}

const BiddingContext = createContext<BiddingContextValue | null>(null);

export function BiddingProvider({ children }: {children: React.ReactNode;}) {
  const reduced = useReducedMotion() ?? false;
  const [categoryId, setCategoryId] = useState<CategoryId>('loan');
  const [optionId, setOptionId] = useState('fixed');
  const [termId, setTermId] = useState('5y');
  const [revealKey, setRevealKey] = useState(0);
  const { state: arena, start, skip } = useBiddingArena();

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
      start({ question, categoryId: category.id, ranked: rankQuotes(option.quotes, category.id, term.offset) });
    },
    [reduced, start, termId]
  );

  const value = useMemo(
    () => ({ categoryId, optionId, termId, revealKey, selectCategory, setOptionId, setTermId, arena, ask, skip }),
    [categoryId, optionId, termId, revealKey, selectCategory, arena, ask, skip]
  );

  return <BiddingContext.Provider value={value}>{children}</BiddingContext.Provider>;
}

export function useBidding() {
  const ctx = useContext(BiddingContext);
  if (!ctx) throw new Error('useBidding must be used inside BiddingProvider');
  return ctx;
}