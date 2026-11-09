# TrawellBeyond V3 - Step by step, NO Firebase Admin SDK

## 0. Safe starting point

Your database was already reset according to your last message. **Do not delete it again.**
Preserve all existing `teamUsers` documents and Firebase Authentication accounts.
Do NOT use old rules, old reset scripts, or old V2 service-account instructions.

## 1. Extract / run

Extract `TrawellBeyond_V51_WebSDK_No_Admin_V3.zip` to:
`C:\atul\ReactJS\TrawellBeyond_V51_WebSDK_No_Admin_V3`

In PowerShell:

```powershell
cd C:\atul\ReactJS\TrawellBeyond_V51_WebSDK_No_Admin_V3
npm install
Copy-Item .env.example .env.local
notepad .env.local
```

Copy ONLY the six `NEXT_PUBLIC_FIREBASE_*` values from Firebase Console
Project Settings > Your apps > Firebase Web App. No server keys.
If you already have working web settings, simply copy those six values.

```powershell
npm run check:config
npm test
npm run verify:frontend
npm run build
npm run dev
```

`predev` and `prebuild` automatically bundle the small enquiry bridge for the
original HTML pages. Stop if `npm run build` fails.

## 2. Microsoft + Anonymous Authentication

Firebase Console > Authentication > Sign-in method:

- Microsoft: enabled, configured with your Entra app ID/secret and OAuth callback.
- Anonymous: enabled for invisible customer enquiry sign-ins.

Firebase Console > Authentication > Settings > Authorized domains: ensure
`localhost` is present for local testing, and add your production hostname.
Do not place Microsoft OAuth client secrets in `.env.local`.

## 3. Confirm teamUsers

The new CMS uses existing `teamUsers/<Firebase Authentication UID>` records.
For example, in Firestore Console:

**Collection:** `teamUsers`  
**Document ID:** the exact Firebase Authentication UID of your Microsoft user
(not the email)

Fields:

| Field | Firestore type | Value |
|---|---|---|
| active | boolean | `true` |
| role | string | `super_admin` |

An existing document with `role: admin` also works. Preserve other fields.
If the collection was deleted, recreate your own record manually via Firebase
Console; **never** enable a public self-registration/write rule.

## 4. Deploy the NEW restrictive rules

```powershell
firebase login
firebase projects:list
firebase use --add
firebase deploy --only firestore:rules,storage
```

Select the existing correct Firebase project. Do not deploy V2 rules (which deny
all browser reads and writes). Storage rules use Firestore membership checks,
so Firebase may prompt you to enable Storage -> Firestore rules access;
approve this for the verified project.

## 5. Test the entire path

1. Open `http://localhost:3000/admin`. Microsoft login must complete and show the dashboard.
   If it says no `teamUsers` document, use the UID displayed in the error to check the document.
2. Destinations -> Add Singapore -> Save Draft; refresh Admin and confirm it remains.
3. Media Library -> upload an image with commercial rights -> verify photo appears.
4. Choose a photo, give Singapore a summary, Publish. Confirm `/destinations/singapore` loads.
5. Experiences -> add/publish one Singapore activity; confirm it appears on destination page.
6. Journeys -> add/publish one Singapore journey; confirm it appears in the V5.1 homepage.
7. From public enquiry form, submit a test request. Confirm Admin -> Enquiries shows it.
8. Website Pages -> Homepage -> update & publish page copy; refresh homepage.

**Publish results are not proven until public pages show them.** Run this checklist
before importing a large batch of content.

## Troubleshooting

- `permission-denied` for admin: Verify Firebase project, new rules, Microsoft
  sign-in provider, the UID as document ID in `teamUsers`, `active: true`,
  `role: admin` or `super_admin`.
- Storage permission denied: Deploy new `storage.rules` and enable Storage's
  Firestore rule lookup connection. Check file <=6 MB and JPG/PNG/WebP.
- Missing Firebase config: Check six `NEXT_PUBLIC_FIREBASE_*` values and restart dev server.
- Customer enquiry `auth/operation-not-allowed`: enable Anonymous sign-in.
- Blank content: database is empty. Save + publish content. No imported demo data.
- Microsoft popup blocked: use redirect sign-in and configure authorized domains.

**Security notes:** Do not deploy `allow read, write: if true` rules. Public content
is readable only when published; private enquiries are readable only by staff.
Anon sign-in is not spam protection. Add App Check and a rate-limited serverless
validation layer before a wide marketing launch.

**No firebase-admin is included.** There are no service-account setup steps.
