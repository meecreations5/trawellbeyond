# V8.0 — Brand Experience Refinement

## Scope and what changed

V8.0 refines the approved V4.2 white-first, Manrope/Lora, charcoal-and-orange visual language. **The approved logo SVG and V5.1 homepage markup are not redesigned or replaced.** The site remains a CRM-driven enquiry experience (forms, WhatsApp, CREATE) with **no online payments**.

### Brand narrative and motion

- `/our-story` is a six-chapter editorial brand page: The Beginning, Origin, Belief, Philosophy, People/How We Work and Your Chapter. The narrative explicitly introduces **A DreamTrawell Destination Venture** and the brand promise **People First. Destination Second.**
- Six-stage, accessible, non-autoplay interactive Philosophy: **People → Purpose → Requirement → Journey → Experience → Moments**. Tabs support Arrow keys, Home/End, Previous/Next and semantic tabpanel announcements.
- Editorial parallax is opt-in, bounded, off on smaller screens and disabled for `prefers-reduced-motion`; nonessential elements appear as light reveals. No scroll hijacking or forced horizontal scrolling.
- Unified Manrope/Lora typography, warm white pages, charcoal sections, orange accents, visible keyboard focus, skip link, responsive cards and simpler transitions.
- Visual fallback artwork is abstract and local, so the website does not pretend an unrelated photograph belongs to a destination. **It is not a substitute for actual destination photography.**

### Interior pages / discovery / CREATE

- Journey itinerary gains keyboard-accessible day controls and a clearly visible Previous / Next day navigation counter.
- Experience detail gains on-page navigation for the story, highlights, visit information, enquiry and CREATE. Discovery has travel-purpose filters and a clear-filter reset.
- CREATE has step progress with stage navigation, selected-place image fallback, reduced motion support and explicit explanation that choices only submit an enquiry.

### CMS and permissions

- Admin > Website Pages > **Our Story** includes dedicated field groups for the opening, origin, beliefs, people, closing and six philosophy chapters, plus three optional story photographs. Edits flow through the existing draft → visual media approval → publisher publication workflow.
- Firestore rules and CMS validation have been extended for the optional Story fields; existing published pages require no schema migration. Draft media changes made by non-publishers are marked pending review.
- New photos selected from the Media Library can retain optimized variants, credits and licensing references. Existing photos and records are not rewritten by this release.

### QA and acceptance additions

- `npm run audit:media:v80 -- path/to/cms-export.json` performs read-only structural coverage checks on **published** destinations, experiences and journeys (use `--include-drafts` after the file to also include drafts). Thresholds: HTTPS cover; at least 3 distinct destination gallery images and all 3 destination story images; at least 2 experience gallery images; at least 3 journey gallery images and an explicitly stored photograph per itinerary day; rights/attribution documentation. This audit checks URLs and counts, **not image existence, photo identity, actual rights, relevance, WebP encoding, accessibility, file load, or visual quality.**
- `npm run check:live:v80 -- https://your-public-domain.example` performs a read-only route-marker check after deployment. No sign-in, image upload or lead submission happens in this script.
- See [V8.0 Live Acceptance](V8_0_LIVE_ACCEPTANCE.md) for the **mandatory** human checks.

## Upgrade from V7.9.2

1. Back up your complete existing project and Firebase rules; optionally export CMS data before deployment.
2. **Changed Files ZIP:** extract into the **root of your existing V7.9.2 project**, overwriting only matching paths. Do not create an additional nested `src` directory. Or use the **Full Code ZIP** as a fresh project clone, then bring over your own local `.env.local` (never put secrets in source control).
3. From the project root in Windows PowerShell:

```powershell
npm install
npm test
npm run check:syntax
npm run verify:frontend
npm run build
```

4. Ensure the Firebase CLI is authenticated to the **correct project** and review the `firestore.rules` changes before deploying:

```powershell
firebase login
firebase projects:list
firebase use YOUR_ACTUAL_FIREBASE_PROJECT_ID
firebase deploy --only firestore:rules
```

If the project has not yet configured `firebase use`, select the correct existing project ID; don't guess it. No Storage rules were modified in V8.0. Publishing Next.js web code is **a separate deployment** using your existing Vercel or Firebase App Hosting setup (not `firebase deploy --only firestore:rules`).

5. Deploy the updated web app through your current hosting workflow. Confirm `/our-story`, `/create`, `/journeys`, `/experiences` and `/admin` render and the Admin user roles still behave correctly.
6. In Admin, visit **Website Pages → Our Story**. Edit or approve the text. Add reviewed/licensed hero, origin and people photographs via Media Library. Save draft; a publisher approves media and publishes. Do not assume the story illustrations are real photographs.
7. Use **Bulk Rollout / Image Completion** to complete destination, experience and journey photography. Manually verify each photo's actual location/subject and licensing. Run the structured audit on an exported JSON file, then do the live acceptance checklist.

## Testing performed here

- `npm test`: **134/134 passing**.
- `npm run check:syntax`: **passed** (JS and JSX parse validation; **not** a Next.js build).
- `npm run verify:frontend`: **passed** (approved homepage and existing detail templates remain present).
- Headless Chromium **CSS layout preview only**: no horizontal overflow at 320, 375, 390, 768, 1024 and 1440 pixels; verified `prefers-reduced-motion` removes optional animation.
- The environment lacked the installable `next`, `react`, and `esbuild` packages and could not complete dependency installation; `npm run build` and actual live Firebase, Core Web Vitals and image-delivery checks **remain unverified**.

## Rollback

Restore the backed-up V7.9.2 source, reinstall dependencies and redeploy the previous web version. If Firestore rules were changed, restore the known-good previous `firestore.rules` and redeploy. The new story fields are optional, so no destructive database migration or forced rewriting is required.
