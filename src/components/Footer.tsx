import React from 'react';
import { TwitterIcon, LinkedinIcon, FacebookIcon } from 'lucide-react';
import { useSectionScroll } from '../utils/useSectionScroll';
export function Footer() {
  const scrollToSection = useSectionScroll();
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <span className="font-heading text-2xl font-semibold text-primary-foreground mb-4 block">
              Safe Methods
            </span>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-sm">
              Clear, confident financial guidance for real life decisions. We
              connect you with trusted consultants and AI-powered insights to
              secure your future.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-accent mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection('top')}
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors text-left">
                  
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('services')}
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors text-left">
                  
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('blog')}
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors text-left">
                  
                  Insights
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-accent mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors text-left">
                  
                  Contact
                </button>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                  
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-accent mb-4">Connect</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-primary-foreground/70 hover:text-accent transition-colors"
                aria-label="Twitter">
                
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-primary-foreground/70 hover:text-accent transition-colors"
                aria-label="LinkedIn">
                
                <LinkedinIcon className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-primary-foreground/70 hover:text-accent transition-colors"
                aria-label="Facebook">
                
                <FacebookIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/15 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/60">
            &copy; 2026 Safe Methods. All rights reserved.
          </p>
        </div>
      </div>
    </footer>);

}