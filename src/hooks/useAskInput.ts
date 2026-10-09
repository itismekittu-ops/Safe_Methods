import React, { useEffect, useState } from 'react';
import { ArrowUpIcon } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';

const PLACEHOLDER_TERMS = [
  'loans...',
  'mortgages...',
  'personal investments...',
  'mutual funds...',
  'debt consolidation...',
];

function useRotatingTerm(intervalMs: number, enabled: boolean) {
  const [termIndex, setTermIndex] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      setTermIndex((prev) => (prev + 1) % PLACEHOLDER_TERMS.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
  return PLACEHOLDER_TERMS[termIndex];
}

interface AskInputProps {
  value: string;
  status: 'idle' | 'auto_typing' | 'sent';
  submitted: string | null;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: (text?: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export function AskInput({
  value,
  status,
  disabled = false,
  onChange,
  onSubmit,
  inputRef,
}: AskInputProps) {
  const isDesktop = useMediaQuery('(min-width: 640px)');
  const canSend = value.trim().length > 0 && status !== 'auto_typing' && !disabled;
  const rotatingTerm = useRotatingTerm(2200, status !== 'auto_typing');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    onSubmit(value);
  };

  return (
    <form onSubmit={submit} className="relative flex w-full flex-col">
      <div className="relative flex w-full items-center">
        {/* Placeholder overlay */}
        {!value && (
          <div className="pointer-events-none absolute left-4 text-xs sm:text-sm text-[#738079] select-none flex items-center gap-1">
            <span>Ask me anything about</span>
            <span className="font-semibold text-forest transition-opacity duration-300">
              {rotatingTerm}
            </span>
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          value={value}
          disabled={disabled || status === 'auto_typing'}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Financial inquiry"
          className="h-10 sm:h-11 w-full rounded-full border border-[#D8CEBA] bg-white pl-4 pr-12 text-xs sm:text-sm text-forest placeholder:text-transparent focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/20 disabled:bg-[#F3EFE6] transition-all"
        />

        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="absolute right-1.5 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#0B3D2E] text-white transition-opacity hover:bg-[#124E3B] disabled:opacity-30 disabled:pointer-events-none"
        >
          <ArrowUpIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}