import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CountUp } from './CountUp';
import { ArrivalSparkle } from './arena/ArrivalSparkle';
import { arenaFlight, easeOut } from '../utils/motion';
import type { Advisor } from '../types/rates';

interface RateCardProps {
  advisor: Advisor;
  rate: number;
  index: number;
  best: boolean;
  /** Shared-element id used when the card flies in from the bidding arena. */
  layoutId?: string;
  /** True when the card lands from the arena: skip slide-in and count-up, pop the badge. */
  arrived?: boolean;
  /** Quick arena runs use a shorter flight. */
  quickFlight?: boolean;
}

export function RateCard({ advisor, rate, index, best, layoutId, arrived = false, quickFlight = false }: RateCardProps) {
  const delay = index * 0.04;
  const flight = arenaFlight(quickFlight);
  // Captured on mount so the sparkle can finish even after the arena run ends.
  const [sparkle] = useState(arrived && best);
  // Keep inner content from stretching while the card flies between differently sized boxes.
  const childLayout = arrived ? 'position' as const : undefined;

  return (
    <motion.li
      layoutId={layoutId}
      initial={arrived ? { opacity: best ? 1 : 0.6 } : { opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{
        duration: arrived ? flight.duration : 0.26,
        delay: arrived ? 0 : delay,
        ease: easeOut,
        layout: flight
      }}
      style={{ borderRadius: 14 }}
      className={`relative z-10 flex h-12 items-center gap-2.5 border pl-3 pr-4 ${
      best ? 'border-forest/15 bg-white' : 'border-line/80 bg-cream-card'}`
      }>
      
      {sparkle && <ArrivalSparkle delay={flight.duration} />}
      <motion.span
        layout={childLayout}
        aria-hidden="true"
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-serif text-[11px] font-medium ${
        best ? 'bg-forest text-gold' : 'bg-cream-deep text-forest'}`
        }>
        
        {advisor.initials}
      </motion.span>
      <motion.div layout={childLayout} className="min-w-0 flex-1 leading-[1.15]">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[14px] font-semibold text-ink">{advisor.name}</p>
          {best &&
          <motion.span
            initial={arrived ? { opacity: 0, scale: 0.7 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 520, damping: 20, delay: arrived ? flight.duration : 0 }}
            className="whitespace-nowrap rounded-full bg-gold-light px-1.5 py-px text-[10px] font-semibold text-forest">
            
              Top pick
            </motion.span>
          }
        </div>
        <p className="truncate text-[12px] text-muted">
          {advisor.firm} · {advisor.role}
        </p>
      </motion.div>
      <motion.div layout={childLayout} className="flex shrink-0 items-center justify-end self-stretch">
        <p className={`font-serif text-[18px] font-medium leading-none tabular-nums ${best ? 'text-forest' : 'text-ink'}`}>
          <CountUp value={rate} delay={delay + 0.05} instant={arrived} />
        </p>
      </motion.div>
    </motion.li>);

}