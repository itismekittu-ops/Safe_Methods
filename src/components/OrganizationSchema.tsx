import React from "react";
import { Helmet } from "react-helmet-async";

const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Safe Methods",
  url: "https://safemethods.com",
  logo: "https://safemethods.com/favicon.ico",
  description:
    "Safe Methods is a financial advice marketplace that connects customers with financial experts from multiple institutions, so they can compare and choose the best product or interest rate — rather than relying on a single bank or advisor.",
  email: "info@safemethods.org",
  telephone: "+1-888-841-7755",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Mississauga",
    addressRegion: "Ontario",
    addressCountry: "Canada",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+1-888-841-7755",
    contactType: "customer service",
    email: "info@safemethods.org",
    areaServed: "CA",
    availableLanguage: ["English"],
  },
};

export function OrganizationSchema() {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(ORGANIZATION_JSONLD)}
      </script>
    </Helmet>
  );
}
