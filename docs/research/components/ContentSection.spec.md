# ContentSection Specification

## Overview
- **Target file:** `src/components/ContentSection.tsx`
- **Screenshot:** `docs/design-references/openai.com/block-02-recent-news.png`
- **Also:** `block-03-stories.png`, `block-04-latest-research.png`, `block-05-openai-for-business.png`
- **Interaction model:** hover (title opacity) + static links

## DOM Structure
- Section heading + optional view-more link
- **news:** 2-col grid of horizontal 120px thumb + title/meta rows
- **stories / research / business:** 3-col square image cards

## Computed Styles
- Section heading: 28px / 600 / lh 34px / tracking -0.28px (md: 32px)
- View more/all: 14px / 500, underline on hover
- Card title: 17–18px / 500
- Meta: 13px / muted rgba(0,0,0,0.55)
- Image radius: 12px news thumbs, 16px story cards
- Gap: 24px (news rows), 24px card grid

## States & Behaviors
- Card title fades slightly on hover (group-hover opacity)
- Entire card is one link; no click-driven tab state
- Four instances share one component via `variant` prop

## Real Content
Recent news (6), Stories (3), Latest research (3), OpenAI for business (3). Verbatim copy and image paths live in `src/data/home.ts`.

## Responsive Behavior
- **Desktop (1440px):** news 2-col; stories/research/business 3-col
- **Tablet (768px):** news 2-col; card grids may drop to 2-col
- **Mobile (390px):** single column stack, thumbs 104px
