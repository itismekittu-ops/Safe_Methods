import type { Advisor, RateCategory, TermOption } from '../types/rates';

export const advisors: Advisor[] = [
  {
    id: 'david',
    name: 'David Chen',
    title: 'Wealth Management Specialist',
    firm: 'BMO',
    rating: 4.9,
    reviewsCount: 142,
    avatarUrl: '/8891abcb-7ee1-4d2e-9ef8-060addbea021.jpg',
    specialties: ['High-Net-Worth Planning', 'ETF Portfolios', 'Tax Minimization'],
  },
  {
    id: 'emily',
    name: 'Emily Roberts',
    title: 'Senior Financial Advisor',
    firm: 'Scotiabank',
    rating: 4.8,
    reviewsCount: 98,
    avatarUrl: '/f20a12af-2574-4757-8c3f-7d31492026f8.jpg',
    specialties: ['First-Time Home Buyers', 'Debt Restructuring', 'Retirement Drawdown'],
  },
  {
    id: 'daniel',
    name: 'Daniel Singh',
    title: 'Wealth Management Advisor',
    firm: 'CIBC',
    rating: 4.9,
    reviewsCount: 176,
    avatarUrl: '/f53ee42b-2219-4af4-82cf-eea93875266e.jpg',
    specialties: ['Cross-Border Planning', 'RESP Strategies', 'Corporate Portfolios'],
  },
  {
    id: 'victor',
    name: 'Victor Gaur',
    title: 'Principal Financial Advisor',
    firm: 'RBC',
    rating: 4.7,
    reviewsCount: 88,
    avatarUrl: null,
    specialties: ['Commercial Lending', 'Mortgage Portfolios', 'Private Banking'],
  },
  {
    id: 'sarah',
    name: 'Sarah Mitchell',
    title: 'Senior Investment Advisor',
    firm: 'TD',
    rating: 4.8,
    reviewsCount: 119,
    avatarUrl: null,
    specialties: ['Estate Structuring', 'Mutual Funds', 'Fixed-Income Ladders'],
  },
];

export const terms: TermOption[] = [
  { id: '1y', label: '1 year', offset: -0.15 },
  { id: '2y', label: '2 years', offset: -0.05 },
  { id: '3y', label: '3 years', offset: 0.05 },
  { id: '4y', label: '4 years', offset: 0.1 },
  { id: '5y', label: '5 years', offset: 0 },
];

export const rateCategories: RateCategory[] = [
  {
    id: 'loan',
    label: 'Loan',
    description: 'Personal borrowing and lines of credit',
    options: [
      {
        id: 'fixed',
        label: 'Fixed',
        quotes: [
          { advisorId: 'david', rate: 3.26 },
          { advisorId: 'emily', rate: 3.68 },
          { advisorId: 'daniel', rate: 3.85 },
          { advisorId: 'victor', rate: 4.03 },
          { advisorId: 'sarah', rate: 4.13 },
        ],
      },
      {
        id: 'variable',
        label: 'Variable',
        quotes: [
          { advisorId: 'emily', rate: 2.75 },
          { advisorId: 'david', rate: 2.95 },
          { advisorId: 'sarah', rate: 3.1 },
          { advisorId: 'victor', rate: 3.25 },
          { advisorId: 'daniel', rate: 3.4 },
        ],
      },
    ],
  },
  {
    id: 'mortgage',
    label: 'Mortgage',
    description: 'Residential purchase and refinance',
    options: [
      {
        id: 'fixed',
        label: 'Fixed',
        quotes: [
          { advisorId: 'emily', rate: 4.23 },
          { advisorId: 'david', rate: 4.33 },
          { advisorId: 'daniel', rate: 4.41 },
          { advisorId: 'sarah', rate: 4.48 },
          { advisorId: 'victor', rate: 4.63 },
        ],
      },
      {
        id: 'variable',
        label: 'Variable',
        quotes: [
          { advisorId: 'daniel', rate: 3.79 },
          { advisorId: 'victor', rate: 3.88 },
          { advisorId: 'emily', rate: 3.95 },
          { advisorId: 'david', rate: 4.15 },
          { advisorId: 'sarah', rate: 4.25 },
        ],
      },
    ],
  },
  {
    id: 'investment',
    label: 'Investment',
    description: 'Guaranteed and market-linked deposits',
    options: [
      {
        id: 'fixed-gic',
        label: 'Fixed Rate GIC',
        quotes: [
          { advisorId: 'sarah', rate: 4.49 },
          { advisorId: 'emily', rate: 4.36 },
          { advisorId: 'david', rate: 4.24 },
          { advisorId: 'daniel', rate: 4.19 },
          { advisorId: 'victor', rate: 4.09 },
        ],
      },
      {
        id: 'market-linked',
        label: 'Market Linked GIC',
        quotes: [
          { advisorId: 'victor', rate: 5.85 },
          { advisorId: 'emily', rate: 5.73 },
          { advisorId: 'david', rate: 5.48 },
          { advisorId: 'sarah', rate: 5.19 },
          { advisorId: 'daniel', rate: 4.95 },
        ],
      },
    ],
  },
  {
    id: 'funds',
    label: 'Mutual Fund',
    description: 'Targeted equity and balanced strategies',
    options: [
      {
        id: 'balanced',
        label: 'Mutual Funds',
        quotes: [
          { advisorId: 'daniel', rate: 7.74 },
          { advisorId: 'sarah', rate: 7.54 },
          { advisorId: 'emily', rate: 7.09 },
          { advisorId: 'victor', rate: 7.0 },
          { advisorId: 'david', rate: 6.54 },
        ],
      },
    ],
  },
  {
    id: 'debt',
    label: 'Debt Management',
    description: 'Consolidation loans from Canadian schedules',
    options: [
      {
        id: 'fixed',
        label: 'Fixed Loan',
        quotes: [
          { advisorId: 'david', rate: 7.24 },
          { advisorId: 'emily', rate: 7.49 },
          { advisorId: 'daniel', rate: 7.85 },
          { advisorId: 'victor', rate: 8.1 },
          { advisorId: 'sarah', rate: 8.35 },
        ],
      },
    ],
  },
];