# TrawellBeyond V7.9 — All Remaining Destinations & Controlled Bulk Publishing

**Prepared:** 9 November 2026  
**Baseline:** V7.8 Dubai + Thailand + V7.7 Singapore master + approved V5.1 frontend  
**Business model:** Enquiry-led; no online payments  
**Tech:** Next.js 16.4.5, Firebase Web SDK, Microsoft sign-in, protected `teamUsers` permissions; no Firebase Admin SDK.

## Release scope

- 17 additional destination drafts (5 international + 12 domestic), 102 unique Experience Details drafts (6 per destination), 34 customizable journey drafts (2 per destination): **153 new private records**.
- Destination Essentials with language, currency, local transport, dining, accommodation area, culture, weather and arrival-reference content, all requiring current fact review.
- Cinematic destination story chapters and recommended experiences/journeys use the **existing** Singapore V5.1 templates; no design change.
- New Admin **Bulk Rollout V7.9** screen: read-only scan, import only missing drafts, guidance for sourcing photos, readiness audit, CSV export, record-specific review, controlled multi-record publishing.
- A Firestore transaction for each publish checks current status, exact revision (`updatedAt`), photo/credit/rights fields, distinct story photos, sufficient galleries/day images, latest visit/entry review dates and parent destination publication. Bulk publish is restricted to these 17 destinations.
- Existing V7.7 Content Completion Center and WebP crop/resize/variants Media Library remain available; no automatic image/video import or publication without review.

### Destinations

International: Malaysia, Bali, Vietnam, Sri Lanka, Turkey.  
India: Kerala, Himachal Pradesh, Kashmir, Rajasthan, Goa, Sikkim, Mysore, Ooty, Delhi, Agra, Varanasi, Ayodhya.

### Honest state of content

**These are 153 private editorial/planning drafts, not 153 photographically complete public pages.** No attraction photo or ticket price is invented or implicitly licensed, and no date-stamped current fact verification is claimed. Existing media permissions and trusted source links still require the team's actual review. Videos are optional and currently unset for these new drafts. Source references in CSV are predominantly official destination tourism sites; attraction-specific schedules, entry requirements and transport instructions must be verified with current official operators or authorities before publishing.

## 1 — Complete V7.8 Dubai + Thailand LIVE acceptance on your own Firebase-connected website

After installing the release and starting a running site, run from a separate PowerShell window:

```powershell
npm run check:v78 -- --base http://localhost:3000 --out v78-live-acceptance.json
```

Use the real URL printed by Next.js (including a different port if necessary). The checker performs eight read-only HTTP page checks: both destination details, four Experience Details and two Journey Details pages. A 404 means that item is not published; it does **not** authorize publishing an unreviewed draft.

The **automated checker does not certify** photographs, proper licences, video playback, responsive layout, CREATE behavior or real enquiry delivery. Manually check both destinations on desktop + phone:

1. Destination hero, stories, gallery, Travel Essentials and featured links.
2. Experience Details hero, accurate attraction images, operating guidance, optional verified video, Add to CREATE.
3. Journey details day tabs, correct day photos, galleries, personalizer, CREATE journey.
4. In Admin: test Submit Enquiry and confirm correct destination/experience/journey attribution.
5. Source and licence fields, presence of correct location, no mismatched photos; no promise of unavailable attractions. 
6. Rescan with Content Completion; correct all high-priority issues before signing off.

**Live status in prepared release:** NOT VERIFIED. No user Microsoft/Firebase authenticated session or running site is available in the build environment. No live Firestore content was changed. The separate baseline V7.8 Node suite passed 102/102.

## 2 — Install V7.9 code (Windows PowerShell)

Extract **Full Code ZIP** to a fresh working folder. Copy the known-working `.env.local` from your V7.8 folder (do not share credentials in chat):

```powershell
cd "C:\atul\ReactJS\TrawellBeyond_V51_All_Destinations_V7_9"
Copy-Item "C:\atul\ReactJS\TrawellBeyond_V51_Dubai_Thailand_V7_8\.env.local" ".\.env.local"
npm install
npm test
npm run check:syntax
npm run verify:frontend
npm run build
npm run dev
```

