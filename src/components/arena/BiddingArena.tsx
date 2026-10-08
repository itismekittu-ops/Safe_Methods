import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchIcon } from 'lucide-react';
import { ArenaStage } from './ArenaStage';
import { useBidding } from '../../contexts/BiddingContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { easeOut } from '../../utils/motion';
import type { ArenaPhase } from '../../types/arena';

const statusCopy: Record<ArenaPhase, string> = {
  intro: 'Asking 5 firms…',
  round1: 'Round 1 · Banks are bidding…',
  round2: 'Round 2 · Three bids left',
  duel: 'Final duel',
  winner: 'We have a winner',
  landing: 'We have a winner'
};

export function BiddingArena() {
  const { arena, skip } = useBidding();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const { run, phase } = arena;
  const live = phase === 'round1' || phase === 'round2' || phase === 'duel';

  return (
    <AnimatePresence>
      {run &&
      <motion.div
        key={run.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: easeOut }}
        role="region"
        aria-label="Banks bidding on your question"
        className="absolute inset-x-0 bottom-[100px] top-0 z-20 flex flex-col overflow-hidden px-6 pt-5">
        
          <div className="flex items-center justify-between gap-3">
            <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: easeOut }}
            className="inline-flex min-w-0 items-center gap-2 rounded-full border border-forest/15 bg-white px-3.5 py-1.5 text-sm font-medium text-forest shadow-sm">
            
              <SearchIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{run.question}</span>
            </motion.p>
            {phase !== 'landing' &&
          <button
            type="button"
            onClick={skip}
            className="inline-flex min-h-10 shrink-0 items-center rounded px-2 text-sm font-medium text-muted underline underline-offset-4 transition-colors duration-150 hover:text-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40">
            
                Skip
              </button>
          }
          </div>

          <p aria-live="polite" className="mt-2 flex items-center gap-2 text-sm font-medium text-forest">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              {live &&
            <motion.span
              className="absolute inset-0 rounded-full bg-gold"
              animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }} />

            }
              <span className="relative h-2 w-2 rounded-full bg-gold" />
            </span>
            {statusCopy[phase]}
          </p>

          <div
          className={`relative flex-1 ${desktop ? '' : 'flex items-center justify-center py-2'}`}
          style={{ perspective: 1000 }}>
          
            <ArenaStage run={run} state={arena} desktop={desktop} />
          </div>
        </motion.div>
      }
    </AnimatePresence>);

}