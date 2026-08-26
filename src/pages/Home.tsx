import React from 'react';
import { SEO } from '../components/SEO';
import { HeroSection } from '../components/HeroSection';
import { ServicesSection } from '../components/ServicesSection';
import { SafeBotDemo } from '../components/SafeBotDemo';
import { CtaSection } from '../components/CtaSection';
import { BlogSection } from '../components/BlogSection';
import { ContactSection } from '../components/ContactSection';
import { ExitIntentPopup } from '../components/ExitIntentPopup';
export function Home() {
  return (
    <main>
      <SEO
        title="Compare Financial Advice from Multiple Institutions"
        description="Safe Methods brings financial experts from top firms together so you can compare and choose the best product or interest rate. Ask SafeBot, get matched, and request quotes."
        path="/"
      />
      <HeroSection />
      <ServicesSection />
      <SafeBotDemo />
      <CtaSection />
      <BlogSection />
      <ContactSection />
      <ExitIntentPopup />
    </main>);

}