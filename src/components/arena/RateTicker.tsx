import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { easeOut } from '../../utils/motion';

export function RateTicker({ value }: {value: number;}) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const controls = animate(prev.current, value, { duration: 0.28, ease: easeOut, onUpdate: setDisplay });
    prev.current = value;
    return () => controls.stop();
  }, [value]);

  return (
    <span className="tabular-nums">
      {display.toFixed(2)}
      <span className="text-[0.7em]">%</span>
    </span>);

}