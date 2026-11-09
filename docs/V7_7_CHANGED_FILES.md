# V7.7 Changed Files (relative to V7.6 Full Code)

- `src/lib/completion-engine.mjs` (new) — global content/media audit, verified suggestions, transaction-safe blank-only merge planning.
- `src/lib/media-variants.mjs` (new) — optimized variant normalization, exact URL matching, asset-to-content linking, attribution.
- `src/components/admin/CompletionCenter.jsx` (new) — Admin scanning, filtering, CSV, review, safe-fill, image health tests.
- `src/components/admin/completion-center.css` (new) — Admin-only styles.
- `src/components/admin/AdminConsole.jsx` — new menu, editor link, image selection preserves WebP variant mapping and credits.
- `src/components/admin/ImageLibrary.jsx` — editable alt text and saved image metadata.
- `src/lib/cms-web.js` — paginated scan, Firestore transaction-based fill, saved media metadata update (Firebase Web SDK only).
- `src/lib/content.mjs` — validates optional public image-variant map.
- `src/lib/v51-home.mjs` — medium-size destination and journey card images.
- `src/lib/v51-details.mjs` — medium-size experience cards/day photos, thumbnail gallery buttons.
- `src/lib/v51-experience.mjs` — experience thumbnail gallery and medium related cards.
- `src/lib/photo-credits.mjs` — separate lightbox display URL and small thumbnail URL.
- `src/components/ContentCards.jsx` — choose medium variants on listing pages.
- `src/components/CreateStudio.jsx` — choose optimized destination/experience thumbnails.
- `firestore.rules` — authorizes `imageVariants` map for authorized content writes while retaining `teamUsers` rules.
- `package.json` — version bump to 7.7.0.
- `README.md`, `docs/V7_7_CONTENT_COMPLETION_RELEASE.md` — installation and limitations.
- `tests/v77-completion.test.mjs` (new) — scanner, variant selection, safe-merge and source-level checks.
