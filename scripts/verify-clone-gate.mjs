#!/usr/bin/env node

/**
 * Structural clone gate. Encodes the pre-dispatch / completion checklist from
 * .claude/skills/clone-website/SKILL.md so agents cannot skip it with a nod.
 *
 * Usage:
 *   node scripts/verify-clone-gate.mjs [--strict] [--host <hostname>]
 *   npm run verify:clone
 *   npm run verify:clone -- --strict
 *
 * Exit 0 = ready to dispatch / declare complete.
 * Exit 1 = missing artifacts or thin specs. Fix extraction before building.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
let strict = false;
let host = null;
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--strict") {
    strict = true;
    continue;
  }
  if (arg === "--host") {
    host = args[++i] ?? null;
    continue;
  }
  if (arg.startsWith("--host=")) {
    host = arg.slice("--host=".length) || null;
    continue;
  }
  console.error(`Unknown argument: ${arg}`);
  process.exit(2);
}

const COMPONENTS_DIR = join(ROOT, "src", "components");
const SPEC_DIR = join(ROOT, "docs", "research", "components");
const RESEARCH_DIR = join(ROOT, "docs", "research");
const SKIP_COMPONENTS = new Set(["icons.tsx"]);

/** Phrases that mean the extractor guessed instead of measuring. */
const BANNED = [
  /\bTODO\b/,
  /\bTBD\b/,
  /\bFIXME\b/,
  /\bapproximately\b/i,
  /\blooks like\b/i,
  /\bguess(?:ed|ing)?\b/i,
  /\blorem ipsum\b/i,
];

const REQUIRED_HEADINGS = [
  { id: "overview", re: /^##\s+Overview\b/m },
  {
    id: "computed-styles",
    re: /^##\s+(?:Computed Styles|Styles)\b/m,
  },
  {
    id: "states-behaviors",
    re: /^##\s+(?:States & Behaviors|States|Behaviors)\b/m,
  },
];

const STRICT_HEADINGS = [
  { id: "dom-structure", re: /^##\s+(?:DOM Structure|Structure)\b/m },
  {
    id: "real-content",
    re: /^##\s+(?:Real Content|Per-State Content|Text Content|Content)\b/m,
  },
  {
    id: "responsive",
    re: /^##\s+Responsive(?: Behavior)?\b/m,
  },
];

/** @type {{ level: "error" | "warn"; message: string }[]} */
const findings = [];

function error(message) {
  findings.push({ level: "error", message });
}

function warn(message) {
  findings.push({ level: "warn", message });
}

function listFiles(dir, predicate) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => predicate(name, join(dir, name)))
    .sort();
}

function findResearchFile(filename) {
  const candidates = [];
  if (host) {
    candidates.push(join(RESEARCH_DIR, host, filename));
  }
  candidates.push(join(RESEARCH_DIR, filename));
  if (!host && existsSync(RESEARCH_DIR)) {
    for (const entry of readdirSync(RESEARCH_DIR)) {
      const nested = join(RESEARCH_DIR, entry, filename);
      if (statSync(join(RESEARCH_DIR, entry)).isDirectory() && existsSync(nested)) {
        candidates.push(nested);
      }
    }
  }
  return candidates.find((path) => existsSync(path)) ?? null;
}

function sectionComponents() {
  return listFiles(
    COMPONENTS_DIR,
    (name, full) =>
      name.endsWith(".tsx") &&
      !SKIP_COMPONENTS.has(name) &&
      statSync(full).isFile()
  ).map((name) => name.replace(/\.tsx$/, ""));
}

function specFiles() {
  return listFiles(
    SPEC_DIR,
    (name, full) => name.endsWith(".spec.md") && statSync(full).isFile()
  ).map((name) => name.replace(/\.spec\.md$/, ""));
}

