# TrawellBeyond V7.8 — Dubai + Thailand Together
**Release prepared:** 9 November 2026  
**Baseline:** V7.7 Singapore master + global Content Completion Center  
**Frontend:** approved V5.1 unchanged  
**Architecture:** Next.js 16 / Firebase Web SDK; no Firebase Admin SDK, no payment gateway

## What's actually delivered

- **Dubai**: cinematic destination draft with three editorial storytelling chapters, Travel Essentials, featured experiences, a suggested journey, FAQ and official-source travel references.
- **Thailand**: the same approved design and schema, including Bangkok/Pattaya, Chiang Mai, Phuket and Krabi content. Individual regions have different transit and weather conditions; the journey suggestions account for transfers.
- **28 Experience Details drafts** (14 Dubai and 14 Thailand). Twenty are adapted from the available Singapore/Dubai/Thailand reference workbook and eight are newly drafted. Titles, editorial descriptions, highlights, suggested durations, attraction directions/nearest transport, ticket/safety notes and official reference links are included.
- **5 Journey Details drafts**: two Dubai itineraries and three Thailand itineraries, each with day-wise plans, experiences, personalization suggestions and enquiry CTAs inherited from Singapore.
- **27 candidate Commons images**, with a photo-to-content map for destination heroes/stories/gallery, matching Experience Details and ordered day-wise Journey photography. An admin must open each candidate file page, verify rights and subject, and explicitly accept images **individually** before import. The resolver checks source file, photographer and commercially permitted licence again. Imported copies use the existing V7.4–V7.7 image optimizer (WebP where supported with responsive variants), Store credits, licence, source and alt text, and fill **empty** media fields only.
- Global Content Completion Center already available from V7.7 audits both destinations and their experiences/journeys. Existing Singapore, published records, custom CMS text, images and publication status are untouched by draft installation.
- Destination videos for Dubai and Thailand and an attraction preview for Burj Khalifa, see `V7_8_VIDEO_SOURCES.md`. Other Experience Details videos stay blank pending official-source checks.

### Important, time-sensitive attraction status

**Museum of the Future is temporarily closed.** Its operator reports closure from September 2026 and expects reopening during Q1 2027. The experience can be kept as a planning draft, but admission is not currently available. Both the record and suggested journey narrative have been adjusted to avoid implying it is open. Verify on https://museumofthefuture.ae/en/get-help before changing status.

Dubai Miracle Garden and Global Village are seasonal. Thailand island/boat excursions depend on weather, permits and local closures. **Opening times, tickets, pricing, accessibility and transfers need operator confirmation for the actual dates.** Existing workbook hours are references rather than guaranteed live schedules.

## Local installation (Windows PowerShell)

Extract `TrawellBeyond_V51_Dubai_Thailand_V7_8_Full_Code.zip` to your working directory. Copy the **working V7.7 `.env.local`** (do not paste credentials into chat).

```powershell
cd C:\atul\ReactJS\TrawellBeyond_V51_Dubai_Thailand_V7_8
Copy-Item "C:\atul\ReactJS\TrawellBeyond_V51_Content_Intelligence_V7_7\.env.local" ".\.env.local"
npm install
npm test
npm run check:syntax
npm run verify:frontend
npm run build
npm run dev
```

`http://localhost:3000/admin` → sign in through existing Microsoft account. Ensure `teamUsers` permissions are already correct. **No new Firestore or Storage rules and no reset are required for this release.** Deployment only after local tests pass. If port 3000 is occupied, use the actual URL printed by Next.js.

## Admin operator workflow

1. **Dashboard → V7.8 / TWO DESTINATIONS → Install Dubai + Thailand drafts.** Creates 35 private draft documents. Repeating is safe: existing slugs are skipped and Firestore transactions prevent collision.
2. Expand **Review 27 Wikimedia photo candidates and licences**. Inspect each file page and compare the subject, licence requirements, photographer, derivative/crop permission and whether credit can be displayed. Tick **Approve this photograph** only for accepted sources; confirm the overall rights checkbox.
3. Click **Import [N] reviewed WebP photos**. The resolver refreshes the Commons licence at import time, uploads optimized variants to Firebase Storage, records credits and fills existing **blank** photo positions through a transaction. Missing or rejected candidates are skipped with a report. The importer never changes a content record's status or publishes anything. Existing custom photos stay in place.
4. Open **Content Completion** and filter Dubai/Thailand. Review any missing gallery photos, day photographs, videos, source/credit fields and practical information. For missing images, use the Media Library and choose a more appropriate source (or official/owned imagery) rather than silently substituting a different attraction.
5. Review **Destinations → Dubai / Thailand** and **Experiences** and **Journeys** in Admin. Confirm hours, ticket inclusions, local guidance, map/transport, media licences and mobile page appearance. Publish each approved record using normal CMS controls.
6. On the public site, test destination → experience → Add to My Journey → CREATE → enquiry in Admin. Verify all related links, galleries, source attributions, video playback, mobile and desktop. Keep unavailable/closed experiences in Draft until appropriately labelled and approved.

## Important limits & what this release does *not* claim

- Code files contain **photo suggestions and a secure import workflow, not the original photos themselves**. The live Commons/Storage import and licensing still require your approval. Several candidate filenames in the reference workbook might be outdated, and some attractions may lack licensed subject-accurate images. The completion scanner will show remaining gaps.
- The standard Experience Details gallery needs more than a hero image. For each experience, curate a few distinct, accurate shots in Media Library; don't fill an attraction with generic nearby skyline images.
- Not all 28 individual experiences have official videos: source-reviewed examples only are provided. The other video fields intentionally stay blank.
- The content is **not yet deployed or published** to your actual Firebase project; these are code-backed drafts. No production Next.js build, live Firebase integration, public playback or actual Media Library imports could be run in this environment.
- Image-rights conditions matter: CC BY requires attribution; CC BY-SA may require attribution, link to the licence, change indication and share-alike for adapted/cropped versions. Confirm applicability with the source terms before using in a commercial site.
- The photo auto-linker only fills missing media and preserves custom images. Existing nonempty image credits are appended safely (never deleted) when source lines are present; changes go through blank-only transactional completion.
- The imported data is customer-facing only. DreamTrawell internal net prices, vendors, margins and SOPs are not published.

## Content and evidence manifests

- `V7_8_CMS_CONTENT_MANIFEST.csv` — all 35 drafts, status, references, photo availability and review requirements.
- `V7_8_ATTRACTIONS_REFERENCE.csv` — the 20 workbook-sourced attraction references.
- `V7_8_MEDIA_REVIEW.csv` — 27 filename/source/licence review candidates (the licence **hints** are not certification).
- `V7_8_VIDEO_SOURCES.md` — curated source video references.
- `V7_8_CHANGED_FILES.md` — exact changed file paths against V7.7.

## Quality assurance

- 102/102 Node automated tests passed, including new content/schema integrity, single-destination slug identity, image rights guardrails, publication protection, ordered Journey photos and append-only credits.
- `npm run check:syntax` passed (44 JS modules, 29 JSX files and 3 JSON manifests); this checks source structures, **not the full React/Next compiler**.
- `npm run verify:frontend` passed approved V5.1 design markers.
- **Production build unverified:** `npm run build` cannot complete in this environment because dependencies including `esbuild` are not installed; do not mistake structural checks for a successful build.
