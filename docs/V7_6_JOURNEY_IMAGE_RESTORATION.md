# TrawellBeyond V7.6 — Journey gallery restoration and WebP + CC controls

## What this release fixes

- **Journey gallery missing:** the V7.5 renderer hid the entire gallery whenever `galleryImages` was empty, even if `dayImages` held four photographs. V7.6 automatically composes a gallery from images already attached to that same journey: explicit gallery → day-by-day photos → cover image. It never invents new photos or changes Firestore records on page view.
- **One/two images:** the gallery stays visually balanced instead of leaving empty space.
- **Day images missing:** the displayed day card can fall back to a gallery photo or the journey cover, without pretending the fallback is a photograph of the named attraction. Admin shows actual missing day-photo counts. Publish complete, accurate photographs manually.
- **Admin:** Journeys editor shows photo counts and a one-click action to fill the gallery field from existing journey photos. Saving an edited published record retains its published state.
- **WebP and optional CC:** the existing in-browser photo optimizer now supports subtle **brightness / contrast / saturation** controls, with live crop preview, "Subtle enhance" and "Reset colour" buttons. Adjusted WebP/JPEG fallback variants are generated before uploading through the Firebase Web SDK.
- **Attribution:** Photo credit / CC licence fields are retained. If "CC" meant *Creative Commons*, always review exact file rights and source; this release does not automatically re-license anything.

## Important limitations

The uploaded V7.5 project contains URL references and SVG placeholders, **not the original full-resolution photographs** from Firebase Storage. Consequently, no existing online photo can be physically converted or colour-corrected offline in this release. To convert a saved photo, use **Admin → Media Library → Crop / optimize copy**; that creates a new optimized file, which you then select in the Journey editor and save. Existing images remain unchanged until you choose the replacements. This preserves image quality and published content.

The photo editor retains source and licence metadata, but does not insert a watermark or change the appearance of real attractions. Please preserve all Creative Commons attribution and share-alike requirements.

## Local installation

Extract **Changed Files Only** into your current V7.5 project, retaining the folder structure, or extract Full Code into a fresh folder and copy your existing `.env.local` (never include secrets in ZIP). Then in Windows PowerShell:

```powershell
npm install
npm test
npm run build
npm run dev
```

No Firestore database reset, security-rule change, Firebase Admin SDK, or Storage deletion is needed.

## Singapore Journey acceptance test

1. Open `/journeys/singapore-at-your-pace`, scroll to the gallery, and verify the day photos appear even if the dedicated gallery field was empty.
2. In Admin → Journeys → Singapore, inspect the photo count. Click **Use existing day photos to complete the gallery**, then **Save Published Changes**.
3. Admin → Media Library → select an original uploaded or appropriately licensed saved photograph → **Crop / optimize copy** → select **Cinematic hero**, **Gallery** or **Story** size → adjust colour correction gently → save optimized WebP.
4. Choose the new optimized photo in the Journey's hero, gallery or day photo fields and save; refresh the public page. Confirm image accuracy, placement and credits.
5. Verify 360px mobile and desktop, gallery lightbox, keyboard navigation and CREATE enquiry. The public HTML should load without broken images.

## Image dimensions

| Image placement | Main output | Additional variants |
| --- | --- | --- |
| Hero | up to 1920px wide, 16:9 | medium ≤960px; thumb ≤480px |
| Journey gallery | up to 1440px wide, 3:2 | medium ≤960px; thumb ≤480px |
| Editorial story | up to 1000px wide, 4:5 | medium ≤960px; thumb ≤480px |

Images are never upscaled, and WebP is used where supported. Do not claim all existing URLs have been converted: only images processed by the Media Library are optimized.
