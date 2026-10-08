import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { terms } from '../data/rates';
import { easeOut } from '../utils/motion';

interface TermSelectProps {
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

export function TermSelect({ value, onChange, disabled }: TermSelectProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const current = terms.find((t) => t.id === value) ?? terms[0];

  useEffect(() => {
    if (!open) return;
    setActive(Math.max(0, terms.findIndex((t) => t.id === value)));
    listRef.current?.focus();
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
    // Only on open/close.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const choose = (id: string) => {
    onChange(id);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % terms.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + terms.length) % terms.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(terms.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(terms[active].id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Term: ${current.label}`}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full border bg-white pl-3.5 pr-2.5 text-[13px] font-semibold text-ink transition-colors duration-150 hover:border-forest/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 disabled:cursor-default ${
        open ? 'border-forest/40' : 'border-line'}`
        }>
        
        {current.label}
        <ChevronDownIcon
          className={`h-4 w-4 text-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true" />
        
      </button>

      <AnimatePresence>
        {open &&
        <motion.ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-label="Term"
          aria-activedescendant={`term-${terms[active].id}`}
          onKeyDown={onListKey}
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: 0.15, ease: easeOut }}
          style={{ transformOrigin: 'top right' }}
          className="absolute right-0 top-full z-40 mt-1.5 w-36 rounded-2xl border border-line bg-cream-card p-1 shadow-panel focus:outline-none">
          
            {terms.map((t, i) => {
            const selected = t.id === value;
            return (
              <li
                key={t.id}
                id={`term-${t.id}`}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(t.id)}
                className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-1.5 text-[13px] font-semibold transition-colors duration-100 ${
                selected ?
                'bg-forest text-cream' :
                i === active ?
                'bg-gold-light/70 text-forest' :
                'text-ink'}`
                }>
                
                  {t.label}
                  {selected && <CheckIcon className="h-3.5 w-3.5 text-gold" strokeWidth={2.6} aria-hidden="true" />}
                </li>);

          })}
          </motion.ul>
        }
      </AnimatePresence>
    </div>);

}