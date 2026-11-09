'use client';
import {addDoc,collection,serverTimestamp} from 'firebase/firestore';
import {clientAuth,clientDb,signInAnonymously} from './firebase-client';
const validPhone=x=>/^[+0-9()\s.-]{7,22}$/.test(String(x||'')) && (String(x||'').match(/\d/g)||[]).length>=7;
export async function submitEnquiry(raw){
 if(raw.website)return {ok:true};
 const entry={
  name:String(raw.name||'').trim().slice(0,120),email:String(raw.email||'').trim().slice(0,160),
  phone:String(raw.phone||'').trim().slice(0,40),destination:String(raw.destination||'').trim().slice(0,120),
  dates:String(raw.dates||'').trim().slice(0,160),travelers:String(raw.travelers||'').trim().slice(0,50),
  purpose:String(raw.purpose||'').trim().slice(0,160),notes:String(raw.notes||'').trim().slice(0,2500),
  source:['contact','create','enquiry'].includes(raw.source)?raw.source:'enquiry',
  consent:raw.consent===true,status:'new',createdAt:serverTimestamp()
 };
 if(entry.name.length<2||!validPhone(entry.phone)||!entry.consent)throw new Error('Enter your name, a valid contact number and consent to be contacted.');
 if(entry.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email))throw new Error('Enter a valid email address.');
 const auth=clientAuth();
 if(!auth.currentUser)try{await signInAnonymously(auth);}catch(err){
  if(err.code==='auth/operation-not-allowed')throw new Error('Enquiries are not enabled yet. Enable Firebase Authentication → Anonymous sign-in.');
  throw err;
 }
 try{const ref=await addDoc(collection(clientDb(),'enquiries'),entry);return {ok:true,id:ref.id};}
 catch(error){if(error.code==='permission-denied')throw new Error('Enquiry permission denied. Deploy the updated firestore.rules file.');throw error;}
}
