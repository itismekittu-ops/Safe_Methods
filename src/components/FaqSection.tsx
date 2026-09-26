import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Is Safe Methods free to use for consumers?',
    a: 'Yes. Safe Methods is completely free for consumers. We do not charge fees to compare rates or receive quotes from certified advisors.',
  },
  {
    q: 'How does the multi-bank quote process work?',
    a: 'When you submit a quote request, verified advisors from top institutions submit competitive bids. We compile them into a unified, side-by-side comparison sent to your inbox.',
  },
  {
    q: 'Is my personal data shared with every bank?',
    a: 'No. Your contact details are strictly limited to the institutions you explicitly select and consent to. We never sell your data.',
  },
  {
    q: 'Should I pay off debt or invest first?',
    a: 'A useful rule of thumb is to compare the interest rate on your debt with the return you can expect from investing. High-interest debt usually deserves priority because its cost is certain while investment returns are not.',
  },
{
    q: 'How does my credit score affect the loan rate I get?',
    a: 'Your credit score summarizes how reliably you have repaid debt, and lenders use it to decide whether to approve you and at what rate. In Canada scores range from 300 to 900, and a higher score generally unlocks lower rates.',
  },
{
    q: 'How can I improve my credit score fast?',
    a: 'The biggest drivers of your score are payment history and how much of your available credit you use. Small, consistent habits usually move your score faster and more safely than any shortcut.',
  },
{
    q: 'How much can I afford to borrow?',
    a: 'Lenders look at your income, your existing debts, and your credit history to decide how much they will lend. What you can borrow and what you can comfortably repay are not always the same amount.',
  },
{
    q: 'Should I choose a fixed or variable mortgage?',
    a: 'A fixed rate stays the same for the whole term, while a variable rate can move up or down with market conditions. The right choice depends on how much payment certainty you need and how much rate risk you can accept.',
  },
{
    q: 'What is better: a loan / line of credit / credit card ?',
    a: 'A personal loan gives you a lump sum with fixed payments, while a credit card gives you revolving credit you repay at your own pace. The better choice depends on how much you need, how fast you can repay, and the rate you qualify for.',
  },
];

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
};

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="container mx-auto px-4 py-16 md:py-24">
      <div className="mb-10">
        <h2 className="font-heading text-3xl md:text-4xl text-primary text-center tracking-normal mb-3">
          Frequently Asked Questions
        </h2>
        <div className="w-16 h-0.5 bg-accent mx-auto mb-4" />
        <p className="text-muted-foreground text-center text-sm md:text-base max-w-2xl mx-auto">
          Clear, transparent answers on comparing rates, advisor impartiality, and how our multi-bank quotes work.
        </p>
      </div>

      <div className="w-full max-w-3xl mx-auto space-y-3.5 mt-10">
        {FAQS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`bg-surface border transition-all duration-200 rounded-xl p-5 md:p-6 shadow-sm ${
                isOpen
                  ? 'border-border-subtle border-l-4 border-l-primary'
                  : 'border-border-subtle hover:border-primary/40'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between text-left font-heading font-medium text-base md:text-lg text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-accent font-bold' : 'text-muted-foreground'}`} />
              </button>
              {isOpen && (
                <div className="mt-3.5 pt-3.5 border-t border-border-subtle/60 text-sm md:text-base text-muted-foreground leading-relaxed pl-0.5">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(FAQ_JSONLD)}
        </script>
      </Helmet>
    </section>
  );
}
