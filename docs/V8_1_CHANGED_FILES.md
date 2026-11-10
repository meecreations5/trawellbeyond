# V8.1 — Exact Changed-File Manifest

**Baseline:** `TrawellBeyond_V8_0_1_Complete_Project.zip`

New files and modified files relative to V8.0.1, based on byte comparison.

## New files

- `docs/V8_1_MOTION_IDENTITY_RELEASE.md`
- `public/assets/trawellbeyond-accent-motif.svg`
- `public/v81-motion.css`
- `public/v81-motion.js`
- `public/v81-page-transitions.css`
- `scripts/audit-v81-motion.mjs`
- `scripts/check-live-v81.mjs`
- `src/components/motion/BrandReveal.jsx`
- `src/components/motion/BrandedState.jsx`
- `src/components/motion/ChapterProgress.jsx`
- `src/components/motion/JourneyLine.jsx`
- `src/lib/motion-policy.mjs`
- `tests/v81-motion.test.mjs`
- `docs/V8_1_CHANGED_FILES.md` (this manifest)

## Modified files

- `README.md`
- `package.json`
- `public/index.html`
- `public/journey-tray.js`
- `src/app/layout.jsx`
- `src/app/not-found.jsx`
- `src/app/our-story/page.jsx`
- `src/components/ContentCards.jsx`
- `src/components/CreateStudio.jsx`
- `src/components/InquiryForm.jsx`
- `src/components/PageMotion.jsx`
- `src/components/PublicShell.jsx`
- `src/components/StoryPhilosophy.jsx`
- `src/templates/destination.html`
- `src/templates/experience.html`
- `src/templates/journey.html`

**Deleted baseline files:** None.

**Not modified:** `public/assets/trawellbeyond-master.svg`, `public/assets/trawellbeyond-display.svg`, `firestore.rules`, `storage.rules` (where present), Admin/team management code, and the published CMS dataset.

Use the changed-files ZIP only over the V8.0.1 baseline. Install dependencies and run all acceptance checks before deployment.
