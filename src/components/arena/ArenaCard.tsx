import React, { useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { ArrowDownIcon, ArrowUpIcon, CrownIcon } from 'lucide-react';
import { RateTicker } from './RateTicker';
import { AdvisorAvatar } from './AdvisorAvatar';
import { easeOut } from '../../utils/motion';
import { ARENA_CARD, WINNER_CARD } from '../../utils/arenaGeometry';
import type { Advisor } from '../../types/rates';

interface ArenaCardProps {
  advisor: Advisor;
  /** 0 = best bid. */
  rankIndex: number;
  finalRate: number;
  lowerWins: boolean;
  round: number;
  totalRounds: number;
  leaving: boolean;
  isWinner: boolean;
  winnerLabel: string;
  desktop: boolean;
  quick: boolean;
  enterDelay: number;
  layoutId?: string;
  /** Desktop only: absolute position inside the stage. */
  pos?: {left: number;top: number;};
  toward?: {x: number;y: number;};
  tilt?: {rotateX: number;rotateY: number;};
}

const LUNGE = 18;
const baseShadow = '0 0 0 0px rgba(201,162,39,0), 0 12px 26px -16px rgba(11,61,46,0.35)';
const winShadow = '0 0 0 2px rgba(201,162,39,1), 0 0 0 8px rgba(201,162,39,0.18), 0 22px 48px -14px rgba(201,162,39,0.6)';

export function ArenaCard({
  advisor,
  rankIndex,
  finalRate,
  lowerWins,
  round,
  totalRounds,
  leaving,
  isWinner,
  winnerLabel,
  desktop,
  quick,
  enterDelay,
  layoutId,
  pos,
  toward = { x: 0, y: 0 },
  tilt = { rotateX: 0, rotateY: 0 }
}: ArenaCardProps) {
  const controls = useAnimationControls();
  const rest = desktop ? tilt : { rotateX: 0, rotateY: 0 };
  // Bids start a little worse and close in on the final rate with every collision.
  const spread = 0.3 + rankIndex * 0.08;
  const ticker = finalRate + (lowerWins ? 1 : -1) * spread * (1 - round / totalRounds);
  const step = spread / totalRounds;

  useEffect(() => {
    controls.start({
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      ...rest,
      transition: { duration: quick ? 0.25 : 0.3, delay: enterDelay, ease: easeOut }
    });
    // Entrance runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (round === 0 || isWinner || leaving) return;
    const v = desktop ? toward : { x: 0, y: 0 };
    controls.start({
      x: [0, v.x * LUNGE, -v.x * LUNGE * 0.15, 0],
      y: [0, v.y * LUNGE, -v.y * LUNGE * 0.15, 0],
      scale: [1, 1.04, 0.99, 1],
      transition: { duration: 0.28, times: [0, 0.4, 0.7, 1], ease: 'easeInOut' }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  useEffect(() => {
    if (leaving) {
      controls.start({
        opacity: 0.45,
        scale: 0.92,
        rotateX: 0,
        rotateY: 0,
        filter: 'saturate(0.3)',
        transition: { duration: 0.3, ease: easeOut }
      });
    }
  }, [leaving, controls]);

  useEffect(() => {
    if (isWinner) {
      controls.start({
        x: 0,
        y: 0,
        scale: 1.04,
        rotateX: 0,
        rotateY: 0,
        opacity: 1,
        filter: 'saturate(1)',
        boxShadow: winShadow,
        transition: { duration: 0.3, ease: easeOut }
      });
    }
  }, [isWinner, controls]);

  const enterOffset = desktop ?
  { x: -toward.x * 40, y: -toward.y * 40, rotateX: rest.rotateX * 2.4, rotateY: rest.rotateY * 2.4 } :
  { x: rankIndex % 2 ? 28 : -28, y: 0, rotateX: 0, rotateY: 0 };

  const style: React.CSSProperties = { borderRadius: 16 };
  if (desktop && pos) {
    style.left = pos.left;
    style.top = pos.top;
    style.width = isWinner ? WINNER_CARD.w : ARENA_CARD.w;
  }

  return (
    <motion.div
      layout
      layoutId={layoutId}
      initial={{ opacity: 0, scale: 0.9, filter: 'saturate(1)', boxShadow: baseShadow, ...enterOffset }}
      animate={controls}
      exit={desktop ? undefined : { opacity: 0, scale: 0.92, transition: { duration: 0.2, ease: easeOut } }}
      transition={{ layout: { duration: 0.3, ease: easeOut } }}
      style={style}
      className={`border bg-white ${desktop ? 'absolute' : 'relative w-full'} ${
      isWinner ? 'border-gold/60 px-5 pb-4 pt-7' : desktop ? 'border-line p-2.5' : 'border-line px-3 py-2'}`
      }>
      
      {isWinner ?
      <>
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ borderRadius: 16 }}>
            <motion.span
            className="absolute inset-y-0 -left-1/3 w-1/3 bg-gold-light/80"
            initial={{ x: '0%', skewX: -20 }}
            animate={{ x: '460%', skewX: -20 }}
            transition={{ duration: quick ? 0.3 : 0.5, delay: 0.25, ease: [0.45, 0, 0.2, 1] }} />
          
          </span>
          <span className="absolute inset-x-0 -top-4 flex justify-center">
            <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22, delay: 0.1 }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-forest-ink">
            
              <CrownIcon className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
            </motion.span>
          </span>
          <div className="relative flex flex-col items-center text-center">
            <span className="rounded-full bg-gold p-[3px]">
              <span className="block h-[72px] w-[72px] overflow-hidden rounded-full ring-2 ring-white">
                <AdvisorAvatar advisor={advisor} reveal revealDuration={quick ? 0.3 : 0.5} className="h-full w-full text-2xl" />
              </span>
            </span>
            <p className="mt-2.5 text-[15px] font-semibold text-ink">{advisor.name}</p>
            <p className="text-xs text-muted">
              {advisor.firm} · {advisor.role}
            </p>
            <p className="mt-2.5 text-sm text-muted">
              {winnerLabel}:{' '}
              <span className="font-serif text-2xl font-semibold text-forest">{finalRate.toFixed(2)}%</span>
            </p>
          </div>
        </> :

      <div className={desktop ? '' : 'flex items-center justify-between gap-3'}>
          <div className="flex min-w-0 items-center gap-2">
            <AdvisorAvatar advisor={advisor} className="h-8 w-8 text-[11px]" />
            <div className="min-w-0">
              <p className="break-words text-[12px] font-semibold leading-[1.15] text-ink">{advisor.name}</p>
              <p className="truncate text-[11px] text-muted">{advisor.firm}</p>
            </div>
          </div>
          <div className={`flex items-end justify-between gap-2 ${desktop ? 'mt-2' : 'shrink-0'}`}>
            {desktop &&
          <span className="text-[11px] font-medium leading-tight text-muted">
                {round > 0 ?
            <motion.span
              key={round}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1, ease: easeOut }}
              className="inline-flex items-center gap-0.5 font-semibold text-forest">
              
                    {lowerWins ?
              <ArrowDownIcon className="h-3 w-3" aria-hidden="true" /> :

              <ArrowUpIcon className="h-3 w-3" aria-hidden="true" />
              }
                    {step.toFixed(2)}
                  </motion.span> :

            'Bid'
            }
              </span>
          }
            <span className="font-serif text-[22px] font-medium leading-none text-forest">
              <RateTicker value={ticker} />
            </span>
          </div>
        </div>
      }
    </motion.div>);

}