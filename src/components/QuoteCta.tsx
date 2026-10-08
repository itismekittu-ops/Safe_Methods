import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CalendarIcon, InfoIcon } from 'lucide-react';
import { QuoteInfo } from './QuoteInfo';

interface QuoteCtaProps {
  onQuote: () => void;
  onBook: () => void;
}

export function QuoteCta({ onQuote, onBook }: QuoteCtaProps) {
  return (
    <div id="quotes">
      <div className="relative">
        <span aria-hidden="true" className="cta-pulse pointer-events-none absolute inset-0 rounded-2xl border-2 border-gold" />
        <motion.button
          type="button"
          onClick={onQuote}
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ y: 1, scale: 0.98 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="cta-button group relative flex h-[clamp(44px,5vh,52px)] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gold font-sans text-[15px] font-semibold text-forest-ink">
          
          <span aria-hidden="true" className="cta-shine pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-white/40" />
          <span className="relative">Get Competing Quotes</span>
          <ArrowRightIcon className="cta-arrow relative h-4 w-4" aria-hidden="true" />
        </motion.button>
        <QuoteInfo />
      </div>

      <button
        type="button"
        onClick={onBook}
        className="mt-3.5 flex h-10 w-full items-center justify-center gap-2 rounded-2xl border border-forest bg-transparent font-sans text-[14px] font-semibold text-forest transition-colors duration-150 hover:bg-forest/5">
        
        <CalendarIcon className="h-4 w-4" aria-hidden="true" />
        Book a Consultant
      </button>

      <p className="mt-2 flex items-start gap-1.5 font-sans text-[11.5px] leading-[1.35] text-note">
        <InfoIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        AI responses are educational and can make mistakes. We encourage you to speak with a verified advisor for
        personalized financial advice.
      </p>
    </div>);
}
