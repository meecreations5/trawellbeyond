# V7.2 – Experience Gallery UI Fix

## What failed

The `/experiences/[slug]` page loaded `sg-gallery.js` but **not** `sg-gallery.css`. The script created a full-screen photo dialog but the browser displayed it as unstyled ordinary page content. This caused the image to grow too large and the close/previous/next buttons and caption to appear outside the intended viewer.

## Changes

- Add the missing `/sg-gallery.css` to `src/templates/experience.html`.
- Keep gallery images inside a constrained stage at desktop and phone sizes.
- Place the caption and image counter under the photograph, within the modal.
- Provide keyboard navigation (Escape / arrow keys), focus management, swipe controls and an unavailable-image fallback.
- Add three regression tests to ensure all public gallery routes include the stylesheet and JavaScript.

## Install

Use the **Full Code** archive as a new folder, or extract **Changed Files Only** into the root of your existing V7.1 project (preserving paths). You do **not** need to reset Firestore or redeploy rules.

```powershell
cd C:\atul\ReactJS\TrawellBeyond_V51_Singapore_Gallery_V7_2
npm install
npm test
npm run build
npm run dev
```

Open the published **Marina Bay Waterfront** experience under `/experiences/marina-bay-waterfront`, click the gallery image and check the popup. Test Escape, Previous/Next and the phone viewport. Press **Ctrl+Shift+R** to bypass an old cached stylesheet.

## Separate editorial issue

The screenshot also shows a photo of **Gardens by the Bay Supertree Grove** labelled **Marina Bay Waterfront**. The V7.1 starter `src/lib/singapore-photos.mjs` links the Marina Bay experience to an image filename describing Gardens by the Bay as seen from Marina Bay Sands. This is a photo-curation mismatch, not a CSS bug. Change the **Marina Bay Waterfront** hero/gallery photos from the CMS to accurate photos of that attraction, checking commercial-use licence and author credit. Updating a seed source file alone will not overwrite an already-published Firestore record.

## Verification status

- 48 Node automated tests passed, including three gallery-specific regression checks.
- Source syntax validation passed.
- Live Firebase, full Next.js build and cross-device browser rendering still require validation on your computer.
