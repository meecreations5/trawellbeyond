# TrawellBeyond V8.1 — Motion & Interaction Identity

**Release:** V8.1.0 · **Baseline:** V8.0.1 Complete Project · **Date:** 9 November 2026

## What this release actually does

This is a focused UI/UX enhancement, not a website rewrite. It preserves V4.2 Motion Edition, the original locked logo, the slightly enlarged V8.0.1 journey header logo, Firestore/CMS data, existing Admin and team access, the enquiry-led business model, and My Journey persistence.

1. **Logo Moment:** Shows the exact approved `trawellbeyond-display.svg` in a non-blocking floating welcome moment once per browser session. It disappears automatically in about one second, accepts no pointer interactions, never delays the real page, and is skipped for reduced motion. The React implementation is robust to development Strict Mode effect replays.
2. **Actual logo accent reuse:** The new `trawellbeyond-accent-motif.svg` copies the original orange path *and its clip geometry* from the approved display SVG; it is a cropped derivative used beside the Story progress, CREATE and branded states. The master/display SVG files remain byte-for-byte unchanged.
3. **Orange Journey Line:** One accessible and reusable line component connects the six Philosophy stages and the four CREATE steps. Progress uses transform rather than animated widths. Story includes an optional desktop chapter navigation rail, with all sections retaining readable normal flow on mobile.
4. **Living Postcard:** Adds quiet photo/card hover feedback, progressive destination/journey/experience arrival animation when an outgoing published slug matches the incoming page, and optional browser-native transitions **only on public standalone HTML templates**. Navigation works instantly without the API, scripts or matching images. No navigation interception or artificial waiting is introduced.
5. **Save to My Journey:** Clicking Save immediately updates button text, `aria-pressed`, the tray count and live announcements; activating an already-saved button removes it. A small one-time pulse supplements the saved state. Existing `tb_journey_v73`, the tray API and `tb:journey-updated` event remain intact.
6. **CREATE progression:** Shows branded progress without altering stage validation, drafts, journey preferences, day planning, consent or enquiry submission. A decorative check appears only after the backend confirms success.
7. **Branded states:** A reusable component for empty, error, loading and confirmed-success messaging. It is used for empty catalogues, not-found guidance and enquiry outcomes. InquiryForm now requires an explicit successful backend result before displaying confirmation.

**Out of scope:** No new payment/booking flow, no Firebase Admin SDK, no new Firestore fields/rules, no AI/chatbot, no automated publication, no destination content changes, and no image uploads. V8.1 does not fill missing live destination, experience or journey photos.

## New files

- `public/v81-motion.css` — design tokens, transitions, loader, story/create line, states, responsive and reduced-motion rules.
- `public/v81-page-transitions.css` — progressive cross-document transitions included **only** in public homepage/detail HTML (not Admin/React layouts).
- `public/v81-motion.js` — standalone HTML adapter (session-based logo reveal and matching postcard arrival).
- `public/assets/trawellbeyond-accent-motif.svg` — approved logo accent copied exactly, with original geometry and clips.
- `src/lib/motion-policy.mjs` — pure motion helpers and stable browser keys.
- `src/components/motion/BrandReveal.jsx` — non-blocking React logo reveal.
- `src/components/motion/JourneyLine.jsx` — accessible progress primitive.
- `src/components/motion/ChapterProgress.jsx` — Story chapter orientation.
- `src/components/motion/BrandedState.jsx` — reusable semantic state messaging.
- `tests/v81-motion.test.mjs` — 19 release regression tests.
- `scripts/audit-v81-motion.mjs` — source/logo/integration checks.
- `scripts/check-live-v81.mjs` — read-only smoke check for a deployed domain.

## Modified files

- `public/index.html` and `src/templates/{destination,experience,journey}.html` — include shared public motion assets.
- `public/journey-tray.js` — idempotent save API preserved and user-action toggle feedback added.
- `src/app/layout.jsx`, `src/components/PublicShell.jsx`, `src/components/PageMotion.jsx` — enable new public-page motion without affecting Admin.
- `src/app/our-story/page.jsx`, `src/components/StoryPhilosophy.jsx` — chapter ids/rail and six-stage journey line.
- `src/components/CreateStudio.jsx` — reuse motion line and original accent.
- `src/components/ContentCards.jsx`, `src/components/InquiryForm.jsx`, `src/app/not-found.jsx` — accessible states and truthful confirmations.
- `package.json` — release version and two new audit commands.
- `README.md` — V8.1 release pointer.

