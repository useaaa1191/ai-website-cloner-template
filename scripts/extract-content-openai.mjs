import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const OUT = "docs/research/openai.com";
const PUBLIC = "public";
fs.mkdirSync(path.join(PUBLIC, "fonts"), { recursive: true });
fs.mkdirSync(path.join(PUBLIC, "images"), { recursive: true });
fs.mkdirSync(path.join(PUBLIC, "videos"), { recursive: true });
fs.mkdirSync(path.join(PUBLIC, "seo"), { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      resolve(dest);
      return;
    }
    const client = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);
    const req = client.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve(dest);
      });
    });
    req.on("error", (e) => {
      file.close();
      reject(e);
    });
  });
}

async function downloadBatch(items, concurrency = 4) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      const item = items[idx];
      try {
        await download(item.url, item.dest);
        results[idx] = { ...item, ok: true };
      } catch (e) {
        results[idx] = { ...item, ok: false, error: String(e) };
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
});
const page = await context.newPage();
await page.goto("https://openai.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(5000);

// Close nav overlay if open by pressing Escape / clicking body
await page.keyboard.press("Escape");
await page.mouse.click(720, 400);
await page.waitForTimeout(500);

const content = await page.evaluate(() => {
  function abs(url) {
    try {
      return new URL(url, location.origin).href;
    } catch {
      return url;
    }
  }

  const article = document.querySelector("main article");
  const blocks = [...article.children];

  // Hero
  const hero = blocks[0];
  const heroHeading = hero.querySelector("h1, h2, p, [class*='text']");
  // Find the main prompt text
  const allHeroText = hero.innerText;
  const chatInput =
    hero.querySelector("textarea, input, [contenteditable], [role='textbox']") ||
    hero.querySelector("form");
  const chips = [...hero.querySelectorAll("a, button")]
    .map((el) => ({
      text: el.innerText.trim().replace(/\s+/g, " "),
      href: el.href || null,
      analytics: el.getAttribute("data-analytics"),
    }))
    .filter((c) => c.text && c.text.length < 80 && !c.text.includes("Skip"));

  // Featured grid
  const featured = blocks[1];
  const featuredCards = [...featured.querySelectorAll("a")]
    .filter((a) => a.querySelector("img, video") || (a.innerText || "").length > 20)
    .map((a) => {
      const img = a.querySelector("img");
      const video = a.querySelector("video");
      const lines = (a.innerText || "")
        .trim()
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      return {
        href: a.href,
        title: lines[0] || null,
        meta: lines.slice(1),
        lines,
        img: img
          ? { src: abs(img.currentSrc || img.src), alt: img.alt }
          : null,
        video: video
          ? {
              src: abs(video.currentSrc || video.src || video.querySelector("source")?.src),
              poster: video.poster ? abs(video.poster) : null,
            }
          : null,
      };
    });

  // Deduplicate featured by title
  const seen = new Set();
  const featuredUnique = featuredCards.filter((c) => {
    const key = c.title || c.href;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  function extractSection(block) {
    const heading = block.querySelector("h2")?.textContent?.trim() || null;
    const viewLink = [...block.querySelectorAll("a")].find((a) =>
      /view (more|all)/i.test(a.innerText)
    );
    // Card links that have images
    const cards = [...block.querySelectorAll("a")]
      .filter((a) => {
        const t = (a.innerText || "").trim();
        return a.querySelector("img") && t.length > 5 && !/view (more|all)/i.test(t);
      })
      .map((a) => {
        const img = a.querySelector("img");
        const lines = (a.innerText || "")
          .trim()
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        return {
          href: a.href,
          title: lines[0],
          meta: lines.slice(1),
          lines,
          img: img
            ? {
                src: abs(img.currentSrc || img.src),
                alt: img.alt,
                w: img.naturalWidth,
                h: img.naturalHeight,
              }
            : null,
        };
      });
    // dedupe
    const s = new Set();
    const unique = cards.filter((c) => {
      if (s.has(c.title)) return false;
      s.add(c.title);
      return true;
    });
    return {
      heading,
      viewMore: viewLink
        ? { text: viewLink.innerText.trim(), href: viewLink.href }
        : null,
      cards: unique,
      textAll: (block.innerText || "").trim().slice(0, 2000),
    };
  }

  const news = extractSection(blocks[2]);
  const stories = extractSection(blocks[3]);
  const research = extractSection(blocks[4]);
  const business = extractSection(blocks[5]);
  const cta = {
    heading: blocks[6].querySelector("h2")?.textContent?.trim(),
    button: (() => {
      const a = blocks[6].querySelector("a");
      return a
        ? { text: a.innerText.trim(), href: a.href }
        : null;
    })(),
    textAll: blocks[6].innerText.trim(),
  };

  // Header nav
  const header = document.querySelector("header");
  const navLinks = [...(header?.querySelectorAll("nav a, [class*='nav'] a") || [])]
    .map((a) => ({ text: a.innerText.trim().replace(/\s+/g, " "), href: a.href }))
    .filter((a) => a.text && a.text.length < 40);

  // Better: get top-level nav labels from visible header bar
  const headerBar = header?.querySelector('[class*="header-bar"]') || header;
  const topNav = [...(headerBar?.querySelectorAll("a, button") || [])]
    .map((el) => ({
      text: el.innerText.trim().replace(/\s+/g, " "),
      href: el.href || null,
      tag: el.tagName.toLowerCase(),
    }))
    .filter((x) => x.text && x.text.length < 40 && !x.text.includes("Skip"));

  // Footer columns
  const footer = document.querySelector("footer");
  const footerCols = [];
  if (footer) {
    // Try to find column groups
    const headings = [...footer.querySelectorAll("h3, h4, [class*='heading']")];
    if (headings.length) {
      for (const h of headings) {
        const col = { title: h.textContent.trim(), links: [] };
        let sib = h.parentElement;
        const links = [...(sib?.querySelectorAll("a") || [])];
        col.links = links.map((a) => ({
          text: a.innerText.trim().replace(/\s+/g, " "),
          href: a.href,
        }));
        footerCols.push(col);
      }
    }
  }

  // Styles for key elements
  function styles(el) {
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      padding: cs.padding,
      borderRadius: cs.borderRadius,
      border: cs.border,
      maxWidth: cs.maxWidth,
      width: cs.width,
      height: cs.height,
      gap: cs.gap,
      display: cs.display,
      gridTemplateColumns: cs.gridTemplateColumns,
    };
  }

  const heroTitleEl = [...hero.querySelectorAll("*")].find(
    (el) => el.childNodes.length && el.textContent.trim() === "What can I help with?"
  );

  // Featured layout
  const featuredGrid = featured.querySelector('[class*="grid"]') || featured.firstElementChild;

  return {
    hero: {
      title: "What can I help with?",
      titleStyles: styles(heroTitleEl),
      chips,
      inputPlaceholder: chatInput?.placeholder || chatInput?.getAttribute("aria-label") || "Message ChatGPT",
      textAll: allHeroText.slice(0, 1500),
      containerStyles: styles(hero),
    },
    featured: {
      cards: featuredUnique,
      gridStyles: styles(featuredGrid),
      textAll: featured.innerText.slice(0, 1500),
    },
    news,
    stories,
    research,
    business,
    cta,
    header: {
      topNav,
      navLinks: navLinks.slice(0, 40),
      styles: styles(header),
    },
    footer: {
      cols: footerCols,
      textAll: footer?.innerText?.slice(0, 3000),
      styles: styles(footer),
    },
    maxWidthContainer: (() => {
      const el = document.querySelector(".max-w-container, [class*='max-w-container']");
      return el ? styles(el) : null;
    })(),
  };
});

fs.writeFileSync(path.join(OUT, "content.json"), JSON.stringify(content, null, 2));
console.log("Content written");
console.log("Featured cards:", content.featured.cards.length);
console.log("News:", content.news.cards.length);
console.log("Stories:", content.stories.cards.length);
console.log("Research:", content.research.cards.length);
console.log("Business:", content.business.cards.length);

// Collect all image/video URLs
const assets = [];
function addAsset(url, folder, prefix) {
  if (!url || !url.startsWith("http")) return;
  const clean = url.split("?")[0];
  const ext = path.extname(clean) || (folder === "videos" ? ".mp4" : ".webp");
  const hash = Buffer.from(clean).toString("base64url").slice(0, 16);
  const name = `${prefix}-${hash}${ext}`;
  assets.push({ url, dest: path.join(PUBLIC, folder, name), local: `/${folder}/${name}` });
}

for (const c of content.featured.cards) {
  if (c.img?.src) addAsset(c.img.src, "images", "featured");
  if (c.video?.src) addAsset(c.video.src, "videos", "featured");
  if (c.video?.poster) addAsset(c.video.poster, "images", "poster");
}
for (const section of [content.news, content.stories, content.research, content.business]) {
  for (const c of section.cards) {
    if (c.img?.src) addAsset(c.img.src, "images", section.heading?.toLowerCase().replace(/\s+/g, "-") || "card");
  }
}

// Fonts
const fontWeights = [
  "Light", "Regular", "Medium", "Semibold", "Bold",
  "LightItalic", "RegularItalic", "MediumItalic", "SemiboldItalic", "BoldItalic",
];
for (const w of fontWeights) {
  assets.push({
    url: `https://cdn.openai.com/common/fonts/openai-sans/v4/OpenAISans-${w}.woff2`,
    dest: path.join(PUBLIC, "fonts", `OpenAISans-${w}.woff2`),
    local: `/fonts/OpenAISans-${w}.woff2`,
  });
}

// SEO
assets.push(
  { url: "https://openai.com/favicon.ico", dest: path.join(PUBLIC, "seo", "favicon.ico"), local: "/seo/favicon.ico" },
  { url: "https://openai.com/favicon.svg", dest: path.join(PUBLIC, "seo", "favicon.svg"), local: "/seo/favicon.svg" },
  { url: "https://openai.com/apple-icon.png", dest: path.join(PUBLIC, "seo", "apple-icon.png"), local: "/seo/apple-icon.png" },
  {
    url: content.featured.cards[0]?.img?.src ||
      "https://images.ctfassets.net/kftzwdyauwt9/3KGOHkSXu53naMuSFNaiwv/cdb0e2f899f524abb71314ab20e09c9c/OAI-white-on-black.png?w=1600&h=900&fit=fill",
    dest: path.join(PUBLIC, "seo", "og.png"),
    local: "/seo/og.png",
  }
);

// Also pull more imgs from page that we might have missed
const moreImgs = await page.evaluate(() =>
  [...document.querySelectorAll("img")].map((img) => img.currentSrc || img.src)
);
for (const src of moreImgs) {
  if (src && src.includes("ctfassets")) addAsset(src, "images", "extra");
}

console.log("Downloading", assets.length, "assets...");
const results = await downloadBatch(assets, 5);
const ok = results.filter((r) => r.ok).length;
const fail = results.filter((r) => !r.ok);
console.log(`Downloaded ${ok}/${assets.length}`);
if (fail.length) console.log("Failures:", fail.slice(0, 10).map((f) => f.error));

// Asset map: remote -> local
const assetMap = {};
for (const r of results) {
  if (r.ok) assetMap[r.url] = r.local;
}
fs.writeFileSync(path.join(OUT, "asset-map.json"), JSON.stringify(assetMap, null, 2));

// Extract SVGs from header for icons
const svgs = await page.evaluate(() => {
  return [...document.querySelectorAll("header svg, footer svg, main svg")]
    .slice(0, 50)
    .map((svg, i) => ({
      i,
      viewBox: svg.getAttribute("viewBox"),
      html: svg.outerHTML,
      label: svg.getAttribute("aria-label") || svg.parentElement?.getAttribute("aria-label") || "",
      parent: (svg.closest("a,button")?.innerText || "").trim().slice(0, 40),
    }));
});
fs.writeFileSync(path.join(OUT, "svgs.json"), JSON.stringify(svgs, null, 2));
console.log("SVGs:", svgs.length);

// Precise styles for hero title, chips, featured cards
const precise = await page.evaluate(() => {
  const findByText = (text) =>
    [...document.querySelectorAll("*")].find(
      (el) => el.childNodes.length === 1 && el.textContent.trim() === text
    );

  function s(el) {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const keys = [
      "fontSize","fontWeight","fontFamily","lineHeight","letterSpacing","color",
      "backgroundColor","padding","paddingTop","paddingBottom","paddingLeft","paddingRight",
      "margin","borderRadius","border","width","height","maxWidth","display",
      "flexDirection","justifyContent","alignItems","gap","gridTemplateColumns",
      "boxShadow","position","overflow","objectFit","transition","cursor",
    ];
    const out = {};
    for (const k of keys) out[k] = cs[k];
    return out;
  }

  const title = findByText("What can I help with?");
  const chip = [...document.querySelectorAll("a")].find((a) =>
    a.innerText.includes("Learn about ChatGPT Business")
  );
  const tryBtn = [...document.querySelectorAll("a")].find((a) =>
    a.innerText.includes("Try ChatGPT")
  );
  const loginBtn = [...document.querySelectorAll("button, a")].find((el) =>
    el.innerText.trim().startsWith("Log in")
  );
  const newsH = findByText("Recent news");
  const sectionH = findByText("Stories");

  // Featured primary card
  const featLink = [...document.querySelectorAll("a")].find((a) =>
    a.innerText.includes("GPT-5.6")
  );

  // Input box
  const inputBox =
    document.querySelector('[data-analytics*="splash"]') ||
    document.querySelector("form") ||
    [...document.querySelectorAll("div")].find((d) =>
      (d.innerText || "").includes("Message ChatGPT")
    );

  return {
    title: s(title),
    chip: s(chip),
    tryBtn: s(tryBtn),
    loginBtn: s(loginBtn),
    newsHeading: s(newsH),
    storiesHeading: s(sectionH),
    featuredCard: s(featLink),
    inputRelated: s(inputBox),
    headerH: s(document.querySelector("header")),
  };
});
fs.writeFileSync(path.join(OUT, "precise-styles.json"), JSON.stringify(precise, null, 2));

await browser.close();
console.log("Done.");
