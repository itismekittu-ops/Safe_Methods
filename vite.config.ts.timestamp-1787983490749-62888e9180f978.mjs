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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBta2RpclN5bmMsIHdyaXRlRmlsZVN5bmMsIHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJ1xuXG5jb25zdCBTSVRFX1VSTCA9IFwiaHR0cHM6Ly9zYWZlbWV0aG9kcy5jb21cIjtcblxuY29uc3QgUk9VVEVTID0gW1xuICB7XG4gICAgcGF0aDogXCIvXCIsXG4gICAgdGl0bGU6IFwiU2FmZSBNZXRob2RzIHwgQ29tcGFyZSBGaW5hbmNpYWwgQWR2aWNlIGZyb20gVG9wIEluc3RpdHV0aW9uc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlNhZmUgTWV0aG9kcyBjb25uZWN0cyB5b3Ugd2l0aCBmaW5hbmNpYWwgZXhwZXJ0cyBmcm9tIHRvcCBpbnN0aXR1dGlvbnMgc28geW91IGNhbiBjb21wYXJlIGFuZCBjaG9vc2UgdGhlIGJlc3QgcHJvZHVjdHMsIHJhdGVzLCBhbmQgYWR2aWNlLlwiLFxuICB9LFxuICB7XG4gICAgcGF0aDogXCIvc2VydmljZXNcIixcbiAgICB0aXRsZTogXCJEZWJ0IE1hbmFnZW1lbnQgU2VydmljZXMgfCBTYWZlIE1ldGhvZHNcIixcbiAgICBkZXNjcmlwdGlvbjogXCJTdHJhdGVnaWMgcmVzdHJ1Y3R1cmluZyBhbmQgb3B0aW1pemF0aW9uIG9mIGxpYWJpbGl0aWVzIHRvIHByZXNlcnZlIGxpcXVpZGl0eSBhbmQgZW5oYW5jZSB5b3VyIG92ZXJhbGwgbmV0IHdvcnRoLiBCb29rIGEgY29uc3VsdGF0aW9uIHdpdGggU2FmZSBNZXRob2RzLlwiLFxuICB9LFxuICB7XG4gICAgcGF0aDogXCIvYmxvZ1wiLFxuICAgIHRpdGxlOiBcIk5hdmlnYXRpbmcgR2VuZXJhdGlvbmFsIFdlYWx0aCBUcmFuc2ZlciBpbiBVbmNlcnRhaW4gTWFya2V0cyB8IFNhZmUgTWV0aG9kc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkhvdyBoaWdoLW5ldC13b3J0aCBmYW1pbGllcyBjYW4gcHJlcGFyZSB0aGUgbmV4dCBnZW5lcmF0aW9uIHRvIG1hbmFnZSBzaWduaWZpY2FudCB3ZWFsdGggdGhyb3VnaCBnb3Zlcm5hbmNlLCBjb21tdW5pY2F0aW9uLCBhbmQgc3RyYXRlZ2ljIHBsYW5uaW5nLlwiLFxuICB9LFxuXTtcblxuY29uc3QgSE9NRVBBR0VfSlNPTkxEID0gW1xuICB7XG4gICAgXCJAY29udGV4dFwiOiBcImh0dHBzOi8vc2NoZW1hLm9yZ1wiLFxuICAgIFwiQHR5cGVcIjogXCJPcmdhbml6YXRpb25cIixcbiAgICBcIm5hbWVcIjogXCJTYWZlIE1ldGhvZHNcIixcbiAgICBcInVybFwiOiBcImh0dHBzOi8vc2FmZW1ldGhvZHMuY29tXCIsXG4gICAgXCJsb2dvXCI6IFwiaHR0cHM6Ly9zYWZlbWV0aG9kcy5jb20vZmF2aWNvbi5pY29cIixcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiU2FmZSBNZXRob2RzIGlzIGEgZmluYW5jaWFsIGFkdmljZSBtYXJrZXRwbGFjZSB0aGF0IGNvbm5lY3RzIGN1c3RvbWVycyB3aXRoIGZpbmFuY2lhbCBleHBlcnRzIGZyb20gbXVsdGlwbGUgaW5zdGl0dXRpb25zLCBzbyB0aGV5IGNhbiBjb21wYXJlIGFuZCBjaG9vc2UgdGhlIGJlc3QgcHJvZHVjdCBvciBpbnRlcmVzdCByYXRlIFx1MjAxNCByYXRoZXIgdGhhbiByZWx5aW5nIG9uIGEgc2luZ2xlIGJhbmsgb3IgYWR2aXNvci5cIixcbiAgICBcImVtYWlsXCI6IFwiaW5mb0BzYWZlbWV0aG9kcy5vcmdcIixcbiAgICBcInRlbGVwaG9uZVwiOiBcIisxLTg4OC04NDEtNzc1NVwiLFxuICAgIFwiYWRkcmVzc1wiOiB7XG4gICAgICBcIkB0eXBlXCI6IFwiUG9zdGFsQWRkcmVzc1wiLFxuICAgICAgXCJhZGRyZXNzTG9jYWxpdHlcIjogXCJNaXNzaXNzYXVnYVwiLFxuICAgICAgXCJhZGRyZXNzUmVnaW9uXCI6IFwiT250YXJpb1wiLFxuICAgICAgXCJhZGRyZXNzQ291bnRyeVwiOiBcIkNhbmFkYVwiLFxuICAgIH0sXG4gICAgXCJjb250YWN0UG9pbnRcIjoge1xuICAgICAgXCJAdHlwZVwiOiBcIkNvbnRhY3RQb2ludFwiLFxuICAgICAgXCJ0ZWxlcGhvbmVcIjogXCIrMS04ODgtODQxLTc3NTVcIixcbiAgICAgIFwiY29udGFjdFR5cGVcIjogXCJjdXN0b21lciBzZXJ2aWNlXCIsXG4gICAgICBcImVtYWlsXCI6IFwiaW5mb0BzYWZlbWV0aG9kcy5vcmdcIixcbiAgICAgIFwiYXJlYVNlcnZlZFwiOiBcIkNBXCIsXG4gICAgICBcImF2YWlsYWJsZUxhbmd1YWdlXCI6IFtcIkVuZ2xpc2hcIl0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIFwiQGNvbnRleHRcIjogXCJodHRwczovL3NjaGVtYS5vcmdcIixcbiAgICBcIkB0eXBlXCI6IFwiRmluYW5jaWFsU2VydmljZVwiLFxuICAgIFwibmFtZVwiOiBcIlNhZmUgTWV0aG9kc1wiLFxuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9zYWZlbWV0aG9kcy5jb21cIixcbiAgICBcImRlc2NyaXB0aW9uXCI6IFwiU2FmZSBNZXRob2RzIGJyaW5ncyB0b2dldGhlciBBSS1kcml2ZW4gdG9vbHMgYW5kIGh1bWFuIGZpbmFuY2lhbCBleHBlcnRpc2UgdG8gaGVscCBjdXN0b21lcnMgY29tcGFyZSBsb2FuLCBpbnZlc3RtZW50LCBhbmQgZGVidCBtYW5hZ2VtZW50IG9wdGlvbnMgYWNyb3NzIGluc3RpdHV0aW9ucy4gVGhlIHBsYXRmb3JtIGlzIG5ld2x5IGxhdW5jaGVkIGFuZCBjdXJyZW50bHkgZnJlZSBmb3IgYWxsIGN1c3RvbWVycyB0byB1c2UuXCIsXG4gICAgXCJhcmVhU2VydmVkXCI6IFwiQ0FcIixcbiAgICBcInByb3ZpZGVyXCI6IHtcbiAgICAgIFwiQHR5cGVcIjogXCJPcmdhbml6YXRpb25cIixcbiAgICAgIFwibmFtZVwiOiBcIlNhZmUgTWV0aG9kc1wiLFxuICAgICAgXCJ1cmxcIjogXCJodHRwczovL3NhZmVtZXRob2RzLmNvbVwiLFxuICAgICAgXCJ0ZWxlcGhvbmVcIjogXCIrMS04ODgtODQxLTc3NTVcIixcbiAgICAgIFwiZW1haWxcIjogXCJpbmZvQHNhZmVtZXRob2RzLm9yZ1wiLFxuICAgICAgXCJhZGRyZXNzXCI6IHtcbiAgICAgICAgXCJAdHlwZVwiOiBcIlBvc3RhbEFkZHJlc3NcIixcbiAgICAgICAgXCJhZGRyZXNzTG9jYWxpdHlcIjogXCJNaXNzaXNzYXVnYVwiLFxuICAgICAgICBcImFkZHJlc3NSZWdpb25cIjogXCJPbnRhcmlvXCIsXG4gICAgICAgIFwiYWRkcmVzc0NvdW50cnlcIjogXCJDYW5hZGFcIixcbiAgICAgIH0sXG4gICAgfSxcbiAgICBcInNlcnZpY2VUeXBlXCI6IFwiRmluYW5jaWFsIGFkdmljZSBjb21wYXJpc29uIGFuZCBtYXJrZXRwbGFjZVwiLFxuICB9LFxuXTtcblxuZnVuY3Rpb24gc2VvUGFnZXMoKSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3ZpdGUtcGx1Z2luLXNlby1wYWdlcycsXG4gICAgY2xvc2VCdW5kbGUoKSB7XG4gICAgICBjb25zdCBkaXN0RGlyID0gcmVzb2x2ZShfX2Rpcm5hbWUsICdkaXN0Jyk7XG4gICAgICBjb25zdCB0ZW1wbGF0ZSA9IHJlYWRGaWxlU3luYyhyZXNvbHZlKGRpc3REaXIsICdpbmRleC5odG1sJyksICd1dGYtOCcpO1xuICAgICAgY29uc3Qgb2dJbWFnZSA9IGAke1NJVEVfVVJMfS9vZy1kZWZhdWx0LmpwZ2A7XG5cbiAgICAgIGZvciAoY29uc3Qgcm91dGUgb2YgUk9VVEVTKSB7XG4gICAgICAgIGNvbnN0IGNhbm9uaWNhbCA9IGAke1NJVEVfVVJMfSR7cm91dGUucGF0aCA9PT0gXCIvXCIgPyBcIi9cIiA6IHJvdXRlLnBhdGh9YDtcbiAgICAgICAgY29uc3QgaGVhZEV4dHJhcyA9IGAgIDxsaW5rIHJlbD1cImNhbm9uaWNhbFwiIGhyZWY9XCIke2Nhbm9uaWNhbH1cIiAvPlxuICAgIDxtZXRhIHByb3BlcnR5PVwib2c6dGl0bGVcIiBjb250ZW50PVwiJHtyb3V0ZS50aXRsZX1cIiAvPlxuICAgIDxtZXRhIHByb3BlcnR5PVwib2c6ZGVzY3JpcHRpb25cIiBjb250ZW50PVwiJHtyb3V0ZS5kZXNjcmlwdGlvbn1cIiAvPlxuICAgIDxtZXRhIHByb3BlcnR5PVwib2c6dXJsXCIgY29udGVudD1cIiR7Y2Fub25pY2FsfVwiIC8+XG4gICAgPG1ldGEgcHJvcGVydHk9XCJvZzppbWFnZVwiIGNvbnRlbnQ9XCIke29nSW1hZ2V9XCIgLz5cbiAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOnR5cGVcIiBjb250ZW50PVwid2Vic2l0ZVwiIC8+XG4gICAgPG1ldGEgbmFtZT1cInR3aXR0ZXI6Y2FyZFwiIGNvbnRlbnQ9XCJzdW1tYXJ5X2xhcmdlX2ltYWdlXCIgLz5cbiAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjp0aXRsZVwiIGNvbnRlbnQ9XCIke3JvdXRlLnRpdGxlfVwiIC8+XG4gICAgPG1ldGEgbmFtZT1cInR3aXR0ZXI6ZGVzY3JpcHRpb25cIiBjb250ZW50PVwiJHtyb3V0ZS5kZXNjcmlwdGlvbn1cIiAvPlxuICAgIDxtZXRhIG5hbWU9XCJ0d2l0dGVyOmltYWdlXCIgY29udGVudD1cIiR7b2dJbWFnZX1cIiAvPlxuICA8L2hlYWQ+YDtcblxuICAgICAgICBsZXQgaHRtbCA9IHRlbXBsYXRlXG4gICAgICAgICAgLnJlcGxhY2UoLzx0aXRsZT5bXjxdKjxcXC90aXRsZT4vLCBgPHRpdGxlPiR7cm91dGUudGl0bGV9PC90aXRsZT5gKVxuICAgICAgICAgIC5yZXBsYWNlKC88bWV0YSBuYW1lPVwiZGVzY3JpcHRpb25cIiBjb250ZW50PVwiW15cIl0qXCJcXHMqXFwvPz4vLCBgPG1ldGEgbmFtZT1cImRlc2NyaXB0aW9uXCIgY29udGVudD1cIiR7cm91dGUuZGVzY3JpcHRpb259XCIgLz5gKVxuICAgICAgICAgIC5yZXBsYWNlKCc8L2hlYWQ+JywgaGVhZEV4dHJhcyk7XG5cbiAgICAgICAgaWYgKHJvdXRlLnBhdGggPT09IFwiL1wiKSB7XG4gICAgICAgICAgY29uc3QganNvbmxkU2NyaXB0cyA9IEhPTUVQQUdFX0pTT05MRC5tYXAoXG4gICAgICAgICAgICAob2JqKSA9PlxuICAgICAgICAgICAgICBgICA8c2NyaXB0IHR5cGU9XCJhcHBsaWNhdGlvbi9sZCtqc29uXCI+JHtKU09OLnN0cmluZ2lmeShvYmopfTwvc2NyaXB0PmBcbiAgICAgICAgICApLmpvaW4oXCJcXG5cIik7XG4gICAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShcIjwvaGVhZD5cIiwgYCR7anNvbmxkU2NyaXB0c31cXG4gIDwvaGVhZD5gKTtcbiAgICAgICAgICB3cml0ZUZpbGVTeW5jKHJlc29sdmUoZGlzdERpciwgJ2luZGV4Lmh0bWwnKSwgaHRtbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3Qgc2x1ZyA9IHJvdXRlLnBhdGguc2xpY2UoMSk7XG4gICAgICAgICAgY29uc3QgZGlyID0gcmVzb2x2ZShkaXN0RGlyLCBzbHVnKTtcbiAgICAgICAgICBta2RpclN5bmMoZGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgICB3cml0ZUZpbGVTeW5jKHJlc29sdmUoZGlyLCAnaW5kZXguaHRtbCcpLCBodG1sKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCksIHNlb1BhZ2VzKCldLFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUN4QixTQUFTLFdBQVcsZUFBZSxvQkFBb0I7QUFIdkQsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTSxXQUFXO0FBRWpCLElBQU0sU0FBUztBQUFBLEVBQ2I7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLGFBQWE7QUFBQSxFQUNmO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLEVBQ2Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxhQUFhO0FBQUEsRUFDZjtBQUNGO0FBRUEsSUFBTSxrQkFBa0I7QUFBQSxFQUN0QjtBQUFBLElBQ0UsWUFBWTtBQUFBLElBQ1osU0FBUztBQUFBLElBQ1QsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsU0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLElBQ2IsV0FBVztBQUFBLE1BQ1QsU0FBUztBQUFBLE1BQ1QsbUJBQW1CO0FBQUEsTUFDbkIsaUJBQWlCO0FBQUEsTUFDakIsa0JBQWtCO0FBQUEsSUFDcEI7QUFBQSxJQUNBLGdCQUFnQjtBQUFBLE1BQ2QsU0FBUztBQUFBLE1BQ1QsYUFBYTtBQUFBLE1BQ2IsZUFBZTtBQUFBLE1BQ2YsU0FBUztBQUFBLE1BQ1QsY0FBYztBQUFBLE1BQ2QscUJBQXFCLENBQUMsU0FBUztBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLFlBQVk7QUFBQSxJQUNaLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLGVBQWU7QUFBQSxJQUNmLGNBQWM7QUFBQSxJQUNkLFlBQVk7QUFBQSxNQUNWLFNBQVM7QUFBQSxNQUNULFFBQVE7QUFBQSxNQUNSLE9BQU87QUFBQSxNQUNQLGFBQWE7QUFBQSxNQUNiLFNBQVM7QUFBQSxNQUNULFdBQVc7QUFBQSxRQUNULFNBQVM7QUFBQSxRQUNULG1CQUFtQjtBQUFBLFFBQ25CLGlCQUFpQjtBQUFBLFFBQ2pCLGtCQUFrQjtBQUFBLE1BQ3BCO0FBQUEsSUFDRjtBQUFBLElBQ0EsZUFBZTtBQUFBLEVBQ2pCO0FBQ0Y7QUFFQSxTQUFTLFdBQVc7QUFDbEIsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sY0FBYztBQUNaLFlBQU0sVUFBVSxRQUFRLGtDQUFXLE1BQU07QUFDekMsWUFBTSxXQUFXLGFBQWEsUUFBUSxTQUFTLFlBQVksR0FBRyxPQUFPO0FBQ3JFLFlBQU0sVUFBVSxHQUFHLFFBQVE7QUFFM0IsaUJBQVcsU0FBUyxRQUFRO0FBQzFCLGNBQU0sWUFBWSxHQUFHLFFBQVEsR0FBRyxNQUFNLFNBQVMsTUFBTSxNQUFNLE1BQU0sSUFBSTtBQUNyRSxjQUFNLGFBQWEsaUNBQWlDLFNBQVM7QUFBQSx5Q0FDNUIsTUFBTSxLQUFLO0FBQUEsK0NBQ0wsTUFBTSxXQUFXO0FBQUEsdUNBQ3pCLFNBQVM7QUFBQSx5Q0FDUCxPQUFPO0FBQUE7QUFBQTtBQUFBLDBDQUdOLE1BQU0sS0FBSztBQUFBLGdEQUNMLE1BQU0sV0FBVztBQUFBLDBDQUN2QixPQUFPO0FBQUE7QUFHekMsWUFBSSxPQUFPLFNBQ1IsUUFBUSx5QkFBeUIsVUFBVSxNQUFNLEtBQUssVUFBVSxFQUNoRSxRQUFRLG1EQUFtRCxxQ0FBcUMsTUFBTSxXQUFXLE1BQU0sRUFDdkgsUUFBUSxXQUFXLFVBQVU7QUFFaEMsWUFBSSxNQUFNLFNBQVMsS0FBSztBQUN0QixnQkFBTSxnQkFBZ0IsZ0JBQWdCO0FBQUEsWUFDcEMsQ0FBQyxRQUNDLHdDQUF3QyxLQUFLLFVBQVUsR0FBRyxDQUFDO0FBQUEsVUFDL0QsRUFBRSxLQUFLLElBQUk7QUFDWCxpQkFBTyxLQUFLLFFBQVEsV0FBVyxHQUFHLGFBQWE7QUFBQSxVQUFhO0FBQzVELHdCQUFjLFFBQVEsU0FBUyxZQUFZLEdBQUcsSUFBSTtBQUFBLFFBQ3BELE9BQU87QUFDTCxnQkFBTSxPQUFPLE1BQU0sS0FBSyxNQUFNLENBQUM7QUFDL0IsZ0JBQU0sTUFBTSxRQUFRLFNBQVMsSUFBSTtBQUNqQyxvQkFBVSxLQUFLLEVBQUUsV0FBVyxLQUFLLENBQUM7QUFDbEMsd0JBQWMsUUFBUSxLQUFLLFlBQVksR0FBRyxJQUFJO0FBQUEsUUFDaEQ7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjtBQUVBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO0FBQy9CLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
