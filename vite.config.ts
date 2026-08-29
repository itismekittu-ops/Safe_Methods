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

const REDIRECTS = [
  { from: "/contact", to: "/" },
  { from: "/about-us", to: "/" },
  { from: "/wp-content", to: "/" },
  { from: "/wp-admin", to: "/" },
  { from: "/wp-login.php", to: "/" },
  { from: "/feed", to: "/" },
  { from: "/category", to: "/" },
  { from: "/tag", to: "/" },
  { from: "/page", to: "/" },
];

const GONE_PATHS = ["/xmlrpc.php"];

function redirectHtml(target: string, canonicalUrl: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0; url=${target}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <title>Redirecting&hellip;</title>
  <meta name="robots" content="noindex, follow" />
</head>
<body>
  <p>This page has moved. <a href="${target}">Continue to the new location</a>.</p>
</body>
</html>`;
}

function notFoundHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Page Not Found | Safe Methods</title>
  <meta name="robots" content="noindex, nofollow" />
</head>
<body>
  <p>This page no longer exists. <a href="/">Return to Safe Methods</a>.</p>
</body>
</html>`;
}

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

      for (const rule of REDIRECTS) {
        const canonicalUrl = `${SITE_URL}${rule.to === "/" ? "/" : rule.to}`;
        const html = redirectHtml(rule.to, canonicalUrl);

        if (rule.from.includes(".")) {
          writeFileSync(resolve(distDir, rule.from.slice(1)), html);
        } else {
          const dir = resolve(distDir, rule.from.slice(1));
          mkdirSync(dir, { recursive: true });
          writeFileSync(resolve(dir, 'index.html'), html);
        }
      }

      for (const path of GONE_PATHS) {
        const html = notFoundHtml();
        if (path.includes(".")) {
          writeFileSync(resolve(distDir, path.slice(1)), html);
        } else {
          const dir = resolve(distDir, path.slice(1));
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
