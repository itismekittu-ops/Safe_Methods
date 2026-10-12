import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QuoteCta } from './QuoteCta';
import { RateCard } from './RateCard';
import { EmptyRankSlot } from './EmptyRankSlot';
import { CategoryTabs } from './CategoryTabs';
import { TermSelect } from './TermSelect';
import { useTilt } from '../hooks/useTilt';
import { useBidding } from '../contexts/BiddingContext';
import { advisors, rateCategories, terms } from '../data/rates';
import { rankQuotes } from '../utils/ranking';

const pillTransition = { type: 'spring', stiffness: 520, damping: 40 } as const;

interface RatePanelProps {
  onQuote: () => void;
  onBook: () => void;
}

export function RatePanel({ onQuote, onBook }: RatePanelProps) {
  const { categoryId, optionId, termId, selectCategory, setOptionId, setTermId, arena } = useBidding();
  const tilt = useTilt(4);

  const category = rateCategories.find((c) => c.id === categoryId) ?? rateCategories[0];
  const option = category.options.find((o) => o.id === optionId) ?? category.options[0];
  const term = terms.find((t) => t.id === termId) ?? terms[0];
  const ranked = rankQuotes(option.quotes, category.id, term.offset);
  const run = arena.run;
  const busy = run !== null;
  const hasRateType = category.options.length > 1;

  return (
    <motion.section
      aria-labelledby="rates-heading"
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="relative flex h-full w-full flex-col justify-between rounded-[28px] border border-[#E3DCCD] bg-white px-4 py-3 sm:px-5 sm:py-4 shadow-panel overflow-hidden transition-shadow duration-300"
      style={tilt.style}
    >
      {/* Heading */}
      <div className="flex h-5 items-center shrink-0">
        <h2 id="rates-heading" className="font-serif text-[19px] sm:text-[20px] font-semibold leading-none text-forest">
          Top Matches
        </h2>
      </div>

      {/* Row 1: Horizontally Scrollable Category Tabs */}
      <div className="shrink-0 pt-1">
        <CategoryTabs value={categoryId} onChange={selectCategory} disabled={busy} />
      </div>

      {/* Row 2: Rate Type with clear, high-contrast labels */}
      <div className="flex h-10 items-center justify-between gap-2 shrink-0 pt-0.5">
        {hasRateType ? (
          <div role="radiogroup" aria-label="Rate type" className="flex h-10 rounded-full bg-cream-card ring-1 ring-inset ring-line p-0.5">
            {category.options.map((o) => {
              const active = o.id === option.id;
              return (
                <button
                  key={o.id}
                  role="radio"
                  aria-checked={active}
                  disabled={busy}
                  onClick={() => setOptionId(o.id)}
                  className={`relative h-9 whitespace-nowrap rounded-full px-3.5 text-[12.5px] font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 disabled:cursor-default ${
                    active ? 'text-[#0B3D2E]' : 'text-[#424F49] hover:text-[#0B3D2E]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="option-pill"
                      transition={pillTransition}
                      className="absolute inset-0 rounded-full bg-gold-light"
                    />
                  )}
                  <span className="relative z-10">{o.label}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <span className="text-[13px] font-semibold text-[#424F49]">{option.label}</span>
        )}

        {/* Full Magic Patterns TermSelect Component */}
        <TermSelect value={termId} onChange={setTermId} disabled={busy} />
      </div>

      {/* 5-Card list with clear gap-2 vertical spacing */}
      <div aria-live="polite" className="shrink-0 py-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={`${category.id}-${option.id}-${term.id}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex flex-col gap-2"
          >
            {ranked.map((q, i) => {
              const advisor = advisors.find((a) => a.id === q.advisorId);
              if (!advisor) return null;

              if (run && !arena.landed.includes(advisor.id)) {
                return (
                  <li key={`slot-${advisor.id}`} className="h-[46px] sm:h-[48px]">
                    <EmptyRankSlot rank={i + 1} />
                  </li>
                );
              }

              return (
                <li key={advisor.id} className="h-[46px] sm:h-[48px]">
                  <RateCard
                    advisor={advisor}
                    rate={q.rate}
                    index={i}
                    best={i === 0}
                    arrived={false}
                    quickFlight={false}
                  />
                </li>
              );
            })}
          </motion.ul>
        </AnimatePresence>
      </div>

      {/* Bottom CTAs & Legal Text */}
      <div className="shrink-0 pt-0.5">
        <QuoteCta onQuote={onQuote} onBook={onBook} />
      </div>
    </motion.section>
  );
}