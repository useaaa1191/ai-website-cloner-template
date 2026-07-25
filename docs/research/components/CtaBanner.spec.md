# CtaBanner Specification

## Overview
- **Target file:** `src/components/CtaBanner.tsx`
- **Screenshot:** `docs/design-references/openai.com/block-06-get-started-with-chatgpt.png`
- **Interaction model:** static link

## DOM Structure
- Rounded banner container
- Heading + single Download button link

## Computed Styles
- Container: rounded-3xl, background #f3f3f3, centered text
- Heading: 32px / 600 (md up to 40px)
- Button: black pill, white label, links to /chatgpt/download/

## States & Behaviors
- No scroll or tab state
- Button hover darkens slightly via opacity/brightness
- Entire CTA is one outbound Download action

## Real Content
Heading and button label from `homeContent.cta` in `src/data/home.ts` (Get started with ChatGPT / Download).

## Responsive Behavior
- **Desktop:** wide rounded banner inside container
- **Mobile:** full-bleed padding reduced; heading wraps to two lines
