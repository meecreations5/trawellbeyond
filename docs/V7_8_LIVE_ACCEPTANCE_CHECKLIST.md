# V7.8 Dubai + Thailand — LIVE Acceptance Checklist

**Status: OPEN / NOT YET VERIFIED against the actual Firebase-connected website.** The V7.8 source and baseline tests passed, but live credentials, public media and enquiries cannot be inspected here.

## Automated route checks

In a separate PowerShell window while Next.js is running:

```powershell
npm run check:v78 -- --base http://localhost:3000 --out v78-live-acceptance.json
```

Expect 8/8 public routes to report 200, correct titles and recognizable page structures (not merely a fallback page). Draft routes will correctly produce 404 until legitimately published.

## Manual sign-off sheet

| Check | Dubai | Thailand | Evidence / observation |
|---|---|---|---|
| Destination hero, gallery, all 3 stories match real location | ☐ | ☐ | |
| Optimized photos load without broken URLs on mobile and desktop | ☐ | ☐ | |
| Destination Travel Essentials information and reference links reviewed | ☐ | ☐ | |
| Two sample Experience Details open and show correct information | ☐ | ☐ | |
| Exact ticket restrictions and operator hours verified | ☐ | ☐ | |
| Official/authorized video previews play if provided | ☐ | ☐ | |
| Journey day-photo order, day-tabs, gallery, and CTA work | ☐ | ☐ | |
| CREATE retains selected destination/experience | ☐ | ☐ | |
| Real test enquiry arrives in Admin with correct details | ☐ | ☐ | |
| Image/creator rights and required CC attribution displayed | ☐ | ☐ | |
| Source records persist after save/publish and page reload | ☐ | ☐ | |
| Browser console has no critical client or permission errors | ☐ | ☐ | |

Do not declare either destination 'live accepted' before these checks pass. Record date, responsible reviewer and any remaining exceptions in your own deployment notes. Do not change Firebase access permissions just to make tests green.
