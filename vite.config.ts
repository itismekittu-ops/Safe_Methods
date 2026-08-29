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

        const html = template
          .replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`)
          .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${route.description}" />`)
          .replace('</head>', headExtras);

        if (route.path === "/") {
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
