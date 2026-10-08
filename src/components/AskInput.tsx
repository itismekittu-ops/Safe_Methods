import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpIcon, CheckCircle2Icon, Loader2Icon } from 'lucide-react';
import { useTypewriter } from '../hooks/useTypewriter';
import { askTopics } from '../data/suggestions';
import { easeOut } from '../utils/motion';
import type { AskStatus } from '../hooks/useAskInput';

interface AskInputProps {
  value: string;
  status: AskStatus;
  submitted: string;
  inputRef: React.RefObject<HTMLInputElement>;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function AskInput({ value, status, submitted, inputRef, disabled = false, onChange, onSubmit }: AskInputProps) {
  const reduced = useReducedMotion() ?? false;
  const typed = useTypewriter(askTopics, { paused: value.length > 0, reduced });
  const sending = status === 'sending' || disabled;

  return (
    <div className="relative">
      <div id="ask-status" aria-live="polite" className="absolute -top-[22px] left-1 right-1">
        <AnimatePresence mode="wait">
          {status === 'error' &&
          <motion.p
            key="error"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: easeOut }}
            className="truncate text-[13px] text-red-700">
            
              Type a question, or pick one above.
            </motion.p>
          }
          {status === 'sent' &&
          <motion.p
            key="sent"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: easeOut }}
            className="flex items-center gap-1.5 truncate text-[13px] text-forest">
            
              <CheckCircle2Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">Got it. We're lining up experts to answer “{submitted}”</span>
            </motion.p>
          }
        </AnimatePresence>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className={`ask-field flex items-center gap-2 rounded-full border bg-cream py-[9px] pl-5 pr-[9px] transition-colors duration-150 focus-within:border-forest/40 focus-within:bg-white ${
        status === 'error' ? 'border-red-300' : 'border-line'}`
        }>
        
        <div className="relative min-w-0 flex-1">
          <input
            id="ask"
            aria-label="Ask a question about loans, mortgages or investments"
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            readOnly={sending}
            autoComplete="off"
            aria-invalid={status === 'error'}
            aria-describedby="ask-status"
            className="h-10 w-full bg-transparent text-[15px] text-ink outline-none disabled:opacity-60" />
          
          {value.length === 0 &&
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center truncate text-[15px] text-[#5B6660]">
            
              <span className="whitespace-nowrap">Ask me anything about&nbsp;</span>
              <span className="truncate font-semibold text-[#1C2B25]">{typed}</span>
              {!reduced && <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-forest/60" />}
            </span>
          }
        </div>
        <button
          type="submit"
          disabled={sending}
          aria-label="Send"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-cream transition-[background-color,transform] duration-150 hover:bg-forest-soft active:scale-[0.94] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-80">
          
          {status === 'sending' ?
          <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" /> :

          <ArrowUpIcon className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
          }
        </button>
      </form>
    </div>);

}