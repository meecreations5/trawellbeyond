# V7.3.1: Singapore gallery oversized white overlay — targeted correction

## What was wrong

The journey/gallery page used photo buttons with both `.tb-gallery-trigger` and `.scenic` classes. The approved V5.1 `.scenic::after` added `inset:0`, while the newer `.tb-gallery-trigger::after` supplied a white `EXPAND` label. The combined CSS could turn the label into an opaque full-size rectangle covering the main photograph on hover. This resembles the supplied screenshot, in which the main photograph is mostly hidden behind white with `EXPAND` near the top.

## What changed

1. The journey gallery no longer marks the image buttons as `.scenic` (these buttons already contain real `<img>` elements).
2. The `EXPAND` pseudo-element explicitly resets `inset` to `auto 15px 15px auto` and stays content-sized, independently of other page CSS.
3. Added a regression test covering the output and CSS safety properties.

No Firebase SDK, rules, content, data model, images, header, footer or CREATE Journey code was changed.

## Apply to existing V7.3 project

Extract the **Changed Files Only** ZIP into the root of your existing V7.3 project, preserving directories. Then run:

```powershell
npm test
npm run build
npm run dev
```

In the browser, use Ctrl+Shift+R and inspect the large photograph of the Singapore journey gallery on desktop and mobile; hover/tap to open the gallery, use next/previous and close. No Firebase deployment or re-upload is needed.

## Acceptance check

- Main left photograph fills its tile without the white rectangle.
- `EXPAND` appears only as a small label on pointer hover/focus.
- Right-hand photographs remain intact.
- Photo lightbox opens and closes normally; keyboard/phone navigation works.

This is a source-level patch. Full Next.js build and live browser testing must still be run in your deployed environment.
