# TrawellBeyond V7.9.1 — Guided Photography Completion

**Date:** 9 November 2026  
**Base:** User's uploaded `TrawellBeyond_V51_All_Destinations_V7_9_Full_Code(1).zip`  
**No Firebase Admin SDK, no database reset, no design redesign, no payment gateway.**

## Root cause of missing images

The original V7.9 bulk install creates **17 destinations + 102 experiences + 34 journeys = 153 draft records**. Those drafts contain intentionally empty `heroImage`, `storyImage1..3`, `galleryImages`, and `dayImages` fields. The `V7_9_PHOTOGRAPHY_REVIEW_QUEUE.csv` records **590 intended photographic slots**, but its search terms are not downloadable, licensed or already-approved image files. Clicking “Install missing private drafts” does **not** retrieve or upload any of those photos. Consequently the images are absent, even though the Firestore content import succeeds.

## Enhancement included

Admin → Bulk Rollout → **03 / GUIDED PHOTO COMPLETION**:

1. Select one of the **17 new destinations** and a group: *Destination page*, *Experiences*, *Journeys* or *All records*.
2. The tool reads the live Firestore snapshot and lists only **missing, Draft** photo slots. Existing image URLs are preserved and excluded.
3. Select **Find photo candidates**. The app searches Wikimedia Commons via its existing public metadata endpoint (no API key). Results are proposed by keyword relevance, never silently treated as correct/approved.
4. For each slot, choose a photograph (up to four alternatives), open the *exact Wikimedia file page*, and verify it depicts the correct attraction, author and permitted commercial licence. Tick the checkbox for that particular selected photo. Photos without usable author/licence are omitted.
5. Select **Import reviewed photos & fill missing fields**, and confirm. The browser uses the existing, authenticated Web SDK path to fetch reviewed photo bytes, create cropped WebP display/medium/thumb variants, and upload them to Firebase Storage. Already imported identical Commons files are reused.
6. The app attaches images with a **Firestore transaction per content record**, using the current `updatedAt` revision as a compare-and-swap. It fills empty image placements only, preserves text, adds metadata/attribution and public responsive variants, and never publishes pages.
7. Refresh the scan and repeat for remaining destination groups. **Itinerary day images must be assigned from Day 1 onward**; missing earlier days prevent later-day placement to avoid wrong sequencing.
8. Finish attraction-opening-time and travel-guide fact checks. Use the existing readiness review and controlled publication process when content is complete. The current live website is not automatically changed by importing these private drafts.

This tool covers the 17 additional V7.9 destinations. Existing **Singapore, Dubai and Thailand** use the separate, already present image-recovery features; this hotfix does not edit their content. Published pages are intentionally excluded from automatic photo attachment; use the normal editor to repair existing published pages.

## Installation (PowerShell)

For the full ZIP, extract into a **fresh folder**, then copy your known-working `.env.local` (never share credentials):

```powershell
cd "C:\atul\ReactJS\TrawellBeyond_V51_All_Destinations_V7_9_1"
Copy-Item "C:\atul\ReactJS\TrawellBeyond_V51_All_Destinations_V7_9\.env.local" ".\.env.local"
npm install
npm test
npm run check:syntax
npm run verify:frontend
npm run build
npm run dev
```

To patch your **existing** V7.9 project, copy the contents of `V7_9_1_Changed_Files_Only.zip` **into your existing project root**, retaining `.env.local`. Run the same checks above before deploying. No new Firestore or Storage rule changes are required provided your V7.9 teamUsers and CMS media access rules have already been deployed. Do **not** re-import the 153 records or reset Firestore.

### Acceptance checklist

- [ ] Log in via Microsoft as a `teamUsers` Admin or super_admin.
- [ ] Admin → Bulk Rollout → Scan current Firebase records: selected destination and its 6 experiences/2 journeys appear.
- [ ] Select one destination; six missing destination photo placements are listed when no photos are stored.
- [ ] Wikimedia candidate search returns suitable images; verify direct source and licence. An empty search is not falsely treated as an approved image.
- [ ] Approve two or more different correct images, import them; original content and status remain intact.
- [ ] Confirm uploaded WebP URLs are in `cms/media/items`, `cms-public/...`, and the actual destination Firestore record.
- [ ] Re-run scan: missing-slot count drops; photos and attribution appear in Admin; source page is recorded.
- [ ] Import more photos for experiences and day-wise journeys, checking each exact location.
- [ ] Visit destination/experience/journey public pages **after** approval and publication. Test mobile image sizing, gallery, CREATE and enquiry forms.

## Safety, quality and limitations

- There is **no automated importing of 590 real photos** from the developer's ZIP. Uploads occur only after an authenticated administrator selects and approves actual source files; no licences, identity, subject accuracy or commercial rights are invented.
- Wikimedia results may be missing, wrong, offline or restricted. Some locations have few suitable Commons photos. Use the existing manual Media Library or properly licensed alternative image provider for unresolved records.
- Reused Wikimedia images require attribution and compliance with the exact licence, including ShareAlike where applicable; trademark, privacy/property, and other location-specific restrictions may also apply.
- Images are **WebP when the browser supports encoding it**, with JPEG fallback; never rely on the filename extension alone. Optimized variants are linked by Firebase Storage HTTPS URLs.
- Existing *published* records are not changed through the new batch. No destination/experience/journey is automatically published. Verification dates, opening hours, admission details and official video links must be reviewed separately.
- If a search or upload fails mid-batch, successfully imported files remain in the Media Library for reuse. The transaction skips occupied/duplicate fields and blocks stale revisions rather than overwriting them.
- The `api/commons` public search/image routes and Firebase Storage must be reachable from the deployed browser. This release is not a guarantee of successful network access or Wikimedia uptime.

## Automated validation on supplied ZIP

- `npm test`: **115/115 passed** (109 baseline + 6 added photo-logic tests).
- `npm run check:syntax`: 49 JS modules, 31 JSX components and three JSON manifests verified.
- `npm run verify:frontend`: passed, approved V5.1 templates unchanged.
- JSX parse via TypeScript's JSX parser: PhotoCompletion, BulkRollout and AdminConsole parsed without errors.
- **Not verified:** Full Next production build (npm dependencies were not available in the offline validation environment); browser/Microsoft sign-in; live Firebase/Storage upload; Wikimedia search success for any particular attraction; visual and legal review of all 590 search queue placements.
