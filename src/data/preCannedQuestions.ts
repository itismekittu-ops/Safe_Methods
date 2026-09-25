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
  // =========================================================================
  // CORE 6 HOMEPAGE DEMO CATEGORIES
  // =========================================================================
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
      'How does my credit score affect the loan rate I get?',
      'How much can I afford to borrow?',
      'What is GDS / TDS?'
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
      ],
      ratesNote: 'Mutual fund returns are not fixed rates and change with the market. The rates below are capital-protected options shown for comparison.',
      rates: [
        { label: 'Market-linked GIC (15% capped) (3 years)', details: 'RBC at 2.23%' },
        { label: 'Market-linked GIC (15% capped) (2 years)', details: 'TD at 1.89%' },
        { label: 'Market-linked GIC (15% capped) (1 year)', details: 'BMO at 1.69%' }
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
        'Consolidate your debts — Pay off your high interest debts and have regular low interest monthly payments that you can gradually pay off.'
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
        'Loans can be secured / unsecured and depending on type of interest rate can vary. Example: if you want a loan to travel or for marriage, interest rates may be higher than a car loan or home improvement loan or equipment loan because in the latter category you have an asset that you can put as collateral.',
        'If you need money for contingency / emergency to fall upon, then you will be better off with a Line of Credit. You only pay interest if you withdraw, and if you haven\'t withdrawn from your LOC, you don\'t pay any interest.'
      ],
      intakePrompts: [
        'What is your specific need & duration?',
        'Unsecured personal loan for vacation (rates vary based on credit & income)',
        'Secured Car loan / Equipment loan (collateral helps secure lower rates)',
        'Line of credit for contingency / emergency (pay interest only on what you withdraw)'
      ],
      rates: [
        { label: 'Variable Rate Loan / Mortgage (4 years)', details: 'BMO at 3.01%' },
        { label: 'Credit card lowest interest alternative', details: 'TD at 20.10%, annual fee $120' }
      ]
    },
    followUpChips: [
      'How does my credit score affect the loan rate I get?',
      'How much can I afford to borrow?',
      'What is GDS / TDS?'
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
        { label: 'Fixed mortgage (4 years)', details: 'RBC at 3.01%' },
        { label: 'Fixed mortgage (2 years)', details: 'BMO at 3.12%' },
        { label: 'Variable mortgage (4 years)', details: 'BMO at 3.01%' }
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
        { label: 'GIC (3 years)', details: 'TD at 2.01%' },
        { label: 'Market-linked GIC (15% capped) (3 years)', details: 'RBC at 2.23%' },
        { label: 'GIC (2 years)', details: 'TD at 1.69%' }
      ]
    },
    followUpChips: [
      'What is the difference between a GIC and a market-linked GIC?',
      'Are GICs safe, and are they insured?',
      'How much of my savings should go into safe investments?'
    ]
  },

  // =========================================================================
  // FOLLOW-UP QUESTION TREE: LENDING/CREDIT & LOANS
  // =========================================================================
  {
    id: 'credit_score_rate_impact',
    category: 'LENDING/CREDIT',
    question: 'How does my credit score affect the loan rate I get?',
    aliases: [
      'how does my credit score affect the loan rate i get',
      'how does my credit score affect the loan rate i get?',
      'how does my credit score affect the rate i get',
      'how does my credit score affect the rate i get?'
    ],
    response: {
      introduction: [
        'Your credit score summarizes how reliably you have repaid debt, and lenders use it to decide whether to approve you and at what rate.',
        'In Canada scores range from 300 to 900, and a higher score generally unlocks lower rates.'
      ],
      pros: [
        'A strong score can qualify you for lower interest rates, saving money over the life of a loan.',
        'Good credit gives you more approval options and better negotiating power.'
      ],
      cons: [
        'A lower score can mean higher rates, extra fees, or a declined application.',
        'Scores change with your behaviour, so a rate quoted today may differ if your score shifts.'
      ],
      rates: [
        { label: 'Credit card - lowest interest', details: 'TD at 20.10%, annual fee $120' },
        { label: 'Credit card - lowest annual fee', details: 'BMO at 21.21%, annual fee $100' }
      ]
    },
    followUpChips: [
      'How can I improve my credit score fast?',
      'How much can I afford to borrow?',
      'What is the difference between a secured and an unsecured loan?'
    ]
  },
  {
    id: 'afford_to_borrow',
    category: 'LENDING/CREDIT',
    question: 'How much can I afford to borrow?',
    aliases: [
      'how much can i afford to borrow',
      'how much can i afford to borrow?'
    ],
    response: {
      introduction: [
        'Lenders look at your income, your existing debts, and your credit history to decide how much they will lend.',
        'What you can borrow and what you can comfortably repay are not always the same amount.'
      ],
      pros: [
        'Knowing your budget before applying helps you borrow only what you need.',
        'Comparing offers shows how different rates and terms change your monthly payment.'
      ],
      cons: [
        'Approval amounts can be higher than what fits comfortably in your monthly budget.',
        'Borrowing the maximum leaves little room for emergencies or rising costs.'
      ],
      rates: [
        { label: 'Fixed mortgage (2 years)', details: 'BMO at 3.12%' },
        { label: 'Credit card - lowest interest', details: 'TD at 20.10%, annual fee $120' }
      ]
    },
    followUpChips: [
      'What is GDS / TDS?',
      'What is better: a loan / line of credit / credit card ?',
      'How does my credit score affect the loan rate I get?'
    ]
  },
  {
    id: 'gds_tds_definition',
    category: 'LENDING/CREDIT',
    question: 'What is GDS / TDS?',
    aliases: [
      'what is gds / tds',
      'what is gds / tds?',
      'what is gds and tds'
    ],
    response: {
      introduction: [
        'GDS (Gross Debt Service) and TDS (Total Debt Service) are standard qualifying debt ratios Canadian financial institutions use to decide how much you can afford to borrow.',
        'In general banking guidelines, your housing costs (GDS) should not exceed 39% of your gross monthly income, and your total debt obligations (TDS) should not exceed 44%.'
      ],
      pros: [
        'Calculating your ratios in advance prevents you from over-extending your budget or applying for amounts that lenders will reject.',
        'Knowing your numbers gives you a clear target to pay down specific debts to immediately increase your borrowing capacity.'
      ],
      cons: [
        'Carrying high-interest credit card debt significantly inflates your TDS, sharply reducing the loan or mortgage amount you qualify for.',
        'Lenders enforce hard ratio limits regardless of whether you feel comfortable managing larger monthly payments.'
      ],
      rates: [
        { label: 'Fixed mortgage (2 years)', details: 'BMO at 3.12%' },
        { label: 'Credit card - lowest interest', details: 'TD at 20.10%, annual fee $120' }
      ]
    },
    followUpChips: [
      'How much can I afford to borrow?',
      'What is the difference between a secured and an unsecured loan?',
      'How does my credit score affect the loan rate I get?'
    ]
  },
  {
    id: 'compare_loan_loc_card',
    category: 'LOANS',
    question: 'What is better: a loan / line of credit / credit card ?',
    aliases: [
      'what is better: a loan / line of credit / credit card',
      'what is better: a loan / line of credit / credit card ?',
      'loan vs line of credit vs credit card'
    ],
    response: {
      introduction: [
        'A personal loan gives you a lump sum with fixed payments, while a credit card gives you revolving credit you repay at your own pace.',
        'The better choice depends on how much you need, how fast you can repay, and the rate you qualify for.'
      ],
      pros: [
        'Interest rate for personal loans is less than Credit Card.',
        'Once you pay off your loan - your total debt "comes down" and that helps improve your credit score.',
        'A credit card offers flexibility for small or short-term purchases if you pay the balance in full.'
      ],
      cons: [
        'Personal loans require approval and may include fees, and your rate depends on your credit profile.',
        'Card balances that are carried can grow quickly because of high interest rates.'
      ],
      rates: [
        { label: 'Credit card - lowest interest', details: 'TD at 20.10%, annual fee $120' },
        { label: 'Credit card - lowest annual fee', details: 'BMO at 21.21%, annual fee $100' }
      ]
    },
    followUpChips: [
      'Credit card with lowest interest rates?',
      'What is the difference between a secured and an unsecured loan?',
      'How much can I afford to borrow?'
    ]
  },
  {
    id: 'lowest_interest_credit_cards',
    category: 'LENDING/CREDIT',
    question: 'Credit card with lowest interest rates?',
    aliases: [
      'credit card with lowest interest rates',
      'credit card with lowest interest rates?',
      'lowest interest credit card'
    ],
    response: {
      introduction: [
        'Credit card cost has two parts: the annual fee you pay for the card and the interest charged on any balance you carry.',
        'Among the big banks we compare, rates sit just above 20%, so paying in full each month matters.'
      ],
      pros: [
        'Paying the full balance every month means you avoid interest entirely.',
        'Comparing banks lets you weigh a lower fee against a lower interest rate.'
      ],
      cons: [
        'Interest above 20% makes carrying a balance expensive.',
        'Annual fees add a fixed cost whether or not you use the card much.'
      ],
      rates: [
        { label: 'Credit card (TD)', details: '20.10%, annual fee $120' },
        { label: 'Credit card (RBC)', details: '20.56%, annual fee $110' },
        { label: 'Credit card (BMO)', details: '21.21%, annual fee $100' }
      ]
    },
    followUpChips: [
      'What is better: a loan / line of credit / credit card ?',
      'How can I improve my credit score fast?',
      'How does my credit score affect the loan rate I get?'
    ]
  },
  {
    id: 'improve_credit_score_fast',
    category: 'LENDING/CREDIT',
    question: 'How can I improve my credit score fast?',
    aliases: [
      'how can i improve my credit score fast',
      'how can i improve my credit score fast?',
      'improve credit score fast'
    ],
    response: {
      introduction: [
        'The biggest drivers of your score are payment history and how much of your available credit you use.',
        'Small, consistent habits usually move your score faster and more safely than any shortcut.'
      ],
      pros: [
        'Paying every bill on time is the single most effective way to build your score.',
        'Keeping card balances low relative to your limits can lift your score within a few billing cycles.'
      ],
      cons: [
        'Real improvement takes months, and no legitimate method delivers an instant jump.',
        'Applying for several new cards or loans in a short time can pull your score down.'
      ],
      rates: [
        { label: 'Credit card - lowest interest', details: 'TD at 20.10%, annual fee $120' },
        { label: 'Credit card - lowest annual fee', details: 'BMO at 21.21%, annual fee $100' }
      ]
    },
    followUpChips: [
      'How does my credit score affect the loan rate I get?',
      'Credit card with lowest interest rates?',
      'How much can I afford to borrow?'
    ]
  },
  {
    id: 'secured_vs_unsecured_loan',
    category: 'LOANS',
    question: 'What is the difference between a secured and an unsecured loan?',
    aliases: [
      'what is the difference between a secured and an unsecured loan',
      'what is the difference between a secured and an unsecured loan?',
      'secured vs unsecured loan'
    ],
    response: {
      introduction: [
        'A secured loan is backed by an asset, such as a home or vehicle, while an unsecured loan relies only on your promise to repay.',
        'Lenders take less risk with secured loans, which is why they usually offer lower rates.'
      ],
      pros: [
        'Secured loans typically offer lower rates and can allow larger amounts.',
        'Unsecured loans do not put a specific asset directly at risk.'
      ],
      cons: [
        'If you default on a secured loan, the lender can take the asset that backs it.',
        'Unsecured loans and credit cards usually cost more and may have lower limits.'
      ],
      rates: [
        { label: 'Fixed mortgage (2 years)', details: 'BMO at 3.12%' },
        { label: 'Credit card - lowest interest', details: 'TD at 20.10%, annual fee $120' }
      ]
    },
    followUpChips: [
      'How much can I afford to borrow?',
      'What is better: a loan / line of credit / credit card ?',
      'What is GDS / TDS?'
    ]
  },

  // =========================================================================
  // FOLLOW-UP QUESTION TREE: MORTGAGE
  // =========================================================================
  {
    id: 'mortgage_down_payment',
    category: 'MORTGAGE',
    question: 'How much down payment do I need to buy a home?',
    aliases: [
      'how much down payment do i need to buy a home',
      'how much down payment do i need to buy a home?',
      'minimum down payment'
    ],
    response: {
      introduction: [
        'The minimum down payment in Canada is tiered: 5% of the first $500,000 of the price and 10% of the portion above that, up to the insured price limit.',
        'Putting down less than 20% generally requires mortgage default insurance, which adds to your costs.'
      ],
      pros: [
        'A larger down payment reduces your mortgage amount and the total interest you pay.',
        'Putting down 20% or more avoids default insurance premiums.'
      ],
      cons: [
        'A small down payment means insurance premiums and a larger mortgage to repay.',
        'You also need cash for closing costs on top of the down payment.'
      ],
      rates: [
        { label: 'Fixed mortgage (4 years)', details: 'RBC at 3.01%' },
        { label: 'Fixed mortgage (2 years)', details: 'BMO at 3.12%' },
        { label: 'Fixed mortgage (3 years)', details: 'TD at 3.25%' },
        { label: 'Fixed mortgage (1 year)', details: 'TD at 4.12%' }
      ]
    },
    followUpChips: [
      'What is a mortgage pre-approval and should I get one?',
      'What documents do I need to apply for a mortgage?',
      'Should I choose a fixed or variable mortgage?'
    ]
  },
  {
    id: 'mortgage_renew_or_switch',
    category: 'MORTGAGE',
    question: 'Should I renew with my current bank or switch lenders?',
    aliases: [
      'should i renew with my current bank or switch lenders',
      'should i renew with my current bank or switch lenders?',
      'renew or switch lenders'
    ],
    response: {
      introduction: [
        'At renewal you can usually stay with your lender or move to a new one, and comparing rates first can save real money.',
        'Breaking your mortgage before the term ends can trigger a prepayment penalty, so timing matters.'
      ],
      pros: [
        'Shopping around at renewal can get you a lower rate than your lender\'s first offer.',
        'Switching at the end of your term generally avoids a prepayment penalty.'
      ],
      cons: [
        'Switching may involve costs such as legal or appraisal fees, though some lenders cover them.',
        'Staying is simpler, but accepting the first renewal offer can mean overpaying.'
      ],
      rates: [
        { label: 'Fixed mortgage (4 years)', details: 'RBC at 3.01%' },
        { label: 'Fixed mortgage (2 years)', details: 'BMO at 3.12%' },
        { label: 'Variable mortgage (4 years)', details: 'BMO at 3.01%' },
        { label: 'Variable mortgage (2 years)', details: 'TD at 3.12%' }
      ]
    },
    followUpChips: [
      'Should I choose a fixed or variable mortgage?',
      'Which mortgage term should I choose?',
      'What documents do I need to apply for a mortgage?'
    ]
  },
  {
    id: 'mortgage_pre_approval',
    category: 'MORTGAGE',
    question: 'What is a mortgage pre-approval and should I get one?',
    aliases: [
      'what is a mortgage pre-approval and should i get one',
      'what is a mortgage pre-approval and should i get one?',
      'mortgage pre approval'
    ],
    response: {
      introduction: [
        'A pre-approval is a lender\'s estimate of how much you can borrow, based on your income, debts, and credit.',
        'It often holds a rate for a set period, commonly around 90 to 120 days, while you shop for a home.'
      ],
      pros: [
        'You know your budget before you start house hunting.',
        'A rate hold can protect you if rates rise while you search.'
      ],
      cons: [
        'A pre-approval is not a final approval, since the property and your finances are reviewed again later.',
        'It requires a credit check, and rate holds expire.'
      ],
      rates: [
        { label: 'Fixed mortgage (4 years)', details: 'RBC at 3.01%' },
        { label: 'Fixed mortgage (2 years)', details: 'BMO at 3.12%' },
        { label: 'Fixed mortgage (3 years)', details: 'TD at 3.25%' },
        { label: 'Fixed mortgage (1 year)', details: 'TD at 4.12%' }
      ]
    },
    followUpChips: [
      'What documents do I need to apply for a mortgage?',
      'How much down payment do I need to buy a home?',
      'Should I choose a fixed or variable mortgage?'
    ]
  },
  {
    id: 'mortgage_fixed_vs_variable',
    category: 'MORTGAGE',
    question: 'Should I choose a fixed or variable mortgage?',
    aliases: [
      'should i choose a fixed or variable mortgage',
      'should i choose a fixed or variable mortgage?',
      'fixed or variable mortgage'
    ],
    response: {
      introduction: [
        'A fixed rate stays the same for the whole term, while a variable rate can move up or down with market conditions.',
        'The right choice depends on how much payment certainty you need and how much rate risk you can accept.'
      ],
      pros: [
        'Fixed mortgages give stable payments, which makes long-term budgeting easier.',
        'Variable mortgages can cost less if rates fall during your term.'
      ],
      cons: [
        'Fixed rates can be higher than variable rates when you sign, and breaking early may cost more.',
        'Variable payments or interest costs can rise if rates go up.'
      ],
      rates: [
        { label: 'Fixed mortgage (4 years)', details: 'RBC at 3.01%' },
        { label: 'Fixed mortgage (2 years)', details: 'BMO at 3.12%' },
        { label: 'Variable mortgage (4 years)', details: 'BMO at 3.01%' },
        { label: 'Variable mortgage (2 years)', details: 'TD at 3.12%' }
      ]
    },
    followUpChips: [
      'Which mortgage term should I choose?',
      'Should I renew with my current bank or switch lenders?',
      'What is a mortgage pre-approval and should I get one?'
    ]
  },
  {
    id: 'mortgage_term_selection',
    category: 'MORTGAGE',
    question: 'Which mortgage term should I choose?',
    aliases: [
      'which mortgage term should i choose',
      'which mortgage term should i choose?',
      'mortgage term length'
    ],
    response: {
      introduction: [
        'The term is how long your rate and conditions are locked in before you renew, and it does not change how long you take to repay.',
        'Shorter terms give you flexibility, while longer terms give you rate stability.'
      ],
      pros: [
        'A shorter term lets you renegotiate sooner if rates drop or your finances change.',
        'A longer term protects you from rate increases for more years.'
      ],
      cons: [
        'Shorter terms mean more frequent renewals, and you may renew at a higher rate.',
        'Longer terms can lock you in, and leaving early may involve penalties.'
      ],
      rates: [
        { label: 'Fixed mortgage (4 years)', details: 'RBC at 3.01%' },
        { label: 'Fixed mortgage (2 years)', details: 'BMO at 3.12%' },
        { label: 'Fixed mortgage (3 years)', details: 'TD at 3.25%' },
        { label: 'Fixed mortgage (1 year)', details: 'TD at 4.12%' }
      ]
    },
    followUpChips: [
      'Should I choose a fixed or variable mortgage?',
      'Should I renew with my current bank or switch lenders?',
      'What is a mortgage pre-approval and should I get one?'
    ]
  },
  {
    id: 'mortgage_required_documents',
    category: 'MORTGAGE',
    question: 'What documents do I need to apply for a mortgage?',
    aliases: [
      'what documents do i need to apply for a mortgage',
      'what documents do i need to apply for a mortgage?',
      'documents needed for mortgage'
    ],
    response: {
      introduction: [
        'Lenders typically ask for government ID, proof of income (such as pay stubs, an employment letter, or your Notice of Assessment), and proof of your down payment.',
        'Having these ready before you apply speeds up approval, and the exact list varies by lender.'
      ],
      pros: [
        'Preparing early makes the approval process faster and smoother.',
        'Complete documents help lenders give you an accurate rate and approval amount.'
      ],
      cons: [
        'Self-employed borrowers usually need more documentation to prove their income.',
        'Requirements differ between lenders, so you may be asked for additional items.'
      ],
      rates: [
        { label: 'Fixed mortgage (4 years)', details: 'RBC at 3.01%' },
        { label: 'Fixed mortgage (2 years)', details: 'BMO at 3.12%' },
        { label: 'Fixed mortgage (3 years)', details: 'TD at 3.25%' },
        { label: 'Fixed mortgage (1 year)', details: 'TD at 4.12%' }
      ]
    },
    followUpChips: [
      'What is a mortgage pre-approval and should I get one?',
      'How much down payment do I need to buy a home?',
      'Which mortgage term should I choose?'
    ]
  },

  // =========================================================================
  // FOLLOW-UP QUESTION TREE: PERSONAL INVESTMENTS (GICs)
  // =========================================================================
  {
    id: 'gic_vs_market_linked',
    category: 'PERSONAL INVESTMENTS',
    question: 'What is the difference between a GIC and a market-linked GIC?',
    aliases: [
      'what is the difference between a gic and a market-linked gic',
      'what is the difference between a gic and a market-linked gic?',
      'market linked gic'
    ],
    response: {
      introduction: [
        'A regular GIC pays a fixed interest rate, while a market-linked GIC ties your return to the performance of a market index.',
        'The market-linked options in our comparison are capped at 15%, which limits the upside.'
      ],
      pros: [
        'Market-linked GICs give you a chance at a higher return than a fixed rate.',
        'Your principal remains protected, so market losses do not reduce your original deposit.'
      ],
      cons: [
        'Returns depend on market performance and can end up lower than a regular GIC.',
        'The 15% cap means gains above that level are not passed on to you.'
      ],
      rates: [
        { label: 'Market-linked GIC (15% capped) (3 years)', details: 'RBC at 2.23%' },
        { label: 'Market-linked GIC (15% capped) (2 years)', details: 'TD at 1.89%' },
        { label: 'Market-linked GIC (15% capped) (1 year)', details: 'BMO at 1.69%' },
        { label: 'GIC (3 years)', details: 'TD at 2.01%' },
        { label: 'GIC (2 years)', details: 'TD at 1.69%' },
        { label: 'GIC (1 year)', details: 'RBC at 1.45%' }
      ]
    },
    followUpChips: [
      'Are GICs safe, and are they insured?',
      'How much of my savings should go into safe investments?',
      'What is the difference between a TFSA and an RRSP?'
    ]
  },
  {
    id: 'gic_safety_insurance',
    category: 'PERSONAL INVESTMENTS',
    question: 'Are GICs safe, and are they insured?',
    aliases: [
      'are gics safe, and are they insured',
      'are gics safe, and are they insured?',
      'is gic safe'
    ],
    response: {
      introduction: [
        'GICs are among the lower-risk investments because your principal is protected and the rate is set when you buy.',
        'Eligible deposits at CDIC member banks are generally insured up to a limit, so confirm the details with your institution.'
      ],
      pros: [
        'Your principal is protected, so you know what you will get back at maturity.',
        'Deposit insurance can add another layer of protection for eligible GICs.'
      ],
      cons: [
        'Returns are modest and may not beat inflation.',
        'Your money is usually locked in until maturity, and cashable options tend to pay less.'
      ],
      rates: [
        { label: 'GIC (3 years)', details: 'TD at 2.01%' },
        { label: 'GIC (2 years)', details: 'TD at 1.69%' },
        { label: 'GIC (1 year)', details: 'RBC at 1.45%' }
      ]
    },
    followUpChips: [
      'How much of my savings should go into safe investments?',
      'What is the difference between a GIC and a market-linked GIC?',
      'What is the difference between a TFSA and an RRSP?'
    ]
  },
  {
    id: 'safe_investment_allocation',
    category: 'PERSONAL INVESTMENTS',
    question: 'How much of my savings should go into safe investments?',
    aliases: [
      'how much of my savings should go into safe investments',
      'how much of my savings should go into safe investments?',
      'safe investment allocation'
    ],
    response: {
      introduction: [
        'There is no single right split, since it depends on when you need the money and how much risk you can handle.',
        'Money you need within a few years usually belongs in safer options like GICs, while long-term money can take more risk.'
      ],
      pros: [
        'Safe investments protect your principal and give predictable returns.',
        'Keeping some money safe means you are not forced to sell growth investments during a downturn.'
      ],
      cons: [
        'Too much in safe investments can leave your money growing slowly over the long term.',
        'Fixed returns may not keep pace with inflation.'
      ],
      rates: [
        { label: 'GIC (3 years)', details: 'TD at 2.01%' },
        { label: 'GIC (2 years)', details: 'TD at 1.69%' },
        { label: 'Market-linked GIC (15% capped) (3 years)', details: 'RBC at 2.23%' },
        { label: 'Market-linked GIC (15% capped) (2 years)', details: 'TD at 1.89%' }
      ]
    },
    followUpChips: [
      'Should I pay off debt or invest first?',
      'How do I start investing with a small amount of money?',
      'What is the difference between a TFSA and an RRSP?'
    ]
  },
  {
    id: 'debt_vs_investing_priority',
    category: 'PERSONAL INVESTMENTS',
    question: 'Should I pay off debt or invest first?',
    aliases: [
      'should i pay off debt or invest first',
      'should i pay off debt or invest first?',
      'debt vs investing'
    ],
    response: {
      introduction: [
        'A useful rule of thumb is to compare the interest rate on your debt with the return you can expect from investing.',
        'High-interest debt usually deserves priority because its cost is certain while investment returns are not.'
      ],
      pros: [
        'Paying off high-interest debt gives a guaranteed return equal to the interest you stop paying.',
        'Being debt-free improves cash flow and frees money to invest later.'
      ],
      cons: [
        'Putting all extra cash toward debt can delay building savings or an emergency fund.',
        'Low-interest debt may not be worth rushing if investing offers a better expected return.'
      ],
      rates: [
        { label: 'Credit card - lowest interest', details: 'TD at 20.10%, annual fee $120' },
        { label: 'GIC (3 years)', details: 'TD at 2.01%' }
      ]
    },
    followUpChips: [
      'How much of my savings should go into safe investments?',
      'How do I start investing with a small amount of money?',
      'What is the difference between a TFSA and an RRSP?'
    ]
  },
  {
    id: 'investing_small_amounts',
    category: 'PERSONAL INVESTMENTS',
    question: 'How do I start investing with a small amount of money?',
    aliases: [
      'how do i start investing with a small amount of money',
      'how do i start investing with a small amount of money?',
      'invest with little money'
    ],
    response: {
      introduction: [
        'You do not need a large amount to begin, since many products accept small deposits or regular contributions.',
        'Starting early and adding money consistently matters more than the size of your first deposit.'
      ],
      pros: [
        'Regular small contributions build the habit and benefit from time.',
        'Low-risk options like GICs let you start with a known return.'
      ],
      cons: [
        'Minimum deposits and fees vary, so high costs can eat into small amounts.',
        'Investing before building an emergency fund can force you to withdraw at a bad time.'
      ],
      rates: [
        { label: 'GIC (3 years)', details: 'TD at 2.01%' },
        { label: 'GIC (2 years)', details: 'TD at 1.69%' },
        { label: 'GIC (1 year)', details: 'RBC at 1.45%' }
      ]
    },
    followUpChips: [
      'What is the difference between a TFSA and an RRSP?',
      'Are GICs safe, and are they insured?',
      'Should I pay off debt or invest first?'
    ]
  },
  {
    id: 'tfsa_vs_rrsp_difference',
    category: 'PERSONAL INVESTMENTS',
    question: 'What is the difference between a TFSA and an RRSP?',
    aliases: [
      'what is the difference between a tfsa and an rrsp',
      'what is the difference between a tfsa and an rrsp?',
      'tfsa vs rrsp'
    ],
    response: {
      introduction: [
        'A TFSA lets your investments grow and be withdrawn tax-free, while an RRSP gives you a tax deduction now and taxes your withdrawals later.',
        'Both are accounts that can hold GICs, mutual funds, and other investments.'
      ],
      pros: [
        'TFSA withdrawals are tax-free, which gives you flexibility for goals at any time.',
        'RRSP contributions reduce your taxable income, which can be valuable in higher-income years.'
      ],
      cons: [
        'TFSA contributions are not tax-deductible and are limited by your contribution room.',
        'RRSP withdrawals are taxed as income, and contribution limits apply.'
      ],
      rates: [
        { label: 'Market-linked GIC (15% capped) (3 years)', details: 'RBC at 2.23%' },
        { label: 'GIC (3 years)', details: 'TD at 2.01%' },
        { label: 'Market-linked GIC (15% capped) (2 years)', details: 'TD at 1.89%' },
        { label: 'GIC (2 years)', details: 'TD at 1.69%' }
      ]
    },
    followUpChips: [
      'What is the difference between a GIC and a market-linked GIC?',
      'How much of my savings should go into safe investments?',
      'How do I start investing with a small amount of money?'
    ]
  },

  // =========================================================================
  // FOLLOW-UP QUESTION TREE: MUTUAL FUNDS / STOCKS
  // =========================================================================
  {
    id: 'mf_choose_right_fund',
    category: 'MUTUAL FUNDS/STOCKS',
    question: 'How do I choose the right mutual fund?',
    aliases: [
      'how do i choose the right mutual fund',
      'how do i choose the right mutual fund?',
      'choose mutual fund'
    ],
    response: {
      introduction: [
        'Start with your goal, time horizon, and risk comfort, then look for a fund whose holdings and strategy fit them.',
        'Compare costs and read the fund\'s Fund Facts document before you buy.'
      ],
      pros: [
        'Matching a fund to your goal and timeline improves the odds you will stick with it.',
        'Comparing fees and holdings helps you avoid paying more than you need to.'
      ],
      cons: [
        'Past performance does not guarantee future results, so it should not be your only guide.',
        'Owning several overlapping funds can add cost without adding real diversification.'
      ],
      ratesNote: 'Mutual fund returns are not fixed rates and change with the market. The rates below are capital-protected options shown for comparison.',
      rates: [
        { label: 'Market-linked GIC (15% capped) (3 years)', details: 'RBC at 2.23%' },
        { label: 'Market-linked GIC (15% capped) (2 years)', details: 'TD at 1.89%' },
        { label: 'Market-linked GIC (15% capped) (1 year)', details: 'BMO at 1.69%' }
      ]
    },
    followUpChips: [
      'What fees should I watch for in mutual funds?',
      'How much risk should I take with mutual funds?',
      'What is the difference between mutual funds and ETFs?'
    ]
  },
  {
    id: 'mf_fees_watch_out',
    category: 'MUTUAL FUNDS/STOCKS',
    question: 'What fees should I watch for in mutual funds?',
    aliases: [
      'what fees should i watch for in mutual funds',
      'what fees should i watch for in mutual funds?',
      'mutual fund fees'
    ],
    response: {
      introduction: [
        'Mutual funds charge ongoing fees, usually shown as a management expense ratio (MER), which is taken out of the fund\'s returns.',
        'Some funds also charge sales or switching fees, so always read the fee details before buying.'
      ],
      pros: [
        'Knowing the fees upfront lets you compare funds fairly.',
        'Choosing lower-cost funds can leave more of your return in your pocket.'
      ],
      cons: [
        'Fees compound over time and can significantly reduce long-term growth.',
        'A higher fee does not guarantee better performance.'
      ],
      ratesNote: 'Mutual fund returns are not fixed rates and change with the market. The rates below are capital-protected options shown for comparison.',
      rates: [
        { label: 'Market-linked GIC (15% capped) (3 years)', details: 'RBC at 2.23%' },
        { label: 'Market-linked GIC (15% capped) (2 years)', details: 'TD at 1.89%' },
        { label: 'Market-linked GIC (15% capped) (1 year)', details: 'BMO at 1.69%' }
      ]
    },
    followUpChips: [
      'What is the difference between mutual funds and ETFs?',
      'How do I choose the right mutual fund?',
      'Can I hold mutual funds in a TFSA or RRSP?'
    ]
  },
  {
    id: 'mf_risk_tolerance',
    category: 'MUTUAL FUNDS/STOCKS',
    question: 'How much risk should I take with mutual funds?',
    aliases: [
      'how much risk should i take with mutual funds',
      'how much risk should i take with mutual funds?',
      'mutual fund risk'
    ],
    response: {
      introduction: [
        'Mutual funds range from conservative bond and money market funds to higher-risk equity funds, so you can choose a level that fits you.',
        'Your risk level should match your time horizon and how you would react to a drop in value.'
      ],
      pros: [
        'You can pick funds that match your comfort with risk, from cautious to growth-focused.',
        'A longer time horizon gives growth funds more time to recover from downturns.'
      ],
      cons: [
        'Higher-risk funds can lose value quickly, especially in the short term.',
        'Taking too little risk may limit growth, while too much can lead to panic selling.'
      ],
      ratesNote: 'Mutual fund returns are not fixed rates and change with the market. The rates below are capital-protected options shown for comparison.',
      rates: [
        { label: 'Market-linked GIC (15% capped) (3 years)', details: 'RBC at 2.23%' },
        { label: 'Market-linked GIC (15% capped) (2 years)', details: 'TD at 1.89%' },
        { label: 'Market-linked GIC (15% capped) (1 year)', details: 'BMO at 1.69%' }
      ]
    },
    followUpChips: [
      'Are mutual funds better than GICs?',
      'How do I choose the right mutual fund?',
      'What fees should I watch for in mutual funds?'
    ]
  },
  {
    id: 'mf_start_investing',
    category: 'MUTUAL FUNDS/STOCKS',
    question: 'How do I start investing in mutual funds?',
    aliases: [
      'how do i start investing in mutual funds',
      'how do i start investing in mutual funds?',
      'start investing in mutual funds'
    ],
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
      ],
      ratesNote: 'Mutual fund returns are not fixed rates and change with the market. The rates below are capital-protected options shown for comparison.',
      rates: [
        { label: 'Market-linked GIC (15% capped) (3 years)', details: 'RBC at 2.23%' },
        { label: 'Market-linked GIC (15% capped) (2 years)', details: 'TD at 1.89%' },
        { label: 'Market-linked GIC (15% capped) (1 year)', details: 'BMO at 1.69%' }
      ]
    },
    followUpChips: [
      'How do I choose the right mutual fund?',
      'Can I hold mutual funds in a TFSA or RRSP?',
      'What fees should I watch for in mutual funds?'
    ]
  },
  {
    id: 'mf_vs_gic_comparison',
    category: 'MUTUAL FUNDS/STOCKS',
    question: 'Are mutual funds better than GICs?',
    aliases: [
      'are mutual funds better than gics',
      'are mutual funds better than gics?',
      'mutual funds vs gic'
    ],
    response: {
      introduction: [
        'Mutual funds aim for growth but can lose value, while GICs protect your principal and pay a known rate.',
        'Neither is better for everyone, since it depends on your timeline and comfort with risk.'
      ],
      pros: [
        'Mutual funds offer higher growth potential over the long term.',
        'GICs give certainty, which suits short-term goals or lower risk tolerance.'
      ],
      cons: [
        'Mutual funds can lose money, especially over short periods.',
        'GICs lock in your money and may earn less than growth-oriented investments.'
      ],
      ratesNote: 'Mutual fund returns are not fixed rates and change with the market. The rates below are capital-protected options shown for comparison.',
      rates: [
        { label: 'GIC (3 years)', details: 'TD at 2.01%' },
        { label: 'GIC (2 years)', details: 'TD at 1.69%' },
        { label: 'GIC (1 year)', details: 'RBC at 1.45%' },
        { label: 'Market-linked GIC (15% capped) (3 years)', details: 'RBC at 2.23%' }
      ]
    },
    followUpChips: [
      'How much risk should I take with mutual funds?',
      'Can I hold mutual funds in a TFSA or RRSP?',
      'What fees should I watch for in mutual funds?'
    ]
  },
  {
    id: 'mf_vs_etf_comparison',
    category: 'MUTUAL FUNDS/STOCKS',
    question: 'What is the difference between mutual funds and ETFs?',
    aliases: [
      'what is the difference between mutual funds and etfs',
      'what is the difference between mutual funds and etfs?',
      'mutual funds vs etfs'
    ],
    response: {
      introduction: [
        'Both pool many investments into one product, but ETFs trade on an exchange like stocks while mutual funds are bought and sold at the end-of-day price.',
        'ETFs often have lower fees, while mutual funds are commonly bought through banks and advisors and can offer automatic contributions.'
      ],
      pros: [
        'ETFs generally carry lower fees and can be traded throughout the day.',
        'Mutual funds make it easy to invest set amounts automatically and often come with advisor support.'
      ],
      cons: [
        'ETFs are bought like stocks, which can involve trading commissions and more do-it-yourself decisions.',
        'Mutual funds often have higher fees, which can reduce long-term returns.'
      ],
      ratesNote: 'Mutual fund returns are not fixed rates and change with the market. The rates below are capital-protected options shown for comparison.',
      rates: [
        { label: 'Market-linked GIC (15% capped) (3 years)', details: 'RBC at 2.23%' },
        { label: 'Market-linked GIC (15% capped) (2 years)', details: 'TD at 1.89%' },
        { label: 'Market-linked GIC (15% capped) (1 year)', details: 'BMO at 1.69%' }
      ]
    },
    followUpChips: [
      'What fees should I watch for in mutual funds?',
      'How do I start investing in mutual funds?',
      'Can I hold mutual funds in a TFSA or RRSP?'
    ]
  },
  {
    id: 'mf_tfsa_rrsp_eligibility',
    category: 'MUTUAL FUNDS/STOCKS',
    question: 'Can I hold mutual funds in a TFSA or RRSP?',
    aliases: [
      'can i hold mutual funds in a tfsa or rrsp',
      'can i hold mutual funds in a tfsa or rrsp?',
      'mutual funds in tfsa'
    ],
    response: {
      introduction: [
        'Yes, mutual funds can be held inside a TFSA or RRSP, which changes how your gains are taxed but not how the fund performs.',
        'Which account is better depends on your goals, your tax situation, and your contribution room.'
      ],
      pros: [
        'Holding funds in a registered account can shelter your growth from tax.',
        'You can match the account to your goal, such as retirement or flexible savings.'
      ],
      cons: [
        'Contribution limits apply, so you may not be able to hold everything in these accounts.',
        'RRSP withdrawals are taxed as income, so timing matters.'
      ],
      ratesNote: 'Mutual fund returns are not fixed rates and change with the market. The rates below are capital-protected options shown for comparison.',
      rates: [
        { label: 'GIC (3 years)', details: 'TD at 2.01%' },
        { label: 'GIC (2 years)', details: 'TD at 1.69%' },
        { label: 'GIC (1 year)', details: 'RBC at 1.45%' },
        { label: 'Market-linked GIC (15% capped) (3 years)', details: 'RBC at 2.23%' }
      ]
    },
    followUpChips: [
      'How do I start investing in mutual funds?',
      'How do I choose the right mutual fund?',
      'Are mutual funds better than GICs?'
    ]
  },

  // =========================================================================
  // FOLLOW-UP QUESTION TREE: DEBT CONSOLIDATION
  // =========================================================================
  {
    id: 'debt_fixed_vs_revolving',
    category: 'DEBT CONSOLIDATION',
    question: 'Do you want money for a fixed duration / or long term revolving credit?',
    aliases: [
      'do you want money for a fixed duration / or long term revolving credit',
      'do you want money for a fixed duration / or long term revolving credit?',
      'fixed duration or revolving credit',
      'fixed vs revolving debt consolidation'
    ],
    response: {
      introduction: [
        'A fixed-duration installment loan provides a single lump sum that you repay over a set timeframe with predictable payments, ideal for paying off debt completely.',
        'Revolving credit (like a personal line of credit or HELOC) allows you to borrow, repay, and borrow again up to a limit, giving flexible access for ongoing needs.'
      ],
      pros: [
        'Fixed loans establish a clear payoff date so you become debt-free on schedule.',
        'Revolving lines of credit only charge interest on the specific balance you draw.'
      ],
      cons: [
        'Revolving credit carries the risk of keeping you in a cycle of debt if you continue borrowing as balances free up.',
        'Fixed loans offer less flexibility once established if you encounter an unexpected expense.'
      ],
      rates: [
        { label: 'Variable Rate Loan / Mortgage (4 years)', details: 'BMO at 3.01%' },
        { label: 'Fixed mortgage (2 years)', details: 'BMO at 3.12%' },
        { label: 'Credit card - lowest interest', details: 'TD at 20.10%, annual fee $120' }
      ]
    },
    followUpChips: [
      'How do I consolidate my debt effectively?',
      'How does my credit score affect the loan rate I get?',
      'Is a balance transfer credit card a good way to consolidate debt?'
    ]
  },
  {
    id: 'debt_consolidate_effectively',
    category: 'DEBT CONSOLIDATION',
    question: 'How do I consolidate my debt effectively?',
    aliases: [
      'how do i consolidate my debt effectively',
      'how do i consolidate my debt effectively?',
      'how to consolidate debt effectively',
      'consolidate debt effectively'
    ],
    response: {
      introduction: [
        'Debt consolidation combines several debts into one payment, ideally at a lower interest rate than you pay now.',
        'It works best when the new rate is lower and you stop adding new balances to the old accounts.'
      ],
      pros: [
        'One monthly payment is easier to manage than several due dates.',
        'A lower rate means more of each payment goes toward the balance.'
      ],
      cons: [
        'Longer repayment periods can mean more total interest even at a lower rate.',
        'It only helps if spending habits change, otherwise old balances can build again.'
      ],
      rates: [
        { label: 'Variable Rate Loan / Mortgage (4 years)', details: 'BMO at 3.01%' },
        { label: 'Fixed mortgage (2 years)', details: 'BMO at 3.12%' },
        { label: 'Credit card - lowest interest', details: 'TD at 20.10%, annual fee $120' }
      ]
    },
    followUpChips: [
      'Is debt consolidation right for me?',
      'Should I use the debt snowball or the debt avalanche method?',
      'Can I use my mortgage to consolidate debt?'
    ]
  },
  {
    id: 'debt_consolidation_right_for_me',
    category: 'DEBT CONSOLIDATION',
    question: 'Is debt consolidation right for me?',
    aliases: [
      'is debt consolidation right for me',
      'is debt consolidation right for me?',
      'should i consolidate my debt'
    ],
    response: {
      introduction: [
        'It can make sense when you carry several high-interest debts and can qualify for a meaningfully lower rate.',
        'It is less useful if your debts are small, already low-interest, or close to paid off.'
      ],
      pros: [
        'Replacing card balances above 20% with cheaper borrowing can reduce interest costs.',
        'A single payment plan helps you stay on track.'
      ],
      cons: [
        'Fees or penalties on the new product can cancel out savings.',
        'Spreading payments over a longer time can increase what you pay overall.'
      ],
      rates: [
        { label: 'Variable Rate Loan / Mortgage (4 years)', details: 'BMO at 3.01%' },
        { label: 'Credit card - lowest interest', details: 'TD at 20.10%, annual fee $120' }
      ]
    },
    followUpChips: [
      'How do I consolidate my debt effectively?',
      'What is the difference between debt consolidation, credit counselling, and a consumer proposal?',
      'Should I use the debt snowball or the debt avalanche method?'
    ]
  },
  {
    id: 'debt_use_mortgage_refinance',
    category: 'DEBT CONSOLIDATION',
    question: 'Can I use my mortgage to consolidate debt?',
    aliases: [
      'can i use my mortgage to consolidate debt',
      'can i use my mortgage to consolidate debt?',
      'use mortgage to consolidate debt',
      'refinance mortgage for debt consolidation'
    ],
    response: {
      introduction: [
        'Some homeowners refinance or borrow against home equity to pay off higher-interest debts at mortgage-level rates.',
        'This can lower your interest cost, but it turns unsecured debt into debt secured by your home.'
      ],
      pros: [
        'Mortgage rates are far lower than credit card rates, so interest savings can be significant.',
        'Your monthly cash flow may improve with one lower payment.'
      ],
      cons: [
        'Your home becomes security for debt that was previously unsecured.',
        'Refinancing can involve penalties and fees, and spreading debt over a long amortization can raise total interest.'
      ],
      rates: [
        { label: 'Fixed mortgage (2 years)', details: 'BMO at 3.12%' },
        { label: 'Variable mortgage (2 years)', details: 'TD at 3.12%' },
        { label: 'Credit card - lowest interest', details: 'TD at 20.10%, annual fee $120' }
      ]
    },
    followUpChips: [
      'How do I consolidate my debt effectively?',
      'How much can I afford to borrow?',
      'Will debt consolidation affect my credit score?'
    ]
  },
  {
    id: 'debt_affect_credit_score',
    category: 'DEBT CONSOLIDATION',
    question: 'Will debt consolidation affect my credit score?',
    aliases: [
      'will debt consolidation affect my credit score',
      'will debt consolidation affect my credit score?',
      'does debt consolidation hurt credit'
    ],
    response: {
      introduction: [
        'Applying for new credit can cause a small, temporary dip, since lenders check your credit report.',
        'Over time, paying on schedule and lowering card balances can help your score recover and improve.'
      ],
      pros: [
        'Lower card balances reduce your credit utilization, which can support your score.',
        'On-time payments on a single account build a positive payment history.'
      ],
      cons: [
        'A credit check for the new product may briefly lower your score.',
        'Closing old accounts or missing payments on the new one can hurt your score.'
      ],
      rates: [
        { label: 'Variable Rate Loan / Mortgage (4 years)', details: 'BMO at 3.01%' },
        { label: 'Credit card - lowest interest', details: 'TD at 20.10%, annual fee $120' }
      ]
    },
    followUpChips: [
      'How does my credit score affect the loan rate I get?',
      'How do I consolidate my debt effectively?',
      'Can I consolidate my debt with bad credit?'
    ]
  },
  {
    id: 'debt_snowball_vs_avalanche',
    category: 'DEBT CONSOLIDATION',
    question: 'Should I use the debt snowball or the debt avalanche method?',
    aliases: [
      'should i use the debt snowball or the debt avalanche method',
      'should i use the debt snowball or the debt avalanche method?',
      'snowball vs avalanche',
      'debt snowball vs avalanche'
    ],
    response: {
      introduction: [
        'The avalanche method pays off your highest-interest debt first, while the snowball method pays off your smallest balance first.',
        'Both keep minimum payments on everything else and put extra money toward one target at a time.'
      ],
      pros: [
        'Avalanche usually saves the most interest overall.',
        'Snowball gives quick wins that help many people stay motivated.'
      ],
      cons: [
        'Avalanche can feel slow if your highest-rate debt is also your largest.',
        'Snowball can cost more in interest if your small debts have low rates.'
      ],
      rates: [
        { label: 'Credit card - lowest interest', details: 'TD at 20.10%, annual fee $120' },
        { label: 'Variable Rate Loan / Mortgage (4 years)', details: 'BMO at 3.01%' }
      ]
    },
    followUpChips: [
      'Is debt consolidation right for me?',
      'How do I consolidate my debt effectively?',
      'Is a balance transfer credit card a good way to consolidate debt?'
    ]
  },
  {
    id: 'debt_consolidate_bad_credit',
    category: 'DEBT CONSOLIDATION',
    question: 'Can I consolidate my debt with bad credit?',
    aliases: [
      'can i consolidate my debt with bad credit',
      'can i consolidate my debt with bad credit?',
      'consolidate debt with bad credit',
      'bad credit debt consolidation'
    ],
    response: {
      introduction: [
        'You can still consolidate with lower credit, but approval is harder and the rates offered are usually higher.',
        'The savings depend on whether the new rate is actually lower than what you pay now.'
      ],
      pros: [
        'Even with imperfect credit, a lower rate than your cards can still reduce interest costs.',
        'Options like a co-signer, a secured loan, or non-profit credit counselling may be available.'
      ],
      cons: [
        'A higher rate or extra fees can erase the savings, so compare the total cost carefully.',
        'Secured options or co-signers put an asset or another person at risk if payments are missed.'
      ],
      rates: [
        { label: 'Credit card - lowest interest', details: 'TD at 20.10%, annual fee $120' },
        { label: 'Credit card - lowest annual fee', details: 'BMO at 21.21%, annual fee $100' }
      ]
    },
    followUpChips: [
      'What is the difference between debt consolidation, credit counselling, and a consumer proposal?',
      'Will debt consolidation affect my credit score?',
      'How does my credit score affect the loan rate I get?'
    ]
  },
  {
    id: 'debt_balance_transfer_card',
    category: 'DEBT CONSOLIDATION',
    question: 'Is a balance transfer credit card a good way to consolidate debt?',
    aliases: [
      'is a balance transfer credit card a good way to consolidate debt',
      'is a balance transfer credit card a good way to consolidate debt?',
      'balance transfer credit card',
      'balance transfer for debt consolidation'
    ],
    response: {
      introduction: [
        'A balance transfer card moves your existing card balances onto a new card, often with a low promotional rate for a limited time.',
        'It can save interest if you pay off the balance before the promotional period ends.'
      ],
      pros: [
        'A low promotional rate lets more of each payment go toward the balance.',
        'You can combine several card balances into one payment.'
      ],
      cons: [
        'Transfer fees can apply, and the rate usually rises sharply after the promotional period.',
        'Missing a payment can end the promotional rate early.'
      ],
      rates: [
        { label: 'Credit card - lowest interest', details: 'TD at 20.10%, annual fee $120' },
        { label: 'Credit card - lowest annual fee', details: 'BMO at 21.21%, annual fee $100' }
      ]
    },
    followUpChips: [
      'Is debt consolidation right for me?',
      'How do I consolidate my debt effectively?',
      'Do you want money for a fixed duration / or long term revolving credit?'
    ]
  },
  {
    id: 'debt_consolidation_vs_proposal_counselling',
    category: 'DEBT CONSOLIDATION',
    question: 'What is the difference between debt consolidation, credit counselling, and a consumer proposal?',
    aliases: [
      'what is the difference between debt consolidation, credit counselling, and a consumer proposal',
      'what is the difference between debt consolidation, credit counselling, and a consumer proposal?',
      'debt consolidation vs credit counselling vs consumer proposal',
      'consumer proposal vs debt consolidation'
    ],
    response: {
      introduction: [
        'Consolidation replaces your debts with a new loan, credit counselling sets up a repayment plan through a non-profit agency, and a consumer proposal is a legal arrangement, arranged through a Licensed Insolvency Trustee, to repay less than you owe.',
        'Which fits depends on how large your debt is and whether you can still afford your payments.'
      ],
      pros: [
        'Credit counselling or a consumer proposal can help when payments have become unmanageable.',
        'A consolidation loan is the simplest option if you still qualify for a lower rate.'
      ],
      cons: [
        'A counselling plan or consumer proposal can be noted on your credit report and affect future borrowing.',
        'Consolidation only works if you qualify and can keep up with the new payment.'
      ],
      ratesNote: 'Speak to accredited credit consultants or Licensed Insolvency Trustees to review your options.'
    },
    followUpChips: [
      'Can I consolidate my debt with bad credit?',
      'Will debt consolidation affect my credit score?',
      'Is debt consolidation right for me?'
    ]
  }
];

