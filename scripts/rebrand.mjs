// scripts/rebrand.mjs
// Take the chatgpt.com/overview mirror in out/chatgpt-overview and rewrite the
// text content into Forward Foundation (forwardfnd.org) messaging while keeping
// the exact same DOM structure, CSS, and asset layout. Produces a new folder
// out/forward-foundation and re-zips it as dist/forward-foundation.zip.
//
// Strategy:
//   1. Copy the whole mirror folder to a new output dir.
//   2. Load index.html with cheerio.
//   3. Update <head> - title, meta description, og/twitter cards, canonical.
//   4. Walk every text-carrying element and rewrite using a two-pass approach:
//        - selector-scoped rewrites for content that is easy to target
//        - unique long-string rewrites for the hero copy and card bodies
//   5. Strip the ChatGPT hero mode-rotator so no JS can overwrite our headline.
//   6. Strip external tracking / analytics scripts.
//   7. Write index.html back, then zip the folder.
import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";
import * as cheerio from "cheerio";

const SRC = "out/chatgpt-overview";
const DEST = "out/forward-foundation";
const ZIP = "dist/forward-foundation.zip";

// Fresh copy
await fs.rm(DEST, { recursive: true, force: true });
execSync(`cp -R "${SRC}" "${DEST}"`);
// Remove the ChatGPT-specific README, we'll write our own
await fs.rm(path.join(DEST, "README.txt"), { force: true });

