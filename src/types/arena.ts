import type { CategoryId, Quote } from './rates';

export type ArenaPhase = 'intro' | 'round1' | 'round2' | 'duel' | 'winner' | 'landing';

export interface ArenaRun {
  id: number;
  question: string;
  categoryId: CategoryId;
  /** Best bid first. */
  ranked: Quote[];
  quick: boolean;
}

export interface ArenaState {
  run: ArenaRun | null;
  phase: ArenaPhase;
  /** Number of collisions so far; tickers drop on each one. */
  round: number;
  totalRounds: number;
  leaving: string | null;
  landed: string[];
}