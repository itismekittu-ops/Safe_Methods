import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className = '', id, children, ...props }: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-4 py-2.5 bg-surface border border-border-subtle rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
