import { chromium } from "playwright";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";

const staticRoot = path.resolve("out");
const output = "docs/design-references/forwardfnd.org";
await fs.mkdir(output, { recursive: true });

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

const server = http.createServer(async (request, response) => {
  try {
    const requestPath = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
    let filePath = path.resolve(staticRoot, relativePath);

    if (!filePath.startsWith(staticRoot)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    const stats = await fs.stat(filePath).catch(() => null);
    if (stats?.isDirectory()) filePath = path.join(filePath, "index.html");

    const body = await fs.readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Could not bind verification server");
const baseUrl = `http://127.0.0.1:${address.port}`;

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const report = {};

try {
  for (const [name, viewport, mobile] of [
    ["desktop", { width: 1440, height: 900 }, false],
    ["mobile", { width: 390, height: 844 }, true],
  ]) {
    const context = await browser.newContext({
      viewport,
      isMobile: mobile,
      hasTouch: mobile,
      deviceScaleFactor: 1,
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const failedRequests = [];

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("requestfailed", (request) => {
      failedRequests.push(`${request.url()} :: ${request.failure()?.errorText ?? "failed"}`);
    });

    await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 30000 });
    await page.screenshot({ path: `${output}/new-${name}-top.png` });
    await page.screenshot({ path: `${output}/new-${name}-full.png`, fullPage: true });

    await page.getByRole("button", { name: "Skipped breakfast and lunch, more withdrawn than baseline." }).click();
    await page.getByText("Contact the care team", { exact: true }).waitFor();
    await page.screenshot({ path: `${output}/new-${name}-kinsight-result.png` });

    const bodyMetrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      title: document.title,
    }));

    report[name] = {
      ...bodyMetrics,
      horizontalOverflow: bodyMetrics.scrollWidth > bodyMetrics.clientWidth,
      consoleErrors,
      failedRequests,
    };

    await context.close();
  }
} finally {
  await browser.close();
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

await fs.writeFile(`${output}/verification.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
