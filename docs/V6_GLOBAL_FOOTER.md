# V6 — One global footer, original V5.1 design

## Why this release
V5 had separate footer implementations: the homepage used the approved V5.1 white footer; destination/experience/journey templates used an abbreviated footer; and React pages displayed a green marketing footer. This update uses ONE renderer and ONE stylesheet for the entire public site.

## Files
- `src/lib/global-footer.mjs` — single HTML renderer, safe escaping and footer replacement.
- `public/global-footer.css` — shared responsive V5.1 footer stylesheet.
- `src/lib/site-chrome.mjs` — replace any old public HTML footer at render time.
- `src/components/PublicShell.jsx` — same renderer on React public pages (not Admin).
- `src/app/layout.jsx` — load footer stylesheet on React routes.
- `public/index.html` and `src/templates/{destination,experience,journey}.html` — load footer CSS on raw HTML routes.
- `tests/global-footer.test.mjs` — parity, CMS data, XSS, single footer assertions.

## Edit in Admin
1. Sign in to `/admin` with your Microsoft account.
2. Open **Website Pages**, then **Header & Footer** (`site-settings`).
3. Update Footer Line 1, Footer Line 2, Footer Company, Footer Bottom, Footer CTA, Footer Links, Email and Phone as needed.
4. Select **Publish to Website** (Save Draft won't update live pages).
5. Refresh `/`, `/destinations/singapore`, `/experiences/gardens-by-the-bay`, `/journeys/singapore-at-your-pace`, and `/contact`.

All public pages share exactly the same footer markup, navigation and styling; only the settings record controls editable text. The approved homepage sections and animations are otherwise unchanged. Admin `/admin` intentionally has no public footer.

## Install
- **Full zip**: Extract in a clean folder; copy the existing `.env.local`, do not copy `node_modules`.
- **Changed-files zip**: Apply the listed files with the same relative paths over V5.
- Run `npm install`, `npm test`, `npm run build`, `npm run dev`.
- This release changes no Firestore rules or schema; **no rule deployment and no database reset** are needed.

## Testing limitations
Automated checks cannot replace desktop/mobile visual QA and live Firebase publication. Check all five routes after deployment, especially the direct HTML pages.
