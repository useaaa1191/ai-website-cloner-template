# FeaturedGrid Specification

## Overview
- **Target file:** `src/components/FeaturedGrid.tsx`
- **Screenshot:** `docs/design-references/openai.com/block-01-block-1.png`
- **Interaction model:** hover + time (autoplay muted video)

## DOM Structure
- 12-col grid: primary 8 cols, side stack 4 cols
- Primary aspect 16/9 video/poster; side cards stacked with gap 24px

## Assets
- Primary video: `/videos/oai-8ce491a724bc.mp4` + poster `/images/oai-b38c7be20da1.png`
- Work video: `/videos/oai-0e92c02611d6.mp4` + `/images/oai-cc49fcbd0427.png`
- GPT-Live: `/images/oai-8b584e01f7d8.png`
- Daybreak: `/images/oai-dae35f6cfe08.png`

## Text Content
See `src/data/home.ts` featured array (verbatim from openai.com)
