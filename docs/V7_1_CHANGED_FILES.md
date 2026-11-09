# V7.1 Changed Files Manifest

- `package.json` - release version update
- `src/components/admin/AdminConsole.jsx` - one-click, published-safe photo recovery inside Singapore records; preview/rights confirmation; readable gallery thumbnails and ordering; simplified dashboard
- `src/components/admin/ImageLibrary.jsx` - prefilled search on photo field selection and source review clarity
- `src/components/admin/admin.css` - photo-recovery and gallery-editor layout styles
- `src/lib/singapore-photo-recovery.mjs` - new safe pure repair engine
- `src/lib/singapore-draft-merge.mjs` - storage attachment covers empty fields in Published records
- `src/lib/commons-license.mjs` - new reusable Commons licence filter
- `src/lib/cms-web.js` - verify commercial license before import
- `src/app/api/commons/search/route.js` - commercial-license filter and appropriately sized thumbnail import
- `src/app/api/commons/resolve/route.js` - validate shortlist photo licences
- `tests/singapore-v7-photos-recovery.test.mjs` - new recovery tests
- `docs/V7_1_SINGAPORE_IMAGES_FIX.md` - installation and use guide
- `docs/V7_1_CHANGED_FILES.md` - this manifest

No changes to Firebase rules, login method, public frontend, original images, or content documents.
