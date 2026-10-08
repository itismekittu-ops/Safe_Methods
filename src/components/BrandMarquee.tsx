import React from 'react';
import { brandRows, brandStyles } from '../data/brands';

const edgeMask = 'linear-gradient(to right, transparent 0, #000 12%, #000 88%, transparent 100%)';

interface MarqueeRowProps {
  names: string[];
  direction: 'ltr' | 'rtl';
  seconds: number;
}

function MarqueeRow({ names, direction, seconds }: MarqueeRowProps) {
  const half = [...names, ...names];
  return (
    <div
      className="marquee flex h-6 w-full items-center overflow-hidden"
      style={{ maskImage: edgeMask, WebkitMaskImage: edgeMask }}
    >
      <div
        className={`marquee-track flex w-max items-center ${direction === 'ltr' ? 'marquee-ltr' : 'marquee-rtl'}`}
        style={{ animationDuration: `${seconds}s` }}
      >
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center m-0 p-0 list-none" aria-hidden={copy === 1}>
            {half.map((name, i) => (
              <li
                key={`${name}-${i}`}
                className={`whitespace-nowrap px-6 leading-none text-[#5B6660] ${
                  brandStyles[name] ?? ''
                }`}
                style={{ fontSize: '13.5px' }}
              >
                {name}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export function BrandMarquee() {
  return (
    <div className="flex w-full flex-col gap-1.5 py-1">
      <MarqueeRow names={brandRows[0]} direction="ltr" seconds={36} />
      <MarqueeRow names={brandRows[1]} direction="rtl" seconds={46} />
    </div>
  );
}