For an existing V7.8 folder, alternatively extract **Changed Files Only** *inside that project's root*, replacing matching relative file paths; retain its `.env.local`. `npm install` is required for a clean folder. If the build fails, do not deploy; capture the error for correction.

**No new Firestore or Storage security rules are required for V7.9.** Deploy only if you have not already deployed the compatible prior-version rules, and confirm the selected Firebase project before running any deploy command. Do not reset Firestore, delete Storage content, change `teamUsers`, or add Firebase Admin SDK.

## 3 — Admin workflow

1. Sign in at `http://localhost:3000/admin` with the existing Microsoft account. Select **Bulk Rollout V7.9**, or Dashboard → **17 destinations. One publishing workflow**.
2. Tick desired destinations (all 17 initially), then **Scan current Firebase records**. Existing documents by slug are listed as preserved. Download the review CSV if needed.
3. Click **Install N missing private drafts**. New records are saved as `draft` with no invented photos, prices or dates. The transactional create path rejects duplicate slugs; retrying preserves existing documents.
4. Open **Media Library**, source authentic attraction photos or usable Commons images. Verify commercial licence, creator, original source page and necessary attribution. Crop/resize; save WebP variants, then assign suitable cover, story, gallery and one image per journey day. The CSV photography queue gives targeted source-search queries but is **not a set of approved image URLs**.
5. Review Travel Essentials, exact attraction hours and operator links, nearest/actual access, cultural notes, itineraries, operator closures and date of last verification. For new Experience Details, generic 'Check operator hours' and 'Local transfer to be confirmed' placeholders **cannot** pass the V7.9 bulk publishing gate.
6. Refresh the Firestore scan. For each record marked ready, inspect content and media, tick its individual approval box, and acknowledge media rights and factual accuracy.
7. Click **Publish N reviewed records** and type the requested `PUBLISH N` phrase. Destinations publish first, then their experiences and journeys. Per-record transactions recheck content at the latest revision. Partial failures are reported and do not silently change other records.
8. Re-run Content Completion and check every newly public page plus the CREATE → Enquiry path from a desktop and a real mobile device.

The user-facing website continues to use the approved design. Admin's ordinary single-record Publish action remains available for the existing content; the new safety gate applies to the V7.9 bulk workflow.

## 4 — Documentation and sources

- `V7_9_ALL_CONTENT_MANIFEST.csv`: all 153 draft records, route slugs and required verification steps.
- `V7_9_PHOTOGRAPHY_REVIEW_QUEUE.csv`: assigned media slots, candidate Commons search terms, suggested dimensions, empty licence/source/approval fields. No actual photo rights are presumed.
- `V7_9_OFFICIAL_VIDEO_REVIEW.csv`: optional official/authorized video-source research queue; empty verified URLs.
- `V7_9_CHANGED_FILES.md`: exact manifest of files changed since V7.8.
- `V7_8_LIVE_ACCEPTANCE_CHECKLIST.md`: printable sign-off, including enquiry/CREATE/photo tests.

Authoritative destination tourism-source starting points are included in the starter records: tourism ministries/agencies and their destination portals. Do not substitute a general guide for a specific operator opening-hour notice or visa guidance.

## 5 — Automated validation already run

- **109/109 Node automated tests passed** (102 from V7.8 plus 7 V7.9 tests).
- `npm run check:syntax`: 47 JavaScript modules, 30 JSX files and 3 JSON manifests verified (structural check, not a Next compiler pass).
- `npm run verify:frontend`: approved V5.1 frontend and page-template markers passed.
- **Full Next.js production build NOT VERIFIED**: dependencies were not installed successfully in the build environment.
- **Live Firebase and actual photo import NOT VERIFIED**: requires your deployment, authenticated Admin and explicit media/source review.

## Final acceptance criteria

V7.8 Dubai/Thailand can be marked live accepted only after HTTP and manual photo/CREATE/enquiry checks pass. V7.9 full launch completion requires the 17 destinations and their selected experiences/journeys to have source-correct, licensed photographs, date-reviewed travel facts, valid published URLs, correct responsive media and functioning enquiry submissions. Keep unfinished items as Draft; do not use placeholders or pretend they are live.
