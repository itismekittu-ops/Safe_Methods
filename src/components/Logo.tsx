import React from 'react';

type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
  size?: LogoSize;
  className?: string;
}

const sizeClasses: Record<LogoSize, { container: string; icon: string; text: string }> = {
  sm: { container: 'gap-2', icon: 'w-7 h-7', text: 'text-lg' },
  md: { container: 'gap-2.5', icon: 'w-9 h-9', text: 'text-xl' },
  lg: { container: 'gap-3', icon: 'w-12 h-12', text: 'text-2xl' },
};

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const s = sizeClasses[size];
  return (
    <div className={`flex items-center ${s.container} ${className}`}>
      <div className={`${s.icon} flex items-center justify-center bg-primary rounded-lg shrink-0`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-2/3 h-2/3">
          <path
            d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z"
            stroke="#D4AF37"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M9 12l2 2 4-4"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className={`font-heading font-semibold text-primary ${s.text}`}>
        Safe Methods
      </span>
    </div>
  );
}
