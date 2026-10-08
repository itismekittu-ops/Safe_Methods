import React, { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { HeroIntro } from './HeroIntro';
import { RatePanel } from './RatePanel';
import { BrandMarquee } from './BrandMarquee';
import { GetQuotesModal } from './GetQuotesModal';
import type { BankMatchRef } from './GetQuotesModal';
import { easeOut } from '../utils/motion';
import { useBidding } from '../contexts/BiddingContext';
import { advisors, rateCategories, terms } from '../data/rates';
import { rankQuotes } from '../utils/ranking';

type RequestMode = 'loan' | 'investment' | 'mortgage';

function categoryIdToRequestMode(categoryId: string): RequestMode {
  if (categoryId === 'mortgage') return 'mortgage';
  if (categoryId === 'investment' || categoryId === 'funds') return 'investment';
  return 'loan';
}

function categoryIdToProductType(categoryId: string): string {
  switch (categoryId) {
    case 'mortgage': return 'mortgage';
    case 'investment': return 'gic';
    case 'funds': return 'investment';
    case 'debt': return 'personal_loan';
    default: return 'personal_loan';
  }
}

export function Hero() {
  const { categoryId, optionId, termId, sessionToken } = useBidding();
  const [quotesOpen, setQuotesOpen] = useState(false);

  const banks: BankMatchRef[] = useMemo(() => {
    const category = rateCategories.find((c) => c.id === categoryId) ?? rateCategories[0];
    const option = category.options.find((o) => o.id === optionId) ?? category.options[0];
    const term = terms.find((t) => t.id === termId) ?? terms[0];
    const ranked = rankQuotes(option.quotes, category.id, term.offset);
    const productType = categoryIdToProductType(category.id);

    return ranked.map((q, i) => {
      const advisor = advisors.find((a) => a.id === q.advisorId);
      return {
        name: advisor?.firm ?? '',
        productType,
        rate: q.rate,
        rank: i + 1,
        consultantId: null,
        consultantName: advisor?.name ?? null,
      };
    });
  }, [categoryId, optionId, termId]);

  const handleBook = useCallback(() => {
    const url = import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com/safemethods';
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
      {/* Dynamic desktop viewport container: completely fits at 100% zoom without cutting off bottom buttons */}
      <div className="flex flex-1 flex-col justify-between pb-2 pt-1 lg:min-h-[calc(100vh-84px)] lg:max-h-[calc(100vh-76px)] overflow-hidden">
        {/* Two-column card grid */}
        <div className="relative z-10 grid flex-1 items-stretch gap-4 sm:gap-5 lg:max-h-[calc(100vh-150px)] lg:grid-cols-[minmax(0,1fr)_410px] xl:grid-cols-[minmax(0,1fr)_430px]">
          <div className="hero-left relative z-10 flex h-full flex-col">
            <div
              id="coin-slot"
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-8 z-0 hidden h-44 w-44 lg:block" />

            <HeroIntro onOpenQuotesModal={() => setQuotesOpen(true)} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2, ease: easeOut }}
            className="relative z-10 flex h-full flex-col">

            <RatePanel
              onQuote={() => setQuotesOpen(true)}
              onBook={handleBook} />
          </motion.div>
        </div>

        {/* Brand marquee: strictly below the cards, showing both tracks peeking at the fold */}
        <div className="relative z-0 mt-2 h-14 shrink-0 overflow-hidden pt-1 pointer-events-none">
          <BrandMarquee />
        </div>
      </div>

      <GetQuotesModal
        open={quotesOpen}
        onClose={() => setQuotesOpen(false)}
        banks={banks}
        sessionToken={sessionToken}
        initialCategory={categoryIdToRequestMode(categoryId)}
      />
    </section>
  );
}