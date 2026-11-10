# V8.1.1 — CREATE & Experience Highlights UX Correction (9 Nov 2026)

**Start here:** [`docs/V8_1_1_CREATE_EXPERIENCE_UX.md`](docs/V8_1_1_CREATE_EXPERIENCE_UX.md). Focused UI polish on top of V8.1. Fixes overlapping orange CREATE progress styles, replaces destination-biased purpose-card photography with original people-first illustrations, and makes Experience Highlights an intentional two-column editorial layout with contextual photos when available. Includes a broken-photo fallback and mobile scroll treatment. Existing logo, Admin/CMS roles, Firestore/Storage rules, Journey draft data, and enquiry flows are unchanged.

**Local checks:** 163/163 automated tests, JavaScript/JSX syntax checks, frontend asset audit and V8.1 motion audit pass. Isolated Chromium layout previews at 320, 390, 768, and 1440px show no horizontal overflow. **Next.js production build/live Firebase/media acceptance remain unverified** because package installation could not reach the npm registry in this environment.

---

# V8.1 Motion & Interaction Identity (9 Nov 2026)

**Start here:** [`docs/V8_1_MOTION_IDENTITY_RELEASE.md`](docs/V8_1_MOTION_IDENTITY_RELEASE.md).

Builds on V8.0.1 without changing the approved V4.2 layout, master/display logo SVGs, Admin/Firestore permissions or enquiry-only business model. Adds a first-session non-blocking logo reveal, exact orange-accent motif, Story/Philosophy/CREATE progress, Living Postcard navigation polish, immediate My Journey save/remove feedback and clear empty/error/confirmed states.

**Local verification:** 157/157 automated tests, syntax and frontend audit pass. Isolated Chromium tests at six widths pass; **Next.js production build and live Firebase/media acceptance remain open** because dependency installation was unavailable in this environment. No new photographs are included.

---

**V8.0.1 Visual hotfix**: Journey detail logo resized slightly and destination Save/Explore actions separated and made responsive. See `docs/V8_0_1_DETAIL_UX_POLISH.md`.

# TrawellBeyond V8.0 — Brand Experience Refinement

**Baseline:** V7.9.2 Full Code, preserving V4.2 Motion Edition design and the approved SVG logo. This is an **enquiry-led website**; no checkout or payment functions were added.

**Start here:** [V8.0 Release & Installation Guide](docs/V8_0_BRAND_EXPERIENCE_RELEASE.md) and [Live Acceptance Checklist](docs/V8_0_LIVE_ACCEPTANCE.md).

**Local results:** 134 automated tests and JavaScript/JSX syntax checks pass. Frontend baseline markers pass. The Story CSS was reviewed at 320, 375, 390, 768, 1024 and 1440px in a Chromium layout preview. **Full Next.js production build and live Firebase/image acceptance have not been completed in this isolated environment** because dependencies could not be installed here.

---

# V7.9.2 — Team Content Studio + Automatic Photography (9 Nov 2026)

**Images missing after import?** Use **Admin > Bulk Rollout > Automatic Image Completion** to scan actual Firestore records across all destinations, experiences and journeys; reuse approved Commons photos or import new WebP variants into empty **Draft** photo fields. Strong filename matches are only *suggestions* and all auto-attachments require a Publisher's visual approval. **Admin > Team & Access** lets the owner invite Content Editors, Media Assistants and Publishers by Microsoft email. Published pages and existing photos are never auto-overwritten. Update **both Firestore and Storage rules**. Nothing is uploaded or published just by installing this ZIP.

**START HERE:** [`docs/V7_9_2_TEAM_PHOTOGRAPHY_RELEASE.md`](docs/V7_9_2_TEAM_PHOTOGRAPHY_RELEASE.md). This build is locally syntax/test checked, but its Next.js build, Firebase security and live image imports need validation in the user's connected environment.

---

# V7.9.1 Photo Completion Hotfix (9 Nov 2026)

**Images missing after V7.9 import?** V7.9 installed 153 private editorial drafts but deliberately did not import real photos. This hotfix adds Admin → Bulk Rollout → **03 / Guided Photo Completion**: source Commons candidates for all 590 V7.9 image placements, manually review exact image/licence, import selected photos as WebP to Firebase Storage, and atomically attach only to blank Draft photo fields. Existing destination copy, galleries, already assigned media, publication status and Singapore/Dubai/Thailand are unchanged. **No photos are bundled or uploaded by this ZIP**, and Wikimedia/production Firebase availability is not certified. See [`docs/V7_9_1_PHOTO_COMPLETION_RELEASE.md`](docs/V7_9_1_PHOTO_COMPLETION_RELEASE.md).

---

# V7.9 — All Remaining Destinations & Bulk Publishing (9 Nov 2026)

**START HERE:** [`docs/V7_9_ALL_DESTINATIONS_BULK_RELEASE.md`](docs/V7_9_ALL_DESTINATIONS_BULK_RELEASE.md). Build on V7.8 Dubai + Thailand, V7.7 Singapore and the approved V5.1 UI. Adds 17 destinations, 102 experience drafts and 34 journey drafts, all kept private until the Admin verifies real photos/licensing, time-sensitive travel facts and explicitly approves publication. New Admin → **Bulk Rollout V7.9** supports draft-only import, Firestore scan, readiness checks, editable content, review reports and selective batch publishing with a transaction.

**V7.8 live acceptance is NOT signed off by this ZIP.** Run `npm run check:v78` on your own running website and complete the separate real-media, video, mobile, CREATE and Admin enquiry tests before declaring Dubai/Thailand accepted. No Firestore reset, no Firebase Admin SDK and no unreviewed photo/video sources.

---

