export interface PreCannedQA {
  id: string;
  category: string;
  question: string;
  aliases: string[];
  response: {
    introduction: string[];
    pros?: string[];
    cons?: string[];
    intakePrompts?: string[];
    ratesNote?: string;
    rates?: { label: string; details: string }[];
  };
  followUpChips: string[];
}

export const PRE_CANNED_QUESTIONS: PreCannedQA[] = [
  {
    id: 'lending_credit',
    category: 'LENDING/CREDIT',
    question: 'Smart way to borrow money?',
    aliases: ['smart way to borrow money', 'how to borrow money', 'best way to borrow money'],
    response: {
      introduction: [
        'Borrowing costs & interest rates depend mainly on whether the loan is secured (backed by an asset such as your home / car) or unsecured (such as a loan / credit card).',
        'Comparing offers from several banks before you borrow is the simplest way to lower your interest cost.'
      ],
      cons: [
        'Secured loans put your asset at risk if you cannot keep up with payments.',
        'Unsecured credit like credit cards costs far more if a balance is carried month to month.'
      ],
      intakePrompts: [
        'What are your borrowing needs? Is it for a specific purpose for a fixed duration? → Leads to loan (variable / fixed)',
        'Do you want to have access to money just in case for an emergency or a future need? (no end date) → Leads to unsecured personal line of credit / secured line of credit like HELOC',
        'Can you provide some guarantee / collateral / asset as a security? → Car loan / HELOC / Mortgage'
      ],
      rates: [
        { label: 'Fixed mortgage (2 years)', details: 'BMO at 3.12%' },
        { label: 'Credit card - lowest interest', details: 'TD at 20.10%, annual fee $120' }
      ]
    },
    followUpChips: [
      'How does my credit score affect the rate I get',
      'How much can I afford to borrow?',
      'What is GDS / TDS'
    ]
  },
  {
    id: 'mutual_funds',
    category: 'MUTUAL FUNDS/STOCKS',
    question: 'High return mutual funds?',
    aliases: ['high return mutual funds', 'mutual funds', 'investing in mutual funds'],
    response: {
      introduction: [
        'A mutual fund pools money from many investors to buy a diversified mix of stocks, bonds, or other assets.',
        'Getting started means choosing your goal and risk level, then picking a fund that matches them.'
      ],
      pros: [
        'Diversification spreads your risk across many holdings in a single purchase.',
        'You can start with modest amounts and add money regularly.'
      ],
      cons: [
        'Values rise and fall with the market, and returns are not guaranteed.',
        'Fees reduce your returns over time, so costs matter.'
      ]
    },
    followUpChips: [
      'How do I choose the right mutual fund?',
      'What fees should I watch for in mutual funds?',
      'How much risk should I take with mutual funds?'
    ]
  },
  {
    id: 'debt_consolidation',
    category: 'DEBT CONSOLIDATION',
    question: 'How to avoid High monthly payments?',
    aliases: ['how to avoid high monthly payments', 'debt consolidation', 'consolidate debt'],
    response: {
      introduction: [
        'Consolidate your debts - Pay off your high interest debts and have regular low interest monthly payments that you can gradually pay off.'
      ],
      intakePrompts: [
        'What kind of high interest debts do you have? Credit cards / loans?',
        'What is your GDS (gross debt servicing)? i.e. monthly income / monthly debt payments'
      ],
      ratesNote: 'Speak to specialists / consultants who can work to lower down your high interest payments.'
    },
    followUpChips: [
      'Do you want money for a fixed duration / or long term revolving credit?',
      'How does my credit score affect the loan rate I get?',
      'How much can I afford to borrow?'
    ]
  },
  {
    id: 'loans',
    category: 'LOANS',
    question: 'Best short term loans?',
    aliases: ['best short term loans', 'short term loans', 'personal loans'],
    response: {
      introduction: [
        'Loans have a fixed time duration to pay back and therefore carry "Lower" interest rates than Credit Cards.',
        'Loans can be secured / unsecured and depending on type of interest rate can vary. Example if you want a loan to travel or for marriage, interest rates may be higher than a car loan or home improvement loan or equipment loan because in the latter category you have an asset that you can put as collateral.',
        'If you need money for contingency / emergency to fall upon, then you will be better off with a Line of Credit. You only pay interest if you withdraw, and if you haven\'t withdrawn from your LOC, you don\'t pay any interest.'
      ],
      intakePrompts: [
        'What is your specific need & duration?'
      ],
      rates: [
        { label: 'Variable Rate Loan / Mortgage (4 years)', details: 'BMO at 3.01%' },
        { label: 'Credit card lowest interest alternative', details: 'TD at 20.10%, annual fee $120' }
      ]
    },
    followUpChips: [
      'How does my credit score affect the rate I get',
      'How much can I afford to borrow?',
      'What is GDS / TDS'
    ]
  },
  {
    id: 'mortgage',
    category: 'MORTGAGE',
    question: 'best mortgage rate?',
    aliases: ['best mortgage rate', 'mortgage rates', 'lowest mortgage rate'],
    response: {
      introduction: [
        'The best rate comes from comparing several lenders on the same term and type, since rates differ between banks.',
        'Your credit score, down payment, and the term you choose all influence the rate you are offered.',
        'The lowest rate is not always the best deal, since prepayment terms and penalties differ.',
        'Rates change often, so a quote today may not hold for long unless it is rate-locked.'
      ],
      intakePrompts: [
        'Peace of mind with fixed monthly payment?',
        'Take benefit of lower interest rate BUT open to risk & volatility of monthly payments increasing in future?',
        'Short term mortgage only because you want to sell the property?',
        'Long term lock in because you want to avoid market fluctuations?'
      ],
      rates: [
        { label: '4-Year Fixed Mortgage', details: 'RBC at 3.01%' },
        { label: '2-Year Fixed Mortgage', details: 'BMO at 3.12%' },
        { label: '4-Year Variable Mortgage', details: 'BMO at 3.01%' }
      ]
    },
    followUpChips: [
      'How much down payment do I need to buy a home?',
      'Should I renew with my current bank or switch lenders?',
      'What is a mortgage pre-approval and should I get one?'
    ]
  },
  {
    id: 'personal_investments',
    category: 'PERSONAL INVESTMENTS',
    question: 'Best GIC rates?',
    aliases: ['best gic rates', 'gic rates', 'best gic'],
    response: {
      introduction: [
        'A GIC (Guaranteed Investment Certificate) lets you lock in your money for a fixed term in exchange for a set interest rate.',
        'Rates vary by bank and term, so comparing them can increase what you earn on the same deposit.'
      ],
      pros: [
        'Your principal is protected and your return is known in advance.',
        'Comparing banks can earn you a higher rate on the same amount and term.'
      ],
      cons: [
        'Your money is locked in for the term, so early access may be limited.',
        'Fixed returns may not keep pace with inflation or higher-growth investments.'
      ],
      rates: [
        { label: '3-Year Fixed GIC', details: 'TD at 2.01%' },
        { label: '3-Year Market-Linked GIC (15% cap)', details: 'RBC at 2.23%' },
        { label: '2-Year Fixed GIC', details: 'TD at 1.69%' }
      ]
    },
    followUpChips: [
      'What is the difference between a GIC and a market-linked GIC?',
      'Are GICs safe, and are they insured?',
      'How much of my savings should go into safe investments?'
    ]
  }
];

