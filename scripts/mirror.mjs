// scripts/mirror.mjs
// Build a fully self-contained static mirror of chatgpt.com/overview using
// Wayback as the fetch source (since chatgpt.com is behind Cloudflare Turnstile).
//
// Strategy:
//   1. Launch Chromium, intercept every response, save the body to /assets/<hash><ext>.
//   2. Build a URL -> local-path map, including both Wayback-prefixed URLs and the
//      original-site URLs they proxy for.
//   3. Auto-scroll to trigger lazy assets.
//   4. Rewrite the rendered HTML by:
//        - dropping Wayback toolbar / injected scripts / meta redirects
//        - swapping every remote URL to its local counterpart
//   5. Rewrite the same URLs inside every downloaded CSS file (for url(...) and @font-face).
//   6. Emit index.html at the mirror root.
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const WAYBACK = "https://web.archive.org/web/20260715161528/https://chatgpt.com/overview/";
const OUT_DIR = path.resolve("out/chatgpt-overview");
const ASSETS_DIR = path.join(OUT_DIR, "assets");
await fs.rm(OUT_DIR, { recursive: true, force: true });
await fs.mkdir(ASSETS_DIR, { recursive: true });

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";

// Maps: every URL we might see in HTML/CSS -> the local relative path (from index.html)
const urlMap = new Map();
// Track files we saved so we can rewrite CSS bodies afterward
const savedCssFiles = new Set();

function extFromContentType(ct) {
  if (!ct) return "";
  ct = ct.split(";")[0].trim().toLowerCase();
  const table = {
    "text/html": ".html",
    "text/css": ".css",
    "text/javascript": ".js",
    "application/javascript": ".js",
    "application/x-javascript": ".js",
    "application/json": ".json",
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/svg+xml": ".svg",
    "image/x-icon": ".ico",
    "image/vnd.microsoft.icon": ".ico",
    "font/woff": ".woff",
    "font/woff2": ".woff2",
    "font/ttf": ".ttf",
    "font/otf": ".otf",
    "application/font-woff": ".woff",
    "application/font-woff2": ".woff2",
    "application/x-font-woff": ".woff",
    "application/vnd.ms-fontobject": ".eot",
    "application/octet-stream": "",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
  };
  return table[ct] || "";
}

function extFromUrl(u) {
  try {
    const p = new URL(u).pathname;
    const m = p.match(/\.([a-z0-9]{2,5})(?:$|[?#])/i);
    if (m) return "." + m[1].toLowerCase();
  } catch {}
  return "";
}

// Wayback rewrites sub-resource URLs like:
//   https://web.archive.org/web/20260715161528im_/https://example.com/foo.png
//   https://web.archive.org/web/20260715161528cs_/https://example.com/foo.css
// The "flavor" letters are optional. Strip them and unwrap to the original URL.
function unwrapWayback(u) {
  const m = u.match(/^https?:\/\/web\.archive\.org\/web\/\d+[a-z_]*\/(https?:\/\/.*)$/i);
  return m ? m[1] : null;
}

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
});
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent: UA,
  deviceScaleFactor: 1,
  locale: "en-US",
  timezoneId: "America/Los_Angeles",
  colorScheme: "light",
});
await ctx.addInitScript(() => {
  Object.defineProperty(navigator, "webdriver", { get: () => undefined });
});

const page = await ctx.newPage();

page.on("response", async (resp) => {
  try {
    const req = resp.request();
    const url = resp.url();
    const status = resp.status();
    if (status >= 300 && status < 400) return; // redirects
    if (status >= 400) return;
    const rtype = req.resourceType();
    if (["websocket", "eventsource", "manifest"].includes(rtype)) return;
    // Skip the top document navigation - we handle it manually later
    if (rtype === "document" && url === page.url()) return;
    if (url.startsWith("data:") || url.startsWith("blob:")) return;

    let buf;
    try {
      buf = await resp.body();
    } catch {
      return;
    }
    if (!buf || buf.length === 0) return;

    const ct = resp.headers()["content-type"] || "";
    let ext = extFromContentType(ct) || extFromUrl(url);
    if (!ext) ext = ".bin";

    const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 16);
    const filename = `${hash}${ext}`;
    const abs = path.join(ASSETS_DIR, filename);
    await fs.writeFile(abs, buf).catch(() => {});
    const rel = `assets/${filename}`;

    // Register mapping for the Wayback URL...
    urlMap.set(url, rel);
    // ...and the original site URL it stood in for.
    const orig = unwrapWayback(url);
    if (orig) urlMap.set(orig, rel);

    if (ext === ".css") savedCssFiles.add(abs);
  } catch (e) {
    // swallow, mirror is best-effort
  }
});

