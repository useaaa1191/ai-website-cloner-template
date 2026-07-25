# SiteFooter Specification

## Overview
- **Target file:** `src/components/SiteFooter.tsx`
- **Screenshot:** `docs/design-references/openai.com/section-00-footer-desktop.png`
- **Interaction model:** static links

## DOM Structure
- Logo
- Multi-column link groups (Research, Products, Business, Developers, Company, etc.)
- Social icons: X, YouTube, LinkedIn, GitHub, Instagram, TikTok, Discord
- Legal row: copyright, Privacy, Terms, language

## Computed Styles
- Column titles: 14px / 500
- Links: 14px muted → black on hover
- Top border separator
- Social icons: 20px hit targets

## States & Behaviors
- Link hover color shift only
- No accordion or scroll-driven footer behavior on desktop
- Mobile stacks columns; social row remains horizontal wrap

## Real Content
Footer groups and legal links from `homeContent.footer` in `src/data/home.ts`.

## Responsive Behavior
- **Desktop:** multi-column grid
- **Tablet:** fewer columns, wrapped groups
- **Mobile:** stacked groups; see `section-00-footer-mobile.png`
