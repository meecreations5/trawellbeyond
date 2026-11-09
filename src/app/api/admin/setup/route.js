/** Non-secret presence checks; all CMS data access uses Firebase Web SDK. */
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){
 const env=process.env;
 const checks={
  firebaseWebProject:!!env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  firebaseWebApiKey:!!env.NEXT_PUBLIC_FIREBASE_API_KEY,
  firebaseAuthDomain:!!env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  firebaseWebAppId:!!env.NEXT_PUBLIC_FIREBASE_APP_ID,
  firebaseStorageBucket:!!env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 };
 return Response.json({ok:Object.values(checks).every(Boolean),checks,adminSdkRequired:false,
  help:'Microsoft login + Firestore teamUsers/<Firebase UID> record authorizes CMS access. No private server keys.'},{headers:{'cache-control':'no-store'}});
}
