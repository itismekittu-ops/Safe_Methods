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
        const html = template.replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`).replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${route.description}" />`).replace("</head>", headExtras);
        if (route.path === "/") {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBta2RpclN5bmMsIHdyaXRlRmlsZVN5bmMsIHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJ1xuXG5jb25zdCBTSVRFX1VSTCA9IFwiaHR0cHM6Ly9zYWZlbWV0aG9kcy5jb21cIjtcblxuY29uc3QgUk9VVEVTID0gW1xuICB7XG4gICAgcGF0aDogXCIvXCIsXG4gICAgdGl0bGU6IFwiU2FmZSBNZXRob2RzIHwgQ29tcGFyZSBGaW5hbmNpYWwgQWR2aWNlIGZyb20gVG9wIEluc3RpdHV0aW9uc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlNhZmUgTWV0aG9kcyBjb25uZWN0cyB5b3Ugd2l0aCBmaW5hbmNpYWwgZXhwZXJ0cyBmcm9tIHRvcCBpbnN0aXR1dGlvbnMgc28geW91IGNhbiBjb21wYXJlIGFuZCBjaG9vc2UgdGhlIGJlc3QgcHJvZHVjdHMsIHJhdGVzLCBhbmQgYWR2aWNlLlwiLFxuICB9LFxuICB7XG4gICAgcGF0aDogXCIvc2VydmljZXNcIixcbiAgICB0aXRsZTogXCJEZWJ0IE1hbmFnZW1lbnQgU2VydmljZXMgfCBTYWZlIE1ldGhvZHNcIixcbiAgICBkZXNjcmlwdGlvbjogXCJTdHJhdGVnaWMgcmVzdHJ1Y3R1cmluZyBhbmQgb3B0aW1pemF0aW9uIG9mIGxpYWJpbGl0aWVzIHRvIHByZXNlcnZlIGxpcXVpZGl0eSBhbmQgZW5oYW5jZSB5b3VyIG92ZXJhbGwgbmV0IHdvcnRoLiBCb29rIGEgY29uc3VsdGF0aW9uIHdpdGggU2FmZSBNZXRob2RzLlwiLFxuICB9LFxuICB7XG4gICAgcGF0aDogXCIvYmxvZ1wiLFxuICAgIHRpdGxlOiBcIk5hdmlnYXRpbmcgR2VuZXJhdGlvbmFsIFdlYWx0aCBUcmFuc2ZlciBpbiBVbmNlcnRhaW4gTWFya2V0cyB8IFNhZmUgTWV0aG9kc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkhvdyBoaWdoLW5ldC13b3J0aCBmYW1pbGllcyBjYW4gcHJlcGFyZSB0aGUgbmV4dCBnZW5lcmF0aW9uIHRvIG1hbmFnZSBzaWduaWZpY2FudCB3ZWFsdGggdGhyb3VnaCBnb3Zlcm5hbmNlLCBjb21tdW5pY2F0aW9uLCBhbmQgc3RyYXRlZ2ljIHBsYW5uaW5nLlwiLFxuICB9LFxuXTtcblxuZnVuY3Rpb24gc2VvUGFnZXMoKSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3ZpdGUtcGx1Z2luLXNlby1wYWdlcycsXG4gICAgY2xvc2VCdW5kbGUoKSB7XG4gICAgICBjb25zdCBkaXN0RGlyID0gcmVzb2x2ZShfX2Rpcm5hbWUsICdkaXN0Jyk7XG4gICAgICBjb25zdCB0ZW1wbGF0ZSA9IHJlYWRGaWxlU3luYyhyZXNvbHZlKGRpc3REaXIsICdpbmRleC5odG1sJyksICd1dGYtOCcpO1xuICAgICAgY29uc3Qgb2dJbWFnZSA9IGAke1NJVEVfVVJMfS9vZy1kZWZhdWx0LmpwZ2A7XG5cbiAgICAgIGZvciAoY29uc3Qgcm91dGUgb2YgUk9VVEVTKSB7XG4gICAgICAgIGNvbnN0IGNhbm9uaWNhbCA9IGAke1NJVEVfVVJMfSR7cm91dGUucGF0aCA9PT0gXCIvXCIgPyBcIi9cIiA6IHJvdXRlLnBhdGh9YDtcbiAgICAgICAgY29uc3QgaGVhZEV4dHJhcyA9IGAgIDxsaW5rIHJlbD1cImNhbm9uaWNhbFwiIGhyZWY9XCIke2Nhbm9uaWNhbH1cIiAvPlxuICAgIDxtZXRhIHByb3BlcnR5PVwib2c6dGl0bGVcIiBjb250ZW50PVwiJHtyb3V0ZS50aXRsZX1cIiAvPlxuICAgIDxtZXRhIHByb3BlcnR5PVwib2c6ZGVzY3JpcHRpb25cIiBjb250ZW50PVwiJHtyb3V0ZS5kZXNjcmlwdGlvbn1cIiAvPlxuICAgIDxtZXRhIHByb3BlcnR5PVwib2c6dXJsXCIgY29udGVudD1cIiR7Y2Fub25pY2FsfVwiIC8+XG4gICAgPG1ldGEgcHJvcGVydHk9XCJvZzppbWFnZVwiIGNvbnRlbnQ9XCIke29nSW1hZ2V9XCIgLz5cbiAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOnR5cGVcIiBjb250ZW50PVwid2Vic2l0ZVwiIC8+XG4gICAgPG1ldGEgbmFtZT1cInR3aXR0ZXI6Y2FyZFwiIGNvbnRlbnQ9XCJzdW1tYXJ5X2xhcmdlX2ltYWdlXCIgLz5cbiAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjp0aXRsZVwiIGNvbnRlbnQ9XCIke3JvdXRlLnRpdGxlfVwiIC8+XG4gICAgPG1ldGEgbmFtZT1cInR3aXR0ZXI6ZGVzY3JpcHRpb25cIiBjb250ZW50PVwiJHtyb3V0ZS5kZXNjcmlwdGlvbn1cIiAvPlxuICAgIDxtZXRhIG5hbWU9XCJ0d2l0dGVyOmltYWdlXCIgY29udGVudD1cIiR7b2dJbWFnZX1cIiAvPlxuICA8L2hlYWQ+YDtcblxuICAgICAgICBjb25zdCBodG1sID0gdGVtcGxhdGVcbiAgICAgICAgICAucmVwbGFjZSgvPHRpdGxlPltePF0qPFxcL3RpdGxlPi8sIGA8dGl0bGU+JHtyb3V0ZS50aXRsZX08L3RpdGxlPmApXG4gICAgICAgICAgLnJlcGxhY2UoLzxtZXRhIG5hbWU9XCJkZXNjcmlwdGlvblwiIGNvbnRlbnQ9XCJbXlwiXSpcIlxccypcXC8/Pi8sIGA8bWV0YSBuYW1lPVwiZGVzY3JpcHRpb25cIiBjb250ZW50PVwiJHtyb3V0ZS5kZXNjcmlwdGlvbn1cIiAvPmApXG4gICAgICAgICAgLnJlcGxhY2UoJzwvaGVhZD4nLCBoZWFkRXh0cmFzKTtcblxuICAgICAgICBpZiAocm91dGUucGF0aCA9PT0gXCIvXCIpIHtcbiAgICAgICAgICB3cml0ZUZpbGVTeW5jKHJlc29sdmUoZGlzdERpciwgJ2luZGV4Lmh0bWwnKSwgaHRtbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3Qgc2x1ZyA9IHJvdXRlLnBhdGguc2xpY2UoMSk7XG4gICAgICAgICAgY29uc3QgZGlyID0gcmVzb2x2ZShkaXN0RGlyLCBzbHVnKTtcbiAgICAgICAgICBta2RpclN5bmMoZGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgICAgICB3cml0ZUZpbGVTeW5jKHJlc29sdmUoZGlyLCAnaW5kZXguaHRtbCcpLCBodG1sKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCksIHNlb1BhZ2VzKCldLFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUN4QixTQUFTLFdBQVcsZUFBZSxvQkFBb0I7QUFIdkQsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTSxXQUFXO0FBRWpCLElBQU0sU0FBUztBQUFBLEVBQ2I7QUFBQSxJQUNFLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLGFBQWE7QUFBQSxFQUNmO0FBQUEsRUFDQTtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLEVBQ2Y7QUFBQSxFQUNBO0FBQUEsSUFDRSxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxhQUFhO0FBQUEsRUFDZjtBQUNGO0FBRUEsU0FBUyxXQUFXO0FBQ2xCLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLGNBQWM7QUFDWixZQUFNLFVBQVUsUUFBUSxrQ0FBVyxNQUFNO0FBQ3pDLFlBQU0sV0FBVyxhQUFhLFFBQVEsU0FBUyxZQUFZLEdBQUcsT0FBTztBQUNyRSxZQUFNLFVBQVUsR0FBRyxRQUFRO0FBRTNCLGlCQUFXLFNBQVMsUUFBUTtBQUMxQixjQUFNLFlBQVksR0FBRyxRQUFRLEdBQUcsTUFBTSxTQUFTLE1BQU0sTUFBTSxNQUFNLElBQUk7QUFDckUsY0FBTSxhQUFhLGlDQUFpQyxTQUFTO0FBQUEseUNBQzVCLE1BQU0sS0FBSztBQUFBLCtDQUNMLE1BQU0sV0FBVztBQUFBLHVDQUN6QixTQUFTO0FBQUEseUNBQ1AsT0FBTztBQUFBO0FBQUE7QUFBQSwwQ0FHTixNQUFNLEtBQUs7QUFBQSxnREFDTCxNQUFNLFdBQVc7QUFBQSwwQ0FDdkIsT0FBTztBQUFBO0FBR3pDLGNBQU0sT0FBTyxTQUNWLFFBQVEseUJBQXlCLFVBQVUsTUFBTSxLQUFLLFVBQVUsRUFDaEUsUUFBUSxtREFBbUQscUNBQXFDLE1BQU0sV0FBVyxNQUFNLEVBQ3ZILFFBQVEsV0FBVyxVQUFVO0FBRWhDLFlBQUksTUFBTSxTQUFTLEtBQUs7QUFDdEIsd0JBQWMsUUFBUSxTQUFTLFlBQVksR0FBRyxJQUFJO0FBQUEsUUFDcEQsT0FBTztBQUNMLGdCQUFNLE9BQU8sTUFBTSxLQUFLLE1BQU0sQ0FBQztBQUMvQixnQkFBTSxNQUFNLFFBQVEsU0FBUyxJQUFJO0FBQ2pDLG9CQUFVLEtBQUssRUFBRSxXQUFXLEtBQUssQ0FBQztBQUNsQyx3QkFBYyxRQUFRLEtBQUssWUFBWSxHQUFHLElBQUk7QUFBQSxRQUNoRDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGO0FBRUEsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7QUFDL0IsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
