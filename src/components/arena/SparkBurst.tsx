import React from 'react';
import { motion } from 'framer-motion';
import { easeOut } from '../../utils/motion';

const particles = Array.from({ length: 14 }, (_, i) => ({
  angle: i / 14 * Math.PI * 2 + i % 2 * 0.25,
  dist: 22 + i * 11 % 26,
  size: i % 3 === 0 ? 6 : i % 3 === 1 ? 4 : 3
}));

interface SparkBurstProps {
  x: number;
  y: number;
  /** Delay so the burst lands on the collision peak. */
  delay?: number;
}

/** Gold spark burst at the collision point. Remount (via key) to replay. */
export function SparkBurst({ x, y, delay = 0.11 }: SparkBurstProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{ left: x, top: y, transform: 'translateZ(80px)' }}>
      
      <motion.span
        className="absolute -ml-5 -mt-5 h-10 w-10 rounded-full border-2 border-gold"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: [0.4, 1.4], opacity: [0, 0.9, 0] }}
        transition={{ duration: 0.26, delay, ease: easeOut }} />
      
      {particles.map((p, i) =>
      <motion.span
        key={i}
        className="absolute rounded-full bg-gold"
        style={{ width: p.size, height: p.size, marginLeft: -p.size / 2, marginTop: -p.size / 2 }}
        initial={{ x: 0, y: 0, opacity: 0, scale: 1 }}
        animate={{
          x: Math.cos(p.angle) * p.dist,
          y: Math.sin(p.angle) * p.dist,
          opacity: [0, 1, 0],
          scale: [1, 1, 0.4]
        }}
        transition={{ duration: 0.3, delay, ease: easeOut }} />

      )}
    </div>);

}