function resolveFromRepo(maybePath) {
  const cleaned = maybePath.replace(/^['"`]|['"`]$/g, "").trim();
  if (!cleaned) return null;
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return { kind: "url", path: cleaned };
  }
  const abs = cleaned.startsWith("/")
    ? join(ROOT, cleaned.replace(/^\//, ""))
    : join(ROOT, cleaned);
  return { kind: "file", path: abs, rel: relative(ROOT, abs) };
}

function checkResearchDocs() {
  for (const name of ["PAGE_TOPOLOGY.md", "BEHAVIORS.md"]) {
    const found = findResearchFile(name);
    if (!found) {
      error(
        `Missing ${name} under docs/research/ (or docs/research/<host>/). Write it during reconnaissance before dispatching builders.`
      );
    }
  }
}

function checkComponentSpecPairing() {
  if (!existsSync(COMPONENTS_DIR)) {
    error("Missing src/components/. Scaffold the Next.js app first.");
    return;
  }
  if (!existsSync(SPEC_DIR)) {
    error(
      "Missing docs/research/components/. Write a .spec.md for each section before dispatching builders."
    );
    return;
  }

  const components = sectionComponents();
  const specs = new Set(specFiles());

  for (const name of components) {
    if (!specs.has(name)) {
      error(
        `Component src/components/${name}.tsx has no matching docs/research/components/${name}.spec.md`
      );
    }
  }

  for (const name of specs) {
    const componentPath = join(COMPONENTS_DIR, `${name}.tsx`);
    if (!existsSync(componentPath)) {
      warn(
        `Spec docs/research/components/${name}.spec.md has no matching src/components/${name}.tsx yet (ok during extract→dispatch; must exist at completion)`
      );
    }
  }
}

/**
 * @param {string} name
 * @param {string} text
 */
function checkSpecQuality(name, text) {
  const rel = `docs/research/components/${name}.spec.md`;

  if (!/interaction model/i.test(text)) {
    error(
      `${rel}: missing Interaction model (static | click-driven | scroll-driven | time-driven). Getting this wrong forces a rewrite.`
    );
  }

  const headings = strict
    ? [...REQUIRED_HEADINGS, ...STRICT_HEADINGS]
    : REQUIRED_HEADINGS;
  for (const heading of headings) {
    if (!heading.re.test(text)) {
      error(`${rel}: missing required heading matching ${heading.id}`);
    }
  }

  for (const pattern of BANNED) {
    const match = text.match(pattern);
    if (match) {
      error(
        `${rel}: contains banned guess-marker "${match[0]}". Re-extract with getComputedStyle() / real content.`
      );
    }
  }

  const screenshotMatch = text.match(
    /\*\*Screenshots?:\*\*\s*`?([^`\n]+?)`?(?:\s|$)/i
  );
  if (!screenshotMatch) {
    error(
      `${rel}: Overview must include Screenshot: path under docs/design-references/`
    );
  } else {
    const raw = screenshotMatch[1].trim();
    // Allow a short relative stem only when it resolves under design-references.
    const candidates = [raw];
    if (!raw.includes("/") && !raw.startsWith("http")) {
      candidates.push(`docs/design-references/${raw}`);
      if (host) {
        candidates.push(`docs/design-references/${host}/${raw}`);
      }
    }
    const resolvedList = candidates
      .map((c) => resolveFromRepo(c))
      .filter(Boolean);
    const fileHit = resolvedList.find(
      (r) => r && r.kind === "file" && existsSync(r.path)
    );
    const urlHit = resolvedList.find((r) => r && r.kind === "url");
    if (urlHit) {
      // External URL is fine; agent should also keep a local crop.
      warn(`${rel}: screenshot is a URL; prefer a local docs/design-references/ file`);
    } else if (!fileHit) {
      // Stems like "block-02 through block-05" are not resolvable paths.
      if (/\bthrough\b|\.\.\.|,/i.test(raw) || !raw.includes("/")) {
        error(
          `${rel}: Screenshot must be a concrete path under docs/design-references/ (got "${raw}")`
        );
      } else {
        const first = resolvedList[0];
        error(
          `${rel}: screenshot not found at ${first && first.kind === "file" ? first.rel : raw}`
        );
      }
    }
  }

  const targetMatch = text.match(/\*\*Target file:\*\*\s*`?([^`\n]+?)`?(?:\s|$)/i);
  if (targetMatch) {
    const resolved = resolveFromRepo(targetMatch[1]);
    if (resolved?.kind === "file" && !existsSync(resolved.path) && strict) {
      error(`${rel}: target file missing at ${resolved.rel}`);
    }
  }
}

function checkAllSpecs() {
  if (!existsSync(SPEC_DIR)) return;
  for (const name of specFiles()) {
    const full = join(SPEC_DIR, `${name}.spec.md`);
    const text = readFileSync(full, "utf8");
    if (text.trim().length < 120) {
      error(
        `docs/research/components/${name}.spec.md is too short (${text.trim().length} chars). Specs must carry exact CSS and content.`
      );
    }
    checkSpecQuality(name, text);
  }
}

function main() {
  console.log(
    `verify-clone-gate${strict ? " (strict)" : ""}${host ? ` host=${host}` : ""}`
  );

  checkResearchDocs();
  checkComponentSpecPairing();
  checkAllSpecs();

  const errors = findings.filter((f) => f.level === "error");
  const warnings = findings.filter((f) => f.level === "warn");

  for (const finding of findings) {
    const tag = finding.level === "error" ? "FAIL" : "WARN";
    console.log(`  [${tag}] ${finding.message}`);
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log("  OK — clone gate passed.");
  } else {
    console.log(
      `  Summary: ${errors.length} error(s), ${warnings.length} warning(s).`
    );
  }

  if (errors.length > 0) {
    console.error(
      "\nClone gate failed. Finish extraction / specs before dispatching builders or calling the clone done."
    );
    process.exit(1);
  }
}

main();
