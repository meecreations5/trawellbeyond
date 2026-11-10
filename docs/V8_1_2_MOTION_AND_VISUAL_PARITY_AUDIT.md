# V8.1.2 — Motion / Visual Parity Audit

Baseline: V8.1.1 full source project. No published CMS data, Firebase schema or approved SVG logo modified.

## Verified faults in V8.1.1
1. The "logo animation" was only a tiny bottom-right card with a static SVG and a ~980ms container fade. It did not animate/reveal the actual logo artwork as requested.
2. A once-per-session key suppressed any repeat after the first page, making the effect difficult to see or test.
3. CREATE V8.1.1 had old and new progress-bar CSS selectors competing; the new uniquely named bar avoids legacy styling entirely.
4. The earlier screenshots were isolated markup/CSS previews, not running Next.js or live Firebase screenshots. They do not establish production parity.
5. Experience Highlights renderer in V8.1.1 already uses text-first 2-column cards, but the public page can still show an old design if the new code was not built/deployed or cached.

## Fixes
- The exact approved /assets/trawellbeyond-display.svg is now revealed visibly at the center of the first page, with its original orange accent. The derived orange motif remains available for other page details; it is not duplicated above the logo. Source SVGs are unmodified.
- `/v81-motion.css`, `/v81-motion.js`, and React BrandReveal share 1750ms timing; pointer-events none; reduced-motion skip.
- Once per session by default. To replay it manually on a site with the V8.1.2 build, visit `/?previewLogo=1` or `/create?previewLogo=1` in the same browser.
- Header logos get a restrained orange underline on hover/focus; SVG unchanged.
- CREATE uses `.cr-v812-meter` to avoid conflicting previous styles; DOM marker `data-tb-ui-version=v8.1.2`.
- Public experience template also has the same DOM version marker.

## How to verify the deployed build
1. Deploy this version, force-reload (Ctrl+Shift+R) and visit `/create`.
2. In DevTools Console run `document.querySelector('[data-tb-ui-version]')?.dataset.tbUiVersion` and expect `v8.1.2`.
3. Visit `/?previewLogo=1` to replay the centered logo animation. If it does not show, check `/v81-motion.js` and `/v81-motion.css` responses in Network tab; they must be HTTP 200 with newest source.
4. In CREATE, inspect `.cr-v812-meter`. Its height must be 3px; it must not contain `.tb-v81-line-nodes`.
5. On a published experience page inspect `.ex-highlights-layout`. It must be either `with-media` or `without-media`; its `.ex-highlight-grid` should be two columns at desktop widths and one at narrow screens.
6. Validate actual Firebase imagery; CSS previews with sample images are not proof of correct production imagery.
7. Run `npm install`, `npm test`, `npm run check:syntax`, `npm run verify:frontend`, `npm run build` locally before deployment.

## Limits
Production Next.js build/live Firebase checks have NOT passed in this build environment because npm dependencies could not be installed. The attached verification screenshots, if provided, are isolated browser tests of actual assets and templates, not a deployed site.
