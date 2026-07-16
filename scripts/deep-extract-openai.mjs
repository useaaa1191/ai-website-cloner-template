import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUT = "docs/research/openai.com";
const REFS = "docs/design-references/openai.com";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(REFS, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
});
const page = await context.newPage();
page.setDefaultTimeout(60000);

await page.goto("https://openai.com/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(5000);

// Accept cookies
for (const sel of ['button:has-text("Accept")', '[id*="onetrust-accept"]']) {
  const btn = page.locator(sel).first();
  if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {});
}

const props = [
  "fontSize", "fontWeight", "fontFamily", "lineHeight", "letterSpacing", "color",
  "textTransform", "backgroundColor", "background", "padding", "paddingTop",
  "paddingRight", "paddingBottom", "paddingLeft", "margin", "marginTop",
  "marginBottom", "width", "height", "maxWidth", "minWidth", "maxHeight",
  "display", "flexDirection", "justifyContent", "alignItems", "gap",
  "gridTemplateColumns", "gridTemplateRows", "borderRadius", "border",
  "borderTop", "borderBottom", "boxShadow", "overflow", "position", "top",
  "right", "bottom", "left", "zIndex", "opacity", "transform", "transition",
  "objectFit", "objectPosition", "backdropFilter", "whiteSpace", "cursor",
];

const deep = await page.evaluate((props) => {
  function styles(el) {
    const cs = getComputedStyle(el);
    const out = {};
    for (const p of props) {
      const v = cs[p];
      if (v && v !== "none" && v !== "normal" && v !== "auto" && v !== "0px" && v !== "rgba(0, 0, 0, 0)" && v !== "rgba(0,0,0,0)")
        out[p] = v;
    }
    return out;
  }

  function walk(el, depth, maxDepth = 4) {
    if (!el || depth > maxDepth) return null;
    const children = [...el.children];
    const textDirect = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .filter(Boolean)
      .join(" ");
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || undefined,
      classes: (el.className?.toString() || "").split(/\s+/).filter(Boolean).slice(0, 8).join(" "),
      role: el.getAttribute("role") || undefined,
      ariaLabel: el.getAttribute("aria-label") || undefined,
      href: el.href || undefined,
      text: textDirect.slice(0, 200) || undefined,
      textAll: (el.innerText || "").trim().slice(0, 500) || undefined,
      styles: styles(el),
      img:
        el.tagName === "IMG"
          ? { src: el.currentSrc || el.src, alt: el.alt, w: el.naturalWidth, h: el.naturalHeight }
          : undefined,
      video:
        el.tagName === "VIDEO"
          ? {
              src: el.currentSrc || el.src || el.querySelector("source")?.src,
              poster: el.poster,
              autoplay: el.autoplay,
              loop: el.loop,
              muted: el.muted,
            }
          : undefined,
      childCount: children.length,
      children: children.slice(0, 25).map((c) => walk(c, depth + 1, maxDepth)).filter(Boolean),
    };
  }

  const article = document.querySelector("main article") || document.querySelector("article");
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");
  const nav = document.querySelector("header nav") || document.querySelector("nav");

  // Top-level article blocks
  const blocks = article
    ? [...article.children].map((el, i) => {
        const rect = el.getBoundingClientRect();
        return {
          index: i,
          top: Math.round(rect.top + scrollY),
          height: Math.round(rect.height),
          width: Math.round(rect.width),
          heading: el.querySelector("h1,h2,h3")?.textContent?.trim() || null,
          textPreview: (el.innerText || "").trim().slice(0, 600),
          hasVideo: !!el.querySelector("video"),
          imgCount: el.querySelectorAll("img").length,
          videoSrcs: [...el.querySelectorAll("video")].map(
            (v) => v.currentSrc || v.src || v.querySelector("source")?.src
          ),
          imgSrcs: [...el.querySelectorAll("img")].map((img) => ({
            src: img.currentSrc || img.src,
            alt: img.alt,
            w: img.naturalWidth,
            h: img.naturalHeight,
          })),
          tree: walk(el, 0, 3),
        };
      })
    : [];

  // All headings with positions
  const headings = [...document.querySelectorAll("h1,h2,h3,h4")].map((h) => {
    const r = h.getBoundingClientRect();
    return {
      tag: h.tagName,
      text: h.textContent.trim(),
      top: Math.round(r.top + scrollY),
      styles: styles(h),
    };
  });

  // Suggestion chips / pills under hero
  const pills = [...document.querySelectorAll("a,button")]
    .filter((el) => {
      const cs = getComputedStyle(el);
      const br = parseFloat(cs.borderRadius);
      const t = (el.innerText || "").trim();
      return br > 20 && t.length > 0 && t.length < 80;
    })
    .slice(0, 60)
    .map((el) => ({
      text: el.innerText.trim().replace(/\s+/g, " "),
      href: el.href || null,
      styles: styles(el),
    }));

  // SVG icons (outerHTML truncated)
  const svgs = [...document.querySelectorAll("svg")]
    .slice(0, 40)
    .map((svg, i) => ({
      index: i,
      viewBox: svg.getAttribute("viewBox"),
      width: svg.getAttribute("width") || getComputedStyle(svg).width,
      height: svg.getAttribute("height") || getComputedStyle(svg).height,
      ariaLabel: svg.getAttribute("aria-label"),
      parentText: (svg.parentElement?.innerText || "").trim().slice(0, 40),
      html: svg.outerHTML.slice(0, 800),
    }));

  // Font face URLs from stylesheets
  const fontUrls = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules || []) {
        if (rule instanceof CSSFontFaceRule) {
          fontUrls.push({
            family: rule.style.fontFamily,
            src: rule.style.src,
            weight: rule.style.fontWeight,
            style: rule.style.fontStyle,
          });
        }
      }
    } catch {}
  }

  return {
    header: header ? walk(header, 0, 4) : null,
    nav: nav ? walk(nav, 0, 3) : null,
    footer: footer ? walk(footer, 0, 3) : null,
    blocks,
    headings,
    pills,
    svgs,
    fontUrls: fontUrls.slice(0, 30),
    bodyStyles: styles(document.body),
    cssVars: (() => {
      const cs = getComputedStyle(document.documentElement);
      const vars = {};
      for (const name of [
        "--background", "--foreground", "--header-h", "--max-h",
        "--page-top-space", "--radius",
      ]) {
        const v = cs.getPropertyValue(name);
        if (v) vars[name] = v.trim();
      }
      // Collect custom props used on body/main
      return vars;
    })(),
  };
}, props);

