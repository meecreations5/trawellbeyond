# TrawellBeyond V8.2 - Created Around You

Release date: 2026-11-10
Baseline: V8.1.2 Complete Project
Visual direction: Approved V4.2 Motion Edition / original TrawellBeyond logo (unchanged)
Business model: Enquiry-led, with no online checkout or payments

## Release scope

This release implements both the launch essentials and the subsequent requested enhancements as one integrated source update.

| Experience | Route or surface | What is implemented |
|---|---|---|
| Journey Companion | Floating Ask TrawellBeyond trigger, React pages and HTML destination/experience/journey templates | Guided purpose, people, dates, interests, pace and travel-style questions; published CMS destination/journey matching; save and direct human enquiry |
| Journey Match | `/journey-match` | Purpose-led suggestions ranked deterministically from *published* CMS content; saved destination and journey actions; CREATE handoff |
| Smart Enquiry | Existing CREATE, enquiry forms, legacy templates, Companion | Consented Firebase enquiry creation with structured summaries, contact method, convenient callback time, receipt reference |
| Journey Companion Inbox | Admin > Journey Companion Inbox | View submitted requests, filter/search, status progress, assign advisors, phone and manual WhatsApp handoff |
| My Journey 3.0 | `/my-journey` | Save/compare curated journeys, preserve existing destination/experience tray, share published-content slugs only, carry selections to CREATE |
| Individual-day customization | `/customize?journey=<slug>` | Day-by-day revision requests for a published journey; submitted as a human-reviewed enquiry; no silent itinerary mutation |
| Destination Insider | `/insider/<slug>` | CMS-based language, transport, food, weather, entry and practical notes; official HTTPS sources; links to published experiences |
| Private enquiry tracker | `/my-enquiries` | Enquiry status by Firestore-owned visitor session; local receipt list stores IDs only, without PII; reference number is not an access credential |

## Journey Companion operating model

The assistant is a **guided, deterministic CMS-grounded planning experience**, not an unrestricted generative AI model and not a bot that confirms bookings. It does not access external live fares or supplier inventory. Recommendations are based on text in published CMS records and can be refined by your editorial team. The visitor can speak to a human without completing the questionnaire. An unfinished conversation does not create a lead in Firestore. An explicit enquiry action, contact details and checked consent are required.

No automatic WhatsApp messages are sent. The Admin's WhatsApp action opens WhatsApp for a human operator; additional API integration and consent governance would be separate work.

## Roles and privacy

- Visitor sign-in: the existing Firebase Web SDK signs visitors in anonymously when they submit a request. The project must enable Firebase Authentication > Anonymous sign-in.
- Enquiry creation: `ownerUid` equals the authenticated visitor UID, the new lead is unassigned, consent is true, and status starts at `new`. The deployed Firestore rules enforce these constraints.
- Enquiry tracking: reads use document get by exact ID plus the same Firebase Auth UID. A public document reference by itself cannot unlock content; the route does not expose private proposals.
- Super Admin / legacy Admin: read and assign enquiries; both can update progress.
- Publisher: sees only records assigned to that publisher; can update progress but cannot reassign.
- Editor / Media Assistant: cannot read customer leads.
- Public lists and sharing: share links include only public content slugs, never name, phone, email, travel date or special requirements.

**Caution:** Anonymous visitor access is device/browser specific. Switching devices, deleting browser data, or signing out may prevent recovery. The Admin inbox is the authority for the enquiry; customers may contact the advisor if their original session was lost. This release does not implement verified email login or secure cross-device enquiry retrieval.

## Main code touchpoints

New:
- `public/v82-companion.js`, `public/v82-companion.css`
- `src/lib/journey-assistant.mjs`, `journey-sharing.mjs`, `enquiry-receipts.mjs`
- `src/components/v82/` for Journey Match, My Journey, customization, Insider Guide and tracker
- `src/components/admin/EnquiryInbox.jsx`, `enquiry-inbox.css`
- New Next.js routes under `src/app/journey-match`, `my-journey`, `customize`, `insider/[slug]`, `my-enquiries`
- `tests/v82-journey-companion.test.mjs` and isolated Playwright browser acceptance harness

Updated:
- `src/lib/enquiries-web.js`: consent, visitor ownership, receipt and status reads
- `firestore.rules`: owner-scoped enquiry gets, assigned publisher read/update, restricted admin edits
- `src/lib/cms-web.js`, `team-access.mjs`, `src/components/admin/AdminConsole.jsx`: inbox and role checks
- `src/components/PublicShell.jsx`, `src/lib/site-chrome.mjs`, `src/public-client/enquiry-bridge.js`: companion and catalog bridge across both rendering systems
- `src/components/InquiryForm.jsx`, `public/journey-tray.js`, `public/journey-tray.css`, `src/lib/v51-details.mjs`: on-page handoffs

No existing logo asset was edited, no content collection was deleted, no payment gateway was added, and no Firebase Admin SDK was added.

## Test results and limitations

- `npm test`: 180/180 passed (Node source and pure utility regression tests).
- `npm run check:syntax`: 58 JS modules, 50 JSX files, 3 JSON manifests scanned.
- `npm run verify:frontend`: approved baseline templates verified.
- `npm run audit:journey:v82`: integration markers and structural checks passed.
- Additional local TypeScript parsing: 50 JSX modules syntactically valid.
- Isolated browser acceptance: 320, 390, 768, 1440 pixels passed; dialog open, seven-stage guided flow, matching, explicit consent, successful mock handoff, Escape dismissal and no panel overflow.

This environment **could not install npm dependencies or run the complete Next.js production build**. The browser acceptance uses mocked published records and a mocked enquiry bridge solely inside `tests/fixtures`, not the deployed Firebase project. No live Firestore permission test, cross-device test, full React interaction test, SEO crawl, real mobile-device QA, or production image coverage verification has been performed.

## Live release acceptance gates

1. Back up V8.1.2 source and current deployed Firestore rules.
2. Install dependencies, test and build V8.2 on a network-connected machine.
3. Confirm Firebase Anonymous Auth is enabled, that the existing Microsoft Admin sign-in still works, and that teamUsers roles are correctly assigned.
4. Deploy V8.2 **Firestore security rules and website together**. Confirm existing enquiry pages still submit.
5. On public desktop and mobile, complete the Companion questionnaire, see published CMS matches and submit a consented test enquiry.
6. In Admin, confirm test lead appears once, assign to a Publisher, verify assigned-only access and update status.
7. Open `/my-enquiries` in the same browser and confirm status. Verify that another visitor session cannot read the record by reference.
8. Test sharing of public slugs, CREATE prefill, day-wise customization and Insider Guides.
9. Check accessibility and live page speed; verify original logo and motions still match V4.2/V8.1.2.
10. Complete outstanding destination, experience and journey photography and final image-license review before launching.

See the companion Installation & Acceptance Guide for deployment commands and rollback.
