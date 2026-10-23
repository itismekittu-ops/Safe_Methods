import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isAdmin = user?.email === 'info@safemethods.org';

  return (
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

        {/* Dynamic Auth Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin/quotes"
                  className="rounded-lg border border-[#D8CEBA] bg-white px-3 py-1 text-xs sm:text-sm font-semibold text-[#0B3D2E] shadow-2xs transition-colors hover:bg-black/5"
                >
                  Admin Quotes
                </Link>
              )}
              <Link
                to="/account"
                className="rounded-lg bg-[#0B3D2E] px-3.5 py-1 text-xs sm:text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[#082e22]"
              >
                Account
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg px-2.5 py-1 text-xs sm:text-sm font-semibold text-[#0B3D2E]/70 hover:text-red-700 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg border border-[#D8CEBA] bg-white px-3.5 py-1 text-xs sm:text-sm font-semibold text-[#0B3D2E] shadow-2xs transition-colors hover:bg-black/5"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}