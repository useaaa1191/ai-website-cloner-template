import { chromium } from "playwright";
import fs from "node:fs/promises";
await fs.mkdir("out/verify", { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
for (const [name, vp, mobile] of [
  ["desktop", { width: 1440, height: 900 }, false],
  ["mobile", { width: 390, height: 844 }, true],
]) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  let failed = 0;
  page.on("requestfailed", () => failed++);
  await page.goto("http://127.0.0.1:8766/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.evaluate(async () => {
    const total = document.documentElement.scrollHeight + 2000;
    for (let y = 0; y < total; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `out/verify/ff-${name}.png`, fullPage: true });
  const title = await page.title();
  const h = await page.evaluate(() => document.body.scrollHeight);
  const stray = await page.evaluate(() => {
    const t = document.body.innerText;
    return { chatgpt: (t.match(/ChatGPT/g) || []).length, openai: (t.match(/OpenAI/g) || []).length };
  });
  console.log(name, "title:", title, "h:", h, "failed:", failed, "stray:", JSON.stringify(stray));
  await ctx.close();
}
await browser.close();
