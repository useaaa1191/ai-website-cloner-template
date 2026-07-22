// scripts/verify-mirror.mjs
// Open the mirrored index.html via file:// and screenshot to verify fidelity.
import { chromium } from "playwright";
import path from "node:path";
import { pathToFileURL } from "node:url";

const indexUrl = pathToFileURL(path.resolve("out/chatgpt-overview/index.html")).href;
const OUT = "out/verify";
import fs from "node:fs/promises";
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
  const errs = [];
  page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
  page.on("requestfailed", (r) =>
    errs.push("failed: " + r.url() + " → " + r.failure()?.errorText),
  );
  await page.goto(indexUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.evaluate(async () => {
    const total = document.documentElement.scrollHeight + 2000;
    for (let y = 0; y < total; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/mirror-${name}.png`, fullPage: true });
  console.log(name, "errors:", errs.length);
  for (const e of errs.slice(0, 10)) console.log(" ", e);
  await ctx.close();
}
await browser.close();
