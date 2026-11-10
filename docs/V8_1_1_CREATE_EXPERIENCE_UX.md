# TrawellBeyond V8.1.1 — CREATE and Experience Highlights UX

**Baseline:** V8.1 Motion & Interaction Identity Full Project. **Scope:** public CREATE flow and experience-detail highlighting. No Admin, database, payment, authentication, publishing or Firebase rules change.

## Problems confirmed from user screenshots

1. The CREATE progress UI showed a thick orange bar and vertically stacked markers. The old CSS selector `.cr-progress-meter span` styled *every nested element* of the new reusable `JourneyLine` and fought its track/fill/nodes layout.
2. CREATE's reason cards displayed Singapore destination photographs regardless of journey purpose. This made purpose-based travel selection feel like selecting Singapore attractions.
3. The Experience Highlights section used a fixed three-column grid. When an experience had four highlights, the last row appeared as one box plus empty grey grid cells. Decorative arrows also implied clickable cards that did nothing.
4. Experience quick navigation could obscure mobile headings, and photo panels could exceed narrow viewport widths when constrained by both intrinsic aspect ratios and `min-height`.

## Changes

**CREATE:** The old wildcard progress selector is removed and the four-step navigation is explicitly scoped. The progress track is 3px with four accessible step actions and sensible 2×2 mobile wrapping. The five purpose cards now use original inline line illustrations, coherent copy, clear pressed/selected states and live status text. No stock media or destination-specific photos are required. Draft-save, back navigation, purpose IDs, destination/experience selection, day planner and enquiry logic are retained.

**Experience Highlights:** Cards form a clean two-column layout (4 = 2×2, odd counts use a balanced final row). A relevant image is shown only when attached to the same experience's hero/gallery CMS fields. If absent, text cards fill the width; if a published image URL fails, the optional photo column is removed. Decorative arrows on non-clickable cards are replaced with orange rules. A clear CTA carries the experience into the existing enquiry-led CREATE flow. On small screens, cards stack, images respect available width, and the quick navigation no longer overlays headings.

**Brand:** Approved logo SVG bytes, typography direction (Manrope/Lora), charcoal `#202824`, orange `#FF751F`, white-first layout and V4.2 motion style are unchanged. Reduced-motion and focus-visible styles are provided. No new external images or fonts are introduced.

## Changed files

- `src/components/CreateStudio.jsx`
- `src/components/create-studio.css`
- `src/templates/experience.html`
- `src/lib/v51-experience.mjs`
- `public/experience-detail.css`
- `public/experience-detail.js`
- `tests/singapore-v7.test.mjs` (updates a design assumption that previously mandated Singapore photos in all CREATE purpose cards)
- `tests/v811-create-experience-ux.test.mjs` (new tests)
- `package.json` (version only)
- `README.md` and this guide

## Installation

Apply the **Changed Files Only ZIP** over the existing V8.1 project root. Do not replace `.env` or Firebase configuration.

```powershell
npm install
npm test
npm run check:syntax
npm run verify:frontend
npm run audit:motion:v81
npm run build
```

Only deploy after the production build passes on your machine. No Firebase rules deploy or content re-import is necessary for this specific change.

## Acceptance before public launch

1. Open **CREATE** at desktop and on a real phone. Step indicator should display one clean orange line; four steps must remain readable, with no stacked markers. Verify keyboard focus and screen reader progress label.
2. Choose each of the five purposes. Selection text should update; **Not sure yet** should remain a working option. Continue and Back must preserve preferences; draft restoration must still work.
3. Choose a destination and experiences; test detailed day planning; submit an actual *test enquiry with valid consent* and confirm the CRM/Firebase result before claiming delivery.
4. Check an experience with **four highlights**: exactly four balanced text cards; no grey empty cells or fake clickable arrows. Test with 1, 3, 5 and 8 highlights as well.
5. Test an experience with a **valid attached image**, an **empty media field**, and an **invalid image URL**. Empty/broken should not result in a giant blank panel or arbitrary substitute destination photo.
6. Test the same pages at 320, 390, 768 and 1440px, with reduced motion and browser back. Confirm no horizontal scrolling, overlapping mobile quick navigation or cropped CTA.
7. Finish your existing Admin image-completion queue separately. This UX patch **does not attach or publish photographs**, resolve licence approvals, or certify live performance.

## Verification performed here

- 163/163 Node automated tests passed.
- 55 JavaScript modules, 39 JSX files and 3 JSON manifests passed the syntax verifier.
- Existing frontend asset and V8.1 motion audits passed.
- Isolated Chromium CSS previews: 320, 390, 768, 1440px; measured no horizontal overflow in CREATE and both experience-highlight variants.
- Not performed: complete Next.js build, live Firebase and production image performance. `npm install` failed due temporary DNS resolution of `registry.npmjs.org` (needed for `esbuild`).

**Rollback:** Restore changed files from your V8.1 backup. No schema migration or content alteration to undo.
