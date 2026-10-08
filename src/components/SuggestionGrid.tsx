import React from 'react';
import { motion } from 'framer-motion';
import { SearchIcon } from 'lucide-react';
import { suggestions } from '../data/suggestions';
import { easeOut } from '../utils/motion';

interface SuggestionGridProps {
  onPick: (question: string) => void;
  disabled?: boolean;
}

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } }
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: easeOut } }
};

export function SuggestionGrid({ onPick, disabled }: SuggestionGridProps) {
  return (
    <motion.ul
      variants={list}
      initial="hidden"
      animate="show"
      aria-label="Suggested questions"
      className="mx-auto grid w-full max-w-[600px] grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
      
      {suggestions.map((q) =>
      <motion.li key={q} variants={item}>
          <motion.button
          type="button"
          disabled={disabled}
          onClick={() => onPick(q)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15, ease: easeOut }}
          className="flex h-[clamp(49px,6vh,61px)] w-full items-center justify-between gap-3 rounded-2xl border border-line bg-cream px-4 text-left text-[14px] font-medium text-ink transition-[border-color,box-shadow,background-color] duration-150 hover:border-forest/40 hover:bg-white hover:shadow-[0_6px_16px_-10px_rgba(11,61,46,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 disabled:opacity-50">
          
            <span className="truncate">{q}</span>
            <SearchIcon className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          </motion.button>
        </motion.li>
      )}
    </motion.ul>);

}