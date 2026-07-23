import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, MenuIcon } from 'lucide-react';
import { Button } from './Button';
import { useSectionScroll } from '../utils/useSectionScroll';
export function Navbar() {
  const scrollToSection = useSectionScroll();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="font-heading text-2xl font-semibold text-primary">
            
            Safe Methods
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection('services')}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            
            Services
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            
            Contact
          </button>
          <button
            onClick={() => scrollToSection('blog')}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            
            Blog
          </button>
        </nav>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
            <MapPinIcon className="w-4 h-4" />
            <span className="text-xs font-medium">Canada</span>
          </div>
          <div className="hidden sm:block">
            <Link to="/login">
              <Button variant="secondary" size="sm">
                Login
              </Button>
            </Link>
          </div>
          <button className="md:hidden p-2 text-foreground" aria-label="Menu">
            <MenuIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>);

}