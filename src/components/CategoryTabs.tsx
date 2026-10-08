import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { rateCategories } from '../data/rates';
import type { CategoryId } from '../types/rates';

interface CategoryTabsProps {
  value: CategoryId;
  onChange: (id: CategoryId) => void;
  disabled?: boolean;
}

const spring = { type: 'spring', stiffness: 520, damping: 42 } as const;
const tabText = 'flex h-10 items-center justify-center whitespace-nowrap px-[7px] text-center font-sans text-[12px] font-semibold xl:text-[13px]';

export function CategoryTabs({ value, onChange, disabled }: CategoryTabsProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<CategoryId, HTMLButtonElement | null>>>({});
  const [compact, setCompact] = useState(false);
  const [pill, setPill] = useState({ left: 0, width: 0, rowWidth: 0 });
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const row = rowRef.current;
    const probe = probeRef.current;
    if (row && probe) setCompact(probe.scrollWidth > row.clientWidth + 0.5);
  }, []);

  const place = useCallback(() => {
    const row = rowRef.current;
    const tab = tabRefs.current[value];
    if (!row || !tab) return;
    setPill({ left: tab.offsetLeft, width: tab.offsetWidth, rowWidth: row.clientWidth });
  }, [value]);

  useLayoutEffect(() => {
    measure();
    place();
  }, [measure, place, compact]);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const observer = new ResizeObserver(() => {
      measure();
      place();
    });
    observer.observe(row);
    document.fonts?.ready.then(() => {
      measure();
      place();
    });
    const id = requestAnimationFrame(() => setReady(true));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(id);
    };
  }, [measure, place]);

  const labelFor = (c: (typeof rateCategories)[number]) => compact ? c.shortLabel ?? c.label : c.label;
  const transition = ready ? spring : { duration: 0 };
  const clipRight = Math.max(0, pill.rowWidth - pill.left - pill.width);

  return (
    <div className="relative rounded-xl bg-cream">
      {/* Invisible probe with full labels: decides whether the short label is needed. */}
      <div ref={probeRef} aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 flex w-max">
        {rateCategories.map((c) =>
        <span key={c.id} className={tabText}>
            {c.label}
          </span>
        )}
      </div>

      <div ref={rowRef} role="tablist" aria-label="Product type" className="relative flex">
        <motion.span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 rounded-xl bg-forest"
          initial={false}
          animate={{ x: pill.left, width: pill.width }}
          transition={transition} />
        

        {rateCategories.map((c) =>
        <button
          key={c.id}
          ref={(node) => {
            tabRefs.current[c.id] = node;
          }}
          role="tab"
          aria-selected={c.id === value}
          aria-label={c.label}
          disabled={disabled}
          onClick={() => onChange(c.id)}
          className={`relative z-10 flex-auto rounded-xl text-muted transition-colors duration-150 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-forest/40 disabled:cursor-default ${tabText}`}>
          
            {labelFor(c)}
          </button>
        )}

        {/* Cream copy of the labels, clipped to the pill so text stays readable while it slides. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 flex"
          initial={false}
          animate={{ clipPath: `inset(0px ${clipRight}px 0px ${pill.left}px round 12px)` }}
          transition={transition}>
          
          {rateCategories.map((c) =>
          <span key={c.id} className={`flex-auto text-cream ${tabText}`}>
              {labelFor(c)}
            </span>
          )}
        </motion.div>
      </div>
    </div>);

}