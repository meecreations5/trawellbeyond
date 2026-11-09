# V6 Global Footer — Changed files only

Apply over **V5 Design Parity**. Do not use over V4 or the original V5.1 static prototype.

New:
- `src/lib/global-footer.mjs`
- `public/global-footer.css`
- `tests/global-footer.test.mjs`
- `docs/V6_GLOBAL_FOOTER.md`
- `docs/V6_CHANGED_FILES.md`

Changed:
- `src/lib/site-chrome.mjs`
- `src/components/PublicShell.jsx`
- `src/app/layout.jsx`
- `public/index.html`
- `src/templates/destination.html`
- `src/templates/experience.html`
- `src/templates/journey.html`
- `README.md`

No Firebase rules, Storage rules, Firestore collections or Auth logic were modified.
Run `npm test`, `npm run check:syntax`, `npm run verify:frontend`, `npm run build`, then `npm run dev`.