// -----------------------------------------------------------------------
// Content maps
// -----------------------------------------------------------------------
//
// unique long-form pairs. exact match on trimmed text content. safe because
// the strings are long enough to appear only once in the DOM.
const LONG_TEXT = new Map([
  // Card 1 (Chat -> KinSight)
  [
    "For questions, learning, and everyday help.",
    "For family dementia caregivers. Free.",
  ],
  [
    "Get help with everyday questions and ideas, explaining concepts, drafting messaging, searching the web, generating an image, comparing options, or thinking through a decision.",
    "KinSight compares small daily observations to a baseline the caregiver controls. Bilingual English and Spanish. Voice-first. Every suggestion arrives with the reasons behind it and waits for a person to decide the next step.",
  ],
  // Card 2 (Work -> SteadyCrew)
  [
    "For completing work tasks from start to finish.",
    "For direct-care agencies and the aides who do the work.",
  ],
  [
    "ChatGPT Work can create and edit docs, slide decks, spreadsheets, charts, PDFs, images, and other deliverables using the tools, context, and apps you\u2019re already using.",
    "SteadyCrew blocks credential gaps, prevents forced overtime, and surfaces the best-fit aide for each call-out. Decline rights stay intact. Every match shows its reason and waits for a supervisor to confirm.",
  ],
  // Card 3 (Codex -> Principles)
  [
    "For coding and technical work.",
    "The rules both tools live by.",
  ],
  [
    "The same powerful coding agent, now alongside ChatGPT. Use it across every step, from understanding and planning to writing, testing, reviewing, and shipping code.",
    "Every recommendation explains itself, waits for a person, and leaves the final call where it belongs. Nothing publishes or acts silently. Incomplete or contradictory input is refused, not dressed up as confidence.",
  ],
  // Feature grid
  [
    "Turn rough notes and thoughts into clear, polished writing. Draft messages, notes, plans, stories, posts, and other writing, and edit as your thinking develops.",
    "KinSight learns what usual looks like from the person who knows best. New observations are compared to a caregiver-controlled baseline, not a generic profile the family had no hand in.",
  ],
  [
    "Create images from a prompt, explore visual directions, or generate graphic designs for flyers, branding, and more.",
    "Every care band and every workforce match shows the reasons behind it. Inspect the logic, agree, or push back. A recommendation is the start of a decision, not the end.",
  ],
  [
    "Connect to your internal work files and apps like Gmail and Slack to create polished, finished deliverables and automate tasks.",
    "Missing or contradictory information is flagged or declined. Crisis language follows deterministic red-flag routing rather than a probabilistic guess.",
  ],
  [
    "Write, debug, and improve code. Build something new, fix what\u2019s broken, or learn how a software project works.",
    "Nothing publishes or acts on its own. Confirm, override, or ignore. Approve, edit, or reject. The final call stays with the caregiver or supervisor.",
  ],
  [
    "Talk with ChatGPT in real time when speaking is easier than typing. Use voice to brainstorm, practice, learn, or keep moving while you\u2019re away from your keyboard.",
    "English and Spanish, spoken or typed. Voice-first for the hands and hours a caregiver doesn\u2019t have. A short observation becomes a reviewable next step.",
  ],
  [
    "Explore fitness, wellness, and health-related questions with clear explanations and practical guidance.",
    "Privacy, dignity, decline rights, and limits on disciplinary use are treated as product requirements, not disclaimers written after the fact.",
  ],
  [
    "Ask about budgeting, planning, financial concepts, and market context. Securely link your financial accounts for personalized insights.",
    "KinSight is free to family caregivers. SteadyCrew is free to aides and supported by agency licensing. Ask about access and we will follow up directly.",
  ],
  // Plans / pricing block
  [
    "ChatGPT is available in various plans for personal use and for business and enterprise.",
    "KinSight is free to family caregivers. SteadyCrew is free to the aides who use it and supported by agency licensing. Research partners and county programs contact us directly.",
  ],
  // Safety block
  [
    "We\u2019re committed to protecting our customer and user data; ChatGPT is built with your security and privacy in mind.",
    "Privacy, dignity, decline rights, and limits on disciplinary use aren\u2019t guidelines added later. They are product requirements the tools have to meet before anyone uses them.",
  ],
  [
    "You choose how your data is used, and we make it easy to control your privacy choices.",
    "The baseline belongs to the person who set it. Access, export, and deletion are one tap. Nothing about a person\u2019s care is used to train a general model.",
  ],
  [
    "Tools like Parental Controls in ChatGPT ensure parents can set safeguards for teen users.",
    "SteadyCrew keeps decline rights intact, refuses to concentrate late shifts on the same aides, and blocks forced overtime. The tool defends the workforce as much as it schedules it.",
  ],
  // Get inspired / stories
  [
    "See what people are using ChatGPT to achieve.",
    "The moments where a careful next step matters more than a fast one.",
  ],
  [
    "Small businesses are getting more done with ChatGPT",
    "A caregiver notices a quiet change and chooses the right next step",
  ],
  [
    "Training to cycle across Antarctica",
    "A supervisor covers a shift without pushing overtime onto the same aide again",
  ],
  [
    "Creating new simulations of black holes",
    "A bilingual household captures observations in Spanish and moves forward in English",
  ],
  // Rolling-out banner
  [
    "Rolling out to all plans on desktop today, and rolling out to Plus, Pro, Business, Enterprise, and Edu on web and mobile over the next few days.",
    "KinSight is live for California family caregivers. SteadyCrew is rolling out to home-care agencies through 2026.",
  ],
]);

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
const html = await fs.readFile(path.join(DEST, "index.html"), "utf8");
const $ = cheerio.load(html, { decodeEntities: false });

// ---- HEAD ----
$("title").text("Forward Foundation | Care decisions, not autopilot");
$("meta[name='description']").attr(
  "content",
  "Forward Foundation is a California nonprofit building free, human-confirmed decision support for family dementia caregivers and the direct-care workforce.",
);
$("meta[property='og:title']").attr("content", "Forward Foundation | Care decisions, not autopilot");
$("meta[property='og:description']").attr(
  "content",
  "Free, human-confirmed decision support for family dementia caregivers and direct-care aides. A California nonprofit.",
);
$("meta[property='og:image:alt']").attr("content", "Forward Foundation - AI that waits for you");
$("meta[name='twitter:title']").attr("content", "Forward Foundation | Care decisions, not autopilot");
$("meta[name='twitter:description']").attr(
  "content",
  "Free, human-confirmed decision support for family dementia caregivers and direct-care aides.",
);
$("meta[name='twitter:image:alt']").attr("content", "Forward Foundation - AI that waits for you");
$("meta[name='twitter:site']").attr("content", "@forwardfnd");
$("meta[name='application-name']").attr("content", "Forward Foundation");
$("meta[name='apple-mobile-web-app-title']").attr("content", "Forward Foundation");

