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
      <div className="mb-12 md:mb-16">
        <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
          Frequently Asked Questions
        </h2>
        <div className="w-16 h-px bg-accent"></div>
      </div>

      <div className="max-w-3xl flex flex-col gap-3">
        {FAQS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-surface border border-border-subtle rounded-lg overflow-hidden transition-colors hover:border-border"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-heading text-lg font-semibold text-foreground">
                  {item.q}
                </span>
                <ChevronDownIcon
                  className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-200 ease-in-out ${
                  isOpen
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground font-body">
                    {item.a}
                  </p>
                </div>
              </div>
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
