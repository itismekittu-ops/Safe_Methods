import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldIcon } from 'lucide-react';
import { easeOut } from '../utils/motion';

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('reset-safe-chat'));
    if (window.location.pathname === '/' || window.location.pathname === '') {
      window.location.reload();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: easeOut }}
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-200 ease-out ${
        scrolled
          ? 'border-line/60 bg-cream/80 shadow-[0_4px_16px_-12px_rgba(11,61,46,0.25)] backdrop-blur-md'
          : 'border-transparent bg-transparent shadow-none'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a
          href="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 cursor-pointer select-none"
          title="Safe Methods — Start a new chat"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-gold">
            <ShieldIcon className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="font-serif text-xl font-medium text-forest">Safe Methods</span>
        </a>

        <a
          href="/login"
          className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold text-forest transition-colors duration-150 hover:bg-cream-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
        >
          Login
        </a>
      </div>
    </motion.header>
  );
}