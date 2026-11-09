# TrawellBeyond V7.4 — Four Experience Checks + Singapore Photo Studio

This release is based on the **approved V7.3.1** project and preserves the V5.1 design, global header/footer, CREATE Journey, and Firebase Web SDK + `teamUsers` authorization. **There is NO Firebase Admin SDK and NO database reset.**

## Start with the latest code

1. Recommended: extract `TrawellBeyond_V51_Singapore_Experience_V7_4_Full_Code.zip` to a *new* project folder. Copy **only your existing `.env.local`** from your working V7.3.1 installation. Don't put Firebase private credentials in this project.
2. In Windows PowerShell:

```powershell
cd C:\atul\ReactJS\TrawellBeyond_V51_Singapore_Experience_V7_4
npm install
npm test
npm run check:syntax
npm run build
npm run dev
```

If you are continuing directly from the V7.3.1 full source without unrelated edits, you may extract the Changed Files ZIP over it, preserving the folder structure. For a known-good baseline and easy rollback, prefer the full ZIP.

**No Firestore or Storage rules changes** are needed for the new media variants. All optimized files use the existing `cms-public/*.webp`/`.jpg` path pattern and the existing media documents keep the same required fields.

## Check four real published Experience Details URLs

With the Next.js server running in a separate terminal, run:

```powershell
npm run check:singapore -- --base http://localhost:3000
```

The script requests these four routes and verifies HTTP 200, correct title, gallery, practical information, context-sensitive CREATE and enquiry markup:

- `/experiences/gardens-by-the-bay`
- `/experiences/marina-bay-waterfront`
- `/experiences/universal-studios-singapore`
- `/experiences/singapore-zoo`

If a route gives **404**, check **Admin → Experiences → that record → Published** and ensure the document slug matches. If the route passes but the hero is wrong, edit its photograph in the CMS; the script cannot verify image subject or licensing.

## Fill missing Singapore attraction content

Go to **Admin → Experiences**, open each Singapore record and select **Fill missing Singapore details**. This is a *preview in the editor*: read the new description and operational facts, then click **Save Published Changes** (or Save Draft). Existing custom copy, photos and publication status are preserved. It never bulk-publishes records.

- All 16 Singapore starter experiences have expanded editorial descriptions, highlights, suggested visit durations and official references.
- Values describing **suggested visit durations** are travel-planning estimates, not operator guarantees.
- Current opening hours were checked from official references listed in the source table below. Where hours differ by date or cannot be guaranteed, the copy instructs guests to check the operator's date-specific calendar.
- No admission prices, SIC schedules or inclusion claims were fabricated.

## Import real photos, crop, optimize and connect to pages

**Admin → Experiences → select record → Singapore Photo Recovery** is the fastest approach for the shortlisted Commons candidates. Review the exact source and licence, tick the confirmation, then import and fill missing sections. The flow also works with existing published records and avoids replacing photos you chose yourself.

For any other photo, **Admin → Media Library** or the **Find / Choose Photo** button opens the new Photo Studio:

1. Upload a JPG/PNG/WebP (original up to 20 MB) or search Wikimedia Commons; review exact source and commercial licence.
2. Choose a crop preset: Original / Hero 16:9 / Story 4:5 / Gallery 3:2 / Card 4:5 / Square 1:1.
3. Set horizontal and vertical focus and optional zoom. The preview and final crop share the same geometry.
4. Choose **Crop, optimize & upload**, **Import cropped photo**, or **Create optimized copy from Storage** for an existing saved photo.
5. WebP is used when supported, JPEG as fallback. The tool creates three variants (display, medium, thumbnail), and records actual pixel sizes and compressed file sizes in Firestore. No source image is upscaled.
6. Choose **Use this photo** and save/publish the record. Old photo objects are retained until you decide to remove them safely.

### Output sizing (maximum; smaller sources are never enlarged)

| Crop preset | Display | Medium | Thumbnail |
|---|---|---|---|
| Original | Up to 1920px wide, preserved ratio | Up to 960px wide | Up to 480px wide |
| Cinematic hero (16:9) | 1920×1080 | 960×540 | 480×270 |
| Story / card portrait (4:5) | 1000×1250 or 960×1200 | 960×1200 where possible | 480×600 |
| Experience gallery (3:2) | 1440×960 | 960×640 | 480×320 |
| Square tile (1:1) | 900×900 | 900×900 | 480×480 |

A small source or zoomed crop produces smaller outputs. **File sizes in KB are data-dependent**, not guaranteed. Source photo and licence credits are retained with the optimized media. CC BY-SA crops are adaptations; the attribution disclosure states that files may have been cropped/compressed and links to the source/licence.

Existing media: choose **Crop / optimize copy** in the Media Library to create a new optimized asset. It does not silently replace photos already embedded in published pages. Select the new asset in each content record you want to update. If in-browser Storage download fails, check bucket browser CORS and re-upload the source file instead.

## Photo accuracy and sign-off

Review `docs/SINGAPORE_PHOTO_AND_CONTENT_MANIFEST.csv`. These are **candidate Wikimedia sources**, not downloaded images. Real photography still needs one-time licence and subject verification, a successful Storage import, and the final published page check. Some existing Commons source photos are historical; verify that the pictured attraction still matches the current visitor experience.

The Marina Bay Waterfront starter candidate has been corrected to an actual waterfront photograph instead of a Gardens by the Bay Supertree photo. Existing published custom photos will **not** be silently overwritten.

Only declare Singapore the locked master when:

1. The four live Experience Details routes return 200 and display correctly.
2. Destination, gallery and journey imagery is visibly accurate on desktop/mobile.
3. All 16 experience records have reviewed photographs and useful content; publish only those ready.
4. CREATE and experience enquiries arrive in the Admin Inbox.
5. Production `npm run build` and one final mobile/desktop visual check pass.

## Verification in this release

- Source-level four Experience Details render checks: **4/4 passed**.
- Complete local test suite: **67/67 passed**.
- JavaScript/JSX syntax checks passed and V5.1 frontend marker verification passed.
- The live Firebase Web SDK save/upload/publish actions and real HTTP route smoke test were **not executed in this environment**.
- Production Next.js build couldn't be executed here because `esbuild`/npm dependencies are not installed in the isolated runtime. Run `npm install` and `npm run build` locally.

## Official attraction reference URLs (retrieved 8 Nov 2026)

- Gardens by the Bay: https://www.gardensbythebay.com.sg/en/plan-your-visit/opening-hours.html
- Marina Bay general travel information: https://www.visitsingapore.com/
- Universal Studios: https://www.rwsentosa.com/en/play/universal-studios-singapore
- Singapore Zoo: https://www.mandai.com/en/singapore-zoo.html
- Night Safari: https://www.mandai.com/en/night-safari.html
- Bird Paradise: https://www.mandai.com/en/bird-paradise.html
- River Wonders: https://www.mandai.com/en/river-wonders.html
- Singapore Flyer: https://www.singaporeflyer.com/public/en/plan-your-visit
- Cable Car: https://www.sentosa.com.sg/en/things-to-do/attractions/singapore-cable-car
- Wings of Time: https://www.sentosa.com.sg/en/things-to-do/attractions/wings-of-time/
- Jewel Rain Vortex: https://www.jewelchangiairport.com/en/attractions/rain-vortex.html
- Jewel Canopy Park: https://www.jewelchangiairport.com/en/attractions/canopy-park.html
- National Gallery: https://www.nationalgallery.sg/sg/en/visit/visitor-information.html
- Little India: https://www.visitsingapore.com/neighbourhood/featured-neighbourhood/little-india/
