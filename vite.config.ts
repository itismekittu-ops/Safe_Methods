import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { mkdirSync, writeFileSync, readFileSync } from 'fs'

const SITE_URL = "https://safemethods.com";

const ROUTES = [
  {
    path: "/",
    title: "Safe Methods | Compare Financial Advice from Top Institutions",
    description: "Safe Methods connects you with financial experts from top institutions so you can compare and choose the best products, rates, and advice.",
  },
  {
    path: "/services",
    title: "Debt Management Services | Safe Methods",
    description: "Strategic restructuring and optimization of liabilities to preserve liquidity and enhance your overall net worth. Book a consultation with Safe Methods.",
  },
  {
    path: "/blog",
    title: "Navigating Generational Wealth Transfer in Uncertain Markets | Safe Methods",
    description: "How high-net-worth families can prepare the next generation to manage significant wealth through governance, communication, and strategic planning.",
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy | Safe Methods",
    description: "Safe Methods Privacy Policy — how we collect, use, and protect your personal information when you visit safemethods.com.",
  },
];

const HOMEPAGE_JSONLD = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Safe Methods",
    "url": "https://safemethods.com",
    "logo": "https://safemethods.com/favicon.ico",
    "description": "Safe Methods is a financial advice marketplace that connects customers with financial experts from multiple institutions, so they can compare and choose the best product or interest rate — rather than relying on a single bank or advisor.",
    "email": "info@safemethods.org",
    "telephone": "+1-888-841-7755",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Mississauga",
      "addressRegion": "Ontario",
      "addressCountry": "Canada",
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-888-841-7755",
      "contactType": "customer service",
      "email": "info@safemethods.org",
      "areaServed": "CA",
      "availableLanguage": ["English"],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "Safe Methods",
    "url": "https://safemethods.com",
    "description": "Safe Methods brings together AI-driven tools and human financial expertise to help customers compare loan, investment, and debt management options across institutions. The platform is newly launched and currently free for all customers to use.",
    "areaServed": "CA",
    "provider": {
      "@type": "Organization",
      "name": "Safe Methods",
      "url": "https://safemethods.com",
      "telephone": "+1-888-841-7755",
      "email": "info@safemethods.org",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Mississauga",
        "addressRegion": "Ontario",
        "addressCountry": "Canada",
      },
    },
    "serviceType": "Financial advice comparison and marketplace",
  },
];

function seoPages() {
  return {
    name: 'vite-plugin-seo-pages',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const template = readFileSync(resolve(distDir, 'index.html'), 'utf-8');
      const ogImage = `${SITE_URL}/og-default.jpg`;

      for (const route of ROUTES) {
        const canonical = `${SITE_URL}${route.path === "/" ? "/" : route.path}`;
        const headExtras = `  <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${route.title}" />
    <meta property="og:description" content="${route.description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${route.title}" />
    <meta name="twitter:description" content="${route.description}" />
    <meta name="twitter:image" content="${ogImage}" />
  </head>`;

        let html = template
          .replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`)
          .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${route.description}" />`)
          .replace('</head>', headExtras);

        if (route.path === "/") {
          const jsonldScripts = HOMEPAGE_JSONLD.map(
            (obj) =>
              `  <script type="application/ld+json">${JSON.stringify(obj)}</script>`
          ).join("\n");
          html = html.replace("</head>", `${jsonldScripts}\n  </head>`);
          writeFileSync(resolve(distDir, 'index.html'), html);
        } else {
          const slug = route.path.slice(1);
          const dir = resolve(distDir, slug);
          mkdirSync(dir, { recursive: true });
          writeFileSync(resolve(dir, 'index.html'), html);
        }
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), seoPages()],
})
