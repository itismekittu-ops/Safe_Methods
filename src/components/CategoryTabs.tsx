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
const tabText =
  'flex h-8 items-center justify-center whitespace-nowrap px-3 text-center font-sans text-[11.5px] font-semibold xl:text-[12px]';

export function CategoryTabs({ value, onChange, disabled }: CategoryTabsProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<CategoryId, HTMLButtonElement | null>>>({});
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const [ready, setReady] = useState(false);

  const place = useCallback(() => {
    const tab = tabRefs.current[value];
    if (!tab) return;
    setPill({ left: tab.offsetLeft, width: tab.offsetWidth });

    // Ensure the active tab scrolls into view if selected via external logic
    if (rowRef.current) {
      const row = rowRef.current;
      const tabLeft = tab.offsetLeft;
      const tabRight = tabLeft + tab.offsetWidth;
      if (tabLeft < row.scrollLeft) {
        row.scrollTo({ left: tabLeft - 8, behavior: 'smooth' });
      } else if (tabRight > row.scrollLeft + row.clientWidth) {
        row.scrollTo({ left: tabRight - row.clientWidth + 8, behavior: 'smooth' });
      }
    }
  }, [value]);

  useLayoutEffect(() => {
    place();
  }, [place]);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const observer = new ResizeObserver(() => {
      place();
    });
    observer.observe(row);

    document.fonts?.ready.then(() => {
      place();
    });

    const id = requestAnimationFrame(() => setReady(true));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(id);
    };
  }, [place]);

  const transition = ready ? spring : { duration: 0 };

  return (
    <div
      ref={rowRef}
      role="tablist"
      aria-label="Product type"
      className="relative flex w-full items-center gap-1 overflow-x-auto rounded-xl bg-[#F6F2EA] p-1 scroll-smooth no-scrollbar"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* Sliding active pill indicator */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-y-1 rounded-lg bg-[#0B3D2E]"
        initial={false}
        animate={{ x: pill.left, width: pill.width }}
        transition={transition}
      />

      {rateCategories.map((c) => {
        const active = c.id === value;
        return (
          <button
            key={c.id}
            ref={(node) => {
              tabRefs.current[c.id] = node;
            }}
            role="tab"
            aria-selected={active}
            aria-label={c.label}
            disabled={disabled}
            onClick={() => onChange(c.id)}
            className={`relative z-10 flex-shrink-0 rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-forest/40 disabled:cursor-default ${
              active ? 'text-white' : 'text-[#0B3D2E] hover:text-forest-soft'
            } ${tabText}`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}