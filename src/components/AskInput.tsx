import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpIcon, CheckCircle2Icon } from 'lucide-react';
import { useTypewriter } from '../hooks/useTypewriter';
import { askTopics } from '../data/suggestions';
import { easeOut } from '../utils/motion';

interface AskInputProps {
  value: string;
  status: 'idle' | 'auto_typing' | 'sent' | 'error' | 'sending';
  submitted: string | null;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: (text?: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export function AskInput({
  value,
  status,
  submitted,
  disabled = false,
  onChange,
  onSubmit,
  inputRef,
}: AskInputProps) {
  const reduced = useReducedMotion() ?? false;
  const typed = useTypewriter(askTopics, { paused: value.length > 0, reduced });
  const sending = status === 'sending' || disabled;
  const canSend = value.trim().length > 0 && !sending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    onSubmit(value);
  };

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className={`ask-field flex items-center gap-2 rounded-full border bg-[#FAF7F0] py-[7px] pl-5 pr-[7px] transition-colors duration-150 focus-within:border-forest/40 focus-within:bg-white ${
          status === 'error' ? 'border-red-300' : 'border-line'
        }`}
      >
        <div className="relative min-w-0 flex-1">
          <input
            id="ask"
            ref={inputRef}
            type="text"
            value={value}
            disabled={sending}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Ask a question about loans, mortgages or investments"
            autoComplete="off"
            className="h-9 sm:h-10 w-full bg-transparent text-[14px] sm:text-[15px] text-ink outline-none disabled:opacity-60"
          />

          {value.length === 0 && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center truncate text-[14px] sm:text-[15px] text-muted select-none"
            >
              <span className="whitespace-nowrap">Ask me anything about&nbsp;</span>
              <span className="truncate font-semibold text-ink">{typed}</span>
              {!reduced && <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-forest/60" />}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send"
          className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-forest text-cream transition-[background-color,transform] duration-150 hover:bg-forest-soft active:scale-[0.94] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-40"
        >
          <ArrowUpIcon className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}