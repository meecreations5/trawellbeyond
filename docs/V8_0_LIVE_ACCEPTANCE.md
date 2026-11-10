# V8.0 Live Acceptance Checklist — complete before launch

**This is a manual acceptance plan, not a claim that the deployed website has passed.** Use a staging URL and a test Microsoft account per role. Record pass/fail, browser, timestamp and screenshots where useful.

## 1. Publication and staff authorization

- [ ] Confirm the correct Firebase project, production rules and hosting environment.
- [ ] Owner can invite, deactivate and change role of team users; no unauthorized self-invite or role escalation.
- [ ] Content Editor can edit drafts but cannot publish; Media Assistant handles only allowed draft photo fields.
- [ ] Publisher can approve selected photos and publish; a pending review blocks publication.
- [ ] Existing destination, experience, journey and offer CMS records remain unchanged after upgrade; no data migration required.
- [ ] Admin → Website Pages → `our-story`: change narrative field, save draft, compare public page unchanged; publisher publishes, compare public page updates.
- [ ] Verify `storyHeroImage`, `storyOriginImage` and `storyPeopleImage` show proper responsive photo variants and credits in public view.

## 2. Brand experience

- [ ] Homepage still matches approved V4.2 structure, colours, motion and **unchanged** logo; no checkout or payments.
- [ ] Our Story opens with TrawellBeyond context, origin as a DreamTrawell Destination venture and clear promise.
- [ ] Philosophy stages appear in exact order: People, Purpose, Requirement, Journey, Experience, Moments.
- [ ] Tabs respond to pointer, keyboard arrows, Home/End, Previous/Next. `aria-selected`, tab focus and panel content stay synchronized.
- [ ] Parallax is subtle and does not obscure content, create scroll traps, block navigation or induce motion sickness.
- [ ] With reduced motion enabled, transforms/reveal animation are off and all content is still visible.

## 3. Content and media (critical; previously missing)

- [ ] All published **destinations**: correct licensed cover, 3 story photographs and distinct relevant gallery images.
- [ ] All published **experiences**: correct cover, relevant gallery images, practical information, real timings only when verified, and applicable videos.
- [ ] All published **journeys**: correct cover, distinct gallery images, one suitable photograph **per itinerary day**, no broken day carousel navigation.
- [ ] Confirm original location/attraction identities visually; automatic similarity matches are **not** proof of correctness.
- [ ] Each image is actually accessible on the public site; HTTP 200, no broken links, adequate source resolution, alt text where appropriate.
- [ ] Optimized versions use WebP when available, appropriate size for device and no huge source images on mobile.
- [ ] Licence/rights proof, photographer credit, permitted reuse and any required attribution links are present.
- [ ] Use V7.9.2 Admin Content Completion / Bulk Rollout to finish missing media; run the V8 structural JSON audit when an export is available.

## 4. Mobile and accessibility

- [ ] Verify iPhone-size 320/375/390px, tablet 768px, desktop 1024/1440px **on deployed app**, not just CSS preview.
- [ ] No horizontal overflow, overlapping CTAs, clipped text, navigation obscuring content, or invisible focus.
- [ ] Tab through nav, story, philosophy, experience tabs, journey days, CREATE and enquiry forms; Enter/Space perform expected action.
- [ ] Screen reader: semantic headings, links, form labels, progress indicator, live error/status announcements, image alternatives and focus order.
- [ ] Zoom to 200%/400% and verify usable reflow; check WCAG AA contrast for all content and interactive states.
- [ ] Test slow connection and broken-image fallbacks; no layout shifts blocking buttons.

## 5. Journey / experience / CREATE functionality

- [ ] Journey itinerary day Previous/Next, direct tab selection, keyboard control, counter and media update correctly.
- [ ] Experience quick navigation lands on story, highlights, planning and enquiry sections; purpose filters return appropriate content.
- [ ] CREATE selections persist between stages, backward editing works, progress updates accurately and contact validation works.
- [ ] The system creates an enquiry and sends notifications via your configured pipeline. Test only with consented test data and verify it in Admin.
- [ ] WhatsApp and enquiry CTA destinations work; no online payment or booking confirmation occurs.

## 6. Performance, SEO and live release

- [ ] Run `npm install && npm run build` on the deployment runner; resolve build errors before publishing.
- [ ] Run `npm run check:live:v80 -- https://YOUR-LIVE-URL` after deploying.
- [ ] Audit LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at 75th percentile using real-user/field data where available; use mobile Lighthouse for lab diagnostics.
- [ ] No large media transfers, unnecessary background animation, console errors or uncaught React hydration warnings.
- [ ] Verify `/`, `/our-story`, `/destinations`, `/experiences`, `/journeys`, `/create`, `/enquire`, `/contact`, `/privacy`, `/terms` and published detail URLs.
- [ ] Test sitemap, robots, titles, descriptions, canonical URLs, OG images and structured data as applicable.
- [ ] Confirm publish/unpublish behaviour and rollback process; record actual production sign-off after all gates pass.
