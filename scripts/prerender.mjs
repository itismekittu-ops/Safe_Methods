import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, statSync } from "fs";
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
  console.log("[prerender] Starting prerender for routes:", ROUTES.join(", "));

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

  const template = rawTemplate
    .replace(/<title>[^<]*<\/title>\s*/, "")
    .replace(/<meta name="description" content="[^"]*"\s*\/?>[\s]*/, "");

  const writtenFiles = [];

  for (const route of ROUTES) {
    console.log(`[prerender] Rendering route: ${route}`);

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

    if (!headTags || headTags.trim().length === 0) {
      fail(`render("${route}") produced no head tags. SEO metadata would be missing.`);
    }

    console.log(`[prerender]   HTML length: ${html.length} chars, head tags length: ${headTags.length} chars`);

    let page = template;

    page = page.replace(
      '<div id="root"></div>',
      `<div id="root">${html}</div>`
    );

    page = page.replace("</head>", `    ${headTags}\n  </head>`);

    if (page.includes('<div id="root"></div>')) {
      fail(`Route "${route}": root div is still empty after injection.`);
    }

    const outPath =
      route === "/"
        ? resolve(distDir, "index.html")
        : resolve(distDir, route.slice(1), "index.html");

    if (route !== "/") {
      const outDir = dirname(outPath);
      mkdirSync(outDir, { recursive: true });
      console.log(`[prerender]   Created directory: ${outDir}`);
    }

    writeFileSync(outPath, page);
    writtenFiles.push({ route, outPath, expectedSize: page.length });
    console.log(`[prerender]   Wrote: ${outPath} (${page.length} bytes)`);
  }

  // Post-write verification: read every file back and confirm it has content
  console.log("\n[prerender] Verifying written files...");
  for (const { route, outPath, expectedSize } of writtenFiles) {
    if (!existsSync(outPath)) {
      fail(`Post-write check: ${outPath} does not exist after writing!`);
    }

    const stat = statSync(outPath);
    if (stat.size === 0) {
      fail(`Post-write check: ${outPath} is 0 bytes!`);
    }

    const content = readFileSync(outPath, "utf-8");

    if (content.includes('<div id="root"></div>')) {
      fail(`Post-write check: ${outPath} still has empty root div!`);
    }

    if (!content.includes('data-rh="true"')) {
      fail(`Post-write check: ${outPath} is missing Helmet-injected head tags!`);
    }

    console.log(`[prerender]   VERIFIED: ${route} -> ${outPath} (${stat.size} bytes on disk)`);
  }

  // Clean up SSR build
  rmSync(ssrDir, { recursive: true, force: true });
  console.log("\n[prerender] Cleaned up dist-ssr/");
  console.log(`[prerender] SUCCESS: ${ROUTES.length} routes prerendered and verified.\n`);
}

prerender().catch((err) => {
  console.error(`\n[prerender] FATAL: ${err.stack || err}\n`);
  process.exit(1);
});
