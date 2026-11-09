> **Historical V4 instructions. For the V5 release, follow `docs/V5_DESIGN_PARITY_RELEASE.md` instead.**

# TrawellBeyond V4 - Homepage, Header, Footer, Singapore, and Core Pages

## What is delivered

- Approved V5.1 cinematic homepage and scrolling sections remain intact.
- Header and Footer settings are edited using `Website Pages -> Header & Footer` (`site-settings`).
- Homepage text, motion chapters, and selected images are edited using `Website Pages -> Homepage` (`homepage`).
- Other standard public pages already read the CMS (Story, Services, FAQ, Journal, Contact, CREATE, Enquiry, Privacy, Terms).
- A reviewable launch content pack provides 23 private starter drafts: 11 pages, 1 Singapore destination, 1 4-day Singapore journey, and 10 experience descriptions.
- Firebase Web SDK only. No Firebase Admin SDK, no private service-account keys, no server Admin email allowlist.

## 1. Start in a NEW folder; preserve teamUsers

Extract the new ZIP to, for example:

`C:\atul\ReactJS\TrawellBeyond_V51_CMS_Launch_V4`

PowerShell:

```powershell
cd C:\atul\ReactJS\TrawellBeyond_V51_CMS_Launch_V4
npm install
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
notepad .env.local
```

Copy only your SIX existing `NEXT_PUBLIC_FIREBASE_*` values. Do not add any Firebase Admin SDK variables.
Do not delete the database again.

## 2. Firebase authorization

Check Firebase Console:

- Authentication: Microsoft sign-in is enabled.
- Authentication: Anonymous sign-in is enabled for customer enquiries.
- Firestore: `teamUsers/<your Firebase Auth UID>` exists and contains boolean `active: true` and string `role: super_admin` (or `admin`).
- Firestore/Storage project is the project actually referenced by `.env.local`.
- Firebase Authentication authorized domains include `localhost` and later your live host.

Deploy the V4 rules (important: 12 new header/footer fields are now allowed):

```powershell
firebase login
firebase projects:list
firebase use --add
firebase deploy --only firestore:rules,storage
```

Choose the correct Firebase project before confirming. This command changes rules only; it does not clear Firestore or Storage.

## 3. Run and verify

```powershell
npm test
npm run check:syntax
npm run verify:frontend
npm run build
npm run dev
```

Then open `http://localhost:3000/admin` and complete Microsoft login. Stop to investigate if `npm run build` fails.

## 4. Install all starter content AS DRAFTS

On Admin -> Dashboard:

1. Click **1. Install starter drafts**. Confirm.
2. Wait for final counts: `23 drafts created` if the database had no CMS records. Existing records are skipped, not overwritten. Partial failures are reported.
3. Open Website Pages -> Header & Footer. Review logo consistency (the locked logo is not editable), navigation labels and the company statement. Add a verified business email/phone only if available.
4. Open Website Pages -> Homepage. Review all copy, three motion chapters, Ways to Travel heading, and choose your preferred licensed hero images, or keep the V5.1 existing photography until replaced.
5. Click **2. Publish core website pages**. This publishes up to 9 reviewed CMS pages. It intentionally does not publish Privacy or Terms.
6. Visit `/` and `/our-story`, `/services`, `/faq`, `/contact`, `/create`, `/enquire`, `/journal`. Refresh to confirm copy changes. The page status must show `published` in Admin.

## 5. Publish Singapore

1. Admin -> Destinations -> Singapore (the imported draft).
2. Review the description, experience positioning and FAQs; select a commercially licensed Singapore photo via Media Library for best visual quality.
3. Click **Publish to Website**.
4. Open `http://localhost:3000/destinations/singapore` and verify. The homepage destination section will include Singapore after it has been published.
5. Admin -> Experiences -> review each of the 10 Singapore experience drafts individually. Confirm attraction names, current timings, availability, image rights, and any prices before publishing. Published experiences appear as destination tiles.
6. Admin -> Journeys -> review Singapore, at Your Pace. Confirm itinerary and inclusions, choose an image, publish. It then appears in the homepage Journeys section and the Singapore destination page.

## 6. Complete the remaining content

- Destinations: add and publish other destinations using the same workflow.
- Journeys and Packages: create linked journeys after destinations exist.
- Offers: create only when terms, dates, inclusions and approvals are known; no old promotions imported.
- Media: upload licensed JPG/PNG/WebP (less than 6 MB) with source/licence information.
- Website Pages -> Privacy and Terms: the imported text is a draft outline. Complete business and legal review and supply verified company/support details before publishing.
- Website Enquiries: submit a real test request from the frontend, then verify it appears in Admin. Consent, Microsoft team access and anonymous sign-in need real tests.

## Important acceptance criteria

- Header and footer changes appear on homepage AND CMS-generated routes.
- Save Draft survives a hard refresh.
- Published Singapore returns HTTP 200 at `/destinations/singapore`.
- Unpublished experience does NOT appear as a live listing.
- Published journey links back to the Singapore destination.
- Customer enquiries are not publicly readable.
- Media uploads and retrieval work against the actual Firebase Storage bucket.
- Privacy/Terms, production deployment, mobile UX and enquiries receive final manual review.

This release has **not** deployed to your Firebase project. This environment passed the source and unit checks but could not finish npm dependency installation, so the full Next.js build and live Firebase integration remain to be verified on your machine.
