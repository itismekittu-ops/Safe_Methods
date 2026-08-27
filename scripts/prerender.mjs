/**
 * Prerender script — runs after `vite build`.
 *
 * Starts the Vite preview server, uses Puppeteer to load each public
 * route, waits for the app to render (including Helmet meta tags),
 * then writes the full HTML to the corresponding file in dist/.
 * Also generates sitemap.xml from the live route list.
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import puppeteer from "puppeteer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const distDir = join(projectRoot, "dist");
const publicDir = join(projectRoot, "public");

const SITE_URL = "https://safemethods.com";

// Public marketing routes — single source of truth for prerendering + sitemap
const ROUTES = ["/", "/services", "/blog"];

const PREVIEW_PORT = 4173;

function generateSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = ROUTES.map((route) => {
    const loc = `${SITE_URL}${route === "/" ? "/" : route}`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === "/" ? "1.0" : "0.8"}</priority>
  </url>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  // Write into dist/ (the deployed output)
  writeFileSync(join(distDir, "sitemap.xml"), xml);
  // Also write into public/ so subsequent `vite build` runs carry it forward
  // even if prerender is skipped for some reason.
  writeFileSync(join(publicDir, "sitemap.xml"), xml);
  console.log("  -> sitemap.xml generated");
}

async function waitForServer(url) {
  for (let i = 0; i < 30; i++) {
    try {
      const resp = await fetch(url);
      if (resp.ok) return;
    } catch {
      // server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Preview server did not start in time");
}

async function main() {
  if (!existsSync(distDir)) {
    console.error("dist/ directory not found. Run `vite build` first.");
    process.exit(1);
  }

  // Generate sitemap from route list
  console.log("Generating sitemap.xml...");
  generateSitemap();

  // Start preview server in its own process group so we can kill the tree
  const previewProcess = spawn("npx", ["vite", "preview", "--port", String(PREVIEW_PORT), "--strictPort"], {
    cwd: projectRoot,
    stdio: "pipe",
    shell: true,
    detached: true,
  });

  const serverUrl = `http://localhost:${PREVIEW_PORT}/`;

  try {
    await waitForServer(serverUrl);

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    for (const route of ROUTES) {
      const page = await browser.newPage();
      const url = `http://localhost:${PREVIEW_PORT}${route}`;
      console.log(`Prerendering ${route}...`);

      await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
      await page.waitForSelector("title", { timeout: 10000 });
      await new Promise((resolve) => setTimeout(resolve, 500));

      const html = await page.content();

      // Write as directory-based index files so hosting platforms serve them
      // at their clean URL: /services -> /services/index.html
      let outPath;
      if (route === "/") {
        outPath = join(distDir, "index.html");
      } else {
        const dir = join(distDir, route.slice(1));
        mkdirSync(dir, { recursive: true });
        outPath = join(dir, "index.html");
      }
      writeFileSync(outPath, html);
      console.log(`  -> ${outPath}`);

      await page.close();
    }

    await browser.close();
    console.log("Prerendering complete.");
  } finally {
    // Kill the entire process group (npx + vite child)
    try {
      process.kill(-previewProcess.pid);
    } catch {
      // fallback if process group kill fails
      previewProcess.kill("SIGKILL");
    }
  }
}

main().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
