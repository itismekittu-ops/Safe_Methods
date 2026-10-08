export type CategoryId = 'loan' | 'mortgage' | 'investment' | 'funds' | 'debt';

export interface Advisor {
  id: string;
  name: string;
  firm: string;
  role: string;
  initials: string;
  /** Optional headshot. Advisors without one use an initials avatar. */
  photo?: string;
}

export interface Quote {
  advisorId: string;
  rate: number;
}

export interface RateOption {
  id: string;
  label: string;
  caption: string;
  quotes: Quote[];
}

export interface RateCategory {
  id: CategoryId;
  label: string;
  /** Used only when the full tab labels don't fit the panel width. */
  shortLabel?: string;
  options: RateOption[];
}

export interface Term {
  id: string;
  label: string;
  offset: number;
}

export interface QuestionIntent {
  categoryId: CategoryId;
  optionId: string;
  termId?: string;
}