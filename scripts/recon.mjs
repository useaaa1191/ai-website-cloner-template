// scripts/recon.mjs
// Full recon pass for a target URL using Playwright.
// - Full-page screenshots at desktop/tablet/mobile
// - Section screenshots
// - HTML dump
// - Asset enumeration (images, videos, backgrounds, svgs, fonts, favicons)
// - Computed styles for anchor elements
// - Interaction sweep hints (scroll-triggered header, hover)
import { chromium, devices } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const URL_TARGET =
  process.env.URL ||
  "https://web.archive.org/web/20260715161528/https://chatgpt.com/overview/";
// Logical host used for output paths (the site we care about, not archive.org)
const HOST = "chatgpt.com";
const OUT = "docs/research";
const IMG = "docs/design-references";
const HOSTDIR = path.join(IMG, HOST);
await fs.mkdir(HOSTDIR, { recursive: true });
await fs.mkdir(path.join(OUT, HOST), { recursive: true });
await fs.mkdir("docs/research/components", { recursive: true });

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";

const browser = await chromium.launch({
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-blink-features=AutomationControlled",
  ],
});

async function newCtx(viewport, isMobile = false) {
  const ctx = await browser.newContext({
    viewport,
    userAgent: UA,
    deviceScaleFactor: 2,
    isMobile,
    hasTouch: isMobile,
    locale: "en-US",
    timezoneId: "America/Los_Angeles",
    javaScriptEnabled: true,
    colorScheme: "light",
  });
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
    window.chrome = { runtime: {} };
  });
  return ctx;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = 400;
      const t = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total >= document.documentElement.scrollHeight + 2000) {
          clearInterval(t);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 120);
    });
  });
  await page.waitForTimeout(600);
}

async function shot(page, filename) {
  const p = path.join(HOSTDIR, filename);
  await page.screenshot({ path: p, fullPage: true });
  return p;
}

async function saveText(rel, content) {
  const p = path.join(OUT, HOST, rel);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, content, "utf8");
  return p;
}

const results = { host: HOST, url: URL_TARGET, viewports: {} };