# V7.8 Dubai + Thailand Destination Expansion (9 Nov 2026)

**Start here: [`docs/V7_8_DUBAI_THAILAND_RELEASE.md`](docs/V7_8_DUBAI_THAILAND_RELEASE.md).**
Adds 2 destination drafts, 28 Singapore-template experience drafts and 5 customisable journey drafts, plus checked travel essentials and reviewed Commons photography import controls. Runs with the unchanged Firebase Web SDK, teamUsers and enquiry-only architecture; no database reset, no automated publication. V7.7 Singapore remains untouched.

**Important travel update:** The Museum of the Future is temporarily closed (September 2026 through expected Q1 2027 reopening). Its entry is for future planning only. See the official site and release notes before advertising or quoting admission.

---

# V7.7 Global Content Completion & Media Intelligence (9 Nov 2026)

**Start with [`docs/V7_7_CONTENT_COMPLETION_RELEASE.md`](docs/V7_7_CONTENT_COMPLETION_RELEASE.md).** This release is based on V7.6 and preserves the approved public visual design, Firebase Web SDK, Microsoft/teamUsers authorization and enquiry-only business model. It adds a global Admin audit, reviewed blank-only completion, image metadata and responsive WebP asset links. Existing data is not reset and nothing is automatically published. Run `npm test`, `npm run build` and deploy the updated Firestore rules before using the new content fields.

---

## V7.6 Journey Image Restoration (9 Nov 2026)

This update restores Journey Details galleries from the real photographs already saved on their itinerary days, improves one/two-image layouts, and adds subtle colour correction to the existing crop-to-WebP Admin Media Library. It does **not** upload or alter live Firebase images automatically. See `docs/V7_6_JOURNEY_IMAGE_RESTORATION.md` for steps, limitations and licence guidance.

# V7.4 Singapore Experience Completion & Image Optimization

**Start here:** [`docs/START_HERE_V7_4.md`](docs/START_HERE_V7_4.md).

V7.3.1 approved frontend design is preserved. V7.4 provides the four Experience Details checks, 16 Singapore attraction editorial records, reviewed Commons candidates, and Admin crop/resize/WebP variant tooling. Firebase Web SDK only; no data reset.

---

# TrawellBeyond V7.3 — Singapore UX Recovery

**Start here:** [`docs/V7_3_SINGAPORE_UX_RELEASE.md`](docs/V7_3_SINGAPORE_UX_RELEASE.md). This update builds on V7.2 without redesigning the approved V5.1 frontend or global footer. It adds a cross-page Journey Tray, unified CREATE, optional day planning, experience search/filtering, six restored Singapore starter drafts and safer publishing. **No live Firebase data or Storage photos are included or changed by this ZIP.**

---

**V7.1 Singapore photo recovery (published records included):** Read `docs/V7_1_SINGAPORE_IMAGES_FIX.md` first. Existing Firebase records and frontend are preserved.

# TrawellBeyond — V7 Singapore Complete Website Experience

**Start here:** [`docs/V7_SINGAPORE_RELEASE.md`](docs/V7_SINGAPORE_RELEASE.md).

This release keeps the approved V5.1 homepage/destination/journey visual direction and V6 single global footer. It adds editorial galleries/lightbox, distinctive Singapore images and attribution records, CMS-assisted import to Firebase Storage, and a richer four-step CREATE journey enquiry experience.

Firebase authentication, Firestore, Storage and customer enquiry processing use the **Firebase Web SDK**, protected by Security Rules and `teamUsers` membership. No Firebase Admin SDK, server credentials or payment gateway.

**Local checks:** `npm test`, `npm run check:syntax`, `npm run verify:frontend`. Run `npm install` and `npm run build` in your configured Next.js environment; live browser/Firebase testing is still required.

**Photo review:** [`docs/V7_SINGAPORE_PHOTO_SOURCES.md`](docs/V7_SINGAPORE_PHOTO_SOURCES.md). Photographs in the starter data are external suggestions until the Admin imports them into Firebase Storage. Each needs a licence and subject-accuracy check. The V7 photo-credit field requires deploying the included `firestore.rules`.

## V7.2: Experience gallery UI regression fixed

The Experience Details HTML template now loads `/sg-gallery.css` alongside the existing gallery script. The shared lightbox has a viewport-contained stage, consistently placed controls and captions, keyboard support, mobile sizing and image-error fallback. No database, storage, login, CMS schema or security rules were changed.

See `docs/V7_2_GALLERY_UI_FIX.md`.


## V7.3.1 targeted gallery fix

See `docs/V7_3_1_SINGAPORE_GALLERY_FIX.md` for the Singapore journey gallery white-overlay bug fix.

## V7.5 | Singapore travel guide and official video previews

The destination page now supports official-source Travel Essentials: language, currency, time zone, weather, public transport, dining, stay areas, arrival guidance and everyday tips. Experience pages support Plan Your Visit with location, transit, accessibility and verified operator sources. Approved YouTube links play only after the user selects Play. The content editor groups optional fields into expandable panels and can fill only missing Singapore guidance without overwriting published work.

**Start here:** [V7.5 release + installation](docs/V7_5_SINGAPORE_KNOWLEDGE_VIDEO_RELEASE.md). New Firestore content fields require deploying `firestore.rules`; Storage rules are unchanged. No Firebase Admin SDK or database reset required.


## V8.1.2 | Verified logo motion and CREATE CSS isolation

This source patch adds a visible, first-session SVG reveal with a repeatable `?previewLogo=1` QA mode; isolates CREATE progress from conflicting older CSS; and adds DOM version markers for deployed-site verification. See `docs/V8_1_2_MOTION_AND_VISUAL_PARITY_AUDIT.md`. **This is not a completed production build or live-site acceptance.**
