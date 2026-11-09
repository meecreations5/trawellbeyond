# V7.9.2 — Collaborative Content Studio and Automatic Photo Completion

**Project:** TrawellBeyond, enquiry-only Next.js 16 + Firebase Web SDK CMS.  
**Prepared:** 9 November 2026.  
**Purpose:** All destinations, experiences and journeys are imported, but many image fields are empty. Resolve missing photography at scale without putting inaccurate or unlicensed photos live, and let teammates help safely.

## What this release actually does

- Adds **Admin > Team & Access** (Super Admin only). Invite by exact Microsoft email; invited staff sign in with their own Microsoft account and claim their Firestore `teamUsers/<uid>` membership after verification against the invitation. The admin must share the sign-in URL; the application does **not** send an invitation email.
- Adds three least-privilege roles: **Publisher** (review, update, publish), **Content Editor** (text and draft content, no publishing), and **Media Assistant** (draft photographs and media only, no publishing or customer enquiries). Existing `admin` access remains supported, but only `super_admin` can invite/manage members.
- Adds **Admin > Bulk Rollout > Automatic Image Completion**, covering all currently saved destinations, experiences and journeys, including older Singapore, Dubai and Thailand records, rather than just the 17 in V7.9.
- Scans the current Firestore records, identifies empty cover, story, gallery and journey day image placements, searches Wikimedia Commons, requires strong filename/subject-token matches and rechecks Commons metadata before importing.
- Imports verified candidates into Firebase Storage with three responsive WebP variants and photo credit/source/licence metadata. Reuses existing matching licensed assets when possible.
- Attaches photos only to **blank fields of Draft records** using conflict-checked Firestore transactions. Existing images, text, itineraries, metadata and published records are preserved. All automatically attached photos mark their draft **pending publisher photo review**.
- Adds a photo-review queue, per-destination image-coverage counts and **Test saved image links** to detect inaccessible URLs (not only blank fields). All-destinations link test checks the first 300 unique URLs; choose a specific destination for a fuller test.
- Adds optimistic concurrency checks so teammates are prompted to rescan when another teammate edits the same record.
- Protects roles in **both Firestore and Cloud Storage security rules**. Editors cannot self-approve changed photographs through direct Firebase SDK writes. Media Assistants cannot overwrite live pages.

## Things this release does not do

- **It is not a live Firebase migration.** No production content or Storage files are uploaded simply by extracting this ZIP.
- **It does not promise 100% automatic coverage.** Commons may not have a correct, reusable photo for a particular attraction or itinerary day. Uncertain matches are skipped; staff must manually review/fill the gaps.
- **It never automatically publishes content**, modifies already-published photographs or guarantees that a strong filename match depicts the correct place. A human publisher must visually review every suggested image and commercial use terms, including share-alike, credit, and any depicted-person/property restrictions as applicable.
- It does not create Microsoft accounts or send invite emails. No payments/checkout are introduced.
- It does not run in the background. The image-completion tab must remain open; stop/rescan/resume is safe.
- Full Next.js production compilation, Firebase Security Rules emulator tests, live Firestore/Storage imports, mobile checks, enquiries and production rollout must be completed in your configured environment. Local Node tests alone are not production acceptance.

## Install (existing V7.9.1 project)

1. **Back up your entire current project, Firestore data, Firestore rules and Storage rules.** Keep `.env.local`, `firebase.json`/`.firebaserc` project selection and the original hosting settings untouched.
2. Unzip `TrawellBeyond_V7_9_2_Changed_Files_Only.zip` **over the root** of the running V7.9.1 project, preserving all other existing files. Alternatively, migrate your `.env.local` and deployment settings into the Full Code ZIP. Do not mix with a V7.9.0 root.
3. In Windows PowerShell, from your project folder:

   ```powershell
   npm install
   npm test
   npm run check:syntax
   npm run verify:frontend
   npm run build
   ```

   Any failure must be resolved before deployment. The distributable was locally checked using Node tests and syntax; no `node_modules` were available here to complete `next build`.
4. **Bootstrapping owner:** In the Firebase Console, ensure your current account's `teamUsers/<YOUR_FIREBASE_AUTH_UID>` document exists with `active: true` and `role: "super_admin"`. Do this only for the established site owner, using your existing privileged Firebase Console access. If the current owner is `admin`, promote that **existing owner record** deliberately before testing Team & Access; don't create a second owner or make other teammates Super Admins.
5. Deploy the source rules together in your chosen Firebase project, after reviewing them and testing in a staging project / Rules Playground:

   ```powershell
   firebase login
   firebase projects:list
   firebase use --add
   firebase deploy --only firestore:rules,storage
   ```

   If you already have a configured `.firebaserc`, `firebase use --add` is optional. This command affects **rules**, not your Next.js website hosting. Deploying local rule files **overwrites the live rules** for those services; verify the target project and retain backups first. Reference: https://firebase.google.com/docs/cli
