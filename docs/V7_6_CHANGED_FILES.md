# V7.6 — Changes from V7.5

- `src/lib/journey-photos.mjs` (new) — URL-safe gallery recovery and photo readiness
- `src/lib/v51-details.mjs` — journey gallery uses existing day photos; no repeated empty tiles; neutral unmatched day fallbacks
- `public/sg-gallery.css` — responsive 1–2 photo gallery layouts
- `src/lib/image-presets.mjs` — bounded brightness, contrast and saturation normalization
- `src/lib/image-optimizer.js` — use browser canvas filter during WebP conversion
- `src/lib/cms-web.js` — preserve photo edits throughout Firebase Web SDK uploads
- `src/components/admin/CropControls.jsx` — live CC sliders and gentle preset
- `src/components/admin/ImageLibrary.jsx` — default colour controls
- `src/components/admin/AdminConsole.jsx` — journey photo completeness and one-click gallery fill
- `src/components/admin/admin.css` — CMS photo panel styling
- `tests/v76-journey-photos.test.mjs` — six regression tests
- `docs/V7_6_JOURNEY_IMAGE_RESTORATION.md` — installation and acceptance test
- `package.json`, `README.md` — release metadata
