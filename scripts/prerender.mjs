import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const distDir = resolve(root, "dist");
const ssrDir = resolve(root, "dist-ssr");

const ROUTES = ["/", "/services", "/blog", "/privacy-policy"];

function fail(msg) {
  console.error(`\n[prerender] FATAL: ${msg}\n`);
  process.exit(1);
}

async function prerender() {
  const ssrEntry = resolve(ssrDir, "entry-server.js");
  if (!existsSync(ssrEntry)) {
    fail(`SSR bundle not found at ${ssrEntry}. Did the SSR build run?`);
  }

  const templatePath = resolve(distDir, "index.html");
  if (!existsSync(templatePath)) {
    fail(`Client build template not found at ${templatePath}. Did the client build run?`);
  }

  const { render } = await import(ssrEntry);
  if (typeof render !== "function") {
    fail(`entry-server.js does not export a "render" function.`);
  }

  const rawTemplate = readFileSync(templatePath, "utf-8");

  if (!rawTemplate.includes('<div id="root"></div>')) {
    fail(`Template does not contain '<div id="root"></div>'. Cannot inject content.`);
  }

  // Strip the template's default title and meta description so Helmet's
  // per-route versions are the only ones present.
  const template = rawTemplate
    .replace(/<title>[^<]*<\/title>\s*/, "")
    .replace(/<meta name="description" content="[^"]*"\s*\/?>[\s]*/, "");

  for (const route of ROUTES) {
    let result;
    try {
      result = render(route);
    } catch (err) {
      fail(`render("${route}") threw: ${err.stack || err}`);
    }

    const { html, headTags } = result;

    if (!html || html.trim().length === 0) {
      fail(`render("${route}") returned empty HTML. SSR produced no content.`);
    }

    let page = template;

    // Inject rendered HTML into root div
    page = page.replace(
      '<div id="root"></div>',
      `<div id="root">${html}</div>`
    );

    // Inject head tags before </head>
    if (headTags && headTags.trim().length > 0) {
      page = page.replace("</head>", `    ${headTags}\n  </head>`);
    } else {
      fail(`render("${route}") produced no head tags. SEO metadata would be missing.`);
    }

    // Verify critical content was injected
    if (page.includes('<div id="root"></div>')) {
      fail(`Route "${route}": root div is still empty after injection.`);
    }

    // Write output
    const outPath =
      route === "/"
        ? resolve(distDir, "index.html")
        : resolve(distDir, route.slice(1), "index.html");

    if (route !== "/") {
      mkdirSync(dirname(outPath), { recursive: true });
    }

    writeFileSync(outPath, page);
    console.log(`  Prerendered: ${route} -> ${outPath}`);
  }

  // Clean up SSR build
  rmSync(ssrDir, { recursive: true, force: true });
  console.log("  Cleaned up dist-ssr/");
  console.log(`  Prerendering complete: ${ROUTES.length} routes written.`);
}

prerender().catch((err) => {
  console.error(`\n[prerender] FATAL: ${err.stack || err}\n`);
  process.exit(1);
});
