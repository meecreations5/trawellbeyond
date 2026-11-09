# V7.1 Singapore Missing-Photo Fix

**What this release addresses:** Singapore destination records were already Published while `heroImage`, `storyImage1..3`, and `galleryImages` were empty. The original V7 dashboard "Fill missing Singapore photos" only worked on Draft records and could add unhosted external URL suggestions. This update fixes the published-record recovery gap without rebuilding the website or deleting data.

## Install (Windows PowerShell)

Unzip the full V7.1 project into a NEW folder (or apply Changed Files Only to your V7 folder). Keep your working `.env.local` from V7. Do not share it or put it in the ZIP.

```powershell
cd C:\atul\ReactJS\TrawellBeyond_V51_Singapore_Photos_V7_1
npm install
npm test
npm run check:syntax
npm run build
npm run dev
```

No new Firestore collection fields, Storage paths, or security rules were introduced. If V7 rules are already deployed, **there is no need to redeploy rules or delete Firestore/Storage**.

## Fix the already-Published Singapore destination

1. Open http://localhost:3000/admin and sign in with Microsoft.
2. Go to **Destinations** and open the existing **Singapore** record. Do not create a duplicate.
3. Near the top you will see **SINGAPORE PHOTO RECOVERY** with the shortlisted cover, story and gallery photos.
4. Click each **Check source & licence** link to review the photograph, correct attraction, attribution and commercial rights. You may choose different photographs using **Find / Choose photo** instead.
5. Tick **I have checked the source photos and their reuse/attribution requirements**.
6. Click **Import photos and fill missing sections**. The CMS resolves each selected Commons file, verifies a reusable license label, downloads a reasonable-size image via the restricted server proxy, uploads it to Firebase Storage through the Firebase Web SDK, then saves the updated content record.
7. Observe the result message. Import failures do not silently count as successes; retry after checking the source. Successful imports are reused automatically.
8. Refresh the Singapore record and check: **Cover Photo**, all three **Story chapter photos**, and the six-photo **Additional photos** gallery. Each should show a thumbnail, and the page should remain **Published**.
9. Open **View Live** or http://localhost:3000/destinations/singapore to verify cover, narrative sections and gallery/lightbox.

The same editor repair works for the 10 provided Singapore experiences and the Singapore journey, including its four itinerary-day images. Their starting records must exist in the CMS.

## Browse and select alternative images

Every cover, story, journey-day and gallery field opens the Media Library with a useful prefilled search query. You can search Commons, inspect its source/license, import directly into Firebase Storage and choose the uploaded image. Gallery photos now have thumbnails, reorder arrows and a Remove action. External URL editing is kept under an optional **Advanced** section.

## What stays unchanged

- Approved V5.1 frontend, global header/footer, page layouts and CREATE journey flows
- Firebase Web SDK and Microsoft Authentication, no Firebase Admin SDK
- Your existing `teamUsers`, Firestore records, editorial copy, Draft/Published statuses, navigation and slugs
- Any custom photo in a nonempty field (never replaced by recovery)

## Important limitations

- Actual Firebase upload, Commons availability, photo identity/rights and public display can only be verified against your project; tests do not make those calls.
- Wikimedia Commons licenses may require credit, a link to the license, modification notices or ShareAlike compliance. The editor must verify the source and obligations for commercial use. Trademarks, identifiable people and attraction branding may involve additional rights.
- Search and import may fail on a source that is unavailable, unsupported or above 6 MB; those failures are shown and can be retried. No image is fabricated.
- No images have been uploaded to your live Firebase Storage by preparing this ZIP.

## Verification performed

- Source syntax: `npm run check:syntax` passed.
- Automated tests: 45 / 45 passed, including recovery of an already-Published Singapore page, preservation of custom images, partial-import retries, experience and journey galleries, and restricted commercial license checks.
- Full Next.js build: not run here; npm dependencies are not installed and internet package installation is unavailable in this environment.
