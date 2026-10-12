import React from 'react';
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

export function RateCard({ advisor, rate, best }: RateCardProps) {
  // Dynamically compute initials from advisor name (e.g., "David Chen" -> "DC")
  const initials = advisor.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-full w-full items-center justify-between rounded-xl px-1.5 py-0.5 transition-colors hover:bg-cream-card/50">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Magic Patterns avatar circle badge */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tracking-tight shadow-xs ${
            best
              ? 'bg-[#0B3D2E] text-white'
              : 'bg-[#EDE5D8] text-[#0B3D2E] border border-[#DDD3C2]'
          }`}
        >
          {initials}
        </div>

        {/* Advisor Details */}
        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="truncate text-[12.5px] font-semibold text-forest">
              {advisor.name}
            </span>
            {best && (
              <span className="inline-flex items-center rounded-md border border-[#DFCBA0] bg-[#FAF2DC] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#8C6D1F]">
                Top pick
              </span>
            )}
          </div>
          <p className="truncate text-[10.5px] text-[#738079] mt-0.5">
            {advisor.firm} · {advisor.title}
          </p>
        </div>
      </div>

      {/* Magic Patterns Serif Rate Display */}
      <div className="shrink-0 text-right pl-2">
        <span className="font-serif text-[16.5px] font-bold tracking-tight text-forest">
          {rate.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}