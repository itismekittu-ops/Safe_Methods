import type React from 'react';
import { useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

export function useTilt(max = 4) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 180, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), spring);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), spring);

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return {
    style: reduced ? {} : { rotateX, rotateY, transformPerspective: 1100 },
    onMouseMove,
    onMouseLeave
  };
}