<!-- AUTO-GENERATED from AGENTS.md — do not edit directly.
     Run `bash scripts/sync-agent-rules.sh` to regenerate. -->

---
description: Project conventions for AI Website Clone Template
alwaysApply: true
---
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Website Reverse-Engineer Template

## What This Is
A reusable template for reverse-engineering any website into a clean, modern Next.js codebase using AI coding agents. The Next.js + shadcn/ui + Tailwind v4 base is pre-scaffolded — just run `/clone-website <url1> [<url2> ...]`.

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict)
- **UI:** shadcn/ui (Radix primitives, Tailwind CSS v4, `cn()` utility)
- **Icons:** Lucide React (default — will be replaced/supplemented by extracted SVGs)
- **Styling:** Tailwind CSS v4 with oklch design tokens
- **Deployment:** Vercel

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript check
- `npm run verify:clone` — Structural clone gate (specs, screenshots, research docs)
- `npm run check` — Run lint + typecheck + build

## Code Style
- TypeScript strict mode, no `any`
- Named exports, PascalCase components, camelCase utils
- Tailwind utility classes, no inline styles
- 2-space indentation
- Responsive: mobile-first

## Design Principles
- **Pixel-perfect emulation** — match the target's spacing, colors, typography exactly
- **No personal aesthetic changes during emulation phase** — match 1:1 first, customize later
- **Real content** — use actual text and assets from the target site, not placeholders
- **Beauty-first** — every pixel matters
- **Gates over reminders** — before dispatching builders or calling a clone done, run `npm run verify:clone` (add `-- --strict` at completion). A green nod at a markdown checklist is not proof.

## Project Structure
```
src/
  app/              # Next.js routes
  components/       # React components
    ui/             # shadcn/ui primitives
    icons.tsx       # Extracted SVG icons as React components
  lib/
    utils.ts        # cn() utility (shadcn)
  types/            # TypeScript interfaces
  hooks/            # Custom React hooks
public/
  images/           # Downloaded images from target site
  videos/           # Downloaded videos from target site
  seo/              # Favicons, OG images, webmanifest
docs/
  research/         # Inspection output (design tokens, components, layout)
  design-references/ # Screenshots and visual references
scripts/            # Asset download scripts + verify-clone-gate.mjs
```

## MOST IMPORTANT NOTES
- When launching Claude Code agent teams, ALWAYS have each teammate work in their own worktree branch and merge everyone's work at the end, resolving any merge conflicts smartly since you are basically serving the orchestrator role and have full context to our goals, work given, work achieved, and desired outcomes.
- After editing `AGENTS.md`, run `bash scripts/sync-agent-rules.sh` to regenerate platform-specific instruction files.
- After editing `.claude/skills/clone-website/SKILL.md`, run `node scripts/sync-skills.mjs` to regenerate the skill for all platforms.
- Run `npm run verify:clone` before dispatching builders. Run `npm run verify:clone -- --strict` before declaring the clone complete.

# Website Inspection Guide

How to reverse-engineer a target site with browser MCP or DevTools. The `/clone-website` skill owns the full pipeline. This guide is the inspection checklist that feeds it.

## Phase 1: Visual audit

### Screenshots to capture
- [ ] Full page at desktop (1440px), tablet (768px), mobile (390px)
- [ ] Dark / light variants when the site has them
- [ ] Key interaction states (hover, open menus, modals, scrolled header)
- [ ] Loading / skeleton / empty / error states when present

Save under `docs/design-references/<hostname>/`.

### Design tokens to extract
- [ ] **Colors** — background, text, accent, border, hover, status
- [ ] **Typography** — families, sizes, weights, line heights, letter spacing
- [ ] **Spacing** — padding/margin scale actually used
- [ ] **Radius / shadow / elevation**
- [ ] **Breakpoints** — where layout shifts
- [ ] **Icons** — library vs custom SVG
- [ ] **Buttons / inputs** — every variant you will rebuild

Put live tokens into `src/app/globals.css` and fonts into `src/app/layout.tsx`. Do not invent a parallel `DESIGN_TOKENS.md` unless you need a human-readable dump; the CSS variables are the source of truth for builders.

## Phase 2: Behavior and topology

Mandatory before any builder dispatch (also enforced by `npm run verify:clone`):

- [ ] `docs/research/<hostname>/BEHAVIORS.md` — scroll, click, hover, responsive findings
- [ ] `docs/research/<hostname>/PAGE_TOPOLOGY.md` — section order, sticky layers, interaction model per section

### Interaction model first
For each section, decide: static, click-driven, scroll-driven, time-driven, or a mix. Scroll before you click. Wrong model means a rewrite, not a CSS tweak.

## Phase 3: Component inventory

For each distinct UI section, write a spec **before** dispatching a builder:

`docs/research/components/<ComponentName>.spec.md`

Required sections (gate-checked):

1. **Overview** — target file, screenshot path, interaction model
2. **DOM Structure** — what contains what
3. **Computed Styles** — values from `getComputedStyle()`, not guesses
4. **States & Behaviors** — triggers, before/after, transitions
5. **Real Content** — verbatim text and asset paths
6. **Responsive Behavior** — desktop / tablet / mobile

Run `npm run verify:clone` after writing specs. Fix every FAIL before dispatch. At completion run `npm run verify:clone -- --strict`.

### Common components to look for
Navigation, cards, buttons, forms, modals, dropdowns, tabs, avatars, skeletons, toasts, tooltips.

## Phase 4: Layout architecture

- [ ] Grid vs flex, column counts per breakpoint
- [ ] Content max-width
- [ ] Sticky elements and z-index layers
- [ ] Scroll behavior (snap, smooth-scroll libraries, infinite scroll)

## Phase 5: Stack notes

Record only what changes how you rebuild:

- [ ] Framework signals (`__NEXT_DATA__`, etc.)
- [ ] CSS approach (Tailwind utilities, CSS-in-JS, sheets)
- [ ] Font loading strategy
- [ ] Image / video delivery (CDN, srcset, formats)
- [ ] Animation approach (CSS, Motion, GSAP, Lottie, canvas)

Optional human dump: `docs/research/<hostname>/TECH_STACK.md`. Builders still get CSS and behavior inline from the component spec, never "see TECH_STACK.md".

## Phase 6: Output map

| Artifact | Path |
| --- | --- |
| Behaviors bible | `docs/research/<hostname>/BEHAVIORS.md` |
| Assembly blueprint | `docs/research/<hostname>/PAGE_TOPOLOGY.md` |
| Component contracts | `docs/research/components/*.spec.md` |
| Screenshots | `docs/design-references/<hostname>/` |
| Tokens in code | `src/app/globals.css`, `src/app/layout.tsx` |
| Gate | `npm run verify:clone` |
