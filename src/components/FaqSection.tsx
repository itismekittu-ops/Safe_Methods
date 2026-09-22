import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDownIcon } from 'lucide-react';

const FAQS = [
  {
    q: 'Is Safe Methods free to use for consumers?',
    a: 'Yes. Safe Methods is completely free for consumers. We do not charge fees to compare rates or receive quotes from certified advisors.',
  },
  {
    q: 'How are the bank rates and rankings determined?',
    a: 'Rankings are generated strictly from verified posted interest rates and product terms. We never accept paid placement or sponsored ranking boosts.',
  },
  {
    q: 'How does the multi-bank quote process work?',
    a: 'When you submit a quote request, verified advisors from top institutions submit competitive bids. We compile them into a unified, side-by-side comparison sent to your inbox.',
  },
  {
    q: 'Is my personal data shared with every bank?',
    a: 'No. Your contact details are strictly limited to the institutions you explicitly select and consent to. We never sell your data.',
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
        <h2 className="font-heading text-3xl md:text-4xl text-primary text-center mb-3">
          Frequently Asked Questions
        </h2>
        <div className="w-16 h-0.5 bg-accent mx-auto mb-4" />
        <p className="text-muted-foreground text-center text-sm md:text-base max-w-2xl mx-auto">
          Clear, transparent answers on comparing rates, advisor impartiality, and how our multi-bank quotes work.
        </p>
      </div>

      <div className="w-full max-w-4xl mx-auto space-y-4 mt-10">
        {FAQS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`bg-surface border border-border-subtle rounded-xl p-5 md:p-6 transition-all duration-200 hover:border-accent/50 shadow-soft ${
                isOpen ? 'border-accent/50' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 text-left font-heading font-medium text-base md:text-lg text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDownIcon
                  className={`w-5 h-5 text-accent shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="mt-4 pt-4 border-t border-border-subtle/60 text-sm md:text-base text-muted-foreground leading-relaxed pl-1">
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
