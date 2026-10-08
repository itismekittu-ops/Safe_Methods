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
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const row = rowRef.current;
    const probe = probeRef.current;
    if (row && probe) setCompact(probe.scrollWidth > row.clientWidth + 0.5);
  }, []);

  const place = useCallback(() => {
    const tab = tabRefs.current[value];
    if (!tab) return;
    setPill({ left: tab.offsetLeft, width: tab.offsetWidth });
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

  return (
    <div ref={rowRef} role="tablist" aria-label="Product type" className="relative flex gap-1 rounded-xl bg-[#F6F2EA] p-1">
      {/* Invisible probe with full labels: decides whether the short label is needed */}
      <div ref={probeRef} aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 flex w-max">
        {rateCategories.map((c) =>
          <span key={c.id} className={tabText}>
            {c.label}
          </span>
        )}
      </div>

      {/* Sliding active pill */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 rounded-xl bg-[#0B3D2E]"
        initial={false}
        animate={{ x: pill.left - 4, width: pill.width }}
        transition={transition} />

      {rateCategories.map((c) => {
        const active = c.id === value;
        return (
          <button
            key={c.id}
            ref={(node) => { tabRefs.current[c.id] = node; }}
            role="tab"
            aria-selected={active}
            aria-label={c.label}
            disabled={disabled}
            onClick={() => onChange(c.id)}
            className={`relative z-10 flex-auto rounded-xl transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-forest/40 disabled:cursor-default ${
              active ? 'text-white' : 'text-[#0B3D2E] hover:text-forest-soft'
            } ${tabText}`}>
            {labelFor(c)}
          </button>
        );
      })}
    </div>
  );
}
