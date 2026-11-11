# TrawellBeyond V8.2.1 - Pre-launch corrections and acceptance

Baseline: the provided V8.2 full project. This is a focused code patch, not a Firebase deployment or launch certification.

## 1. Customer enquiry: auth/admin-restricted-operation

**Verified from code:** src/lib/enquiries-web.js calls Firebase Auth `signInAnonymously()` when a visitor submits an enquiry and does not already have a Firebase session. If Firebase blocks creating this account, the request fails **before** the Firestore enquiry write. Updating Firestore rules alone cannot enable Anonymous Authentication.

**Firebase Console action (must be performed in the real project):**

1. Open Firebase Console and select the TrawellBeyond production project. An earlier project configuration used `trawellbeyond`; verify the actual project ID against `.env.local` / Firebase Project Settings before changing anything.
2. Open **Authentication -> Sign-in method -> Anonymous** and **Enable**, then **Save**.
3. If Anonymous is already enabled but `auth/admin-restricted-operation` persists, review Firebase Authentication / Identity Platform settings for **restricted account creation or disabled sign-ups**. Verify the deployed web app API key, authDomain and projectId all belong to the same project. Check Auth quotas and browser errors if applicable.
4. Use a fresh incognito session (not already authenticated as the Microsoft Admin), submit a test enquiry, and confirm the new Firestore document and Admin Inbox entry.

**Code correction:** known auth restrictions now produce a useful customer message instead of leaking raw `auth/admin-restricted-operation`. Errors remain logged with a diagnostic code in the browser console. Auth and owner-checked Firestore creation remain mandatory. This update does NOT relax any security rules.

## 2. Hydration mismatch on /create

**Reported mismatch:** the server supplied a `button.tb-concierge`, while the client render expected a Next.js Link (`a.tb-concierge`) for the chatbot. The V8.2.1 PublicShell uses a stable `<a href="/enquire" data-tb-assistant-trigger>` on both the first server and client render. Once the Companion script is loaded, its event listener captures the click to open the assistant. If the script has failed, the link still goes to the regular enquiry page.

**After applying the patch (Windows PowerShell):**

```powershell
# Stop any running Next.js dev/server process before removing .next
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm install
npm test
npm run check:syntax
npm run verify:frontend
npm run build
```

Restart the app through your normal deployment pipeline. Test `/create` in a fresh private browser window with the Developer Tools console open. If an `a` vs `button` mismatch persists, verify that the *same* updated bundle was deployed to the server and browser, and clear stale caches. Do not use `suppressHydrationWarning` to mask this mismatch.

## 3. Domestic vs International discovery

Region values in the existing CMS are preserved: `India` and `International`. The public-facing vocabulary displays **Domestic - India** and **International**. Older records with a missing region are matched only against known destination slugs; genuinely unknown places are not silently classified as international.

- `/destinations` shows distinct editorial groups and an All / International / Domestic filter.
- `/destinations?region=international` and `?region=domestic` show the selected collection.
- `/journeys` now groups published journeys using the *parent destination's* region.
- `/experiences` includes a Region dropdown; the Destination dropdown narrows to places in that region.
- `/journey-match` filters published recommendations by destination region.
- `/create` Step 2 lets visitors choose All / International / Domestic before selecting a place.

Counts reflect **published** CMS records, not all imported drafts. No Firestore migration or destination re-import is required.

## 4. Source-level verification performed

- `npm test`: **186 passed** (including six focused pre-launch regression tests; all previous tests still pass).
- `npm run check:syntax`: passed.
- `npm run verify:frontend`: passed; approved static reference design assets/templates unchanged.
- `npm install` failed in this environment due to DNS (`EAI_AGAIN`, registry.npmjs.org). Therefore **Next.js production build has not been verified**.
- No live Firebase console access, production read/write test or deployed responsive browser test was available. No live changes were made.

## 5. Required live acceptance tests before launch

- [ ] Confirm the Firebase project ID, enable Anonymous auth, and ensure no account-creation restrictions remain for the visitor flow.
- [ ] New visitor can submit `/enquire` with consent and receives a reference.
- [ ] New visitor can submit from `/create`; record appears in Admin Conversation Inbox.
- [ ] New visitor can send an enquiry from the Journey Companion; Admin can assign it.
- [ ] Without consent, a submission is blocked.
- [ ] Visitor A cannot access Visitor B's enquiry; team roles still work.
- [ ] `/create` has no hydration warning on direct refresh, normal Next navigation, or mobile.
- [ ] Chatbot link opens the companion once it loads; if blocked, `/enquire` remains reachable.
- [ ] `/destinations`, `/journeys`, `/experiences`, `/journey-match` and CREATE region filters show correct published content.
- [ ] No published destination, experience, or journey has a broken or irrelevant image.
- [ ] Mobile, keyboard, logo animation, performance and SEO smoke checks pass.

## 6. Firebase rules

**No changes** to `firestore.rules` or `storage.rules` were required by this patch. Do not weaken the visitor ownership checks. If the existing V8.2 rules were not yet deployed, review those rules and deploy to the confirmed project using your normal workflow. Enabling Anonymous Authentication is a **Firebase Console setting**, not a `firebase deploy --only firestore:rules` operation.

## 7. Deployment decision

Source patch ready to integrate. Launch blocked until Firebase Authentication is configured, the Next.js production build succeeds, and the live acceptance tests pass.
