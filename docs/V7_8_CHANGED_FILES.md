# V7.8 changed files compared to the V7.7 full-code ZIP

**19 new or modified files** (including this manifest). No baseline files are deleted.

Use the Changed Files ZIP over the installed **V7.7** baseline. It intentionally does not contain node_modules or a Firebase `.env.local`.

## New/modified files

- `README.md`
- `docs/V7_8_ATTRACTIONS_REFERENCE.csv`
- `docs/V7_8_CMS_CONTENT_MANIFEST.csv`
- `docs/V7_8_DUBAI_THAILAND_RELEASE.md`
- `docs/V7_8_MEDIA_REVIEW.csv`
- `docs/V7_8_VIDEO_SOURCES.md`
- `package.json`
- `src/app/api/commons/resolve/route.js`
- `src/components/admin/AdminConsole.jsx`
- `src/lib/completion-engine.mjs`
- `src/lib/dubai-thailand-knowledge.mjs`
- `src/lib/dubai-thailand-master.mjs`
- `src/lib/dubai-thailand-media.mjs`
- `src/lib/dubai-thailand-photos.mjs`
- `src/lib/dubai-thailand-starters.mjs`
- `src/lib/launch-starters.mjs`
- `tests/launch.test.mjs`
- `tests/v78-dubai-thailand.test.mjs`
- `docs/V7_8_CHANGED_FILES.md`

## Safe deploy note

No changes to `firestore.rules` or `storage.rules`. Existing Singapore content, Firebase `teamUsers`, Storage assets and published documents are not modified by installing these code files. Publishing remains manual via the CMS.

Run `npm install`, `npm test`, `npm run check:syntax`, `npm run verify:frontend`, `npm run build` and local browser/Firebase acceptance tests before deploying.
