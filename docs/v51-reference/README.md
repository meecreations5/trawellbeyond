# TrawellBeyond · Unified Website Code V5.1

**Last updated:** 4 November 2026  
**Status:** Interactive design prototype for stakeholder review and developer handoff. **Not** a production Next.js/Firebase deployment.

## Quick start

Open a terminal in this directory:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/` in a browser. No `npm install` or environment secrets are required for this static preview.

## Included pages

| URL / file | Purpose | Status |
| --- | --- | --- |
| `/` or `index.html` | Approved white-first V4.2 animated homepage; 7/9px storytelling dots | Working demo |
| `/singapore.html` | Singapore destination page: storytelling, experiences, purpose selector | Working demo |
| `/singapore-journey.html` | Singapore sample package: interactive itinerary, travel preferences, local enquiry draft | Working demo |

**Navigation:** The header Singapore link, Singapore destination card and Singapore item in the all-destinations drawer open the Singapore destination page. The featured Singapore sample package opens its detail page, while *Make it mine* jumps to the package customization area. All other destinations/packages are representative homepage prototype panels only; they do not yet have detail pages.

## V5.1 update manifest

- `home-routing.js` — Simplified Singapore routing; supports all-destinations drawer and direct *Make it mine* customization action.
- `experience.js` — Added travel-date lower bound and strengthened phone/email validation for local enquiry drafts.
- `index.html` — Updated version note.
- `README.md` — Consolidated single-source developer instructions and production handoff boundaries.
- `CHANGELOG.md` — Documents this update.
- All other components and animation styles inherited unchanged from Singapore V5 / approved V4.2.1 dots correction.

## Brand and motion

- Original approved SVG is included **unchanged** in `assets/trawellbeyond-master.svg`. `assets/trawellbeyond-display.svg` is the cropped presentation variant already used by the design prototype.
- White canvas `#FFFFFF`, charcoal `#1A1A1A`, orange `#FF751F`; Manrope and Lora fonts via Google Fonts.
- Homepage scroll-pinned storytelling, image reveals, destination exploration and horizontal journey rail retained.
- Story-pagination dots: 7px inactive, 9px active, 32px touch/click target.
- Reduced-motion styles are present. Retest all animated flows on real mobile devices before launch.

## What this code does NOT do

- It does **not** submit leads to a real server, email service, WhatsApp API or CRM. It prepares a locally copyable enquiry draft.
- It does **not** provide an admin dashboard, database, user authentication, real-time price or availability, booking, checkout or payment features.
- The Singapore package and other featured journeys are **illustrative concepts**, not bookable products. Final content, offers, inclusions and prices need approval.
- Some photography loads from external image URLs when connected. SVG fallback illustrations are bundled for offline preview. Licensing, image optimization and correct credits must be addressed before publishing.
- This is **not** the full 20-destination production website. The homepage lists the initial destinations, but only Singapore has the detailed page implemented so far.

## Production development sequence

1. Port the approved UI to reusable Next.js components with actual route structure and CMS-backed data models.
2. Implement secure admin authentication, Destination Manager, Package Studio and Promotions Manager.
3. Build and validate server-side enquiry submission, consent, anti-spam, assignments and notification routing to TrawellBeyond CRM.
4. Expand the template to remaining approved destinations, with verified imagery and commercial data.
5. Complete mobile QA, accessibility, SEO, performance, policies and deployment.

Review the included `DESIGN_SYSTEM.md` and `MOTION_SPEC.md` before converting components to production.

## V5.1 verification note

- JavaScript syntax checks passed for `app.js`, `motion.js`, `home-routing.js` and `experience.js`.
- Desktop (1440px) and mobile (390px) isolated page renders showed no horizontal overflow or uncaught JavaScript errors.
- The Singapore enquiry draft was tested with both invalid and valid contact details and a changed night count.
- The master logo bytes match the approved uploaded SVG.
- Full end-to-end URL navigation and network-image verification could not be performed in the restricted browser environment. Recheck those flows locally before deployment.
