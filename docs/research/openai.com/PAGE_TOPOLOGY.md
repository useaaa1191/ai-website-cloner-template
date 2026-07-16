# OpenAI.com Homepage Topology

Target: https://openai.com/
Captured: 2026-07-16

## Page Structure (top → bottom)

1. **SiteHeader** (fixed/sticky, z high, height 4rem / `--header-h`)
   - Logo (OpenAI wordmark SVG)
   - Desktop nav: Research, Products, Business, Developers, Company, Foundation
   - Search icon button
   - Log in (pill, bg rgba(0,0,0,0.04))
   - Try ChatGPT (black pill CTA, external)
   - Interaction: hover opens mega-menu overlay (`nav-overlay` backdrop blur)

2. **HeroSection** (full viewport minus header)
   - Centered title: "What can I help with?" (28px / 600 / 34px lh)
   - ChatGPT prompt input (large pill)
   - Rotating placeholder prompts
   - Suggestion chips + More toggle
   - Interaction: click-driven More expands chips; input submits to ChatGPT

3. **FeaturedGrid**
   - Asymmetric layout: large primary card (~2/3) + stacked side cards (~1/3)
   - Primary: GPT-5.6 video/poster with overlay typography
   - Side: ChatGPT Work (video), GPT-Live, Daybreak
   - Gap between article sections: 120px (`gap-20` / `@md:gap-30`)

4. **RecentNews** — 2-col grid of horizontal image+text rows (6 items)

5. **Stories** — 3-col image cards (3 items)

6. **LatestResearch** — 3-col image cards (3 items)

7. **BusinessStories** — 3-col image cards (3 items)

8. **CtaBanner** — "Get started with ChatGPT" + Download button (muted bg)

9. **SiteFooter** — multi-column link groups + social + legal + language

## Layout Constants

- Container max-width: 1440px (`.max-w-container`)
- Horizontal padding: 32px desktop
- Header height: 64px (4rem)
- Section gap in article: 120px
- News grid: 2 × 676px, gap 24px
- Font: OpenAI Sans (self-hosted woff2)

## Interaction Models

| Section | Model |
|---------|-------|
| Header | hover mega-menus + sticky |
| Hero | click (More) + time (rotating prompts) |
| Featured | hover (scale/opacity), video autoplay muted |
| Content grids | hover underline/opacity |
| Footer | static links |
