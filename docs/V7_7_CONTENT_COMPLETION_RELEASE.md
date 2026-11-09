# TrawellBeyond V7.7 — Global Content Completion & Media Intelligence

**Baseline:** V7.6, approved V5.1 public frontend, V6 single global footer, Firebase Web SDK (no Firebase Admin SDK).
**Status:** Code and offline tests prepared. Not deployed to your Firebase project. A complete production build and live end-to-end test must still be performed on your machine.

## What is included

1. **One Admin Content Completion Center** at `/admin` → **Content Completion**. Click **Scan all website content** to inspect **Destinations, Experiences, Journeys, Offers, Website Pages, and Media Library**. It reads all documents using paginated Firestore queries (10,000 safety cap per collection), not the ordinary editor's 500-item list.
2. **Completion report** by severity and category: critical publication fields, other editorial/travel essentials, gallery and day photos, official YouTube video references, image rights/credits, alt text, and optimized image variants. Filter by destination and content type. Export findings as CSV.
3. **Source-backed suggestions, with review before writing.** The system proposes missing text from the existing Singapore editorial master, Singapore official-source travel guidance, prepared starter records, and *this record's* existing itinerary photos. Official video links are proposed only when already curated in the source pack. New public images and live prices/hours are never invented.
4. **Safe fill:** The Admin ticks proposed fields, confirms, and applies at most 25 records per operation. A Firestore transaction reads each record again, writes only empty fields, retains the original slug, user-written text, and Draft/Published state, and reports skipped conflicting edits. Nothing is automatically published.
5. **Media intelligence:** records now support an optional `imageVariants` map, keyed by approved Media Library asset ID. When a photo is selected in the Admin, it retains the display WebP/JPEG URL and saves its medium/thumbnail URLs, credit and known licence. Public destination, experience, CREATE and listing cards prefer the medium/thumb variant; gallery lightboxes open the display version. Existing URLs continue to work unchanged.
6. **Photo metadata:** Manual upload or Wikimedia import can store descriptive alt text, and saved media metadata can be edited in the Media Library without deleting/reuploading a photograph. Credit and source suggestions are only made when the CMS image URL exactly matches a confirmed saved Media Library asset. The audit warns about unoptimized files and missing metadata.
7. **Optional browser image-health check** tests up to 120 unique CMS image URLs per run. A failed image decode is an advisory issue, not proof of invalid licence or bad storage.

## First run / installation

1. Extract **the complete V7.7 ZIP** into a new folder, or apply **Changed Files Only** to a clean, working V7.6 project. **Do not apply V7.7 changes to an earlier baseline.**
2. Copy the previously working `.env.local` into the new folder. Do not put Firebase credentials or secrets into chat, Git or the ZIP.
3. Run the commands in Windows PowerShell:

```powershell
cd C:\atul\ReactJS\TrawellBeyond_V51_Content_Intelligence_V7_7
npm install
npm test
npm run check:syntax
npm run verify:frontend
npm run build
```

4. **After the build passes and after verifying you selected the correct Firebase project**, deploy the updated Firestore rules (V7.7's `imageVariants` is a new field):

```powershell
firebase login
firebase projects:list
firebase use --add
firebase deploy --only firestore:rules
```

You do not need to reset Firestore/Storage, regenerate teamUsers or deploy Storage rules; the stored image paths and existing security model remain unchanged.

5. Start locally:

```powershell
npm run dev
```

Open `http://localhost:3000/admin` with your existing authorized Microsoft account. Then choose **Content Completion**.

## Recommended Singapore acceptance workflow

1. Click **Scan all website content**. Filter **Destination: Singapore**. Check the critical, photo/video and metadata findings. Export CSV for your completion tracker.
2. Review suggested fields. Select only facts and existing video references you approve. Click **Fill selected missing fields**. This does not publish anything and cannot overwrite existing descriptions or image selections.
3. Open **Media Library** for missing photographs. Verify the exact attraction, photographer, commercial licence and share-alike requirements. Crop and color-adjust only when appropriate; create optimized WebP image variants. Select the new saved photo in the appropriate content record and **Save Published Changes** (or Save Draft).
4. Return to **Content Completion**, rescan, and attach missing `imageVariants`/credits from exact matched Media Library assets. The site then uses thumbnails and medium variants for the relevant card/gallery placements.
5. Test the official/authorized YouTube link from each published Singapore page. Video suggestions are not automatically trusted or played. Confirm the creator and video relevance before accepting.
6. Optionally click **Check up to 120 image URLs**. Investigate failures in the content editor, then verify the page on mobile and desktop.
7. Verify **Singapore Destination → Gardens by the Bay → My Journey → CREATE → Submit Enquiry → Admin Inbox**, and separately the Singapore Journey Details gallery. Only then sign off Singapore as a reusable master.

## Critical boundaries

- **No autonomous copyright approvals.** A CC licence can require attribution and share-alike conditions. Automatically discovered media is never written without your explicit review.
- **No invented attraction photographs.** Image similarity, landmark accuracy and current business hours cannot be proven by this scanner; a staff member must verify them against trustworthy sources.
- **No fully automatic video search/import.** Approved existing Singapore YouTube references can be proposed, but fresh video discovery and eligibility require staff review.
- **No blanket replace.** The safe-fill operation writes only fields that were empty at the time of the transaction, even if someone edited the content between scan and save. `imageVariants` only adds missing media entries.
- **No automatic conversion of existing JPEG URLs.** A JPEG or PNG already saved in CMS will remain until a team member processes the photo in Media Library and assigns the new optimized copy. The browser uses WebP where it has a linked optimized variant and falls back to the original image otherwise.
- **Static prototype imagery:** The scanner audits Firestore CMS content, its Media Library and CMS-referenced image URLs. The approved V5.1 prototype still contains some static presentation assets; these are not rewritten or classified as Firestore records. This is intentional to avoid damaging the approved design.
- **Browser health tests:** Network-level failures can be transient. The health check checks only up to 120 URLs per run and does not verify licences, authenticity or accessibility.
- **No automatic publishing:** Published records remain Published, drafts remain private, and legal/policy pages must be reviewed separately.

## Required live verification

- Firebase Microsoft login and teamUsers authorization
- Scan and result counts for real Firestore data
- Save one selected missing field on an existing draft and one Published record
- Confirm an existing custom description is never overwritten
- Optimized image upload and Firestore `imageVariants` write under deployed rules
- Public card uses medium image; gallery thumbnail uses thumb, lightbox uses display
- Any photo or video attribution is accurate
- Production Next.js build, mobile and desktop rendering, enquiry receipt

The ZIP is **not** a claim that Firebase services have already been modified or that every missing field can be automatically completed. No live database or Storage mutation was performed in this preparation.
