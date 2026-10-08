import { useCallback, useEffect, useRef, useState } from 'react';
import type { ArenaPhase, ArenaRun, ArenaState } from '../types/arena';

const SESSION_KEY = 'safe-methods-arena-played';

interface Timeline {
  /** Each collision: when it happens and which stage it belongs to. */
  bumps: {at: number;phase: ArenaPhase;}[];
  /** When each eliminated card starts to dim, worst bid first. */
  eliminations: number[];
  dimMs: number;
  winner: number;
  land1: number;
  done: number;
}

// First run (~9s): entrance 1.4s → round 1 (1.2s, two out) → round 2 (1.2s, one out)
// → final duel (1.4s) → winner hold 2.0s → 1.0s flight to #1.
const FULL: Timeline = {
  bumps: [
  { at: 1500, phase: 'round1' },
  { at: 2850, phase: 'round2' },
  { at: 4150, phase: 'duel' },
  { at: 4750, phase: 'duel' }],

  eliminations: [1950, 2250, 3350, 5100],
  dimMs: 300,
  winner: 5500,
  land1: 7500,
  done: 8900
};

// Repeat runs (~4s).
const QUICK: Timeline = {
  bumps: [
  { at: 700, phase: 'round1' },
  { at: 1500, phase: 'round2' },
  { at: 2100, phase: 'duel' }],

  eliminations: [900, 1100, 1700, 2300],
  dimMs: 200,
  winner: 2600,
  land1: 3400,
  done: 4050
};

const idle: ArenaState = { run: null, phase: 'intro', round: 0, totalRounds: 1, leaving: null, landed: [] };

function hasPlayed() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function markPlayed() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {

    /* storage unavailable */}
}

export function useBiddingArena() {
  const [state, setState] = useState<ArenaState>(idle);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runId = useRef(0);

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => clear, [clear]);

  const at = (ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const start = useCallback(
    (payload: Omit<ArenaRun, 'id' | 'quick'>) => {
      clear();
      const quick = hasPlayed();
      markPlayed();
      const t = quick ? QUICK : FULL;
      runId.current += 1;
      const run: ArenaRun = { ...payload, id: runId.current, quick };
      const ids = run.ranked.map((q) => q.advisorId);
      const worstFirst = ids.slice(1).reverse();

      setState({ run, phase: 'intro', round: 0, totalRounds: t.bumps.length, leaving: null, landed: [] });

      t.bumps.forEach((bump, i) => {
        at(bump.at, () => setState((s) => ({ ...s, phase: bump.phase, round: i + 1 })));
      });

      worstFirst.forEach((id, i) => {
        const dimAt = t.eliminations[i] ?? t.eliminations[t.eliminations.length - 1];
        at(dimAt, () => setState((s) => ({ ...s, leaving: id })));
        at(dimAt + t.dimMs, () =>
        setState((s) => ({ ...s, leaving: s.leaving === id ? null : s.leaving, landed: [...s.landed, id] }))
        );
      });

      at(t.winner, () => setState((s) => ({ ...s, phase: 'winner' })));
      at(t.land1, () => setState((s) => ({ ...s, phase: 'landing', landed: [...ids].reverse() })));
      at(t.done, () => setState(idle));
    },
    [clear]
  );

  const skip = useCallback(() => {
    clear();
    setState((s) =>
    s.run ?
    {
      ...s,
      run: { ...s.run, quick: true },
      phase: 'landing',
      leaving: null,
      landed: s.run.ranked.map((q) => q.advisorId)
    } :
    s
    );
    at(650, () => setState(idle));
  }, [clear]);

  return { state, start, skip };
}