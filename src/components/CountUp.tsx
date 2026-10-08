import React, { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { easeOut } from '../utils/motion';

interface CountUpProps {
  value: number;
  delay?: number;
  /** Show the final value on mount without counting (e.g. when a card arrives from the arena). */
  instant?: boolean;
}

export function CountUp({ value, delay = 0, instant = false }: CountUpProps) {
  const reduced = useReducedMotion();
  const skipFirst = useRef(instant);
  const [display, setDisplay] = useState(reduced || instant ? value : Math.max(0, value - 1.5));

  useEffect(() => {
    if (reduced || skipFirst.current) {
      skipFirst.current = false;
      setDisplay(value);
      return;
    }
    const controls = animate(Math.max(0, value - 1.5), value, {
      duration: 0.9,
      delay,
      ease: easeOut,
      onUpdate: setDisplay
    });
    return () => controls.stop();
  }, [value, delay, reduced]);

  return (
    <span className="tabular-nums" aria-label={`${value.toFixed(2)} percent`}>
      {display.toFixed(2)}
      <span className="text-[0.7em]">%</span>
    </span>);

}