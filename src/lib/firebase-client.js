'use client';
import {getAuth,OAuthProvider,signInWithPopup,signInWithRedirect,getRedirectResult,signOut,onAuthStateChanged,signInAnonymously,getIdTokenResult} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {getStorage} from 'firebase/storage';
import {webApp,isClientConfigured} from './firebase-shared';
export {isClientConfigured};
export function clientAuth(){return getAuth(webApp());}
export function clientDb(){return getFirestore(webApp());}
export function clientStorage(){return getStorage(webApp());}
export async function loginMicrosoft(){
 const provider=new OAuthProvider('microsoft.com');provider.setCustomParameters({prompt:'select_account'});
 return signInWithPopup(clientAuth(),provider);
}
export async function loginMicrosoftRedirect(){
 const provider=new OAuthProvider('microsoft.com');provider.setCustomParameters({prompt:'select_account'});
 return signInWithRedirect(clientAuth(),provider);
}
export async function finishMicrosoftRedirect(){return getRedirectResult(clientAuth());}
export {signOut,onAuthStateChanged,signInAnonymously,getIdTokenResult};
