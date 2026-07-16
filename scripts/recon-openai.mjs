import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUT = {
  refs: "docs/design-references/openai.com",
  research: "docs/research/openai.com",
};
for (const d of Object.values(OUT)) fs.mkdirSync(d, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--disable-blink-features=AutomationControlled"],
});

async function captureViewport(width, height, label) {
  const context = await browser.newContext({
    viewport: { width, height },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  await page.goto("https://openai.com/", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(4000);

  // Dismiss cookie banners if present
  for (const sel of [
    'button:has-text("Accept")',
    'button:has-text("Accept all")',
    'button:has-text("Got it")',
    '[id*="onetrust-accept"]',
  ]) {
    const btn = page.locator(sel).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(500);
    }
  }

  // Full page screenshot
  await page.screenshot({
    path: path.join(OUT.refs, `full-${label}.png`),
    fullPage: true,
  });
  await page.screenshot({
    path: path.join(OUT.refs, `viewport-${label}.png`),
    fullPage: false,
  });

  const data = await page.evaluate(() => {
    const props = [
      "fontSize",
      "fontWeight",
      "fontFamily",
      "lineHeight",
      "letterSpacing",
      "color",
      "backgroundColor",
      "padding",
      "margin",
      "width",
      "height",
      "maxWidth",
      "display",
      "flexDirection",
      "justifyContent",
      "alignItems",
      "gap",
      "gridTemplateColumns",
      "borderRadius",
      "border",
      "boxShadow",
      "position",
      "top",
      "zIndex",
      "opacity",
      "transform",
      "transition",
      "objectFit",
      "backdropFilter",
    ];

    function extractStyles(el) {
      const cs = getComputedStyle(el);
      const styles = {};
      for (const p of props) {
        const v = cs[p];
        if (
          v &&
          v !== "none" &&
          v !== "normal" &&
          v !== "auto" &&
          v !== "0px" &&
          v !== "rgba(0, 0, 0, 0)"
        )
          styles[p] = v;
      }
      return styles;
    }

    // Section candidates: main children, or large top-level blocks
    const main =
      document.querySelector("main") ||
      document.querySelector("#__next") ||
      document.body;
    const sections = [...main.children].map((el, i) => {
      const rect = el.getBoundingClientRect();
      const text = (el.innerText || "").trim().slice(0, 400);
      return {
        index: i,
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        classes: (el.className?.toString() || "").slice(0, 200),
        role: el.getAttribute("role"),
        ariaLabel: el.getAttribute("aria-label"),
        top: Math.round(rect.top + window.scrollY),
        height: Math.round(rect.height),
        width: Math.round(rect.width),
        textPreview: text,
        childCount: el.children.length,
        hasVideo: !!el.querySelector("video"),
        imgCount: el.querySelectorAll("img").length,
        linkCount: el.querySelectorAll("a").length,
        heading:
          el.querySelector("h1,h2,h3")?.textContent?.trim()?.slice(0, 120) ||
          null,
        styles: extractStyles(el),
      };
    });

    // Also try semantic sections
    const semantic = [...document.querySelectorAll("section, header, footer, nav")].map(
      (el, i) => {
        const rect = el.getBoundingClientRect();
        return {
          index: i,
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          classes: (el.className?.toString() || "").slice(0, 200),
          top: Math.round(rect.top + window.scrollY),
          height: Math.round(rect.height),
          heading:
            el.querySelector("h1,h2,h3")?.textContent?.trim()?.slice(0, 120) ||
            null,
          textPreview: (el.innerText || "").trim().slice(0, 300),
        };
      }
    );

    const images = [...document.querySelectorAll("img")].map((img) => ({
      src: img.src || img.currentSrc,
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight,
      loading: img.loading,
    }));

    const videos = [...document.querySelectorAll("video")].map((v) => ({
      src: v.src || v.querySelector("source")?.src || null,
      poster: v.poster || null,
      autoplay: v.autoplay,
      loop: v.loop,
      muted: v.muted,
    }));

    const bgImages = [...document.querySelectorAll("*")]
      .filter((el) => {
        const bg = getComputedStyle(el).backgroundImage;
        return bg && bg !== "none" && bg.includes("url(");
      })
      .slice(0, 80)
      .map((el) => ({
        url: getComputedStyle(el).backgroundImage,
        tag: el.tagName,
        classes: (el.className?.toString() || "").slice(0, 100),
      }));

    const fonts = [
      ...new Set(
        [...document.querySelectorAll("h1,h2,h3,h4,p,a,button,span,li")]
          .slice(0, 300)
          .map((el) => getComputedStyle(el).fontFamily)
      ),
    ];

    const fontLinks = [...document.querySelectorAll('link[rel="stylesheet"], link[href*="font"]')].map(
      (l) => l.href
    );

    const favicons = [...document.querySelectorAll('link[rel*="icon"]')].map((l) => ({
      href: l.href,
      sizes: l.sizes?.toString(),
      type: l.type,
    }));

    // Color sampling from key elements
    const colorSamples = {};
    for (const sel of [
      "body",
      "header",
      "nav",
      "main",
      "h1",
      "h2",
      "p",
      "a",
      "button",
      "footer",
    ]) {
      const el = document.querySelector(sel);
      if (el) {
        const cs = getComputedStyle(el);
        colorSamples[sel] = {
          color: cs.color,
          backgroundColor: cs.backgroundColor,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          fontFamily: cs.fontFamily,
          lineHeight: cs.lineHeight,
          letterSpacing: cs.letterSpacing,
        };
      }
    }

    // Buttons
    const buttons = [...document.querySelectorAll("a, button")]
      .filter((el) => {
        const t = (el.innerText || "").trim();
        return t.length > 0 && t.length < 60;
      })
      .slice(0, 80)
      .map((el) => {
        const cs = getComputedStyle(el);
        return {
          text: (el.innerText || "").trim().slice(0, 60),
          href: el.href || null,
          tag: el.tagName.toLowerCase(),
          styles: {
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            color: cs.color,
            backgroundColor: cs.backgroundColor,
            borderRadius: cs.borderRadius,
            padding: cs.padding,
            border: cs.border,
          },
        };
      });

    const lenis = !!document.querySelector(".lenis, .locomotive-scroll");
    const htmlClasses = document.documentElement.className;
    const bodyClasses = document.body.className;

    // Meta
    const meta = {
      title: document.title,
      description:
        document.querySelector('meta[name="description"]')?.content || null,
      ogImage:
        document.querySelector('meta[property="og:image"]')?.content || null,
    };

    // Sticky/fixed elements
    const sticky = [...document.querySelectorAll("*")]
      .filter((el) => {
        const p = getComputedStyle(el).position;
        return p === "fixed" || p === "sticky";
      })
      .slice(0, 30)
      .map((el) => ({
        tag: el.tagName,
        classes: (el.className?.toString() || "").slice(0, 120),
        position: getComputedStyle(el).position,
        top: getComputedStyle(el).top,
        zIndex: getComputedStyle(el).zIndex,
        text: (el.innerText || "").trim().slice(0, 80),
      }));

    return {
      url: location.href,
      meta,
      fonts,
      fontLinks,
      favicons,
      colorSamples,
      sections,
      semantic,
      images,
      videos,
      bgImages,
      buttons,
      sticky,
      lenis,
      htmlClasses,
      bodyClasses,
      scrollHeight: document.documentElement.scrollHeight,
      viewport: { w: innerWidth, h: innerHeight },
    };
  });

  // Scroll sweep: capture header styles at top and after scroll
  const headerTop = await page.evaluate(() => {
    const h =
      document.querySelector("header") ||
      document.querySelector("nav") ||
      document.querySelector('[class*="header"]');
    if (!h) return null;
    const cs = getComputedStyle(h);
    return {
      backgroundColor: cs.backgroundColor,
      backdropFilter: cs.backdropFilter,
      boxShadow: cs.boxShadow,
      height: cs.height,
      position: cs.position,
      borderBottom: cs.borderBottom,
    };
  });

  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(800);

  const headerScrolled = await page.evaluate(() => {
    const h =
      document.querySelector("header") ||
      document.querySelector("nav") ||
      document.querySelector('[class*="header"]');
    if (!h) return null;
    const cs = getComputedStyle(h);
    return {
      backgroundColor: cs.backgroundColor,
      backdropFilter: cs.backdropFilter,
      boxShadow: cs.boxShadow,
      height: cs.height,
      position: cs.position,
      borderBottom: cs.borderBottom,
    };
  });

  // Section screenshots while scrolling
  const sectionTops = data.semantic
    .filter((s) => s.height > 80)
    .slice(0, 20);

  for (let i = 0; i < sectionTops.length; i++) {
    const s = sectionTops[i];
    await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 80)), s.top);
    await page.waitForTimeout(400);
    const name = (s.heading || s.tag || `section-${i}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);
    await page.screenshot({
      path: path.join(OUT.refs, `section-${String(i).padStart(2, "0")}-${name}-${label}.png`),
      fullPage: false,
    });
  }

  // Scroll to bottom for lazy content
  await page.evaluate(async () => {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    let y = 0;
    while (y < document.documentElement.scrollHeight) {
      y += 600;
      window.scrollTo(0, y);
      await delay(200);
    }
  });
  await page.waitForTimeout(2000);

  // Re-collect images after lazy load
  const moreAssets = await page.evaluate(() => ({
    images: [...document.querySelectorAll("img")].map((img) => ({
      src: img.src || img.currentSrc,
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight,
    })),
    videos: [...document.querySelectorAll("video")].map((v) => ({
      src: v.src || v.querySelector("source")?.src || null,
      poster: v.poster || null,
    })),
    sources: [...document.querySelectorAll("source")].map((s) => ({
      src: s.src,
      type: s.type,
    })),
  }));

  fs.writeFileSync(
    path.join(OUT.research, `recon-${label}.json`),
    JSON.stringify(
      {
        ...data,
        headerTop,
        headerScrolled,
        moreAssets,
      },
      null,
      2
    )
  );

  // HTML dump of body structure (shallow)
  const structureHtml = await page.evaluate(() => {
    function summarize(el, depth) {
      if (depth > 3) return "";
      const kids = [...el.children]
        .slice(0, 30)
        .map((c) => summarize(c, depth + 1))
        .join("");
      const cls = (el.className?.toString() || "")
        .split(/\s+/)
        .slice(0, 3)
        .join(".");
      const id = el.id ? `#${el.id}` : "";
      const h = el.querySelector(":scope > h1, :scope > h2, :scope > h3");
      const label = h ? ` "${h.textContent.trim().slice(0, 50)}"` : "";
      return `<${el.tagName.toLowerCase()}${id}${cls ? "." + cls : ""}${label}>${kids}</${el.tagName.toLowerCase()}>`;
    }
    const root =
      document.querySelector("main") ||
      document.querySelector("#__next") ||
      document.body;
    return summarize(root, 0);
  });
  fs.writeFileSync(
    path.join(OUT.research, `structure-${label}.txt`),
    structureHtml
  );

  await context.close();
  return data;
}

console.log("Capturing desktop 1440...");
const desktop = await captureViewport(1440, 900, "desktop");
console.log("Capturing mobile 390...");
const mobile = await captureViewport(390, 844, "mobile");
console.log("Capturing tablet 768...");
await captureViewport(768, 1024, "tablet");

fs.writeFileSync(
  path.join(OUT.research, "summary.json"),
  JSON.stringify(
    {
      title: desktop.meta?.title,
      sectionCount: desktop.sections?.length,
      semanticCount: desktop.semantic?.length,
      imageCount: desktop.moreAssets?.images?.length || desktop.images?.length,
      videoCount: desktop.videos?.length,
      fonts: desktop.fonts,
      headings: desktop.semantic?.map((s) => s.heading).filter(Boolean),
    },
    null,
    2
  )
);

await browser.close();
console.log("Recon complete.");
console.log("Title:", desktop.meta?.title);
console.log("Sections:", desktop.sections?.length);
console.log("Semantic:", desktop.semantic?.length);
console.log("Images:", desktop.images?.length);
console.log("Fonts:", desktop.fonts);
