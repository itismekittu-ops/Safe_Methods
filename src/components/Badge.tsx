import React from 'react';

type BadgeVariant = 'accent' | 'neutral' | 'success' | 'warning';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  accent: 'bg-accent/10 text-accent border-accent/30',
  neutral: 'bg-muted text-muted-foreground border-border-subtle',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
};

export function Badge({ variant = 'neutral', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
