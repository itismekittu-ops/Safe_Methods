import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { ServicesSection } from '../components/ServicesSection';
import { SafeBotDemo } from '../components/SafeBotDemo';
import { CtaSection } from '../components/CtaSection';
import { BlogSection } from '../components/BlogSection';
import { ContactSection } from '../components/ContactSection';
export function Home() {
  return (
    <main>
      <HeroSection />
      <ServicesSection />
      <SafeBotDemo />
      <CtaSection />
      <BlogSection />
      <ContactSection />
    </main>);

}