// Helper functions for matching and formatting responses
export function findPreCannedMatch(query: string): PreCannedQA | undefined {
  const normalized = query
    .toLowerCase()
    .replace(/[?.,!/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return PRE_CANNED_QUESTIONS.find((item) => {
    const itemQuestion = item.question
      .toLowerCase()
      .replace(/[?.,!/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (normalized === itemQuestion) return true;

    return item.aliases.some((alias) => {
      const aliasNorm = alias
        .toLowerCase()
        .replace(/[?.,!/]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return normalized === aliasNorm;
    });
  });
}

export function formatPreCannedResponse(item: PreCannedQA): string {
  const parts: string[] = [];

  // Introduction / Overview
  if (item.response.introduction && item.response.introduction.length > 0) {
    parts.push('**Overview**\n');
    item.response.introduction.forEach((bullet) => {
      parts.push(`• ${bullet}`);
    });
  }

  // Pros
  if (item.response.pros && item.response.pros.length > 0) {
    parts.push('\n**Pros**\n');
    item.response.pros.forEach((bullet) => {
      parts.push(`• ${bullet}`);
    });
  }

  // Cons
  if (item.response.cons && item.response.cons.length > 0) {
    parts.push('\n**Cons**\n');
    item.response.cons.forEach((bullet) => {
      parts.push(`• ${bullet}`);
    });
  }

  // Guidance Questions (in-bubble intake prompts)
  if (item.response.intakePrompts && item.response.intakePrompts.length > 0) {
    parts.push('\n**Guidance Questions**\n');
    item.response.intakePrompts.forEach((prompt) => {
      parts.push(`• ${prompt}`);
    });
  }

  // Rates Note (if applicable)
  if (item.response.ratesNote) {
    parts.push(`\n*${item.response.ratesNote}*`);
  }

  // Grounded Rates
  if (item.response.rates && item.response.rates.length > 0) {
    parts.push('\n**Current Rates**\n');
    item.response.rates.forEach((rate) => {
      parts.push(`• **${rate.label}** — ${rate.details}`);
    });
  }

  return parts.join('\n');
}