// Drop the ChatGPT/OpenAI OG share image; browsers will still render fine
// without it and we don't want the wrong art surfacing when shared.
$("meta[property='og:image']").attr("content", "");
$("meta[name='twitter:image']").attr("content", "");

// Drop alternate hreflang entries pointing at chatgpt.com locales.
$("link[rel='alternate'][hreflang]").each((_, el) => {
  const href = $(el).attr("href") || "";
  if (href.includes("chatgpt.com/")) $(el).remove();
});
// Same for canonical if it points remote
$("link[rel='canonical']").attr("href", "./");

// Drop the Wayback analytics + wombat inline scripts so nothing pings archive.org
$("script").each((_, el) => {
  const s = $(el);
  const src = s.attr("src") || "";
  const body = $(el).html() || "";
  if (
    src.includes("archive.org") ||
    body.includes("archive_analytics") ||
    body.includes("__wm.") ||
    body.includes("RufflePlayer")
  ) {
    s.remove();
  }
});

// Also disable OpenAI-specific analytics endpoints - simplest by dropping the
// obvious tracking bundle by hash. Not strictly necessary but keeps outbound
// requests to a minimum.
// (The bundles are named by sha1(url) so we can't semantically identify them
// here; leaving them in place is harmless.)

// ---- NAV: top-level items ----
// The nav has both a desktop tree and a mobile clone; both live in <li> under
// the header. We match by exact leaf text so we hit both.
const NAV_LEAF_MAP = new Map([
  ["Features", "Programs"],
  ["Learn", "Principles"],
  ["Codex", "KinSight"],
  ["Business", "SteadyCrew"],
  ["Pricing", "Access"],
  ["Download", "Contact"],
]);

// ---- NAV: dropdown items and section headings inside the mega-menu ----
const NAV_ITEM_MAP = new Map([
  // Features -> Programs
  ["ChatGPT Work", "KinSight"],
  ["Deep Research", "SteadyCrew"],
  ["Images", "Reason codes"],
  ["Plugins", "Care bands"],
  ["Remote", "Bilingual support"],
  ["Shopping", "Voice-first input"],
  ["Study Mode", "Red-flag routing"],
  ["Voice", "Human confirmation"],
  ["Voice with Video", "Decline rights"],
  // Learn -> Principles: section labels
  ["ChatGPT for", "Built for"],
  ["Inspiration", "In practice"],
  ["Ways to Use", "How we protect"],
  // Learn -> "ChatGPT for" items -> "Built for"
  ["Students", "Family caregivers"],
  ["University Educators", "Direct-care aides"],
  ["Teachers", "Care coordinators"],
  ["Science and Medicine", "Case managers"],
  ["Parents", "Adult children of aging parents"],
  ["Veterans", "Home-care agencies"],
  // Learn -> "Inspiration" -> "In practice"
  ["Fitness, Wellness, and Health", "Dementia observations"],
  ["Money and Finances", "Coverage scrambles"],
  ["Recipes and Cooking", "Bilingual households"],
  ["Travel and Exploration", "Late-shift protection"],
  // Learn -> "Ways to Use" -> "How we protect"
  ["Canva in ChatGPT", "Privacy by design"],
  ["Spotify in ChatGPT", "Dignity"],
  ["ChatGPT for PowerPoint", "Decline rights"],
  ["Chat with PDFs", "Discipline limits"],
  ["Chat with Presentations", "Data minimization"],
  ["Chat with Spreadsheets", "Audit trails"],
  ["For College Students", "Model transparency"],
  // Codex -> KinSight dropdown items
  ["Import to ChatGPT", "Language support"],
  ["Developer Docs", "Baseline setup"],
  ["Codex Events", "Community"],
  // Business -> SteadyCrew dropdown
  ["Contact Sales", "Book a demo"],
  ["Merchants", "Case studies"],
  ["AI solutions for", "For care teams"],
  ["Data Science & Analytics", "Home-care agencies"],
  ["Engineering", "Assisted living"],
  ["Finance", "Adult day programs"],
  ["Product Management", "Skilled nursing"],
  ["Sales & Marketing", "Hospice teams"],
  // Pricing -> Access dropdown
  ["Free", "Free for families"],
  ["Go", "Aide accounts"],
  ["Plus", "Agency licensing"],
  ["Pro", "Nonprofit rate"],
  ["Enterprise", "County programs"],
  ["Higher Education", "Research partners"],
  ["K\u201312 Teachers", "Faith communities"],
]);

