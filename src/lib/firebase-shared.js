/** Firebase Web SDK shared by public server rendering and browser clients.
 * No Firebase Admin SDK, service account, or privileged server database access.
 */
import {getApps,initializeApp} from 'firebase/app';
const config={
 apiKey:process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
 authDomain:process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
 projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
 storageBucket:process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
 messagingSenderId:process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
 appId:process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};
export const isClientConfigured=!!(config.apiKey&&config.authDomain&&config.projectId&&config.appId);
export function webApp(){
 if(!isClientConfigured)throw new Error('Firebase Web SDK configuration missing. Set NEXT_PUBLIC_FIREBASE_* in .env.local.');
 return getApps().find(app=>app.name==='[DEFAULT]')||initializeApp(config);
}
