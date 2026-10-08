import React from 'react';
import { motion } from 'framer-motion';
import { easeOut } from '../../utils/motion';
import type { Advisor } from '../../types/rates';

interface AdvisorAvatarProps {
  advisor: Advisor;
  className?: string;
  /** Blur-to-sharp reveal (used for the winner). */
  reveal?: boolean;
  revealDuration?: number;
}

export function AdvisorAvatar({ advisor, className = '', reveal = false, revealDuration = 0.3 }: AdvisorAvatarProps) {
  const revealProps = reveal ?
  {
    initial: { filter: 'blur(10px)', scale: 1.15, opacity: 0.5 },
    animate: { filter: 'blur(0px)', scale: 1, opacity: 1 },
    transition: { duration: revealDuration, delay: 0.12, ease: easeOut }
  } :
  {};

  if (advisor.photo) {
    return (
      <motion.img
        src={advisor.photo}
        alt=""
        className={`shrink-0 rounded-full object-cover ${className}`}
        {...revealProps} />);


  }

  return (
    <motion.span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-forest font-serif font-medium text-gold ${className}`}
      {...revealProps}>
      
      {advisor.initials}
    </motion.span>);

}