// ---- Login/signup buttons ----
const CTA_MAP = new Map([
  ["Log in", "Sign in"],
  ["Sign up for free", "Request access"],
  ["Try it now*", "Ask about access"],
  ["Download the app", "Read the principles"],
  ["Try ChatGPT today", "Start with the tool that fits the day"],
  ["Download app", "Ask about access"],
]);

// ---- Card / section headings ----
const HEADING_MAP = new Map([
  ["Chat", "KinSight"],
  ["Work", "SteadyCrew"],
  ["Codex", "Principles"],
  ["Writing", "Personal baseline"],
  ["Images", "Visible reasons"], // conflict with nav Images; handled by tag
  ["Coding", "Human gate"],
  ["Voice", "Bilingual voice"],
  ["Health", "Protection by design"],
  ["Finance", "Free where care happens"],
  ["Plans and pricing", "Access"],
  ["User privacy", "Data stays with the caregiver"],
  ["Teen safety", "Aide protection"],
]);

// The h2>p line "Use ChatGPT for work, life, and everything in between."
// The safety h2>p "Designed to keep you safe"
// The stories h2>p "Get inspired"
const HERO_LINE_MAP = new Map([
  ["Use ChatGPT for work, life, and everything in between.", "One foundation. Careful tools where care happens."],
  ["Designed to keep you safe", "Protection by design"],
  ["Get inspired", "In practice"],
]);

// Footer
const FOOTER_MAP = new Map([
  ["OpenAI", "Forward Foundation"],
  ["Research", "Programs"],
  ["Safety", "Principles"],
  ["API", "Access"],
  ["News", "Contact"],
  ["OpenAI \u00a9 2015\u2013", "Forward Foundation \u00a9 2024\u2013"],
]);

// ---- 1. Long unique strings ----
$("*").each((_, el) => {
  const $el = $(el);
  // Only touch elements whose only children are text (no nested elements to
  // avoid clobbering nested markup)
  if ($el.children().length > 0) return;
  const t = $el.text().replace(/\s+/g, " ").trim();
  if (!t) return;
  if (LONG_TEXT.has(t)) {
    $el.text(LONG_TEXT.get(t));
  } else if (HERO_LINE_MAP.has(t)) {
    $el.text(HERO_LINE_MAP.get(t));
  }
});

// ---- 2. Hero mode-rotator ----
// The overview-mode-labels headline animates through "Chat/Work/Codex". We
// replace the whole element with a static Forward Foundation headline so JS
// can't overwrite it.
const $hero = $("h1[overview-mode-labels], h1[data-testid='overview-mode-labels']");
if ($hero.length) {
  // Preserve the outer h1's classes/attrs but replace children with two lines.
  const $h = $hero.first();
  const attrs = $h.attr();
  $h.empty();
  $h.append(
    `<span class="ff-headline-line"><span>AI that waits</span></span>` +
      `<span class="ff-headline-line"><span>for a person.</span></span>`,
  );
  // The mode-rotator was driving inline styles. Add a bit of CSS at the end
  // of head to make our replacement legible.
  $("head").append(
    `<style>
      h1[overview-mode-labels] .ff-headline-line{display:block}
      h1[overview-mode-labels] .ff-headline-line + .ff-headline-line{margin-top:.2em;opacity:.9}
    </style>`,
  );
}

