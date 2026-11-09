# V7 — Singapore Complete Website Experience

**This is the current consolidated installation guide.** V7 builds on approved V5.1 public layouts and V6 global footer. The CMS remains Firebase **Web SDK only**. There is no Firebase Admin SDK, private-key JSON or service-account setup.

## What is delivered in the code

- Singapore destination: approved V5.1 sections, 3 independent storytelling images, curated experiences, optional six-photo editorial gallery, interactive lightbox and photo-source credits.
- Singapore experiences: 10 editorial draft records with source-linked photographic suggestions. Full dedicated details template with hero, highlights, gallery/lightbox, practical info, source links, related experiences, CREATE CTA and enquiry form. For records with only one suitable photo the gallery shows that photo, rather than disappearing.
- Singapore journey: proposed four-day/three-night itinerary, **four distinct day photos**, three-photo gallery, adjustable stay/travellers/interests and enquiry drawer.
- CREATE: new four-stage visual journey builder. Purpose cards, published destinations, published experience selection, nights/people/stay and enquiry with customer consent. Uses the existing anonymous Firebase enquiry path. No payments or booking checkout.
- CMS: new photo credit editor; existing-draft-only missing-photo fill; optional Wikimedia-to-Firebase-Storage importer with source metadata, confirmed rights, progress and retry-safe Media Library reuse. A published record's external shortlisted photo URL may be replaced by the **same photograph** stored in Firebase; your custom images are never overwritten.
- Firebase rules: added `imageCredits` to the allowed CMS field list. `teamUsers` and Microsoft sign-in model remain unchanged. The Wikimedia image-proxy allowlist covers official thumbnail and upload hosts; no arbitrary URL fetching.
- Dev-only previews: Singapore destination, Gardens by the Bay experience, Singapore journey. Disabled in production.

## Step 1 — Install / verify

Extract **Full Code ZIP** into a new directory, e.g. `C:\atul\ReactJS\TrawellBeyond_V7`. Copy the working `.env.local` from V6 to this folder, with its **six public Firebase web config values**. Do not copy or introduce a service account.

In PowerShell:

```powershell
cd C:\atul\ReactJS\TrawellBeyond_V7
npm install
npm test
npm run check:syntax
npm run verify:frontend
npm run build
```

Only proceed to rule deployment and publication if the build passes on your machine.

## Step 2 — Deploy V7 security rules (required)

Firestore schema now has an `imageCredits` string. **V6 rules will reject a Save/Publish containing this field.** Deploy rules from V7:

```powershell
firebase login
firebase use --add
firebase deploy --only firestore:rules,storage
```

Check the selected project before deploying. These commands do **not** delete collections, media, or `teamUsers`. No Firebase database reset is needed.

## Step 3 — Visual preview without publishing anything

```powershell
npm run dev
```

Visit these local URLs (available only when `NODE_ENV=development`):

- Destination: `http://localhost:3000/preview/singapore?view=destination`
- Gardens by the Bay: `http://localhost:3000/preview/singapore?view=experience`
- Journey: `http://localhost:3000/preview/singapore?view=journey`
- CREATE: `http://localhost:3000/create?destination=Singapore`

The three previews use **sample content and Wikimedia photo suggestions**; they do not read Firestore. Layout may show a neutral fallback where a remote source cannot load. The CREATE page reads **published Firestore records**; before publication it shows an empty-state instead.

## Step 4 — Admin content and photographs

Open `http://localhost:3000/admin` and sign in with an authorized Microsoft account. Confirm Firestore `teamUsers/<Firebase UID>` has `active: true` and `role: "super_admin"` or `"admin"`.

In Dashboard, proceed in this order:

1. **Install starter drafts.** Creates missing Singapore and core page records as Drafts; existing documents are not overwritten.
2. **Fill missing Singapore photos.** Optionally fills empty image fields in existing Singapore **drafts only**. Custom images and published records remain unchanged.
3. **Review sources:** `docs/V7_SINGAPORE_PHOTO_SOURCES.md`. Then click **Import Singapore photos to Storage**. The system asks for explicit confirmation, verifies photo metadata, stores images and attaches Firebase URLs to records. This can be retried. A published record is updated only when an already-referenced shortlisted Commons photo is being replaced with that exact stored photo, never by overwriting a custom photo.
4. **Publish core website pages** after checking their copy; Privacy and Terms stay Draft pending legal review.
5. Review and publish Singapore **Destination**, the individual **Experiences**, then **Journey** from their respective CMS sections. Validate admission times and inclusions individually. Draft content is never shown as published.

If an image fails to import, review the error, manually search via **Media Library** or upload a rights-cleared image. Do not assume the whole batch succeeded. Licence and image accuracy require editorial review.

## Step 5 — End-to-end browser checks

- `http://localhost:3000/destinations/singapore` — hero, three storytelling chapters, gallery/lightbox, featured experience cards, featured journey, FAQs, single global footer.
- `http://localhost:3000/experiences/gardens-by-the-bay` — hero, highlights, gallery, credits, related experiences and **Add to CREATE** action.
- `http://localhost:3000/journeys/singapore-at-your-pace` — itinerary tabs show distinct day images, gallery, personalizer and enquiry drawer.
- `http://localhost:3000/create?destination=Singapore&experience=Gardens%20by%20the%20Bay` — steps, preselected experience, adjustable people/stay, email/phone, consent; submit test enquiry and verify receipt in **Admin → Enquiries**.
- Repeat responsive checks on phone-sized screens. Verify gallery keyboard Escape/arrow keys and gallery captions.
- Verify header and **global footer** match the homepage on all routes.

**Launch gate:** sign-in, rules, Save Draft, Publish, Storage import, public page render, CREATE submit and Admin Enquiries must all pass against the actual Firebase project before calling the site production-ready.

## What is and is not verified here

Source syntax and local Node tests can be run without installing npm packages. Local images were not sourced/downloaded into the ZIP; they are *external Commons image suggestions* until imported through the CMS on your machine. npm offline installation failed in this authoring environment (`ENOTCACHED`), so a complete Next.js build, live photo imports and real Firebase transactions have **not** been verified here. No live Firestore or Storage changes were performed by this code preparation.

## No unnecessary rebuild

Do not delete Firestore or Storage again. Do not reintroduce the Firebase Admin SDK. Do not import the old V7/V8 CMS metadata. This release uses the V5.1 frontend, V6 global footer and its straightforward Web SDK content model.
