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
