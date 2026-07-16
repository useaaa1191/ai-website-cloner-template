# SiteHeader Specification

## Overview
- **Target file:** `src/components/SiteHeader.tsx`
- **Screenshot:** `docs/design-references/openai.com/viewport-desktop.png`
- **Interaction model:** hover + click (mobile menu)

## Computed Styles
- height: 64px (`--header-h: 4rem`)
- background: white / translucent with backdrop blur when sticky
- Logo: OpenAI wordmark SVG, height 17px
- Nav links: 14px / 500, padding ~12px 12px, hover bg rgba(0,0,0,0.04)
- Log in: h 36px, bg rgba(0,0,0,0.04), radius 40px, 14px/500
- Try ChatGPT: h 36px, bg #000, color #fff, radius 40px, external arrow

## States & Behaviors
- Sticky at top
- Mobile: hamburger reveals stacked nav
- Search icon present (overlay not fully cloned)

## Text Content
Research, Products, Business, Developers, Company, Foundation, Log in, Try ChatGPT

## Responsive
- Desktop: full nav visible (≥1024px)
- Mobile: logo + Try ChatGPT + menu
