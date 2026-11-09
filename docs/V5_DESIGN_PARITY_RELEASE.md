# TrawellBeyond V5 - Destination, Experience and Journey Design Parity

Release date: 8 November 2026

This release is a focused replacement for V4, not another Admin redesign. It preserves the approved V5.1 homepage and the current Firebase **Web SDK only** architecture. No Firebase Admin SDK, service-account key, online checkout or Firestore reset is required.

## What changed

### Destination details

- Keeps the eight approved V5.1 destination sections, pinned storytelling and CSS/scroll interactions.
- Three story headlines, descriptions and photographs are now individually editable through the Destination CMS record.
- The intro has independently editable **Who is this for?** and **Travel style** fields.
- The four Explore by Purpose selections now take the destination-specific `Description | Keywords` text from CMS and show the selected destination's content on first load.
- Curated experiences are explicitly ordered by their **URL slugs**. Only published experiences render; if the selections are unavailable, other published experiences are used as fallbacks.
- A specific featured journey may be selected by slug. The old generic first-match behaviour is now fallback only.
- Removed the globally hardcoded `SINGAPORE YOUR WAY` banner and Singapore-only introductory copy.
- Added a link to the matching experiences listing using a destination filter.
- Destination narrative photographs use dedicated chapter photos or gallery images; missing images show a neutral fallback rather than repeating the cover automatically.

### Experience details

- Replaces generic `DetailPage.jsx` use for `/experiences/[slug]` with a dedicated V5.1-style HTML template plus stylesheet.
- Adds the cinematic hero, introduction, numbered highlights, photograph gallery, practical information, ticket notes, optional official reference, related published experiences, CREATE selection and on-page enquiry form.
- The new enquiry form uses the existing Firebase Web SDK enquiry bridge. It does **not** submit payment or book travel.
- The selected experience and destination are passed into CREATE and Enquire; the form preserves context and explicitly requests consent.
- A gallery is omitted if no gallery photographs exist, rather than inventing photographs.

### Journey details

- Preserves all seven approved V5.1 journey sections, day selector and personalizer.
- `dayImages`: a separate HTTPS image per itinerary day, in order, one URL per line.
- `galleryImages`: distinct gallery photographs. Missing slots use a neutral graphic rather than repeating the hero photo.
- `journeyStoryTitle`, `journeyGoodFor`, `journeyInterests`, `includedNotes`, `toConfirmNotes`: editable itinerary-specific messaging and personalizer choices.
- Correct dynamic destination breadcrumb, journey title, first day's photo and starting-night counter.

### Admin / Firebase

- Adds new content fields to the existing simple Admin editor and the allowlist in `firestore.rules`.
- New story photos and journey-day photos can be selected from the existing Media Library.
- Adds a non-blocking 'Before you publish' completeness checklist. Draft/Published remain the only content statuses.
- `teamUsers` and the Microsoft Authentication workflow are unchanged.
- **You must deploy the V5 Firestore rules** before saving records that include the new fields, or Firestore will reject the write.

## How to install on Windows

1. Extract the Full Code ZIP into a NEW folder, e.g. `C:\atul\ReactJS\TrawellBeyond_V51_CMS_Design_Parity_V5`.
2. Copy your working V4 `.env.local` into this NEW folder. Never upload the credentials file here. Confirm that the six `NEXT_PUBLIC_FIREBASE_*` values refer to your real Firebase project.
3. Open PowerShell:

```powershell
cd C:\atul\ReactJS\TrawellBeyond_V51_CMS_Design_Parity_V5
npm install
npm test
npm run check:syntax
npm run verify:frontend
npm run build
```

4. In the SAME new project folder, check the Firebase project before deploying rules:

```powershell
firebase login
firebase projects:list
firebase use --add
firebase deploy --only firestore:rules,storage
```

This deploys only rules, not site code, and does **not** delete Firestore, images, `teamUsers` or Authentication users. Select your existing TrawellBeyond project, not another business's project.

5. Start the website:

```powershell
npm run dev
```

Visit `http://localhost:3000/admin` and sign in with the Microsoft account that has `teamUsers/<Firebase UID>` active and `role: super_admin` (or `admin`).

## CMS content and publishing order

1. Website Pages -> **Header & Footer** (`site-settings`) and **Homepage** (`homepage`): confirm the existing published content and the V5.1 header/homepage.
2. Destinations -> **Singapore**: choose a licensed cover and three story images, enter chapter text and purpose descriptions; save draft, refresh, then Publish.
3. Experiences -> **Gardens by the Bay** (or another Singapore attraction): choose cover/gallery, verify duration, opening hours, ticket notes, inclusions and official URL; publish.
4. Return to the Singapore destination and update its `Featured experiences in display order` field with the published experience slug, one per line (for example `gardens-by-the-bay`). Publish the change.
5. Journeys -> **Singapore, at Your Pace**: choose hero, 3 gallery images and 4 day images; confirm itinerary and options; publish.
6. Destinations -> Singapore: set `featuredJourneySlug` to `singapore-at-your-pace` and publish.

**Example Destination Purpose field:** `Include famous sights and local stories at your own pace. | Marina Bay / Gardens / Culture`.

**Example Itinerary entry:** `Day 1: Arrival & Marina Bay | Arrive, settle in and explore the waterfront. | Arrival, Skyline`.

**Example itinerary photos:** Paste one different HTTPS Firebase Storage image URL per line into `Itinerary photos, one per day`. Day 1 takes line 1; Day 2 takes line 2, etc.

If you previously installed the V4 drafts, **edit those existing records**. Do not import the starter content again expecting it to overwrite them. The importer intentionally skips existing slugs.

## What to verify before launch

- Public homepage at `/` and `site-settings` header/footer still match the approved V5.1 design.
- `/destinations/singapore` shows all eight sections, distinct story chapters, working purpose buttons, correct experience tiles and journey link.
- `/experiences/gardens-by-the-bay` shows hero, visual highlights, optional gallery, practical information, CTA and on-page enquiry.
- 'Add to CREATE' opens `/create` with selected destination and experience pre-filled.
- Enquiry form submits only once and appears under Admin -> Enquiries; test with valid consent and Firebase Anonymous auth enabled.
- `/journeys/singapore-at-your-pace`: clicking Day 1/2/3/4 changes both itinerary text and image. The enquiry drawer submits and appears in Admin.
- Draft records never appear publicly. Save Draft survives a hard refresh. Published edits appear after a refresh.
- Check mobile navigation and header/footer at desktop and mobile widths.
- Use only imagery with confirmed commercial-reuse rights; check photographer credits, licences, attraction photo accuracy, practical details, availability and legal pages before live publication.

## Verification status in the supplied package

- All 25 automated tests pass, including six new parity-focused tests.
- JavaScript syntax checks pass; the 25 JSX files were parsed without syntax errors.
- Original V5.1 homepage verification passes.
- **Not verified here:** complete Next.js build (dependency installation timed out), Firebase live writes, Microsoft authentication, enquiry submission, browser screenshot comparison and production deployment. These are essential launch gates, not implied successes.

## Not included or deliberately unchanged

- No Firebase database reset and no deletion of Storage.
- No new online-payment system.
- No changes to the approved master logo or original V5.1 homepage HTML.
- No claim that image-less starter drafts are ready for promotion. Select and verify photographs before publishing.
- No attempt to reproduce an 'approved V5.1 experience-detail screenshot': the uploaded V5.1 design source contained no standalone experience page. The new page follows the approved typography, motion and editorial rhythm with sections from the former detailed experience implementation.
