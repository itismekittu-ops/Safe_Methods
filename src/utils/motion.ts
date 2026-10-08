import type { Variants } from 'framer-motion';

export const easeOut = [0.23, 1, 0.32, 1] as const;

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: easeOut } }
};

/** Flight from the arena into the panel: 1s on the first run, 0.5s on quick runs. */
export function arenaFlight(quick: boolean) {
  return { duration: quick ? 0.5 : 1, ease: [0.45, 0, 0.2, 1] as const };
}