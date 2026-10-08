import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { easeOut } from '../utils/motion';

const TOOLTIP_ID = 'competing-quotes-info';
const CLOSE_DELAY_MS = 150;

/**
 * "i" button that sits over the right end of the primary button (as a sibling, never nested),
 * with a popover explaining competing quotes. Hover/focus opens it; tap toggles it on touch.
 */
export function QuoteInfo() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointer = useRef<string>('mouse');

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hideSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') show();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') hideSoon();
      }}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}>
      
      {/* 32×32 hit area; the visible circle is 20px and sits 14px from the button's right edge. */}
      <button
        type="button"
        aria-label="About competing quotes"
        aria-describedby={open ? TOOLTIP_ID : undefined}
        onPointerDown={(e) => {
          lastPointer.current = e.pointerType;
        }}
        onFocus={show}
        onClick={() => {
          if (lastPointer.current === 'mouse') show();else
          setOpen((o) => !o);
        }}
        className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full">
        
        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px] border-forest bg-white/35 font-sans text-[13px] font-bold leading-none text-forest">
          i
        </span>
      </button>

      <AnimatePresence>
        {open &&
        <motion.div
          id={TOOLTIP_ID}
          role="tooltip"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15, ease: easeOut }}
          className="absolute bottom-full right-0 z-50 mb-2 w-max max-w-[260px] rounded-xl border border-gold bg-cream-bubble px-3 py-2 text-left font-sans text-[13px] leading-snug text-ink shadow-[0_10px_24px_-12px_rgba(11,61,46,0.4)]">
          
            Your request is shared with our partner banks and advisors. They compete to send you their best quotes.
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}