import type { QuestionIntent } from '../types/rates';

export const suggestions = [
'Smart way to borrow money?',
'High return mutual funds?',
'How to avoid high monthly payments?',
'Best short term loans?',
'Best mortgage rate?',
'Best GIC rates?'];


/** Which rate panel tab each suggested question opens. */
export const questionIntents: Record<string, QuestionIntent> = {
  'Smart way to borrow money?': { categoryId: 'loan', optionId: 'fixed' },
  'High return mutual funds?': { categoryId: 'funds', optionId: 'all' },
  'How to avoid high monthly payments?': { categoryId: 'debt', optionId: 'fixed' },
  'Best short term loans?': { categoryId: 'loan', optionId: 'variable', termId: '1y' },
  'Best mortgage rate?': { categoryId: 'mortgage', optionId: 'fixed' },
  'Best GIC rates?': { categoryId: 'investment', optionId: 'gic' }
};

export const askTopics = [
'loans…',
'personal investments…',
'mortgages…',
'GIC rates…',
'lowering monthly payments…'];