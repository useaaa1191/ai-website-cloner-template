import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
})).newPage();

await page.goto("https://openai.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(3000);
await page.keyboard.press("Escape");

// Slow scroll to load lazy images
await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
    window.scrollTo(0, y);
    await sleep(250);
  }
  window.scrollTo(0, 0);
  await sleep(500);
});
await page.waitForTimeout(2000);

const data = await page.evaluate(() => {
  function abs(u) {
    try { return new URL(u, location.origin).href; } catch { return u; }
  }

  function cardFromAnchor(a) {
    const img = a.querySelector("img");
    const video = a.querySelector("video");
    const lines = (a.innerText || "").trim().split("\n").map((l) => l.trim()).filter(Boolean);
    // Also try picture sources
    const sources = [...a.querySelectorAll("source")].map((s) => abs(s.srcset?.split(" ")[0] || s.src));
    return {
      href: a.href,
      title: lines[0] || null,
      lines,
      imgSrc: img ? abs(img.currentSrc || img.src) : sources[0] || null,
      imgAlt: img?.alt || "",
      videoSrc: video ? abs(video.currentSrc || video.src || video.querySelector("source")?.src) : null,
      poster: video?.poster ? abs(video.poster) : null,
      rect: (() => {
        const r = a.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height) };
      })(),
    };
  }

  const article = document.querySelector("main article");
  const blocks = [...article.children];

  function sectionCards(block) {
    const heading = block.querySelector("h2")?.textContent?.trim();
    const view = [...block.querySelectorAll("a")].find((a) => /view (more|all)/i.test(a.innerText));
    // Get all anchors with substantial text that aren't view-more
    const anchors = [...block.querySelectorAll("a")].filter((a) => {
      const t = (a.innerText || "").trim();
      return t.length > 10 && !/view (more|all)/i.test(t);
    });
    // Prefer ones with media; if none, take all
    let withMedia = anchors.filter((a) => a.querySelector("img,video,picture"));
    if (withMedia.length === 0) withMedia = anchors;
    const cards = withMedia.map(cardFromAnchor);
    // dedupe by title
    const seen = new Set();
    const unique = cards.filter((c) => {
      const k = c.title || c.href;
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    return {
      heading,
      viewMore: view ? { text: view.innerText.trim(), href: view.href } : null,
      cards: unique,
      // Also dump all img srcs in block
      allImgs: [...block.querySelectorAll("img")].map((img) => ({
        src: abs(img.currentSrc || img.src),
        alt: img.alt,
        w: img.naturalWidth,
        h: img.naturalHeight,
      })),
    };
  }

  // Hero chips with Learn about
  const hero = blocks[0];
  // Click More via JS to reveal extra chips
  const moreBtn = hero.querySelector('[data-analytics="home-splash-show-more"]');
  if (moreBtn) moreBtn.click();

  return {
    featured: sectionCards(blocks[1]),
    news: sectionCards(blocks[2]),
    stories: sectionCards(blocks[3]),
    research: sectionCards(blocks[4]),
    business: sectionCards(blocks[5]),
    cta: {
      heading: blocks[6].querySelector("h2")?.textContent?.trim(),
      button: (() => {
        const a = blocks[6].querySelector("a");
        return a ? { text: a.innerText.trim(), href: a.href } : null;
      })(),
    },
    heroChips: [...hero.querySelectorAll("a,button")]
      .map((el) => ({
        text: el.innerText.trim().replace(/\s+/g, " "),
        href: el.href || null,
      }))
      .filter((c) => c.text && c.text.length < 60),
    // Footer structured
    footer: (() => {
      const footer = document.querySelector("footer");
      if (!footer) return null;
      // OpenAI footer uses lists
      const groups = [...footer.querySelectorAll("ul")].map((ul) => {
        const prev = ul.previousElementSibling;
        const title =
          prev?.textContent?.trim() ||
          ul.closest("div")?.querySelector("h3,h4,p,span")?.textContent?.trim() ||
          "";
        return {
          title: title.slice(0, 40),
          links: [...ul.querySelectorAll("a")].map((a) => ({
            text: a.innerText.trim().replace(/\s+/g, " "),
            href: a.href,
          })),
        };
      }).filter((g) => g.links.length);
      return { groups, text: footer.innerText };
    })(),
    // Layout measurements
    layout: {
      featuredGrid: (() => {
        const g = blocks[1].querySelector('[class*="grid"]');
        if (!g) return null;
        const cs = getComputedStyle(g);
        return {
          gridTemplateColumns: cs.gridTemplateColumns,
          gap: cs.gap,
          maxWidth: cs.maxWidth,
          padding: cs.padding,
        };
      })(),
      containerMax: (() => {
        const el = document.querySelector(".max-w-container");
        return el ? getComputedStyle(el).maxWidth : null;
      })(),
      newsGrid: (() => {
        const g = blocks[2].querySelector('[class*="grid"]');
        if (!g) return null;
        const cs = getComputedStyle(g);
        return { gridTemplateColumns: cs.gridTemplateColumns, gap: cs.gap };
      })(),
    },
  };
});

// After More click, re-get chips
await page.waitForTimeout(500);
const moreChips = await page.evaluate(() => {
  const hero = document.querySelector("main article")?.children[0];
  return [...(hero?.querySelectorAll("a,button") || [])]
    .map((el) => ({
      text: el.innerText.trim().replace(/\s+/g, " "),
      href: el.href || null,
    }))
    .filter((c) => c.text && c.text.length < 60);
});
data.heroChipsExpanded = moreChips;

fs.writeFileSync("docs/research/openai.com/sections.json", JSON.stringify(data, null, 2));
console.log(JSON.stringify({
  featured: data.featured.cards.map((c) => ({ t: c.title, img: !!c.imgSrc, vid: !!c.videoSrc })),
  news: data.news.cards.length,
  newsImgs: data.news.allImgs.length,
  stories: data.stories.cards.length,
  storiesImgs: data.stories.allImgs.length,
  research: data.research.cards.length,
  business: data.business.cards.length,
  footerGroups: data.footer?.groups?.length,
  layout: data.layout,
}, null, 2));

await browser.close();
