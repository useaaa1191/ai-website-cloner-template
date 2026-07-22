// Verify the mirror over HTTP (ES modules require a real origin).
import { chromium } from "playwright";
import fs from "node:fs/promises";

const OUT = "out/verify";
await fs.mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
for (const [name, vp, mobile] of [
  ["desktop", { width: 1440, height: 900 }, false],
  ["tablet", { width: 820, height: 1180 }, true],
  ["mobile", { width: 390, height: 844 }, true],
]) {
  const ctx = await browser.newContext({
    viewport: vp,
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  let failed = 0;
  page.on("requestfailed", () => failed++);
  await page.goto("http://127.0.0.1:8765/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.evaluate(async () => {
    const total = document.documentElement.scrollHeight + 2000;
    for (let y = 0; y < total; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/mirror-http-${name}.png`, fullPage: true });
  const title = await page.title();
  const bodyH = await page.evaluate(() => document.body.scrollHeight);
  console.log(`${name}: title="${title}" bodyHeight=${bodyH}px failedReqs=${failed}`);
  await ctx.close();
}
await browser.close();
