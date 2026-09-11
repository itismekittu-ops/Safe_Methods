import React, { useEffect, useState, useCallback } from "react";
import { XIcon, SparklesIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "./Button";
import { TextInput } from "./TextInput";
import { supabase } from "../lib/supabase";

const SUPPRESS_KEY = "safebot_exit_intent_shown";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const dismiss = useCallback(() => {
    setOpen(false);
    sessionStorage.setItem(SUPPRESS_KEY, "true");
  }, []);

  // Desktop: mouse leaves through the top of the viewport
  useEffect(() => {
    if (sessionStorage.getItem(SUPPRESS_KEY)) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !sessionStorage.getItem(SUPPRESS_KEY)) {
        setOpen(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  // Mobile fallback: rapid scroll-up after scrolling down
  useEffect(() => {
    if (sessionStorage.getItem(SUPPRESS_KEY)) return;

    let lastY = window.scrollY;
    let lastTime = Date.now();

    const handleScroll = () => {
      const y = window.scrollY;
      const now = Date.now();
      const dt = now - lastTime;
      if (dt === 0) return;

      const velocity = (lastY - y) / dt;
      if (y > 300 && velocity > 2 && !sessionStorage.getItem(SUPPRESS_KEY)) {
        setOpen(true);
      }
      lastY = y;
      lastTime = now;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from("leads").insert({
        name: "Exit-intent subscriber",
        email: email.trim().toLowerCase(),
        source: "exit_intent",
      });
      if (insertError) throw insertError;
      setDone(true);
      setTimeout(dismiss, 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={dismiss}
    >
      <div
        className="bg-surface border border-border-subtle rounded-xl shadow-raised w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          aria-label="Close"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {done ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-5">
              <SparklesIcon className="w-7 h-7 text-success" />
            </div>
            <h2 className="font-heading text-2xl text-foreground mb-2">You're on the list!</h2>
            <p className="text-muted-foreground leading-relaxed">
              We'll send you exclusive rate updates and financial insights straight to your inbox.
            </p>
          </div>
        ) : (
          <div className="p-8">
            <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mb-5">
              <SparklesIcon className="w-7 h-7 text-accent" />
            </div>
            <h2 className="font-heading text-2xl text-foreground mb-3">
              Wait — get a free rate comparison
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Before you go, subscribe to receive our weekly comparison of top
              mortgage, GIC, and investment rates from Canadian institutions —
              no spam, just data.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextInput
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-4 py-3">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                variant="primary"
                className="w-full bg-accent text-primary hover:bg-accent/90 border-transparent"
                disabled={submitting}
              >
                {submitting ? "Subscribing..." : "Get Free Rate Updates"}
                {!submitting && <ArrowRightIcon className="w-4 h-4 ml-2" />}
              </Button>
            </form>

            <button
              onClick={dismiss}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
            >
              No thanks, I'll pass
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
