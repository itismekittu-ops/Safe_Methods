import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrivalSparkle } from './arena/ArrivalSparkle';
import { arenaFlight, easeOut } from '../utils/motion';
import type { Advisor } from '../types/rates';

interface RateCardProps {
  advisor: Advisor;
  rate: number;
  index: number;
  best: boolean;
  layoutId?: string;
  arrived?: boolean;
  quickFlight?: boolean;
}

export function RateCard({
  advisor,
  rate,
  index,
  best,
  layoutId,
  arrived = false,
  quickFlight = false
}: RateCardProps) {
  const delay = index * 0.04;
  const flight = arenaFlight(quickFlight);
  const [sparkle] = useState(arrived && best);
  const childLayout = arrived ? ('position' as const) : undefined;

  const initials = advisor.initials || advisor.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
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
      className={`relative z-10 flex h-[46px] sm:h-[48px] items-center justify-between border pl-3 pr-4 transition-colors duration-150 ${
        best
          ? 'border-forest/20 bg-white shadow-xs'
          : 'border-[#E3DCCD] bg-[#FBF9F4] hover:bg-white'
      }`}
    >
      {sparkle && <ArrivalSparkle delay={flight.duration} />}

      <div className="flex items-center gap-2.5 min-w-0">
        <motion.span
          layout={childLayout}
          aria-hidden="true"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tracking-tight ${
            best
              ? 'bg-[#0B3D2E] text-white shadow-xs'
              : 'bg-[#EDE5D8] text-[#0B3D2E] border border-[#DDD3C2]'
          }`}
        >
          {initials}
        </motion.span>

        <motion.div layout={childLayout} className="min-w-0 flex-1 leading-[1.15]">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[13.5px] font-semibold text-ink">{advisor.name}</p>
            {best && (
              <span className="whitespace-nowrap rounded-md border border-[#DFCBA0] bg-[#FAF2DC] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#8C6D1F]">
                Top pick
              </span>
            )}
          </div>
          <p className="truncate text-[11px] text-[#5B6660]">
            {advisor.firm} · {advisor.title || advisor.role}
          </p>
        </motion.div>
      </div>

      <motion.div layout={childLayout} className="flex shrink-0 items-center justify-end pl-2">
        <p className={`font-serif text-[17px] font-bold leading-none tabular-nums ${best ? 'text-[#0B3D2E]' : 'text-ink'}`}>
          {rate.toFixed(2)}%
        </p>
      </motion.div>
    </motion.div>
  );
}