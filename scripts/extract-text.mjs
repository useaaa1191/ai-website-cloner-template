// Print visible text nodes from the mirror index.html, with a bit of context.
import fs from "node:fs/promises";
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import path from "node:path";

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://127.0.0.1:8765/", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(500);

const dump = await page.evaluate(() => {
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const t = n.nodeValue.replace(/\s+/g, " ").trim();
    if (!t || t.length < 2) continue;
    // Skip inline script/style content
    let p = n.parentNode;
    let skip = false;
    while (p && p !== document) {
      if (p.tagName === "SCRIPT" || p.tagName === "STYLE" || p.tagName === "NOSCRIPT") {
        skip = true;
        break;
      }
      p = p.parentNode;
    }
    if (skip) continue;
    // Build a short breadcrumb of tag names
    const crumbs = [];
    let el = n.parentElement;
    let d = 0;
    while (el && d < 4) {
      crumbs.unshift(el.tagName.toLowerCase() + (el.getAttribute("data-testid") ? `[${el.getAttribute("data-testid")}]` : ""));
      el = el.parentElement;
      d++;
    }
    out.push({ crumb: crumbs.join(">"), text: t });
  }
  return out;
});
await browser.close();

// Also grab all alt attributes and aria-labels
console.log("=== TEXT NODES (", dump.length, ") ===");
for (const d of dump) console.log(d.crumb, "|", d.text);
