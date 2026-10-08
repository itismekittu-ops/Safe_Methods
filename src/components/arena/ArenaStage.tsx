import React, { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { ArenaCard } from './ArenaCard';
import { SparkBurst } from './SparkBurst';
import { useElementSize } from '../../hooks/useElementSize';
import { advisors } from '../../data/rates';
import { arenaLayoutId, lowerWins, winnerLabel } from '../../utils/ranking';
import { pentagonLayout } from '../../utils/arenaGeometry';
import type { ArenaState, ArenaRun } from '../../types/arena';
import type { Advisor } from '../../types/rates';

interface ArenaStageProps {
  run: ArenaRun;
  state: ArenaState;
  desktop: boolean;
}

export function ArenaStage({ run, state, desktop }: ArenaStageProps) {
  const { phase, round, totalRounds, leaving, landed } = state;
  const shake = useAnimationControls();
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useElementSize(ref);
  const geo = useMemo(() => pentagonLayout(width, height), [width, height]);
  const winnerId = run.ranked[0].advisorId;
  const showWinner = phase === 'winner' || phase === 'landing';
  const clashing = phase === 'round1' || phase === 'round2' || phase === 'duel';

  // Subtle 150ms shake timed to the collision peak of each lunge.
  useEffect(() => {
    if (round === 0) return;
    const amp = phase === 'duel' ? 4 : 3;
    shake.start({
      x: [0, -amp, amp, -amp / 2, 0],
      y: [0, amp / 2, -amp / 2, 1, 0],
      transition: { duration: 0.15, delay: 0.11, ease: 'linear' }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, shake]);

  const remaining = advisors.filter((a) => !landed.includes(a.id));

  const renderCard = (advisor: Advisor) => {
    const slot = advisors.indexOf(advisor);
    const rankIndex = run.ranked.findIndex((q) => q.advisorId === advisor.id);
    const isWinner = showWinner && advisor.id === winnerId;
    const g = geo.slots[slot];
    return (
      <ArenaCard
        key={advisor.id}
        advisor={advisor}
        rankIndex={rankIndex}
        finalRate={run.ranked[rankIndex].rate}
        lowerWins={lowerWins(run.categoryId)}
        round={round}
        totalRounds={totalRounds}
        leaving={leaving === advisor.id}
        isWinner={isWinner}
        winnerLabel={winnerLabel(run.categoryId)}
        desktop={desktop}
        quick={run.quick}
        enterDelay={run.quick ? slot * 0.08 : slot * 0.28}
        layoutId={desktop ? arenaLayoutId(run.id, advisor.id) : undefined}
        pos={desktop ? isWinner ? geo.winner : { left: g.left, top: g.top } : undefined}
        toward={g.toward}
        tilt={g.tilt} />);


  };

  if (!desktop) {
    return (
      <motion.div animate={shake} className="flex w-full max-w-sm flex-col items-stretch gap-2">
        <AnimatePresence>{remaining.map(renderCard)}</AnimatePresence>
      </motion.div>);

  }

  // Pentagon around the centre of the card, each card leaning inward.
  return (
    <motion.div ref={ref} animate={shake} style={{ transformStyle: 'preserve-3d' }} className="absolute inset-0">
      {width > 0 && remaining.map(renderCard)}
      {width > 0 && clashing && round > 0 && <SparkBurst key={round} x={geo.cx} y={geo.cy} />}
    </motion.div>);

}