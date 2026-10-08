import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AskInput } from './AskInput';
import { SuggestionGrid } from './SuggestionGrid';
import { BiddingArena } from './arena/BiddingArena';
import { SourceMarker } from './SourceMarker';
import { useAskInput } from '../hooks/useAskInput';
import { useBidding } from '../contexts/BiddingContext';
import { easeOut, fadeUp, stagger } from '../utils/motion';

export function HeroIntro() {
  const reduced = useReducedMotion() ?? false;
  const { ask: startBidding, arena } = useBidding();
  const ask = useAskInput(reduced, startBidding);
  const busy = arena.run !== null;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="relative z-10 flex h-full flex-col rounded-[28px] border border-line bg-cream-card px-6 pb-6 pt-8">
      
      <div
        aria-hidden={busy}
        className={`flex flex-1 flex-col transition-[filter,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        busy ? 'pointer-events-none opacity-20 blur-[6px]' : ''}`
        }>
        
        <div className="text-center">
          <motion.h2
            variants={fadeUp}
            className="mx-auto font-serif font-semibold text-forest">
            
            {/* One line at ~26px; at narrower widths it wraps into two balanced lines. */}
            <span
              className="relative inline-block leading-[1.25] tracking-[-0.02em] [text-wrap:balance]"
              style={{ fontSize: 'clamp(19px, 1.9vw, 26px)' }}>
              
              Only{' '}
              <motion.span
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.26, delay: 0.3, ease: easeOut }}
                className="inline-block rounded-lg bg-forest px-1.5 pb-0.5 text-gold">
                
                1&nbsp;in&nbsp;4
              </motion.span>{' '}
              Canadians turn to a financial&nbsp;advisor.<SourceMarker />
            </span>
            <span
              className="mt-1 block font-normal italic leading-[1.05] tracking-[-0.02em] text-gold-dark"
              style={{ fontSize: 'clamp(36px, 3.8vw, 52px)' }}>
              
              We’re changing that.
            </span>
          </motion.h2>

          <motion.p variants={fadeUp} className="mx-auto mt-1 max-w-[520px] text-[15px] leading-relaxed text-muted">
            Experts from top financial firms bid for you.
          </motion.p>
        </div>

        <div className="flex flex-1 items-center" style={{ paddingTop: 0, paddingBottom: 'clamp(12px, calc(0.6vh + 10px), 26px)' }}>
          <SuggestionGrid onPick={ask.autoType} disabled={busy} />
        </div>
      </div>

      <BiddingArena />

      <motion.div variants={fadeUp} className="mt-auto border-t border-line pt-[18px]">
        <AskInput
          value={ask.value}
          status={ask.status}
          submitted={ask.submitted}
          inputRef={ask.inputRef}
          disabled={busy}
          onChange={ask.onChange}
          onSubmit={ask.submit} />
        
      </motion.div>
    </motion.div>);

}