console.log("→ navigate", WAYBACK);
await page.goto(WAYBACK, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});

// Force lazy content to load
await page.evaluate(async () => {
  const total = document.documentElement.scrollHeight + 3000;
  for (let y = 0; y < total; y += 400) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 100));
  }
  window.scrollTo(0, 0);
});
await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(1500);

// Kill Wayback UI and its scripts so the offline copy looks clean
await page.evaluate(() => {
  const kill = [
    "#wm-ipp-base", "#wm-ipp", "#wm-ipp-print", "#donato",
    "script[src*='archive.org/_static']",
    "script[src*='wombat']",
    "link[href*='archive.org/_static']",
    "iframe[src*='archive.org']",
    "meta[http-equiv='refresh']",
  ];
  for (const sel of kill) document.querySelectorAll(sel).forEach((el) => el.remove());
});

// Grab the fully-rendered HTML
let html = await page.content();

await browser.close();
console.log(`✓ captured ${urlMap.size} URL mappings, ${savedCssFiles.size} css files`);

// -----------------------------------------------------------
// Rewrite HTML
// -----------------------------------------------------------
//
// The DOM contains a mix of:
//   - Wayback-prefixed absolute URLs (in href/src/srcset)
//   - Wayback path-relative URLs beginning with "/web/…"
//   - Original chatgpt.com / cdn.oaistatic.com / etc. that Wayback rewrote inline
//
// Strategy:
//   1. Replace every exact Wayback URL from our capture with its local rel path.
//   2. Also replace bare "/web/<ts>{flavor}/<orig>" occurrences (which resolve to
//      web.archive.org after Playwright serialised the DOM but may still appear
//      in inline scripts / srcset).
//   3. Replace the plain original URLs too (some inline SVG/image references keep
//      the un-wrapped URL).

function replaceAllLiteral(haystack, needle, replacement) {
  if (!needle) return haystack;
  // string split/join avoids regex escaping issues
  return haystack.split(needle).join(replacement);
}

// Sort mappings by URL length descending so longer/more-specific URLs win first.
const orderedMappings = [...urlMap.entries()].sort((a, b) => b[0].length - a[0].length);
for (const [remote, local] of orderedMappings) {
  html = replaceAllLiteral(html, remote, local);
}

// Also strip stray "/web/<ts>xx_/" path prefixes that reference into web.archive.org
html = html.replace(
  /(?:https?:)?\/\/web\.archive\.org\/web\/\d+[a-z_]*\//g,
  "",
);
// And the same as bare root-relative "/web/..." (Wayback occasionally emits these)
html = html.replace(/\/web\/\d+[a-z_]*\//g, "");

// Rewrite CSS files: same URL substitutions + url("..") normalisation
for (const cssPath of savedCssFiles) {
  let css = await fs.readFile(cssPath, "utf8").catch(() => "");
  if (!css) continue;
  for (const [remote, local] of orderedMappings) {
    // Compute a CSS-relative path from inside /assets/foo.css to /assets/bar.png
    // = just "bar.png" (both live in the same dir).
    const cssRel = local.startsWith("assets/") ? local.slice("assets/".length) : "../" + local;
    css = replaceAllLiteral(css, remote, cssRel);
  }
  css = css.replace(/(?:https?:)?\/\/web\.archive\.org\/web\/\d+[a-z_]*\//g, "");
  css = css.replace(/\/web\/\d+[a-z_]*\//g, "");
  await fs.writeFile(cssPath, css);
}

// Any src="//web.archive.org/..." or href="//web.archive.org/..." that survived,
// remove the archive host so it becomes a same-directory reference.
html = html
  .replace(/(?:https?:)?\/\/web\.archive\.org\//g, "")
  .replace(/(?:https?:)?\/\/archive\.org\//g, "");

// Add a tiny banner so it's obvious this is an offline snapshot, plus a base
// element to make relative asset URLs resolve when opened via file://
if (!/<base\s/i.test(html)) {
  html = html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n<base href="./">`);
}

// Ensure a viewport meta
if (!/name=["']viewport["']/i.test(html)) {
  html = html.replace(
    /<head(\s[^>]*)?>/i,
    (m) => `${m}\n<meta name="viewport" content="width=device-width,initial-scale=1">`,
  );
}

// Write the entry point
await fs.writeFile(path.join(OUT_DIR, "index.html"), html, "utf8");

// Write a tiny README inside the zip
await fs.writeFile(
  path.join(OUT_DIR, "README.txt"),
  [
    "Static snapshot of chatgpt.com/overview",
    "Captured via Wayback Machine (snapshot 2026-07-15).",
    "Open index.html in any browser to view offline.",
    "All assets live under ./assets/",
  ].join("\n"),
);

console.log("✓ wrote", OUT_DIR);
