# V7.5 changed files

- `src/lib/travel-guide.mjs` NEW: video safety, travel essentials and visit guide renderers
- `src/lib/singapore-knowledge.mjs` NEW: verified starter facts and merge-without-overwrite function
- `src/lib/content.mjs` UPDATED: schema, text limits, YouTube/HTTPS/date validation
- `src/lib/launch-starters.mjs` UPDATED: Singapore guide/video starter records (drafts only)
- `src/lib/v51-details.mjs` UPDATED: destination guide and film rendering
- `src/lib/v51-experience.mjs` UPDATED: attraction guide and film rendering
- `src/templates/destination.html` UPDATED: new placeholders/styles/script, original sections preserved
- `src/templates/experience.html` UPDATED: new placeholders/styles/script, original sections preserved
- `src/components/admin/AdminConsole.jsx` UPDATED: grouped CMS fields and fill-missing action
- `src/components/admin/admin.css` UPDATED: minimal group editor styles
- `public/travel-guide-v75.css` NEW: responsive travel knowledge/video styles
- `public/video-preview-v75.js` NEW: click-to-load YouTube iframe
- `firestore.rules` UPDATED: new allowed text fields, existing permissions unchanged
- `package.json` UPDATED: version 7.5.0
- `tests/v75-travel-guide.test.mjs` NEW: validation, rendering, migration, rules tests
- `docs/V7_5_SINGAPORE_KNOWLEDGE_VIDEO_RELEASE.md` NEW
- `docs/V7_5_VIDEO_SOURCE_MANIFEST.csv` NEW
- `docs/V7_5_CHANGED_FILES.md` NEW
- `README.md` UPDATED

No other source files changed from V7.4. No `.env.local`, credentials, image binaries or user data are included.
