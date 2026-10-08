import { questionIntents } from '../data/suggestions';
import type { CategoryId, QuestionIntent, Quote } from '../types/rates';

/** Loan, Mortgage and Debt Consolidation: lowest rate wins. Investment and Mutual Fund: highest return wins. */
export function lowerWins(categoryId: CategoryId) {
  return categoryId !== 'investment' && categoryId !== 'funds';
}

export function rankQuotes(quotes: Quote[], categoryId: CategoryId, offset: number): Quote[] {
  const sign = lowerWins(categoryId) ? 1 : -1;
  return quotes.
  map((q) => ({ advisorId: q.advisorId, rate: Math.max(0.5, q.rate + offset) })).
  sort((a, b) => sign * (a.rate - b.rate));
}

export function winnerLabel(categoryId: CategoryId) {
  return lowerWins(categoryId) ? 'Lowest rate' : 'Highest return';
}

export function resolveIntent(question: string): QuestionIntent {
  const preset = questionIntents[question];
  if (preset) return preset;
  const q = question.toLowerCase();
  const rateType = /variable/.test(q) ? 'variable' : 'fixed';
  if (/(debt|consolidat|credit card|monthly payment)/.test(q)) return { categoryId: 'debt', optionId: rateType };
  if (/(mortgage|home|house|condo|renew)/.test(q)) return { categoryId: 'mortgage', optionId: rateType };
  if (/(mutual|fund|etf|stock|portfolio)/.test(q)) return { categoryId: 'funds', optionId: 'all' };
  if (/(gic|invest|return|saving|rrsp|tfsa|retire)/.test(q)) return { categoryId: 'investment', optionId: 'gic' };
  return { categoryId: 'loan', optionId: rateType, termId: /short/.test(q) ? '1y' : undefined };
}

export function arenaLayoutId(runId: number, advisorId: string) {
  return `arena-${runId}-${advisorId}`;
}