# TrawellBeyond V7.5 | Singapore Travel Knowledge and Video Integration

## Release basis and scope
- Baseline: TrawellBeyond V7.4 Full Code. No website redesign, reimport or database reset.
- Retain approved V5.1 frontend, V6 shared footer, V7.3 CREATE and My Journey, V7.4 optimized image uploads.
- Firebase Web SDK only. Microsoft Auth + existing `teamUsers`. No Firebase Admin SDK.
- Added destination Travel Essentials, attraction Plan Your Visit, and optional click-to-play YouTube previews.
- Images and galleries remain unchanged. No video files are downloaded or uploaded.

## Important operational note
This package includes source code and **reviewed starter guidance**. It does not change your live Firestore or Storage. Existing published content is not automatically overwritten. The starter installer skips records already present.

Video references are editorial links. They do not guarantee the featured place or programme has not changed since filming. YouTube can prevent embedding on specific videos; visitors can still open the link on YouTube.

## Install (PowerShell)

1. Extract `TrawellBeyond_V51_Singapore_Knowledge_V7_5_Full_Code.zip` into `C:\atul\ReactJS\TrawellBeyond_V51_Singapore_Knowledge_V7_5`, or copy the Changed Files ZIP over your V7.4 project, retaining directory structure. If extracting the full archive, the inner project folder is `TrawellBeyond_V51_Singapore_Knowledge_V7_5`.
2. Reuse your working `.env.local` from V7.4. Never share it or upload it as an attachment.
3. Run:

```powershell
cd C:\atul\ReactJS\TrawellBeyond_V51_Singapore_Knowledge_V7_5
npm install
npm test
npm run check:syntax
npm run build
```

4. Confirm the selected Firebase project **before deployment**:

```powershell
firebase login
firebase projects:list
firebase use --add
firebase deploy --only firestore:rules
```

Only Firestore security rules changed. Storage rules, Authentication, existing photos, `teamUsers` and enquiries remain untouched. Do not run a database reset.

5. Start the website:

```powershell
npm run dev
```

## Preview before touching Firestore

In development mode, open these routes after `npm run dev` to inspect V7.5 starter content without requiring any database writes:

- `http://localhost:3000/preview/singapore?view=destination` (Travel Essentials and destination video)
- `http://localhost:3000/preview/singapore?view=experience` (Gardens by the Bay visit guide and video)
- `http://localhost:3000/preview/singapore?view=journey` (unchanged itinerary)

The preview route is disabled for production builds.

## Update existing published Singapore records

- `http://localhost:3000/admin` -> Destinations -> Singapore.
- Choose **Fill missing travel / video guidance**. This populates **only empty fields** with the reviewed starter guide. Open the expandable **Travel Essentials** and **Video Preview** sections to review, adjust and verify.
- Select **Save Published Changes** (not Unpublish). Open `http://localhost:3000/destinations/singapore` and check Travel Essentials and destination video.
- Admin -> Experiences -> Gardens by the Bay / Marina Bay Waterfront / Universal Studios Singapore / Singapore Zoo.
- Click **Fill missing travel / video guidance**, review **Plan Your Visit** and **Video Preview**, then **Save Published Changes** for already published records.
- All other attractions support the fields, but their specific access facts and videos should be filled after operator verification. Do not publish invented details.
- Any newly installed Singapore starter records include the new guide/video data and remain private drafts until you explicitly publish them.

## Visitor UX

| Page | Content | Behaviour |
| --- | --- | --- |
| Singapore Destination | Language, SGD, time zone, climate, public transport, food, stay areas, entry guidance, useful essentials | Displays only populated CMS fields; official source links and review date |
| Singapore Destination | Official VisitSingapore video | Play button creates privacy-enhanced YouTube iframe on demand; external link remains available |
| Experiences | Location, nearest transit, getting there, accessibility, practical visit tips | New optional compact Plan Your Visit section beneath existing Good to Know |
| Experiences | Optional individual video | Source/creator credit, click-to-play, no autoplay on page load |

No new payment functionality is introduced. The customer enquiry journey is unchanged.

## Known editorial and launch limitations

- **Video references included:** one official Singapore sightseeing video, one official Gardens by the Bay video and one official Singapore Zoo video. Other attraction videos are intentionally blank pending verification; videos with restricted embedding may require opening YouTube directly.
- **Four attraction-specific plans prefilled:** Gardens by the Bay, Marina Bay Waterfront, Universal Studios Singapore, Singapore Zoo. Other 12 starter experiences retain V7.4 editorial content and can be enriched individually.
- **No restaurant directory:** the destination Food & Dining guide offers neighbourhood and dietary guidance; venue-level hours, certification, menus and allergy policies must be checked separately.
- **Entry and transport requirements change:** use ICA and LTA source links close to departure. Individual nationality-specific visa decisions are not made by the CMS.
- **Live Firebase and full Next.js build:** not tested from this sandbox. `npm install` failed with a DNS/network error accessing npm registry. Run full production build and browser UAT locally before deployment.
- **Visual QA:** source/templates, CSS and test snapshots passed, but live mobile/desktop visual QA remains necessary.

## Verification checklist

- [ ] Admin login using existing Microsoft account and teamUsers succeeds.
- [ ] Singapore destination still displays original hero, chapters, gallery, purpose, journey, FAQs and global footer.
- [ ] Travel Essentials shows all reviewed populated sections and no raw placeholders.
- [ ] Official source links open valid operator/government websites.
- [ ] Destination video opens only when Play is clicked; no third-party iframe loads beforehand.
- [ ] Test four experiences: Gardens by the Bay, Marina Bay Waterfront, Universal Studios Singapore and Singapore Zoo. Their Plan Your Visit blocks render and their existing enquiry/CREATE links still work.
- [ ] Enter a bad video URL and confirm Save is rejected with a helpful message.
- [ ] Change a description in a published record, save and refresh; it stays published.
- [ ] Check the V7.4 image optimization, gallery and cropping tools are unchanged.
- [ ] Verify mobile layout, keyboard/video button interaction and no layout shifts.

## Curated official sources (reviewed 2026-11-09)

- Singapore Tourism Board: https://www.visitsingapore.com/travel-tips/essential-travel-information/
- Singapore public transit: https://www.lta.gov.sg/content/ltagov/en/getting_around/public_transport/plan_your_journey.html
- Singapore entry/SG Arrival Card: https://www.ica.gov.sg/enter-transit-depart/entering-singapore/sg-arrival-card
- Singapore sightseeing video (VisitSingapore): https://www.youtube.com/watch?v=Idjvkpp5OlM
- Gardens by the Bay train/bus: https://www.gardensbythebay.com.sg/en/plan-your-visit/getting-here.html
- Gardens video (VisitSingapore): https://www.youtube.com/watch?v=vNFly4xvAXo
- Resorts World Sentosa access: https://www.rwsentosa.com/en/about/getting-here
- Mandai access: https://www.mandai.com/en/plan-your-visit/getting-to-and-around/getting-to-mandai-wildlife-reserve.html
- Singapore Zoo video (VisitSingapore): https://www.youtube.com/watch?v=xl2R6MvMwjM

## Source-code verification completed here

- Node tests: **73/73 passed** (67 baseline + 6 V7.5).
- Node syntax: 36 JS modules checked.
- JSX: 28 files parsed without syntax errors using TypeScript parser.
- V5.1 structure verification passed.
- Full npm install and Next.js build not verified; npm registry DNS unavailable in sandbox.
