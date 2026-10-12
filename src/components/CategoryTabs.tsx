import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { rateCategories } from '../data/rates';
import type { CategoryId } from '../types/rates';

interface CategoryTabsProps {
  value: CategoryId;
  onChange: (id: CategoryId) => void;
  disabled?: boolean;
}

const pillSpring = { type: 'spring', stiffness: 520, damping: 38 } as const;

export function CategoryTabs({ value, onChange, disabled }: CategoryTabsProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<CategoryId, HTMLButtonElement | null>>>({});
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const [ready, setReady] = useState(false);

  const place = useCallback(() => {
    const tab = tabRefs.current[value];
    if (!tab) return;
    setPill({ left: tab.offsetLeft, width: tab.offsetWidth });

    if (rowRef.current) {
      const row = rowRef.current;
      const tabLeft = tab.offsetLeft;
      const tabRight = tabLeft + tab.offsetWidth;
      if (tabLeft < row.scrollLeft) {
        row.scrollTo({ left: tabLeft - 10, behavior: 'smooth' });
      } else if (tabRight > row.scrollLeft + row.clientWidth) {
        row.scrollTo({ left: tabRight - row.clientWidth + 10, behavior: 'smooth' });
      }
    }
  }, [value]);

  useLayoutEffect(() => {
    place();
  }, [place]);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const observer = new ResizeObserver(() => place());
    observer.observe(row);

    document.fonts?.ready.then(() => place());

    const id = requestAnimationFrame(() => setReady(true));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(id);
    };
  }, [place]);

  const transition = ready ? pillSpring : { duration: 0 };

  return (
    <div className="relative w-full">
      <div
        ref={rowRef}
        role="tablist"
        aria-label="Product type"
        className="relative flex w-full items-center gap-1 overflow-x-auto rounded-xl bg-[#F6F2EA] p-1 pb-1.5 scroll-smooth"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#D3C9B8 transparent',
        }}
      >
        {/* Animated active pill */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-y-1 rounded-lg bg-[#0B3D2E] shadow-xs"
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
              className={`relative z-10 flex-shrink-0 rounded-lg px-3 py-1.5 font-sans text-[11.5px] font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 disabled:cursor-default ${
                active ? 'text-white' : 'text-[#0B3D2E] hover:text-forest-soft'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}