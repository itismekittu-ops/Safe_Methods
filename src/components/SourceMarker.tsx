import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { headlineSource } from '../data/sources';
import { easeOut } from '../utils/motion';

const TOOLTIP_ID = 'source-1-tooltip';
const CLOSE_DELAY_MS = 150;

/**
 * Superscript "1" after the headline statistic, with a hover/focus tooltip naming the source.
 * The wrapper is intentionally not positioned, so the tooltip anchors to the headline line
 * (its nearest positioned ancestor): it opens below the marker, aligned to the headline's left edge.
 */
export function SourceMarker() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hideSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className="inline-block align-super"
      onMouseEnter={show}
      onMouseLeave={hideSoon}
      onFocus={show}
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}>
      
      {/* Padding gives a 24×24 hit area; negative margins keep the glyph tight to the text and the line height unchanged. */}
      <a
        href={`#${headlineSource.id}`}
        aria-label="Source for this statistic"
        aria-describedby={open ? TOOLTIP_ID : undefined}
        className="-my-[5px] -ml-1.5 inline-block rounded px-2 py-[5px] text-[0.55em] font-semibold leading-none text-forest no-underline">
        
        1
      </a>

      <AnimatePresence>
        {open &&
        <span className="absolute left-0 top-full z-50 pt-1">
            <motion.span
            id={TOOLTIP_ID}
            role="tooltip"
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: easeOut }}
            className="block w-max max-w-[280px] whitespace-normal rounded-lg border border-line bg-cream-card px-3 py-1.5 text-left font-sans text-[12px] font-normal not-italic leading-snug tracking-normal text-ink shadow-[0_8px_20px_-12px_rgba(11,61,46,0.35)]">
            
              Source: {headlineSource.label}{' '}
              <a
              href={`#${headlineSource.id}`}
              className="inline-flex min-h-6 items-center font-semibold text-forest underline underline-offset-2">
              
                See sources
              </a>
            </motion.span>
          </span>
        }
      </AnimatePresence>
    </span>);

}