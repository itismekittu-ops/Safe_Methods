import { readFileSync, writeFileSync, mkdirSync, rmSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const distDir = resolve(root, "dist");
const ssrDir = resolve(root, "dist-ssr");

const ROUTES = ["/", "/services", "/blog", "/privacy-policy"];

async function prerender() {
  const { render } = await import(resolve(ssrDir, "entry-server.js"));
  const rawTemplate = readFileSync(resolve(distDir, "index.html"), "utf-8");

  // Strip the template's default title and meta description so Helmet's
  // per-route versions are the only ones present.
  const template = rawTemplate
    .replace(/<title>[^<]*<\/title>\s*/, "")
    .replace(/<meta name="description" content="[^"]*"\s*\/?>[\s]*/, "");

  for (const route of ROUTES) {
    const { html, headTags } = render(route);

    let page = template;

    // Inject rendered HTML into root div
    page = page.replace(
      '<div id="root"></div>',
      `<div id="root">${html}</div>`
    );

    // Inject head tags before </head>
    if (headTags) {
      page = page.replace("</head>", `    ${headTags}\n  </head>`);
    }

    // Write output
    if (route === "/") {
      writeFileSync(resolve(distDir, "index.html"), page);
    } else {
      const slug = route.slice(1);
      const dir = resolve(distDir, slug);
      mkdirSync(dir, { recursive: true });
      writeFileSync(resolve(dir, "index.html"), page);
    }

    console.log(`  Prerendered: ${route}`);
  }

  // Clean up SSR build
  rmSync(ssrDir, { recursive: true, force: true });
  console.log("  Cleaned up dist-ssr/");
}

prerender().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