fs.writeFileSync(path.join(OUT, "deep-extract.json"), JSON.stringify(deep, null, 2));

// Screenshot each article block
for (const block of deep.blocks || []) {
  await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 60)), block.top);
  await page.waitForTimeout(500);
  const name = (block.heading || `block-${block.index}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);
  await page.screenshot({
    path: path.join(REFS, `block-${String(block.index).padStart(2, "0")}-${name}.png`),
    fullPage: false,
  });
}

// Header at top + scrolled
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(REFS, "header-top.png"), clip: { x: 0, y: 0, width: 1440, height: 80 } });

await page.evaluate(() => window.scrollTo(0, 300));
await page.waitForTimeout(600);
const headerStates = await page.evaluate(() => {
  const h = document.querySelector("header");
  if (!h) return null;
  const cs = getComputedStyle(h);
  return {
    scrolled: {
      backgroundColor: cs.backgroundColor,
      backdropFilter: cs.backdropFilter,
      boxShadow: cs.boxShadow,
      height: cs.height,
      borderBottom: cs.borderBottom,
    },
  };
});
await page.screenshot({ path: path.join(REFS, "header-scrolled.png"), clip: { x: 0, y: 0, width: 1440, height: 80 } });

// Hover states on key pills
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);

const hoverTests = [];
const chipLocator = page.locator('a:has-text("Research"), a:has-text("Talk with ChatGPT"), a:has-text("Try ChatGPT")').first();
if (await chipLocator.count()) {
  const before = await chipLocator.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { bg: cs.backgroundColor, color: cs.color, border: cs.border, transform: cs.transform };
  });
  await chipLocator.hover();
  await page.waitForTimeout(300);
  const after = await chipLocator.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { bg: cs.backgroundColor, color: cs.color, border: cs.border, transform: cs.transform };
  });
  hoverTests.push({ el: "first-chip-or-cta", before, after });
}

// Nav mega menu - hover Research
const researchNav = page.locator('header a:has-text("Research"), nav a:has-text("Research")').first();
if (await researchNav.isVisible().catch(() => false)) {
  await researchNav.hover();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(REFS, "nav-research-hover.png"), fullPage: false });
  const menuText = await page.evaluate(() => {
    // Find visible dropdown/panel
    const panels = [...document.querySelectorAll('[role="menu"], [data-state="open"], dialog, [class*="dropdown"], [class*="mega"]')]
      .filter((el) => {
        const cs = getComputedStyle(el);
        return cs.visibility !== "hidden" && cs.opacity !== "0" && el.getBoundingClientRect().height > 40;
      })
      .map((el) => (el.innerText || "").trim().slice(0, 800));
    return panels;
  });
  fs.writeFileSync(path.join(OUT, "nav-menus.json"), JSON.stringify({ research: menuText }, null, 2));
}

// Click "More" chip if present
const moreBtn = page.locator('button:has-text("More"), a:has-text("More")').first();
if (await moreBtn.isVisible().catch(() => false)) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await moreBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(REFS, "hero-more-open.png"), fullPage: false });
  const moreContent = await page.evaluate(() => {
    // capture newly visible content near hero
    return (document.body.innerText || "").slice(0, 2000);
  });
  fs.writeFileSync(path.join(OUT, "more-click.txt"), moreContent);
}

fs.writeFileSync(
  path.join(OUT, "behaviors-raw.json"),
  JSON.stringify({ headerStates, hoverTests }, null, 2)
);

// Collect all network image/video URLs from performance
const assetUrls = await page.evaluate(() => {
  return performance
    .getEntriesByType("resource")
    .filter((r) => /\.(png|jpe?g|webp|gif|svg|mp4|webm|woff2?)(\?|$)/i.test(r.name) || r.name.includes("ctfassets") || r.name.includes("image"))
    .map((r) => ({ url: r.name, type: r.initiatorType, size: r.transferSize }));
});
fs.writeFileSync(path.join(OUT, "network-assets.json"), JSON.stringify(assetUrls, null, 2));

console.log("Blocks:", deep.blocks?.length);
console.log(
  "Headings:",
  deep.headings?.map((h) => `${h.tag}: ${h.text}`).join(" | ")
);
console.log("Pills:", deep.pills?.length);
console.log("SVGs:", deep.svgs?.length);
console.log("Font faces:", deep.fontUrls?.length);
console.log("Network assets:", assetUrls.length);

await browser.close();