## Installation (existing V8.0.1 project)

1. Back up the existing V8.0.1 code and keep your `.env.local` and hosting secrets safe.
2. Extract the **Changed Files Only** ZIP at the project root, preserving its relative folders. Do **not** extract it into a new nested folder.
3. Install dependencies and run verification using PowerShell or the shell in your project folder:

```powershell
npm install
npm test
npm run check:syntax
npm run verify:frontend
npm run audit:motion:v81
npm run build
```

4. If the build passes, deploy the Next.js application through your *existing* hosting/CI pipeline. **There are no new Firestore or Storage rule changes in V8.1.**
5. Check the deployed website using:

```powershell
npm run check:live:v81 -- https://your-live-website.example
```

6. Complete manual acceptance before release sign-off. The CLI is read-only and cannot certify signed-in Admin screens, image correctness, enquiries or actual performance.

**Note:** If you install the Complete Project ZIP instead, keep `.env.local` from your existing secure deployment and follow the same commands. Do not reset or re-import Firestore.

## Local verification completed

| Check | Result |
| --- | --- |
| `npm test` | **157/157 pass** (138 baseline + 19 V8.1 tests) |
| `npm run check:syntax` | Pass — JS modules and JSX file structure |
| `npm run verify:frontend` | Pass — approved HTML/template markers |
| `npm run audit:motion:v81` | Pass — logo bytes, motion integrations, no false success |
| JSX parser (global local TypeScript) | Pass on 12 new/modified JSX entrypoints |
| Chromium isolated test at 320, 375, 390, 768, 1024, 1440px | Pass — logo, save/un-save, no horizontal overflow or JS page errors in test fixture |
| Reduced-motion fixture | Pass — intro disabled |
| Keyboard + focus (isolated fixture) | Pass — Enter to save, open tray, Escape closes and restores focus |
| Original SVG hashes | Unchanged from V8.0.1 |
| Full Next.js production build | **Not verified** — `npm install` timed out; `npm run build` fails at prebuild because `esbuild` is unavailable in this isolated environment |
| Live Firebase/content/real-device QA | **Not performed** |

The Chromium test was an isolated component/static-markup test, **not** a fully hydrated Next.js or production Firebase browser test. The browser blocked local URL navigation, so it was tested using embedded DOM/CSS/JavaScript without real CMS data.

## Production acceptance gates

- [ ] `npm install` and `npm run build` complete in the real repository/CI environment.
- [ ] Home, Story, Philosophy, CREATE, destinations, experiences and journeys render with the actual approved logo and no broken navigation.
- [ ] First-visit reveal appears once, does not intercept actions and is absent under reduced-motion settings.
- [ ] Story chapter rail remains legible on desktop and doesn't overlap sticky navigation; it is hidden on small screens.
- [ ] Philosophy tabs remain keyboard accessible; CREATE 4-stage progress tracks the true stage without submitting early.
- [ ] Save/remove restores correctly after browsing between HTML and React routes; My Journey does not duplicate entries.
- [ ] Real enquiries only show confirmed success after actual Firestore acceptance; failures show error and retry instructions.
- [ ] Test 320, 375, 390, 768, 1024, 1440px on deployed pages, including real Android/iPhone devices.
- [ ] Test reduced motion, keyboard focus, focus order, screen-reader statuses, contrast and zoom to 200%.
- [ ] Inspect actual destination/experience/journey photographs for relevance, attribution and availability; complete missing images through Admin, then publish only approved content.
- [ ] Measure Core Web Vitals on production mobile traffic: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 at p75. Local static tests do not establish these.

**Content/image caveat:** To audit a JSON export of current CMS records, run `npm run audit:media:v80 -- path/to/export.json`. This is a structural check and requires a real export. Human validation of images and licences remains mandatory.

## Rollback

No migrations or rule changes were made. Restore the V8.0.1 backup or revert the V8.1 modified files in source control, then deploy the previous frontend release. Browser session/local-storage values from the old journey tray are retained; no data migration is necessary. The static `tb_intro_seen_v81` and `tb_postcard_v81` keys can harmlessly remain until the browser session ends.