// ---- 3. Selector-scoped rewrites ----
//
// The Chat/Work/Codex three-card block: h2 lives inside <section>. Replace
// there so we don't collide with the nav's "Codex" / "Business" leaves.
$("section h2").each((_, el) => {
  const $el = $(el);
  const t = $el.text().trim();
  if (HEADING_MAP.has(t)) $el.text(HEADING_MAP.get(t));
});
// Feature grid h4s
$("h4").each((_, el) => {
  const $el = $(el);
  const t = $el.text().trim();
  if (HEADING_MAP.has(t)) $el.text(HEADING_MAP.get(t));
});
// Plans-and-pricing / safety headings live under h2 or h3
$("h2, h3").each((_, el) => {
  const $el = $(el);
  const t = $el.text().trim();
  if (HEADING_MAP.has(t)) $el.text(HEADING_MAP.get(t));
});

// The final CTA card "Try ChatGPT today" is an h2
$("h2").each((_, el) => {
  const $el = $(el);
  const t = $el.text().trim();
  if (t === "Try ChatGPT today") $el.text("Start with the tool that fits the day");
});

// ---- 4. Nav labels ----
// Top-level nav: <nav ...> a/button > (span or text)
$("nav a, nav button, header a, header button").each((_, el) => {
  const $el = $(el);
  // Walk direct children with just text
  const t = $el.text().replace(/\s+/g, " ").trim();
  if (NAV_LEAF_MAP.has(t)) {
    // Preserve nested markup by only changing the leaf text node
    const $leaf = $el.find("span").last();
    if ($leaf.length && $leaf.text().trim() === t) $leaf.text(NAV_LEAF_MAP.get(t));
    else $el.text(NAV_LEAF_MAP.get(t));
  }
});

// Nav dropdown items: <li><a><span>…</span></a></li>
$("nav ul li a span, nav ul li button span, nav div div").each((_, el) => {
  const $el = $(el);
  if ($el.children().length > 0) return;
  const t = $el.text().replace(/\s+/g, " ").trim();
  if (NAV_ITEM_MAP.has(t)) $el.text(NAV_ITEM_MAP.get(t));
  if (HEADING_MAP.has(t) && $el.closest("h1,h2,h3,h4").length === 0) {
    // Don't touch card/section headings via nav path
  }
});

// ---- 5. Login/signup + CTA buttons ----
$("button, a").each((_, el) => {
  const $el = $(el);
  if ($el.children().length > 3) return; // skip deep trees
  const t = $el.text().replace(/\s+/g, " ").trim();
  if (CTA_MAP.has(t)) {
    // If there's a single leaf span, edit it; else replace whole text.
    const leaves = $el.find("*").filter((_, x) => $(x).children().length === 0);
    let replaced = false;
    leaves.each((_, leaf) => {
      const lt = $(leaf).text().replace(/\s+/g, " ").trim();
      if (lt === t) {
        $(leaf).text(CTA_MAP.get(t));
        replaced = true;
        return false;
      }
    });
    if (!replaced) $el.text(CTA_MAP.get(t));
  }
});

// ---- 6. "Learn more" links: keep phrase in first two positions (plans, safety)
//   but swap the very first to "Ask about access". Both cards ship the same
//   text and we differentiate by position.
const learnMoreEls = $("a").filter((_, el) => $(el).text().replace(/\s+/g, " ").trim() === "Learn more");
learnMoreEls.each((i, el) => {
  const $el = $(el);
  const replacement = i === 0 ? "Ask about access" : i === 1 ? "Read the privacy note" : "See the workforce rules";
  const leaves = $el.find("*").filter((_, x) => $(x).children().length === 0);
  let done = false;
  leaves.each((_, leaf) => {
    if ($(leaf).text().trim() === "Learn more") {
      $(leaf).text(replacement);
      done = true;
      return false;
    }
  });
  if (!done) $el.text(replacement);
});

// ---- 7. Footer ----
$("footer, [class*='footer' i]").find("a, span, li, div").each((_, el) => {
  const $el = $(el);
  if ($el.children().length > 0) return;
  const t = $el.text().replace(/\s+/g, " ").trim();
  if (FOOTER_MAP.has(t)) $el.text(FOOTER_MAP.get(t));
});

