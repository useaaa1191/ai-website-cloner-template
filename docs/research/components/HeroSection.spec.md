# HeroSection Specification

## Overview
- **Target file:** `src/components/HeroSection.tsx`
- **Screenshot:** `docs/design-references/openai.com/viewport-desktop.png`
- **Interaction model:** time-driven (rotating prompts) + click (More)

## DOM Structure
- Centered title
- Prompt input pill with send control
- Chip row (primary actions + More)

## Computed Styles
- Title: 28px / 600 / lh 34px / tracking 0.3px / black
- Input: pill (radius 9999), border rgba(0,0,0,0.12), min-height 56px
- Send button: circular, bg rgba(0,0,0,0.04)
- Chips: h 40px, radius full, border rgba(0,0,0,0.12), 13px/500

## States & Behaviors
- Input prompt text rotates through multilingual strings every 3.2s
- More expands chip list and reveals Search with ChatGPT
- Submit opens chatgpt.com with query

## Real Content
Title: What can I help with?
Chips: Learn about ChatGPT Business, Talk with ChatGPT, Research, API Platform, More
Rotating prompts and moreChip from `homeContent.hero` in `src/data/home.ts`.

## Responsive Behavior
- **Desktop:** centered hero, chips in a wrapping row
- **Mobile:** full-width input pill, chips wrap, tighter vertical rhythm
