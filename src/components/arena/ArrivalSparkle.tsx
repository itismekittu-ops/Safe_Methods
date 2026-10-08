import React from 'react';
import { motion } from 'framer-motion';
import { easeOut } from '../../utils/motion';

const particles = Array.from({ length: 10 }, (_, i) => ({
  angle: i / 10 * Math.PI * 2,
  dist: 16 + i * 7 % 12,
  size: i % 2 ? 3 : 5
}));

/** Small gold sparkle around the avatar when the winner lands in the #1 slot. */
export function ArrivalSparkle({ delay = 0.32 }: {delay?: number;}) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute left-[28px] top-1/2 z-20">
      <motion.span
        className="absolute -ml-5 -mt-5 h-10 w-10 rounded-full border-2 border-gold"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1.5], opacity: [0, 1, 0] }}
        transition={{ duration: 0.3, delay, ease: easeOut }} />
      
      {particles.map((p, i) =>
      <motion.span
        key={i}
        className="absolute rounded-full bg-gold"
        style={{ width: p.size, height: p.size, marginLeft: -p.size / 2, marginTop: -p.size / 2 }}
        initial={{ x: 0, y: 0, opacity: 0 }}
        animate={{ x: Math.cos(p.angle) * p.dist, y: Math.sin(p.angle) * p.dist, opacity: [0, 1, 0] }}
        transition={{ duration: 0.3, delay, ease: easeOut }} />

      )}
    </span>);

}