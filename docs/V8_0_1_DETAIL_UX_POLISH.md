# V8.0.1 | Detail Page Visual Corrections

Baseline: V8.0 Brand Experience. Scope is limited to the journey header logo and the destination introduction CTA layout.

## Changes

1. Journey detail logo: enlarge the existing `/assets/trawellbeyond-display.svg` with scoped CSS from 218px to 234px desktop and a responsive width up to 198px on mobile. **The SVG is not edited.** Other page logo widths are unchanged.
2. Destination introduction: correct the previously concatenated Save and Explore actions by wrapping them in a clearly spaced `.tb-intro-actions` group. Primary **Explore a curated journey** navigates to its linked journey (or enquiry when none exists); secondary **Save ... to My Journey** continues to call the existing client-side Journey Tray without payment.
3. Improve text legibility with modest font-size/line-height adjustment; ensure two CTAs stack on narrow mobiles, retain keyboard focus indicators, and respect reduced-motion settings.

## Local acceptance

- `npm test`
- `npm run check:syntax`
- `npm run verify:frontend`
- `npm run build` (requires installed dependencies and configured environment)

## Live checks required after deployment

- On Singapore and another destination, inspect both actions at 320, 390, 768 and 1440px; verify no overlapping text, save-to-tray works and primary CTA opens correct journey.
- On journey detail, confirm header logo is slightly larger but does not overlap navigation/hamburger.
- Use keyboard only to test focus, ESC behaviour of Journey Tray, and reduced-motion preference.
- Check real content, photography, accessibility and enquiry flow before launch. This patch does not add content or fill missing photographs.
