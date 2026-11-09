# V7.9.2 changed-files manifest

Target baseline: **V7.9.1 Photo Completion Full Code**. Do not apply against a different unmerged root. **21 changed/new files** including this manifest. No removals.

| Change | File |
| --- | --- |
| Updated | `README.md` |
| New | `docs/V7_9_2_TEAM_PHOTOGRAPHY_RELEASE.md` |
| Updated | `firestore.rules` |
| Updated | `package.json` |
| New | `src/app/api/commons/inspect/route.js` |
| Updated | `src/components/admin/AdminConsole.jsx` |
| New | `src/components/admin/AutoPhotoCompletion.jsx` |
| Updated | `src/components/admin/BulkRollout.jsx` |
| New | `src/components/admin/TeamManagement.jsx` |
| Updated | `src/components/admin/admin.css` |
| New | `src/components/admin/auto-photo-completion.css` |
| New | `src/components/admin/team-management.css` |
| Updated | `src/lib/bulk-rollout.mjs` |
| Updated | `src/lib/cms-web.js` |
| Updated | `src/lib/content.mjs` |
| New | `src/lib/global-photo-completion.mjs` |
| New | `src/lib/team-access.mjs` |
| Updated | `storage.rules` |
| Updated | `tests/content.test.mjs` |
| New | `tests/v792-team-auto-images.test.mjs` |

## Files to deploy and check

- Apply over existing V7.9.1 code. Keep `.env.local` and any runtime secrets out of ZIP.
- Deploy **both** `firestore.rules` and `storage.rules` and verify the Super Admin account; see the full release guide.
- Run `npm install`, `npm test`, `npm run check:syntax`, `npm run verify:frontend`, and `npm run build` in your configured environment.
- These source changes do not import images or publish the live website automatically.

**Release guide:** `docs/V7_9_2_TEAM_PHOTOGRAPHY_RELEASE.md`.