export function normalizeQuery(text: string): string {
  return text.toLowerCase().trim().replace(/\?/g, '').replace(/\s+/g, ' ');
}

export function findPreCannedMatch(text: string): PreCannedQA | undefined {
  const normalized = normalizeQuery(text);
  return PRE_CANNED_QUESTIONS.find((qa) => {
    if (normalizeQuery(qa.question) === normalized) return true;
    return qa.aliases.some((alias) => normalizeQuery(alias) === normalized);
  });
}

export function formatPreCannedResponse(qa: PreCannedQA): string {
  const lines: string[] = [];

  lines.push('### ' + qa.category);
  lines.push('');
  lines.push('**' + qa.question + '**');
  lines.push('');

  lines.push('**Overview**');
  for (const line of qa.response.introduction) {
    lines.push('- ' + line);
  }
  lines.push('');

  if (qa.response.pros && qa.response.pros.length > 0) {
    lines.push('**Pros**');
    for (const line of qa.response.pros) {
      lines.push('- ' + line);
    }
    lines.push('');
  }

  if (qa.response.cons && qa.response.cons.length > 0) {
    lines.push('**Cons**');
    for (const line of qa.response.cons) {
      lines.push('- ' + line);
    }
    lines.push('');
  }

  if (qa.response.intakePrompts && qa.response.intakePrompts.length > 0) {
    lines.push('**Guidance Questions**');
    for (const line of qa.response.intakePrompts) {
      lines.push('- ' + line);
    }
    lines.push('');
  }

  if (qa.response.rates && qa.response.rates.length > 0) {
    lines.push('**Current Rates**');
    for (const rate of qa.response.rates) {
      lines.push('- **' + rate.label + '** — ' + rate.details);
    }
    lines.push('');
  }

  if (qa.response.ratesNote) {
    lines.push('*' + qa.response.ratesNote + '*');
    lines.push('');
  }

  return lines.join('\n');
}
