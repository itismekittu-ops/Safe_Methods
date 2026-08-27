import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { mkdirSync, writeFileSync, readFileSync } from 'fs'

const SITE_URL = "https://safemethods.com";

const ROUTES = [
  {
    path: "/",
    title: "Compare Financial Advice from Multiple Institutions | Safe Methods",
    description: "Safe Methods brings financial experts from top firms together so you can compare and choose the best product or interest rate. Ask SafeBot, get matched, and request quotes.",
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
];

function seoPages() {
  return {
    name: 'vite-plugin-seo-pages',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const template = readFileSync(resolve(distDir, 'index.html'), 'utf-8');

      for (const route of ROUTES) {
        if (route.path === "/") continue;

        const canonical = `${SITE_URL}${route.path}`;
        const ogImage = `${SITE_URL}/og-default.jpg`;

        const html = template
          .replace(
            /<title>[^<]*<\/title>/,
            `<title>${route.title}</title>`
          )
          .replace(
            /<meta name="description" content="[^"]*"\s*\/?>/,
            `<meta name="description" content="${route.description}" />`
          )
          .replace(
            '</head>',
            `  <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${route.title}" />
    <meta property="og:description" content="${route.description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${route.title}" />
    <meta name="twitter:description" content="${route.description}" />
    <meta name="twitter:image" content="${ogImage}" />
  </head>`
          );

        const slug = route.path.slice(1);
        const dir = resolve(distDir, slug);
        mkdirSync(dir, { recursive: true });
        writeFileSync(resolve(dir, 'index.html'), html);
      }

      // Also add OG tags to the root index.html
      const rootRoute = ROUTES[0];
      const rootCanonical = `${SITE_URL}/`;
      const rootOgImage = `${SITE_URL}/og-default.jpg`;
      const rootHtml = template
        .replace(
          /<title>[^<]*<\/title>/,
          `<title>${rootRoute.title}</title>`
        )
        .replace(
          /<meta name="description" content="[^"]*"\s*\/?>/,
          `<meta name="description" content="${rootRoute.description}" />`
        )
        .replace(
          '</head>',
          `  <link rel="canonical" href="${rootCanonical}" />
    <meta property="og:title" content="${rootRoute.title}" />
    <meta property="og:description" content="${rootRoute.description}" />
    <meta property="og:url" content="${rootCanonical}" />
    <meta property="og:image" content="${rootOgImage}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${rootRoute.title}" />
    <meta name="twitter:description" content="${rootRoute.description}" />
    <meta name="twitter:image" content="${rootOgImage}" />
  </head>`
        );
      writeFileSync(resolve(distDir, 'index.html'), rootHtml);
    }
  };
}

export default defineConfig({
  plugins: [react(), seoPages()],
})
