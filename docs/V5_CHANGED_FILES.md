# V5 Change Manifest

Compared to V4.

## New files
- `docs/V5_CHANGED_FILES.md`
- `docs/V5_DESIGN_PARITY_RELEASE.md`
- `public/experience-detail.css`
- `public/experience-detail.js`
- `src/app/experiences/[slug]/route.js`
- `src/lib/v51-experience.mjs`
- `src/templates/experience.html`
- `tests/design-parity.test.mjs`

## Modified files
- `README.md`
- `docs/LAUNCH_V4_STEPS.md`
- `firestore.rules`
- `package.json`
- `public/experience.css`
- `public/experience.js`
- `src/app/create/page.jsx`
- `src/app/enquire/page.jsx`
- `src/app/experiences/page.jsx`
- `src/components/InquiryForm.jsx`
- `src/components/admin/AdminConsole.jsx`
- `src/components/admin/admin.css`
- `src/lib/cms-web.js`
- `src/lib/content.mjs`
- `src/lib/launch-starters.mjs`
- `src/lib/site-chrome.mjs`
- `src/lib/v51-details.mjs`
- `src/templates/destination.html`
- `src/templates/journey.html`

## Deleted files
- `src/app/experiences/[slug]/page.jsx`

**When applying the patch to V4 manually, remove the deleted file to avoid Next.js route conflicts.**
