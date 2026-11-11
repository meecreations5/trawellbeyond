# TrawellBeyond V8.3 — Mobile App Experience

**Baseline:** V8.2.1 Complete Project (10 Nov 2026). This is a mobile-first presentation enhancement to the existing enquiry-led Next.js website; it is **not** a native Android/iOS app or an offline PWA.

## Purpose

Retain the approved V4.2 Motion Edition visual identity and exact SVG logo while giving visitors on phones and small tablets the familiar touch/navigation patterns of a dedicated travel app. Desktop should look and function as before, and the Admin CMS and Firebase data/permissions must not change.

## Implemented mobile experience

1. **Persistent bottom dock:** Home, Explore, central CREATE (existing orange logo motif), Saved (My Journey), Guide (Journey Companion). All tabs use real routes; Guide opens the existing V8.2 companion with `/enquire` as the no-JavaScript fallback. App-dock active states follow the current route.
2. **App masthead:** compact sticky brand header retaining the exact existing logo asset; existing hamburger navigation remains for secondary sections such as Our Story, Journal and Contact.
3. **Immersive homepage:** softly rounded hero, responsive headline, generous whitespace and original motion language. A new mobile-only “Where to next?” area links to International, Domestic (India), Curated Journeys and Journey Match.
4. **Discovery:** mobile scrollable region pills, app-like card corners, visual hierarchy and more convenient destination/journey card spacing.
5. **CREATE:** a shorter first screen, horizontally swipeable four-step progress navigation and compact, people-first purpose cards. The actual four-step validation, local draft state, experience selection and existing enquiry submission remain untouched.
6. **Journey Companion:** Guide is a primary mobile tab; the old floating assistant and floating tray buttons are hidden only when the dock is present. Their underlying panels and desktop controls still work. Companion choices and actions use rounded, touch-friendly surfaces.
7. **Mobile behavior:** safe-area bottom padding for modern phones; minimum useful tab target heights; prevention of input-triggered iOS zoom; scroll-snap where appropriate; dock automatically hidden when dialogs or keyboards are active; reduced-motion support.

## Source architecture

The website includes both React App Router pages and original CMS-rendered HTML routes. They must both be supported:

- `src/components/MobileAppDock.jsx`: React/Next Link navigation for App Router pages.
- `public/mobile-app-dock.js`: lightweight equivalent for CMS HTML homepage, destination, journey and experience templates.
- `public/mobile-app.css`: single styling layer for CMS HTML routes, scoped to widths up to 850px.
- `src/app/mobile-app.css`: matching styling layer for React pages.
- `src/components/PublicShell.jsx`: includes the React dock on public routes, not Admin.
- `src/lib/site-chrome.mjs`: injects the mobile CSS and JavaScript into approved HTML templates.
- `public/index.html`: mobile-only quick-discovery shortcuts.
- `src/app/layout.jsx`: imports the mobile CSS without introducing server/client-dependent HTML.
- `tests/v83-mobile-app.test.mjs`: source-level safeguards.

No Firestore rules, Storage rules, Firebase configuration, pricing, checkout or CMS schemas were changed. The logo assets remain untouched.

## Installation

For an existing **V8.2.1** project, back up the current source, then overlay the V8.3 Changed Files ZIP at the project root. Do not apply the patch to an older version without first updating that baseline.

```powershell
npm install
npm test
npm run check:syntax
npm run verify:frontend
npm run build
```

Deploy with your existing hosting process only after the production build and live acceptance pass. No Firebase rules deployment is required by **this mobile layout change**. Previously unresolved auth/rules requirements remain separate.

## Verification completed locally

- 191/191 Node automated tests passed (186 baseline + 5 mobile-specific tests).
- JavaScript/JSX syntax and approved frontend marker verification passed.
- Chromium standalone homepage previews used the updated homepage markup, mobile app CSS, dock script and the actual Journey Companion client script.
- Test widths: 320px, 390px, 768px and 1440px. No horizontal overflow at those measured widths; app dock is visible below/equal 850px and hidden at 1440px. Guide opened the companion at 390px. In these isolated browser previews, actual CMS photos were replaced with the included illustrative fallback asset.

**Not yet verified:** full Next.js production build (the local dependencies required for `esbuild`/Next were unavailable), React hydration on a running deployment, real Firebase enquiry/auth flows, media coverage on the live site, actual iOS Safari/Android Chrome behavior and field Core Web Vitals. Do not treat these isolated browser checks as a launch sign-off.

## Live acceptance checklist

- Confirm the React dock appears on `/create`, `/destinations`, `/journeys`, `/experiences`, `/my-journey` and `/journey-match`, without hydration errors.
- Confirm the static HTML dock appears on `/`, `/destinations/<slug>`, `/journeys/<slug>` and `/experiences/<slug>`.
- The dock must never appear in `/admin`. Admin screens and security access must remain unchanged.
- All five tab destinations are accurate; Guide opens and closes without navigating away, and has a working fallback when unavailable.
- On iPhone Safari and Android Chrome, verify 320/360/375/390/414px viewports, text legibility, safe-area padding, touch targets, body scrolling, forms/keyboard and modal dismissal.
- Test My Journey save/remove, CREATE step validation and final enquiry submission in an incognito browser. Confirm the enquiry is actually stored and appears in Admin.
- Confirm original logo reveal still works with `/?previewLogo=1` and that reduced-motion preferences are respected.
- Check actual destination, experience and journey photographs. The layout does not auto-fill missing media.
- Verify desktop above 850px remains unchanged; validate real mobile LCP, INP and CLS during the later SEO/performance phase.

## Rollback

Restore the V8.2.1 backup, or revert the files in the V8.3 changed-file manifest. No database migration or data rollback is necessary because this release is client-side layout only.
