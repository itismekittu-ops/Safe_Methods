import React from 'react';
import { QuoteCta } from './QuoteCta';
import { RateCard } from './RateCard';
import { EmptyRankSlot } from './EmptyRankSlot';
import { CategoryTabs } from './CategoryTabs';
import { TermSelect } from './TermSelect';
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
    <section
      aria-labelledby="rates-heading"
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="relative flex h-full w-full flex-col justify-between rounded-[28px] border border-[#E3DCCD] bg-white p-3.5 sm:p-4 shadow-panel overflow-hidden"
      style={tilt.style}
    >
      <div className="flex h-5 items-center shrink-0">
        <h2 id="rates-heading" className="font-serif text-[18px] sm:text-[19px] font-semibold leading-none text-forest">
          Top Matches
        </h2>
      </div>

      <div className="shrink-0 pt-1">
        <CategoryTabs value={categoryId} onChange={selectCategory} disabled={busy} />
      </div>

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
                    active ? 'bg-[#0B3D2E] text-white' : 'text-[#0B3D2E] hover:text-forest-soft'
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
        <TermSelect value={termId} onChange={setTermId} disabled={busy} />
      </div>

      {/* Static 5-card list with fixed h-[46px] slots preventing overlap */}
      <div aria-live="polite" className="shrink-0 py-1">
        <ul className="flex flex-col gap-1.5">
          {ranked.map((q, i) => {
            const advisor = advisors.find((a) => a.id === q.advisorId);
            if (!advisor) return null;

            // Render empty slot while advisor is actively bidding in the arena
            if (run && !arena.landed.includes(advisor.id)) {
              return (
                <li key={`slot-${advisor.id}`} className="h-[46px]">
                  <EmptyRankSlot rank={i + 1} />
                </li>
              );
            }

            return (
              <li key={advisor.id} className="h-[46px]">
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

      <div className="shrink-0 pt-0.5">
        <QuoteCta onQuote={onQuote} onBook={onBook} />
      </div>
    </section>
  );
}