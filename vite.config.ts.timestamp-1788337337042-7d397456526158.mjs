// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import { resolve } from "path";
import { mkdirSync, writeFileSync, readFileSync } from "fs";
var __vite_injected_original_dirname = "/home/project";
var SITE_URL = "https://safemethods.com";
var ROUTES = [
  {
    path: "/",
    title: "Safe Methods | Compare Financial Advice from Top Institutions",
    description: "Safe Methods connects you with financial experts from top institutions so you can compare and choose the best products, rates, and advice."
  },
  {
    path: "/services",
    title: "Debt Management Services | Safe Methods",
    description: "Strategic restructuring and optimization of liabilities to preserve liquidity and enhance your overall net worth. Book a consultation with Safe Methods."
  },
  {
    path: "/blog",
    title: "Navigating Generational Wealth Transfer in Uncertain Markets | Safe Methods",
    description: "How high-net-worth families can prepare the next generation to manage significant wealth through governance, communication, and strategic planning."
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy | Safe Methods",
    description: "Safe Methods Privacy Policy \u2014 how we collect, use, and protect your personal information when you visit safemethods.com."
  }
];
var HOMEPAGE_JSONLD = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Safe Methods",
    "url": "https://safemethods.com",
    "logo": "https://safemethods.com/favicon.ico",
    "description": "Safe Methods is a financial advice marketplace that connects customers with financial experts from multiple institutions, so they can compare and choose the best product or interest rate \u2014 rather than relying on a single bank or advisor.",
    "email": "info@safemethods.org",
    "telephone": "+1-888-841-7755",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Mississauga",
      "addressRegion": "Ontario",
      "addressCountry": "Canada"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-888-841-7755",
      "contactType": "customer service",
      "email": "info@safemethods.org",
      "areaServed": "CA",
      "availableLanguage": ["English"]
    }
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
        "addressCountry": "Canada"
      }
    },
    "serviceType": "Financial advice comparison and marketplace"
  }
];
function seoPages() {
  return {
    name: "vite-plugin-seo-pages",
    closeBundle() {
      const distDir = resolve(__vite_injected_original_dirname, "dist");
      const template = readFileSync(resolve(distDir, "index.html"), "utf-8");
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
        let html = template.replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`).replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${route.description}" />`).replace("</head>", headExtras);
        if (route.path === "/") {
          const jsonldScripts = HOMEPAGE_JSONLD.map(
            (obj) => `  <script type="application/ld+json">${JSON.stringify(obj)}</script>`
          ).join("\n");
          html = html.replace("</head>", `${jsonldScripts}
  </head>`);
          writeFileSync(resolve(distDir, "index.html"), html);
        } else {
          const slug = route.path.slice(1);
          const dir = resolve(distDir, slug);
          mkdirSync(dir, { recursive: true });
          writeFileSync(resolve(dir, "index.html"), html);
        }
      }
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [react(), seoPages()]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBta2RpclN5bmMsIHdyaXRlRmlsZVN5bmMsIHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJ1xuXG5jb25zdCBTSVRFX1VSTCA9IFwiaHR0cHM6Ly9zYWZlbWV0aG9kcy5jb21cIjtcblxuY29uc3QgUk9VVEVTID0gW1xuICB7XG4gICAgcGF0aDogXCIvXCIsXG4gICAgdGl0bGU6IFwiU2FmZSBNZXRob2RzIHwgQ29tcGFyZSBGaW5hbmNpYWwgQWR2aWNlIGZyb20gVG9wIEluc3RpdHV0aW9uc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlNhZmUgTWV0aG9kcyBjb25uZWN0cyB5b3Ugd2l0aCBmaW5hbmNpYWwgZXhwZXJ0cyBmcm9tIHRvcCBpbnN0aXR1dGlvbnMgc28geW91IGNhbiBjb21wYXJlIGFuZCBjaG9vc2UgdGhlIGJlc3QgcHJvZHVjdHMsIHJhdGVzLCBhbmQgYWR2aWNlLlwiLFxuICB9LFxuICB7XG4gICAgcGF0aDogXCIvc2VydmljZXNcIixcbiAgICB0aXRsZTogXCJEZWJ0IE1hbmFnZW1lbnQgU2VydmljZXMgfCBTYWZlIE1ldGhvZHNcIixcbiAgICBkZXNjcmlwdGlvbjogXCJTdHJhdGVnaWMgcmVzdHJ1Y3R1cmluZyBhbmQgb3B0aW1pemF0aW9uIG9mIGxpYWJpbGl0aWVzIHRvIHByZXNlcnZlIGxpcXVpZGl0eSBhbmQgZW5oYW5jZSB5b3VyIG92ZXJhbGwgbmV0IHdvcnRoLiBCb29rIGEgY29uc3VsdGF0aW9uIHdpdGggU2FmZSBNZXRob2RzLlwiLFxuICB9LFxuICB7XG4gICAgcGF0aDogXCIvYmxvZ1wiLFxuICAgIHRpdGxlOiBcIk5hdmlnYXRpbmcgR2VuZXJhdGlvbmFsIFdlYWx0aCBUcmFuc2ZlciBpbiBVbmNlcnRhaW4gTWFya2V0cyB8IFNhZmUgTWV0aG9kc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkhvdyBoaWdoLW5ldC13b3J0aCBmYW1pbGllcyBjYW4gcHJlcGFyZSB0aGUgbmV4dCBnZW5lcmF0aW9uIHRvIG1hbmFnZSBzaWduaWZpY2FudCB3ZWFsdGggdGhyb3VnaCBnb3Zlcm5hbmNlLCBjb21tdW5pY2F0aW9uLCBhbmQgc3RyYXRlZ2ljIHBsYW5uaW5nLlwiLFxuICB9LFxuICB7XG4gICAgcGF0aDogXCIvcHJpdmFjeS1wb2xpY3lcIixcbiAgICB0aXRsZTogXCJQcml2YWN5IFBvbGljeSB8IFNhZmUgTWV0aG9kc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlNhZmUgTWV0aG9kcyBQcml2YWN5IFBvbGljeSBcdTIwMTQgaG93IHdlIGNvbGxlY3QsIHVzZSwgYW5kIHByb3RlY3QgeW91ciBwZXJzb25hbCBpbmZvcm1hdGlvbiB3aGVuIHlvdSB2aXNpdCBzYWZlbWV0aG9kcy5jb20uXCIsXG4gIH0sXG5dO1xuXG5jb25zdCBIT01FUEFHRV9KU09OTEQgPSBbXG4gIHtcbiAgICBcIkBjb250ZXh0XCI6IFwiaHR0cHM6Ly9zY2hlbWEub3JnXCIsXG4gICAgXCJAdHlwZVwiOiBcIk9yZ2FuaXphdGlvblwiLFxuICAgIFwibmFtZVwiOiBcIlNhZmUgTWV0aG9kc1wiLFxuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9zYWZlbWV0aG9kcy5jb21cIixcbiAgICBcImxvZ29cIjogXCJodHRwczovL3NhZmVtZXRob2RzLmNvbS9mYXZpY29uLmljb1wiLFxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJTYWZlIE1ldGhvZHMgaXMgYSBmaW5hbmNpYWwgYWR2aWNlIG1hcmtldHBsYWNlIHRoYXQgY29ubmVjdHMgY3VzdG9tZXJzIHdpdGggZmluYW5jaWFsIGV4cGVydHMgZnJvbSBtdWx0aXBsZSBpbnN0aXR1dGlvbnMsIHNvIHRoZXkgY2FuIGNvbXBhcmUgYW5kIGNob29zZSB0aGUgYmVzdCBwcm9kdWN0IG9yIGludGVyZXN0IHJhdGUgXHUyMDE0IHJhdGhlciB0aGFuIHJlbHlpbmcgb24gYSBzaW5nbGUgYmFuayBvciBhZHZpc29yLlwiLFxuICAgIFwiZW1haWxcIjogXCJpbmZvQHNhZmVtZXRob2RzLm9yZ1wiLFxuICAgIFwidGVsZXBob25lXCI6IFwiKzEtODg4LTg0MS03NzU1XCIsXG4gICAgXCJhZGRyZXNzXCI6IHtcbiAgICAgIFwiQHR5cGVcIjogXCJQb3N0YWxBZGRyZXNzXCIsXG4gICAgICBcImFkZHJlc3NMb2NhbGl0eVwiOiBcIk1pc3Npc3NhdWdhXCIsXG4gICAgICBcImFkZHJlc3NSZWdpb25cIjogXCJPbnRhcmlvXCIsXG4gICAgICBcImFkZHJlc3NDb3VudHJ5XCI6IFwiQ2FuYWRhXCIsXG4gICAgfSxcbiAgICBcImNvbnRhY3RQb2ludFwiOiB7XG4gICAgICBcIkB0eXBlXCI6IFwiQ29udGFjdFBvaW50XCIsXG4gICAgICBcInRlbGVwaG9uZVwiOiBcIisxLTg4OC04NDEtNzc1NVwiLFxuICAgICAgXCJjb250YWN0VHlwZVwiOiBcImN1c3RvbWVyIHNlcnZpY2VcIixcbiAgICAgIFwiZW1haWxcIjogXCJpbmZvQHNhZmVtZXRob2RzLm9yZ1wiLFxuICAgICAgXCJhcmVhU2VydmVkXCI6IFwiQ0FcIixcbiAgICAgIFwiYXZhaWxhYmxlTGFuZ3VhZ2VcIjogW1wiRW5nbGlzaFwiXSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgXCJAY29udGV4dFwiOiBcImh0dHBzOi8vc2NoZW1hLm9yZ1wiLFxuICAgIFwiQHR5cGVcIjogXCJGaW5hbmNpYWxTZXJ2aWNlXCIsXG4gICAgXCJuYW1lXCI6IFwiU2FmZSBNZXRob2RzXCIsXG4gICAgXCJ1cmxcIjogXCJodHRwczovL3NhZmVtZXRob2RzLmNvbVwiLFxuICAgIFwiZGVzY3JpcHRpb25cIjogXCJTYWZlIE1ldGhvZHMgYnJpbmdzIHRvZ2V0aGVyIEFJLWRyaXZlbiB0b29scyBhbmQgaHVtYW4gZmluYW5jaWFsIGV4cGVydGlzZSB0byBoZWxwIGN1c3RvbWVycyBjb21wYXJlIGxvYW4sIGludmVzdG1lbnQsIGFuZCBkZWJ0IG1hbmFnZW1lbnQgb3B0aW9ucyBhY3Jvc3MgaW5zdGl0dXRpb25zLiBUaGUgcGxhdGZvcm0gaXMgbmV3bHkgbGF1bmNoZWQgYW5kIGN1cnJlbnRseSBmcmVlIGZvciBhbGwgY3VzdG9tZXJzIHRvIHVzZS5cIixcbiAgICBcImFyZWFTZXJ2ZWRcIjogXCJDQVwiLFxuICAgIFwicHJvdmlkZXJcIjoge1xuICAgICAgXCJAdHlwZVwiOiBcIk9yZ2FuaXphdGlvblwiLFxuICAgICAgXCJuYW1lXCI6IFwiU2FmZSBNZXRob2RzXCIsXG4gICAgICBcInVybFwiOiBcImh0dHBzOi8vc2FmZW1ldGhvZHMuY29tXCIsXG4gICAgICBcInRlbGVwaG9uZVwiOiBcIisxLTg4OC04NDEtNzc1NVwiLFxuICAgICAgXCJlbWFpbFwiOiBcImluZm9Ac2FmZW1ldGhvZHMub3JnXCIsXG4gICAgICBcImFkZHJlc3NcIjoge1xuICAgICAgICBcIkB0eXBlXCI6IFwiUG9zdGFsQWRkcmVzc1wiLFxuICAgICAgICBcImFkZHJlc3NMb2NhbGl0eVwiOiBcIk1pc3Npc3NhdWdhXCIsXG4gICAgICAgIFwiYWRkcmVzc1JlZ2lvblwiOiBcIk9udGFyaW9cIixcbiAgICAgICAgXCJhZGRyZXNzQ291bnRyeVwiOiBcIkNhbmFkYVwiLFxuICAgICAgfSxcbiAgICB9LFxuICAgIFwic2VydmljZVR5cGVcIjogXCJGaW5hbmNpYWwgYWR2aWNlIGNvbXBhcmlzb24gYW5kIG1hcmtldHBsYWNlXCIsXG4gIH0sXG5dO1xuXG5mdW5jdGlvbiBzZW9QYWdlcygpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAndml0ZS1wbHVnaW4tc2VvLXBhZ2VzJyxcbiAgICBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgIGNvbnN0IGRpc3REaXIgPSByZXNvbHZlKF9fZGlybmFtZSwgJ2Rpc3QnKTtcbiAgICAgIGNvbnN0IHRlbXBsYXRlID0gcmVhZEZpbGVTeW5jKHJlc29sdmUoZGlzdERpciwgJ2luZGV4Lmh0bWwnKSwgJ3V0Zi04Jyk7XG4gICAgICBjb25zdCBvZ0ltYWdlID0gYCR7U0lURV9VUkx9L29nLWRlZmF1bHQuanBnYDtcblxuICAgICAgZm9yIChjb25zdCByb3V0ZSBvZiBST1VURVMpIHtcbiAgICAgICAgY29uc3QgY2Fub25pY2FsID0gYCR7U0lURV9VUkx9JHtyb3V0ZS5wYXRoID09PSBcIi9cIiA/IFwiL1wiIDogcm91dGUucGF0aH1gO1xuICAgICAgICBjb25zdCBoZWFkRXh0cmFzID0gYCAgPGxpbmsgcmVsPVwiY2Fub25pY2FsXCIgaHJlZj1cIiR7Y2Fub25pY2FsfVwiIC8+XG4gICAgPG1ldGEgcHJvcGVydHk9XCJvZzp0aXRsZVwiIGNvbnRlbnQ9XCIke3JvdXRlLnRpdGxlfVwiIC8+XG4gICAgPG1ldGEgcHJvcGVydHk9XCJvZzpkZXNjcmlwdGlvblwiIGNvbnRlbnQ9XCIke3JvdXRlLmRlc2NyaXB0aW9ufVwiIC8+XG4gICAgPG1ldGEgcHJvcGVydHk9XCJvZzp1cmxcIiBjb250ZW50PVwiJHtjYW5vbmljYWx9XCIgLz5cbiAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOmltYWdlXCIgY29udGVudD1cIiR7b2dJbWFnZX1cIiAvPlxuICAgIDxtZXRhIHByb3BlcnR5PVwib2c6dHlwZVwiIGNvbnRlbnQ9XCJ3ZWJzaXRlXCIgLz5cbiAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjpjYXJkXCIgY29udGVudD1cInN1bW1hcnlfbGFyZ2VfaW1hZ2VcIiAvPlxuICAgIDxtZXRhIG5hbWU9XCJ0d2l0dGVyOnRpdGxlXCIgY29udGVudD1cIiR7cm91dGUudGl0bGV9XCIgLz5cbiAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjpkZXNjcmlwdGlvblwiIGNvbnRlbnQ9XCIke3JvdXRlLmRlc2NyaXB0aW9ufVwiIC8+XG4gICAgPG1ldGEgbmFtZT1cInR3aXR0ZXI6aW1hZ2VcIiBjb250ZW50PVwiJHtvZ0ltYWdlfVwiIC8+XG4gIDwvaGVhZD5gO1xuXG4gICAgICAgIGxldCBodG1sID0gdGVtcGxhdGVcbiAgICAgICAgICAucmVwbGFjZSgvPHRpdGxlPltePF0qPFxcL3RpdGxlPi8sIGA8dGl0bGU+JHtyb3V0ZS50aXRsZX08L3RpdGxlPmApXG4gICAgICAgICAgLnJlcGxhY2UoLzxtZXRhIG5hbWU9XCJkZXNjcmlwdGlvblwiIGNvbnRlbnQ9XCJbXlwiXSpcIlxccypcXC8/Pi8sIGA8bWV0YSBuYW1lPVwiZGVzY3JpcHRpb25cIiBjb250ZW50PVwiJHtyb3V0ZS5kZXNjcmlwdGlvbn1cIiAvPmApXG4gICAgICAgICAgLnJlcGxhY2UoJzwvaGVhZD4nLCBoZWFkRXh0cmFzKTtcblxuICAgICAgICBpZiAocm91dGUucGF0aCA9PT0gXCIvXCIpIHtcbiAgICAgICAgICBjb25zdCBqc29ubGRTY3JpcHRzID0gSE9NRVBBR0VfSlNPTkxELm1hcChcbiAgICAgICAgICAgIChvYmopID0+XG4gICAgICAgICAgICAgIGAgIDxzY3JpcHQgdHlwZT1cImFwcGxpY2F0aW9uL2xkK2pzb25cIj4ke0pTT04uc3RyaW5naWZ5KG9iail9PC9zY3JpcHQ+YFxuICAgICAgICAgICkuam9pbihcIlxcblwiKTtcbiAgICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKFwiPC9oZWFkPlwiLCBgJHtqc29ubGRTY3JpcHRzfVxcbiAgPC9oZWFkPmApO1xuICAgICAgICAgIHdyaXRlRmlsZVN5bmMocmVzb2x2ZShkaXN0RGlyLCAnaW5kZXguaHRtbCcpLCBodG1sKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBzbHVnID0gcm91dGUucGF0aC5zbGljZSgxKTtcbiAgICAgICAgICBjb25zdCBkaXIgPSByZXNvbHZlKGRpc3REaXIsIHNsdWcpO1xuICAgICAgICAgIG1rZGlyU3luYyhkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgICAgIHdyaXRlRmlsZVN5bmMocmVzb2x2ZShkaXIsICdpbmRleC5odG1sJyksIGh0bWwpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKSwgc2VvUGFnZXMoKV0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBQ3hCLFNBQVMsV0FBVyxlQUFlLG9CQUFvQjtBQUh2RCxJQUFNLG1DQUFtQztBQUt6QyxJQUFNLFdBQVc7QUFFakIsSUFBTSxTQUFTO0FBQUEsRUFDYjtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLEVBQ2Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxhQUFhO0FBQUEsRUFDZjtBQUFBLEVBQ0E7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLGFBQWE7QUFBQSxFQUNmO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLEVBQ2Y7QUFDRjtBQUVBLElBQU0sa0JBQWtCO0FBQUEsRUFDdEI7QUFBQSxJQUNFLFlBQVk7QUFBQSxJQUNaLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNi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
