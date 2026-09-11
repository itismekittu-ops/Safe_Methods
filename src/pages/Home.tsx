import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SEO } from '../components/SEO';
import { HeroSection } from '../components/HeroSection';
import { ServicesSection } from '../components/ServicesSection';
import { SafeBotDemo } from '../components/SafeBotDemo';
import { CtaSection } from '../components/CtaSection';
import { BlogSection } from '../components/BlogSection';
import { ContactSection } from '../components/ContactSection';
import { ExitIntentPopup } from '../components/ExitIntentPopup';

const FINANCIAL_SERVICE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: "Safe Methods",
  url: "https://safemethods.com",
  description:
    "Safe Methods brings together AI-driven tools and human financial expertise to help customers compare loan, investment, and debt management options across institutions. The platform is newly launched and currently free for all customers to use.",
  areaServed: "CA",
  provider: {
    "@type": "Organization",
    name: "Safe Methods",
    url: "https://safemethods.com",
    telephone: "+1-888-841-7755",
    email: "info@safemethods.org",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mississauga",
      addressRegion: "Ontario",
      addressCountry: "Canada",
    },
  },
  serviceType: "Financial advice comparison and marketplace",
};

export function Home() {
  return (
    <main>
      <SEO
        title="Compare Financial Advice from Top Institutions"
        fullTitle="Safe Methods | Compare Financial Advice from Top Institutions"
        description="Safe Methods connects you with financial experts from top institutions so you can compare and choose the best products, rates, and advice."
        path="/"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(FINANCIAL_SERVICE_JSONLD)}
        </script>
      </Helmet>
      <HeroSection />
      <ServicesSection />
      <SafeBotDemo />
      <CtaSection />
      <BlogSection />
      <ContactSection />
      <ExitIntentPopup />
    </main>
  );
}
