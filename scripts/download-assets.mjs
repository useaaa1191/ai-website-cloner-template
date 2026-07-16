/**
 * Downloads OpenAI.com homepage assets into public/.
 * Prefer re-running extract-content-openai.mjs / deep-extract for fresh URLs.
 * This script re-fetches from the committed asset-map when present.
 */
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const mapPath = "docs/research/openai.com/asset-map.json";
if (!fs.existsSync(mapPath)) {
  console.error("Missing asset-map.json. Run scripts/extract-content-openai.mjs first.");
  process.exit(1);
}

const assetMap = JSON.parse(fs.readFileSync(mapPath, "utf8"));
// Invert: local -> prefer keeping; download from remote keys
const entries = Object.entries(assetMap);

function download(url, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      resolve("skip");
      return;
    }
    const client = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);
    client
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlinkSync(dest);
          download(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve("ok");
        });
      })
      .on("error", reject);
  });
}

let ok = 0;
let fail = 0;
for (const [url, local] of entries) {
  const dest = path.join("public", local.replace(/^\//, ""));
  try {
    const r = await download(url, dest);
    ok++;
    if (r === "ok") console.log("downloaded", local);
  } catch (e) {
    fail++;
    console.warn("fail", local, e.message);
  }
}
console.log(`Done. ok=${ok} fail=${fail}`);