// ---------- Desktop pass ----------
{
  const ctx = await newCtx({ width: 1440, height: 900 });
  const page = await ctx.newPage();
  console.log("→ desktop navigate");
  await page.goto(URL_TARGET, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1500);

  // Save final URL (after redirects)
  results.finalUrl = page.url();
  console.log("  final URL", results.finalUrl);

  // Hide Wayback toolbar so it doesn't corrupt screenshots
  await page.addStyleTag({
    content: `#wm-ipp-base, #wm-ipp-print, #wm-ipp, #donato { display: none !important; visibility: hidden !important; }`,
  });

  // Save raw HTML
  const html = await page.content();
  await saveText("desktop.html", html);

  await autoScroll(page);
  await shot(page, "full-desktop.png");

  // Header top and header scrolled
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(HOSTDIR, "header-top.png"),
    clip: { x: 0, y: 0, width: 1440, height: 140 },
  });
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(HOSTDIR, "header-scrolled.png"),
    clip: { x: 0, y: 0, width: 1440, height: 140 },
  });
  await page.evaluate(() => window.scrollTo(0, 0));

  // Enumerate assets, fonts, colors, layout blocks
  const assets = await page.evaluate(() => {
    const abs = (u) => { try { return new URL(u, location.href).href; } catch { return u; } };
    const imgs = [...document.querySelectorAll("img")].map((img) => ({
      src: abs(img.currentSrc || img.src),
      srcset: img.srcset || null,
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight,
      loading: img.loading,
      position: getComputedStyle(img).position,
    }));
    const videos = [...document.querySelectorAll("video")].map((v) => ({
      src: v.src || v.querySelector("source")?.src,
      poster: v.poster,
      autoplay: v.autoplay,
      loop: v.loop,
      muted: v.muted,
    }));
    const bgImgs = [];
    document.querySelectorAll("*").forEach((el) => {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== "none") {
        const urls = [...bg.matchAll(/url\(("|')?([^)'"]+)("|')?\)/g)].map((m) => m[2]);
        urls.forEach((u) =>
          bgImgs.push({ url: abs(u), el: el.tagName + "." + (el.className?.toString().split(" ")[0] || "") })
        );
      }
    });
    const links = [...document.querySelectorAll("link")].map((l) => ({
      rel: l.rel,
      href: l.href,
      type: l.type,
      as: l.as,
      sizes: l.sizes?.toString(),
    }));
    // Deduped set of fonts actually used on the page (sampling first 400 elements)
    const fontSet = new Set();
    [...document.querySelectorAll("*")].slice(0, 400).forEach((el) => {
      const cs = getComputedStyle(el);
      fontSet.add(cs.fontFamily);
    });
    // Color palette sample
    const colorSet = new Set();
    const bgSet = new Set();
    [...document.querySelectorAll("*")].slice(0, 800).forEach((el) => {
      const cs = getComputedStyle(el);
      colorSet.add(cs.color);
      bgSet.add(cs.backgroundColor);
    });
    return {
      images: imgs,
      videos,
      backgroundImages: bgImgs,
      links,
      fontFamilies: [...fontSet],
      colors: [...colorSet],
      backgrounds: [...bgSet],
      title: document.title,
      lang: document.documentElement.lang,
    };
  });
  await saveText("assets.json", JSON.stringify(assets, null, 2));

  // Grab textual outline: headings + list of top-level sections
  const outline = await page.evaluate(() => {
    const headings = [...document.querySelectorAll("h1,h2,h3,h4")].map((h) => ({
      tag: h.tagName,
      text: h.textContent.trim().slice(0, 200),
    }));
    // Try to find nav links
    const navLinks = [...document.querySelectorAll("nav a, header a")].map((a) => ({
      text: a.textContent.trim(),
      href: a.href,
    }));
    // top-level sections: children of main or body
    const root = document.querySelector("main") || document.body;
    const sections = [...root.children].map((el) => ({
      tag: el.tagName,
      classes: el.className?.toString(),
      id: el.id,
      childCount: el.children.length,
      hText: el.querySelector("h1,h2,h3")?.textContent?.trim()?.slice(0, 120),
      hasVideo: !!el.querySelector("video"),
      hasImg: !!el.querySelector("img"),
    }));
    return { headings, navLinks, sections };
  });
  await saveText("outline.json", JSON.stringify(outline, null, 2));

  // Section-by-section screenshots for the top-level blocks
  const rectInfo = await page.evaluate(() => {
    const root = document.querySelector("main") || document.body;
    return [...root.children].map((el, i) => {
      const r = el.getBoundingClientRect();
      const top = window.scrollY + r.top;
      return { i, top, height: r.height };
    });
  });
  for (const s of rectInfo) {
    if (s.height < 40 || s.height > 4000) continue;
    await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 20)), s.top);
    await page.waitForTimeout(200);
    const clipH = Math.min(Math.floor(s.height), 1200);
    await page.screenshot({
      path: path.join(HOSTDIR, `section-${String(s.i).padStart(2, "0")}.png`),
      clip: { x: 0, y: 0, width: 1440, height: clipH },
    });
  }

  results.viewports.desktop = { ok: true };
  await ctx.close();
}

// ---------- Tablet ----------
{
  const ctx = await newCtx({ width: 820, height: 1180 }, true);
  const page = await ctx.newPage();
  await page.goto(URL_TARGET, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});
  await page.addStyleTag({ content: `#wm-ipp-base,#wm-ipp-print,#wm-ipp,#donato{display:none!important}` });
  await autoScroll(page);
  await shot(page, "full-tablet.png");
  await ctx.close();
}

// ---------- Mobile ----------
{
  const ctx = await newCtx({ width: 390, height: 844 }, true);
  const page = await ctx.newPage();
  await page.goto(URL_TARGET, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});
  await page.addStyleTag({ content: `#wm-ipp-base,#wm-ipp-print,#wm-ipp,#donato{display:none!important}` });
  await autoScroll(page);
  await shot(page, "full-mobile.png");
  await ctx.close();
}

await browser.close();

await saveText("recon-summary.json", JSON.stringify(results, null, 2));
console.log("✓ recon done for", HOST);
