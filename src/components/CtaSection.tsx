import React from 'react';
import { Button } from './Button';
export function CtaSection() {
  return (
    <section className="w-full bg-primary text-primary-foreground py-20 md:py-28">
      <div className="container mx-auto px-4 text-center max-w-2xl">
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl mb-6 text-primary-foreground">
          Your Financial Clarity Starts Here
        </h2>
        <p className="text-primary-foreground/80 text-lg mb-10 leading-relaxed">
          Book a free consultation today and get a personalized plan within 24
          hours. Let us help you navigate your wealth with confidence.
        </p>
        <Button
          variant="secondary"
          size="lg"
          className="!bg-accent !text-accent-foreground !border-accent hover:!bg-accent/90">
          
          Book a Consultation
        </Button>
      </div>
    </section>);

}