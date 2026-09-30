import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { updateGAConsent } from "../lib/analytics";

const CONSENT_KEY = "safemethods_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleEssential = () => {
    updateGAConsent(false);
    try {
      localStorage.setItem(CONSENT_KEY, "essential");
    } catch {
      // storage unavailable — banner still dismissed
    }
    setVisible(false);
  };

  const handleAcceptAll = () => {
    updateGAConsent(true);
    try {
      localStorage.setItem(CONSENT_KEY, "all");
    } catch {
      // storage unavailable — banner still dismissed
    }
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 z-50 max-w-4xl mx-auto">
      <div className="bg-surface border border-border-subtle rounded-xl p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <p className="text-sm text-muted-foreground leading-relaxed flex-1">
            We use essential cookies to provide platform security and optional
            analytics cookies to measure site performance. You can review our
            policy anytime at our{" "}
            <Link
              to="/privacy-policy/"
              className="text-accent hover:text-accent/80 font-medium underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={handleEssential}
              className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border-subtle rounded-lg hover:bg-muted transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 text-sm font-medium text-primary bg-accent rounded-lg hover:bg-accent/90 transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
