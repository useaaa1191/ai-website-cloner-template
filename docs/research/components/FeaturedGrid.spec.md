# FeaturedGrid Specification

## Overview
- **Target file:** `src/components/FeaturedGrid.tsx`
- **Screenshot:** `docs/design-references/openai.com/block-01-block-1.png`
- **Interaction model:** hover + time-driven (autoplay muted video)

## DOM Structure
- 12-col grid: primary 8 cols, side stack 4 cols
- Primary aspect 16/9 video/poster; side cards stacked with gap 24px

## Computed Styles
- Primary card: full-bleed media, title overlay bottom-left, 24–28px title
- Side cards: stacked, gap 24px, 16px image radius
- Meta row: 13px muted

## States & Behaviors
- Primary and work cards autoplay muted looping video when in view
- Hover lifts opacity on title / play affordance
- Cards are links; no click-to-switch tab model

## Assets
- Primary video: `/videos/oai-8ce491a724bc.mp4` + poster `/images/oai-b38c7be20da1.png`
- Work video: `/videos/oai-0e92c02611d6.mp4` + `/images/oai-cc49fcbd0427.png`
- GPT-Live: `/images/oai-8b584e01f7d8.png`
- Daybreak: `/images/oai-dae35f6cfe08.png`

## Real Content
Verbatim featured card titles, hrefs, and media paths from `src/data/home.ts` featured array.

## Responsive Behavior
- **Desktop (1440px):** 8+4 column layout
- **Tablet (768px):** primary full width, side cards below
- **Mobile (390px):** single column stack
