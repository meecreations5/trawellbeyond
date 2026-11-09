# TrawellBeyond V7.3 — Singapore UX Recovery

## Scope and baseline

This is a consolidated update built **on the V7.2 Singapore Gallery codebase**. It preserves the approved V5.1 homepage, destination and journey HTML/CSS structure, existing gallery/lightbox fixes and the V6 global footer. It uses the **Firebase Web SDK only**, Microsoft Authentication and existing `teamUsers` authorization. There is no Firebase Admin SDK, service-account requirement, direct checkout or payment collection.

### What's included

1. **Live My Journey tray:** browse public destination and experience pages, keep up to six destinations and 25 experiences, remove items, and continue to CREATE. Journey choices remain on the device in browser storage. No customer login needed.
2. **One CREATE flow:** homepage and other CREATE CTAs open `/create` instead of the older, disconnected browser-only builder. Selections in the tray are restored in CREATE. The separate four-stage enquiry flow still submits a real Firebase enquiry, subject to the existing security rules.
3. **Optional day-by-day planner:** visitors choose between *Create it for me* and *I'll plan my days*. In detailed mode they can assign selected experiences to days, reorder within a day, save their selections on this device, and send an itinerary preference in the enquiry. Day assignments are preferences, not confirmed operating times or travel feasibility.
4. **Experience discovery:** `/experiences` now supports text search, destination, travel purpose and suggested-duration filters. Filtering applies to **published** experience records.
5. **Explore by Purpose:** homepage purpose choices save the preference and open the filtered experience list. Destination and experience details gain Add to My Journey controls, and journey detail has a direct CREATE link with its destination and nights.
6. **Recover useful old catalogue data:** six attraction-level Singapore records missing from V7.2 starter data (River Wonders, Sentosa Cable Car, Wings of Time, Jewel Rain Vortex, Canopy Park and National Gallery Singapore) are now included as **drafts only**. There are **16 Singapore starter experiences** in total. Missing hours, admissions and images are deliberately not invented.
7. **Publishing safeguards:** Save Published Changes no longer silently changes a published record to Draft. Unpublish is an explicit action. Newly published destinations, experiences, journeys and offers require an HTTPS cover image and summary, enforced both in application validation and updated Firestore rules. Existing already-published records can still be edited for photo recovery.

### Important photo limitation

**No photographs have been uploaded to your live Firebase Storage by this ZIP.** The original suggested Wikimedia image URLs are external references. They may fail or show the wrong subject. Open Admin > Destinations/Experiences/Journeys, review the source and image licence, then use the Media Library to import actual photos into Firebase Storage. Confirm that images depict the named attraction. Correct the Marina Bay Waterfront/Supertree mix-up before publication.

### Install on Windows PowerShell

Extract the **Full Code ZIP** to a new project folder, or extract **Changed Files Only** directly into the root of an existing **V7.2** working project. Do not combine with older V7/V8 branches.

```powershell
cd C:\atul\ReactJS\TrawellBeyond_V51_Singapore_UX_V7_3
# Copy the working .env.local from your V7.2 project into this folder.
npm install
npm test
npm run check:syntax
npm run verify:frontend
npm run build
```

After confirming that `firebase use` points to the intended Firebase project, deploy the changed Firestore rules from this exact project:

```powershell
firebase projects:list
firebase use --add
firebase deploy --only firestore:rules
npm run dev
```

V7.3 does not require a Storage rule change. Do **not** reset Firestore or Storage. Keep your existing `teamUsers` collection and Microsoft provider configuration. There is no Firebase Admin SDK.

### First Admin content setup

1. Go to `http://localhost:3000/admin`; log in with the authorized Microsoft account.
2. Use **Install starter drafts** once. This adds only missing records; existing slugs are skipped, not overwritten. Check the outcome and any individual error messages.
3. Review Singapore destination; confirm all story photos, hero and gallery, save published changes if it is already published.
4. Review the six restored experience drafts individually. Add factual descriptions, opening hours, transfers/ticket notes, and a rights-checked hero before publishing. The current published experience list is not replaced by the starter import.
5. Verify Singapore's existing journey has different day images and a gallery.

### Accept/reject test: Singapore to enquiry

- Homepage: the approved V5.1 section structure, nav/header/footer and motion visuals are intact. Its CREATE CTA opens `/create`.
- `/destinations/singapore`: photo gallery, featured experiences and `Save Singapore to My Journey` work.
- `/experiences/gardens-by-the-bay`: gallery/lightbox is contained, `Save to My Journey` increments the floating tray, experience subject matches its label.
- `/experiences?destination=singapore`: text search and purpose/duration filters respond; only published experiences appear.
- My Journey tray: reopen on another page and confirm selected destination/experience survived browser navigation; remove an item; continue to CREATE.
- `/journeys/singapore-at-your-pace`: click `Or plan my days in CREATE` and confirm destination/night preference is carried over.
- `/create`: select *I'll plan my days*, assign two experiences, change their order, save choices, refresh and resume; then submit an enquiry with consent.
- `/admin`: the enquiry appears with destination, selected experiences and day-plan preferences.
- Confirm images, galleries and touch controls on narrow mobile widths; inspect footer and console for errors.

**The local automated test suite is not a substitute for this real workflow.** Actual Firebase Storage imports, Microsoft login, browser rendering, Next production build and enquiry delivery are not verified here. Publishing without verified content and rights is not recommended.

### Deferred after launch (V7.4)

Map exploration, accurate per-activity geolocation, live day-scheduling conflicts, account-based server-saved drafts, and advanced recommendation algorithms are intentionally **not** included. The V7.3 planner provides preferences, not verified routes or bookings.
