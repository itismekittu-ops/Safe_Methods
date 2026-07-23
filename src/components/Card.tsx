import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  floating?: boolean;
}

export function Card({ floating = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-surface border border-border-subtle rounded-lg ${floating ? 'shadow-raised' : 'shadow-soft'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 border-b border-border-subtle ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`font-heading font-semibold text-foreground ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardBody({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 border-t border-border-subtle ${className}`} {...props}>
      {children}
    </div>
  );
}
