import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QuoteCta } from './QuoteCta';
import { RateCard } from './RateCard';
import { EmptyRankSlot } from './EmptyRankSlot';
import { CategoryTabs } from './CategoryTabs';
import { TermSelect } from './TermSelect';
import { useTilt } from '../hooks/useTilt';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useBidding } from '../contexts/BiddingContext';
import { advisors, rateCategories, terms } from '../data/rates';
import { arenaLayoutId, rankQuotes } from '../utils/ranking';

const pillTransition = { type: 'spring', stiffness: 520, damping: 40 } as const;

interface RatePanelProps {
  onQuote: () => void;
  onBook: () => void;
}

export function RatePanel({ onQuote, onBook }: RatePanelProps) {
  const { categoryId, optionId, termId, revealKey, selectCategory, setOptionId, setTermId, arena } = useBidding();
  const desktop = useMediaQuery('(min-width: 1024px)');
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
      className="relative flex h-full w-full flex-col rounded-[28px] border border-line/80 bg-white/95 px-5 pb-4 pt-4 shadow-panel backdrop-blur-sm"
      style={tilt.style}>
      
      <div className="flex h-5 items-center">
        <h2 id="rates-heading" className="font-serif text-[20px] font-semibold leading-none text-forest">
          Top Matches
        </h2>
      </div>

      <div aria-hidden="true" className="min-h-4 flex-1" />
      <div>
        <CategoryTabs value={categoryId} onChange={selectCategory} disabled={busy} />
      </div>

      <div aria-hidden="true" className="min-h-3 flex-1" />
      <div className="flex h-10 items-center justify-between gap-2">
        {hasRateType ?
        <div role="radiogroup" aria-label="Rate type" className="flex h-10 rounded-full bg-cream-card ring-1 ring-inset ring-line">
            {category.options.map((o) => {
            const active = o.id === option.id;
            return (
              <button
                key={o.id}
                role="radio"
                aria-checked={active}
                disabled={busy}
                onClick={() => setOptionId(o.id)}
                className={`relative h-10 whitespace-nowrap rounded-full px-3 text-[12.5px] font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 disabled:cursor-default ${
                active ? 'text-forest' : 'text-muted hover:text-ink'}`
                }>
                
                  {active &&
                <motion.span layoutId="option-pill" transition={pillTransition} className="absolute inset-1 rounded-full bg-gold-light" />
                }
                  <span className="relative">{o.label}</span>
                </button>);
            })}
          </div> :

        <span className="text-[13px] font-semibold text-muted">{option.label}</span>
        }
        <TermSelect value={termId} onChange={setTermId} disabled={busy} />
      </div>

      <div aria-hidden="true" className="min-h-[14px] flex-1" />
      <div aria-live="polite">
        <AnimatePresence mode="wait" initial>
          <motion.ul
            key={`${revealKey}-${category.id}-${option.id}-${term.id}`}
            className="flex flex-col gap-1.5">
            
            {ranked.map((q, i) => {
              const advisor = advisors.find((a) => a.id === q.advisorId);
              if (!advisor) return null;
              if (run && !arena.landed.includes(advisor.id)) {
                return <EmptyRankSlot key={`slot-${advisor.id}`} rank={i + 1} />;
              }
              const arrived = run !== null && desktop;
              return (
                <RateCard
                  key={advisor.id}
                  advisor={advisor}
                  rate={q.rate}
                  index={i}
                  best={i === 0}
                  arrived={arrived}
                  quickFlight={run?.quick ?? false}
                  layoutId={arrived && run ? arenaLayoutId(run.id, advisor.id) : undefined} />
              );
            })}
          </motion.ul>
        </AnimatePresence>
      </div>

      <div aria-hidden="true" className="min-h-[18px] flex-1" />
      <div>
        <QuoteCta onQuote={onQuote} onBook={onBook} />
      </div>
    </motion.section>);
}
