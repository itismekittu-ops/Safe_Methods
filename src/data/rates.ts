import type { Advisor, RateCategory, Term } from '../types/rates';

export const advisors: Advisor[] = [
{
  id: 'david',
  name: 'David Chen',
  firm: 'BMO',
  role: 'Wealth Management Specialist',
  initials: 'DC',
  photo: "/8891abcb-7ee1-4d2e-9ef8-060addbea021.jpg"
},
{
  id: 'victor',
  name: 'Victor Gaur',
  firm: 'RBC',
  role: 'Principal Financial Advisor',
  initials: 'VG',
  photo: "/f53ee42b-2219-4af4-82cf-eea93875266e.jpg"
},
{
  id: 'sarah',
  name: 'Sarah Mitchell',
  firm: 'TD',
  role: 'Senior Investment Advisor',
  initials: 'SM',
  photo: "/f20a12af-2574-4757-8c3f-7d31492026f8.jpg"
},
{
  id: 'emily',
  name: 'Emily Roberts',
  firm: 'Scotiabank',
  role: 'Senior Financial Advisor',
  initials: 'ER'
},
{
  id: 'daniel',
  name: 'Daniel Singh',
  firm: 'CIBC',
  role: 'Wealth Management Advisor',
  initials: 'DS'
}];


export const rateCategories: RateCategory[] = [
{
  id: 'loan',
  label: 'Loan',
  options: [
  {
    id: 'fixed',
    label: 'Fixed',
    caption: 'Sample rate',
    quotes: [
    { advisorId: 'david', rate: 3.12 },
    { advisorId: 'victor', rate: 3.89 },
    { advisorId: 'sarah', rate: 3.99 },
    { advisorId: 'emily', rate: 3.54 },
    { advisorId: 'daniel', rate: 3.71 }]

  },
  {
    id: 'variable',
    label: 'Variable',
    caption: 'Sample rate',
    quotes: [
    { advisorId: 'david', rate: 3.45 },
    { advisorId: 'victor', rate: 2.98 },
    { advisorId: 'sarah', rate: 3.71 },
    { advisorId: 'emily', rate: 3.18 },
    { advisorId: 'daniel', rate: 3.29 }]

  }]

},
{
  id: 'mortgage',
  label: 'Mortgage',
  options: [
  {
    id: 'fixed',
    label: 'Fixed',
    caption: 'Sample rate',
    quotes: [
    { advisorId: 'david', rate: 4.19 },
    { advisorId: 'victor', rate: 4.49 },
    { advisorId: 'sarah', rate: 4.34 },
    { advisorId: 'emily', rate: 4.09 },
    { advisorId: 'daniel', rate: 4.27 }]

  },
  {
    id: 'variable',
    label: 'Variable',
    caption: 'Sample rate',
    quotes: [
    { advisorId: 'david', rate: 4.22 },
    { advisorId: 'victor', rate: 4.05 },
    { advisorId: 'sarah', rate: 4.39 },
    { advisorId: 'emily', rate: 4.14 },
    { advisorId: 'daniel', rate: 3.96 }]

  }]

},
{
  id: 'investment',
  label: 'Investment',
  options: [
  {
    id: 'gic',
    label: 'Fixed Rate GIC',
    caption: 'Sample rate',
    quotes: [
    { advisorId: 'david', rate: 4.1 },
    { advisorId: 'victor', rate: 3.95 },
    { advisorId: 'sarah', rate: 4.35 },
    { advisorId: 'emily', rate: 4.22 },
    { advisorId: 'daniel', rate: 4.05 }]

  },
  {
    id: 'market',
    label: 'Market Linked GIC',
    caption: 'Sample return',
    quotes: [
    { advisorId: 'david', rate: 5.4 },
    { advisorId: 'victor', rate: 5.85 },
    { advisorId: 'sarah', rate: 5.2 },
    { advisorId: 'emily', rate: 5.6 },
    { advisorId: 'daniel', rate: 5.05 }]

  }]

},
{
  id: 'funds',
  label: 'Mutual Fund',
  options: [
  {
    id: 'all',
    label: 'Mutual funds',
    caption: 'Sample rate',
    quotes: [
    { advisorId: 'david', rate: 6.4 },
    { advisorId: 'victor', rate: 6.8 },
    { advisorId: 'sarah', rate: 7.2 },
    { advisorId: 'emily', rate: 6.95 },
    { advisorId: 'daniel', rate: 7.6 }]

  }]

},
{
  id: 'debt',
  label: 'Debt Consolidation',
  shortLabel: 'Debt',
  options: [
  {
    id: 'fixed',
    label: 'Fixed',
    caption: 'Sample rate',
    quotes: [
    { advisorId: 'david', rate: 6.89 },
    { advisorId: 'victor', rate: 6.49 },
    { advisorId: 'sarah', rate: 7.15 },
    { advisorId: 'emily', rate: 6.75 },
    { advisorId: 'daniel', rate: 6.99 }]

  },
  {
    id: 'variable',
    label: 'Variable',
    caption: 'Sample rate',
    quotes: [
    { advisorId: 'david', rate: 6.6 },
    { advisorId: 'victor', rate: 6.35 },
    { advisorId: 'sarah', rate: 6.88 },
    { advisorId: 'emily', rate: 6.19 },
    { advisorId: 'daniel', rate: 6.42 }]

  }]

}];


export const terms: Term[] = [
{ id: '1y', label: '1 year', offset: -0.18 },
{ id: '2y', label: '2 years', offset: -0.06 },
{ id: '3y', label: '3 years', offset: 0 },
{ id: '5y', label: '5 years', offset: 0.14 }];