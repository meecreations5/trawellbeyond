# V7.9.1 Hotfix — Changed Files Only

These are the changes compared with the uploaded V7.9 ZIP. No files in `public/`, `src/templates/`, `firestore.rules` or `storage.rules` were modified.

- `src/lib/v79-photo-queue.mjs` — 590 slot search plan compiled from the existing V7.9 review CSV (unapproved search terms only).
- `src/lib/bulk-photography.mjs` — slot filtering, candidate eligibility, copy-preserving attachment, itinerary-order protection.
- `src/lib/cms-web.js` — new authenticated `POST /api/admin/bulk/photography` dispatcher using Firestore transaction and reviewed Storage assets.
- `src/components/admin/PhotoCompletion.jsx` — UI for one-destination-at-a-time candidate search, exact source review, import and attach.
- `src/components/admin/photo-completion.css` — matching mobile-friendly admin controls.
- `src/components/admin/BulkRollout.jsx` — integrates Guided Photo Completion into existing admin rollout.
- `tests/v791-bulk-photography.test.mjs` — six focused photo-policy, search-fallback and non-overwrite tests.
- `docs/V7_9_1_PHOTO_COMPLETION_RELEASE.md` — installation, acceptance, limitations.
- `docs/V7_9_1_CHANGED_FILES.md` — this file.
- `README.md` — hotfix entrypoint.
- `package.json` — version update to `7.9.1`.