// Also catch OpenAI copyright text and legal footer labels regardless of
// container.
$("body *").each((_, el) => {
  const $el = $(el);
  if ($el.children().length > 0) return;
  const t = $el.text().replace(/\s+/g, " ").trim();
  if (FOOTER_MAP.has(t)) $el.text(FOOTER_MAP.get(t));
});

// ---- 8. Alt / aria-label / title attribute rewrites ----
$("[alt]").each((_, el) => {
  const alt = ($(el).attr("alt") || "").trim();
  if (/chatgpt/i.test(alt) || /openai/i.test(alt)) {
    $(el).attr("alt", alt.replace(/ChatGPT/gi, "Forward Foundation").replace(/OpenAI/gi, "Forward Foundation"));
  }
});
$("[aria-label]").each((_, el) => {
  const v = ($(el).attr("aria-label") || "").trim();
  if (/chatgpt|openai/i.test(v)) {
    $(el).attr(
      "aria-label",
      v.replace(/ChatGPT/gi, "Forward Foundation").replace(/OpenAI/gi, "Forward Foundation"),
    );
  }
});
$("[title]").each((_, el) => {
  const v = ($(el).attr("title") || "").trim();
  if (/chatgpt|openai/i.test(v)) {
    $(el).attr(
      "title",
      v.replace(/ChatGPT/gi, "Forward Foundation").replace(/OpenAI/gi, "Forward Foundation"),
    );
  }
});

// ---- 9. Straggler ChatGPT / OpenAI mentions in visible text ----
// Only in pure text nodes to avoid corrupting inline JSON strings inside
// preserved <script> tags. cheerio's .contents() gives us text nodes directly.
function walkText(node) {
  const kids = node.children;
  if (!kids) return;
  for (const c of [...kids]) {
    if (c.type === "text") {
      const original = c.data;
      let updated = original;
      // Only touch text that would render (not JSON in scripts / styles)
      const parentTag = c.parent && c.parent.name;
      if (parentTag === "script" || parentTag === "style" || parentTag === "noscript") continue;
      updated = updated
        .replace(/ChatGPT app/g, "Forward Foundation")
        .replace(/ChatGPT/g, "Forward Foundation")
        .replace(/OpenAI/g, "Forward Foundation");
      if (updated !== original) c.data = updated;
    } else if (c.children) {
      walkText(c);
    }
  }
}
walkText($("body")[0]);
walkText($("head")[0]);

// ---- 10. Write out ----
await fs.writeFile(path.join(DEST, "index.html"), $.html(), "utf8");

// Write a proper README
await fs.writeFile(
  path.join(DEST, "README.txt"),
  [
    "Forward Foundation - static rebrand",
    "===================================",
    "",
    "A rebrand of the chatgpt.com/overview design shell, filled with the actual",
    "content from forwardfnd.org (California nonprofit; free human-confirmed",
    "decision support for family dementia caregivers and the direct-care",
    "workforce). CSS, layout, and interactions stay the same. Text, meta,",
    "titles, and nav are rewritten to Forward Foundation.",
    "",
    "How to view",
    "-----------",
    "  ./serve.sh",
    "  # then open http://127.0.0.1:8765",
    "",
    "  # or",
    "  python3 -m http.server 8765 --bind 127.0.0.1",
    "  # or",
    "  npx --yes http-server -p 8765 .",
    "",
    "Opening index.html via file:// works too but ES modules and web fonts",
    "will not load - use serve.sh for full fidelity.",
    "",
    "Content source: https://forwardfnd.org (fetched 2026-07-22).",
    "Design source: https://chatgpt.com/overview/ (Wayback snapshot 2026-07-15).",
  ].join("\n"),
);

// Update serve.sh title
const serveScript = await fs.readFile(path.join(DEST, "serve.sh"), "utf8").catch(() => "");
if (serveScript) {
  const updated = serveScript.replace(/Serving \$/, "Serving Forward Foundation rebrand at $");
  await fs.writeFile(path.join(DEST, "serve.sh"), updated);
}

// Rebuild the zip
await fs.mkdir("dist", { recursive: true });
await fs.rm(ZIP, { force: true });
execSync(`cd ${DEST} && zip -qr ../../${ZIP} .`);
console.log("wrote", ZIP);
