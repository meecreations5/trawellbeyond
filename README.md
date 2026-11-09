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