6. Deploy the Next.js app through the **same hosting service and deployment pipeline you currently use**. Do not assume `firebase deploy --only firestore:rules,storage` deploys the website.

## Use the collaborative CMS

1. Log in via `/admin` with your Microsoft account. Open **Team & Access**.
2. Invite teammates by their **exact Microsoft sign-in email** and choose one of these roles:

   | Role | Draft text | Draft photography | Approve & publish | Team management | Customer enquiries |
   | ---- | ---------- | ----------------- | ----------------- | --------------- | ------------------ |
   | Super Admin | Yes | Yes | Yes | Yes | Yes |
   | Publisher | Yes | Yes | Yes | No | No |
   | Content Editor | Yes | Yes | No | No | No |
   | Media Assistant | No | Yes | No | No | No |

   Legacy Admins retain broader existing access but cannot manage team membership. Only the Super Admin can invite and deactivate teammates.
3. Copy the join instructions from the screen and send them via your own messaging channel. Staff open `/admin` and sign in. Their invited membership is created automatically only if their Microsoft-email claim matches an active invitation.
4. Remove a teammate's access in **Team & Access > Team members > Disable**. Revoking an invitation alone does not disable a member who has already joined; disable the joined membership separately.
5. To avoid overwrites, refresh the content record before saving when another team member has modified it.

## Images: exact recommended sequence

1. Open **Admin > Bulk Rollout**, click **Scan current Firebase records**, then review **Automatic Image Completion**. The destination selector covers actual Firestore records across the complete catalogue, not just the V7.9 selection checkboxes above it.
2. **Choose Malaysia first** as a controlled pilot. Set `Destinations + experiences + journeys`. Read the acknowledgement and choose **Auto-complete**. Keep the browser tab open.
3. The system will mark the successfully attached Draft images as **pending review**. Open each item from the Photo review queue. Verify the *actual landmark*, photographer, credit, licence/source page, correct image composition, duplicate images and no misleading depiction.
4. A **Publisher** opens the corresponding record and presses **I reviewed these photos · Approve**. The approval does not publish automatically.
5. Staff correct missing or incorrect draft photos using **Media Library** and the normal destination / experience / journey editors. For published records with blank/broken images, a Publisher must repair them manually; automation skips published content.
6. Run **Test saved image links** for Malaysia; review the coverage list and published page previews. Only then select the next destination or `All destinations`. Stop / rescan / resume if needed.
7. For V7.9 destination rollouts, the **Bulk Readiness** check also requires realistic journey day photos, gallery photos, factual current attraction/transport details and licence metadata. A `mediaReviewStatus: pending` record cannot publish.

## Launch acceptance checklist: keep publication blocked until complete

- [ ] Malaysia pilot: image coverage checked, image URLs load, credits are displayed, correct subjects are depicted.
- [ ] Every live destination: hero, three story panels where expected and gallery; no broken or repeated/misleading images.
- [ ] Every live experience: cover, gallery, operator timings and visitor information reviewed against current official sources; videos only when source is authorized.
- [ ] Every live journey: cover, gallery and each itinerary-day photo appears correctly on mobile and desktop.
- [ ] Visual review: attribution/licence/source links on public pages, responsive WebP variants, image crop/focus and mobile lightboxes.
- [ ] Team role acceptance: Media Assistant cannot edit text/publish; Editor cannot publish; Publisher can approve/publish; owner can invite/disable; disabled teammate loses access; no direct SDK privilege escalation.
- [ ] Source-of-truth acceptance: Admin `Published` updates are visible on public pages; Drafts stay private; no photo review bypass; no missing images hidden by fallback art.
- [ ] Enquiry acceptance: website forms, WhatsApp and calls work; a *real* test enquiry is visible in Admin and customer consent is recorded; no payment gateway/checkout.
- [ ] Security/ops: correct Firebase project, backed-up rules, tested access control, website deployment completed, SEO/sitemap/social preview/performance checks passed.

**Go/no-go:** Until all checks pass on the *actual public domain and Firebase project*, the source code can be called `V7.9.2 implementation`, but **the live website is not certified ready for launch**.
