import React from 'react';
import { motion } from 'framer-motion';

export function EmptyRankSlot({ rank }: {rank: number;}) {
  return (
    <motion.li
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex h-[48px] items-center gap-2.5 rounded-[14px] border border-dashed border-[#E3DCCD] bg-transparent px-3 text-[12px] text-[#5B6660]">
      
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream font-serif text-[12px] text-forest">
        #{rank}
      </span>
      Waiting for bids…
    </motion.li>);

}