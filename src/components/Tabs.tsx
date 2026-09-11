import React, { createContext, useContext } from 'react';

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tab components must be used within <Tabs>');
  return ctx;
}

interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

export function Tabs({ value, onChange, children }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TabList({ className = '', children, ...props }: TabListProps) {
  return (
    <div className={`flex gap-1 border-b border-border-subtle ${className}`} {...props}>
      {children}
    </div>
  );
}

interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function Tab({ value, className = '', children, ...props }: TabProps) {
  const ctx = useTabsContext();
  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      onClick={() => ctx.onChange(value)}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focus:outline-none ${
        isActive
          ? 'border-accent text-primary'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabPanelProps {
  value: string;
  children: React.ReactNode;
}

export function TabPanel({ value, children }: TabPanelProps) {
  const ctx = useTabsContext();
  if (ctx.value !== value) return null;
  return <div>{children}</div>;
}
