import React from 'react';
import { motion } from 'framer-motion';
import { QuoteCta } from './QuoteCta';
import { RateCard } from './RateCard';
import { EmptyRankSlot } from './EmptyRankSlot';
import { CategoryTabs } from './CategoryTabs';
import { useTilt } from '../hooks/useTilt';
import { useBidding } from '../contexts/BiddingContext';
import { advisors, rateCategories, terms } from '../data/rates';
import { rankQuotes } from '../utils/ranking';

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
      className="relative flex h-full w-full flex-col justify-between rounded-[28px] border border-[#E3DCCD] bg-white p-3.5 sm:p-4 shadow-panel overflow-hidden transition-shadow duration-300"
      style={tilt.style}
    >
      {/* Heading */}
      <div className="flex h-5 items-center shrink-0">
        <h2 id="rates-heading" className="font-serif text-[18px] sm:text-[19px] font-semibold leading-none text-forest">
          Top Matches
        </h2>
      </div>

      {/* Row 1: Category Switcher */}
      <div className="shrink-0 pt-0.5">
        <CategoryTabs value={categoryId} onChange={selectCategory} disabled={busy} />
      </div>

      {/* Row 2: Rate Type + Tenure Dropdown in same line with unified pill styling */}
      <div className="flex h-8 items-center justify-between gap-2 shrink-0 pt-0.5">
        {hasRateType ? (
          <div role="radiogroup" aria-label="Rate type" className="flex h-7 rounded-full border border-line bg-cream-card p-0.5">
            {category.options.map((o) => {
              const active = o.id === option.id;
              return (
                <button
                  key={o.id}
                  role="radio"
                  aria-checked={active}
                  disabled={busy}
                  onClick={() => setOptionId(o.id)}
                  className={`relative h-6 whitespace-nowrap rounded-full px-2.5 text-[11px] font-semibold transition-colors duration-150 focus:outline-none ${
                    active ? 'bg-[#0B3D2E] text-white shadow-xs' : 'text-[#0B3D2E] hover:text-forest-soft'
                  }`}
                >
                  <span className="relative">{o.label}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <span className="text-[12px] font-semibold text-[#5B6660]">{option.label}</span>
        )}

        {/* Compact pill-styled Tenure Dropdown matching the toggle bar */}
        <div className="flex h-7 items-center rounded-full border border-line bg-cream-card px-2">
          <select
            value={termId}
            disabled={busy}
            onChange={(e) => setTermId(e.target.value)}
            className="bg-transparent text-[11px] font-semibold text-[#0B3D2E] focus:outline-none cursor-pointer"
          >
            {terms.map((t) => (
              <option key={t.id} value={t.id} className="text-forest bg-white">
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Static 5-card list with fixed h-[44px] slots to prevent overlap */}
      <div aria-live="polite" className="shrink-0 py-0.5">
        <ul className="flex flex-col gap-1 sm:gap-1.5">
          {ranked.map((q, i) => {
            const advisor = advisors.find((a) => a.id === q.advisorId);
            if (!advisor) return null;

            // Render empty slot while advisor is actively bidding in the arena
            if (run && !arena.landed.includes(advisor.id)) {
              return (
                <li key={`slot-${advisor.id}`} className="h-[44px]">
                  <EmptyRankSlot rank={i + 1} />
                </li>
              );
            }

            return (
              <li key={advisor.id} className="h-[44px]">
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
        </ul>
      </div>

      {/* Bottom CTAs & Legal Text (Fully visible at 100% zoom) */}
      <div className="shrink-0 pt-0.5">
        <QuoteCta onQuote={onQuote} onBook={onBook} />
      </div>
    </motion.section>
  );
}