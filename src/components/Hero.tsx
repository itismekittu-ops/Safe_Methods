import React from 'react';
import { motion } from 'framer-motion';
import { HeroIntro } from './HeroIntro';
import { RatePanel } from './RatePanel';
import { BrandMarquee } from './BrandMarquee';
import { easeOut } from '../utils/motion';

/**
 * Hero = 100vh − navbar (56px) − 30px of marquee peek.
 * Inside: 14px above the cards, 16px below. Cards fill the rest (100vh − 116px),
 * capped at 720px; on taller screens the extra space splits evenly above and below.
 */
export function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 sm:px-8">
      <div className="flex flex-col pb-4 pt-3.5 lg:h-[calc(100vh-86px)] lg:justify-center">
        <div className="grid gap-8 lg:h-[min(calc(100vh-116px),720px)] lg:grid-cols-[minmax(0,1fr)_404px] lg:items-stretch lg:gap-10 xl:grid-cols-[minmax(0,1fr)_444px]">
          <div className="hero-left relative">
            {/* Reserved space for the floating 3D coin (transparent PNG). Drop an <img> in here; it sits behind the card's top-right edge. */}
            <div
              id="coin-slot"
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-8 z-0 hidden h-44 w-44 lg:block" />
            
            <HeroIntro />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25, ease: easeOut }}
            className="relative z-10 h-full">
            
            <RatePanel />
          </motion.div>
        </div>
      </div>

      <div className="pb-10">
        <BrandMarquee />
      </div>
    </section>);

}