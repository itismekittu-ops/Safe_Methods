import React from 'react';
import { PlayIcon } from 'lucide-react';
export function SafeBotDemo() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24 bg-surface border-y border-border-subtle">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
          Meet SafeBot, Your AI Finance Assistant
        </h2>
        <p className="text-muted-foreground text-lg">
          Experience discreet, intelligent guidance available around the clock.
          SafeBot analyzes your financial landscape to provide actionable,
          personalized insights.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="relative aspect-video bg-muted rounded-lg border border-border-subtle overflow-hidden group cursor-pointer flex items-center justify-center shadow-soft">
          {/* Placeholder for video */}
          <div className="absolute inset-0 bg-gradient-to-br from-surface/50 to-muted/50 mix-blend-overlay"></div>

          {/* Play Button */}
          <div className="relative z-10 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-raised group-hover:scale-105 group-hover:bg-primary/90 transition-all">
            <PlayIcon className="w-6 h-6 ml-1" fill="currentColor" />
          </div>
        </div>
      </div>
    </section>);

}