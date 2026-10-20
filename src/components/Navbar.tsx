import React from 'react';
import { Link } from 'react-router-dom';

export function Navbar() {
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Dispatch reset event for SPA safety
    window.dispatchEvent(new CustomEvent('reset-safe-chat'));
    
    // Force a fresh reload to reset all chat history and return to the initial 6 question cards
    if (window.location.pathname === '/' || window.location.pathname === '') {
      window.location.reload();
    } else {
      window.location.href = '/';
    }
  };

  return (
    /* 
      1. Line removed: 'border-b border-[#E3DCCD]' eliminated.
      2. Background matched: Changed from 'bg-[#FAF7F0]' to 'bg-cream' (exact home section background).
    */
    <header className="sticky top-0 z-40 w-full bg-cream border-none shadow-none">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo - Clicking resets chat and refreshes the home screen */}
        <a
          href="/"
          onClick={handleLogoClick}
          className="font-serif text-2xl font-bold tracking-tight text-[#0B3D2E] hover:opacity-90 transition-opacity cursor-pointer select-none"
          title="Safe Methods — Start a new chat"
        >
          Safe Methods
        </a>

        {/* Login Button */}
        <Link
          to="/login"
          className="rounded-lg border border-[#D8CEBA] bg-white px-3.5 py-1 text-xs sm:text-sm font-semibold text-[#0B3D2E] shadow-2xs transition-colors hover:bg-black/5"
        >
          Login
        </Link>
      </div>
    </header>
  );
}