'use client';
/** Visitor enquiries remain unprivileged Web SDK writes; Firestore rules enforce ownership. */
import {addDoc,collection,doc,getDoc,serverTimestamp} from 'firebase/firestore';
import {clientAuth,clientDb,signInAnonymously} from './firebase-client';
import {rememberReceipt} from './enquiry-receipts.mjs';
import {visitorAuthErrorMessage} from './visitor-auth-errors.mjs';
const validPhone=x=>/^[+0-9()\s.-]{7,22}$/.test(String(x||'')) && (String(x||'').match(/\d/g)||[]).length>=7;
const allowedSource=['contact','create','enquiry','companion','match','customize'];
const followUps=['call','whatsapp','email'];
export async function ensureVisitorAuth(){
 try{
  const auth=clientAuth();
  if(typeof auth.authStateReady==='function')await auth.authStateReady();
  if(auth.currentUser)return auth.currentUser;
  return (await signInAnonymously(auth)).user;
 }catch(err){
  console.error('Visitor Firebase authentication failed:',err?.code||'unknown');
  throw new Error(visitorAuthErrorMessage(err));
 }
}
export async function submitEnquiry(raw={}){
 if(raw.website)return {ok:false,error:'Please use the enquiry form.'};
 const source=allowedSource.includes(raw.source)?raw.source:'enquiry';
 const entry={
  name:String(raw.name||'').trim().slice(0,120),email:String(raw.email||'').trim().slice(0,160),
  phone:String(raw.phone||'').trim().slice(0,40),destination:String(raw.destination||'').trim().slice(0,120),
  dates:String(raw.dates||'').trim().slice(0,160),travelers:String(raw.travelers||'').trim().slice(0,50),
  purpose:String(raw.purpose||'').trim().slice(0,160),notes:String(raw.notes||'').trim().slice(0,2500),
  leadSummary:String(raw.leadSummary||'').trim().slice(0,1800),
  followUpChannel:followUps.includes(raw.followUpChannel)?raw.followUpChannel:'call',
  preferredContactTime:String(raw.preferredContactTime||'').trim().slice(0,80),
  source,consent:raw.consent===true,status:'new',assignedTo:'',createdAt:serverTimestamp()
 };
 if(entry.name.length<2||!validPhone(entry.phone)||!entry.consent)throw new Error('Enter your name, a valid contact number and consent to be contacted.');
 if(entry.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email))throw new Error('Enter a valid email address.');
 if(entry.followUpChannel==='email'&&!entry.email)throw new Error('Add an email address to request an email reply.');
 const user=await ensureVisitorAuth();
 try{
  const ref=await addDoc(collection(clientDb(),'enquiries'),{...entry,ownerUid:user.uid});
  rememberReceipt(ref.id,source);
  return {ok:true,id:ref.id};
 }catch(error){if(error.code==='permission-denied')throw new Error('Enquiry permission denied. Deploy the V8.2 firestore.rules file.');throw error;}
}
/** Tracking uses Firebase UID access, never the enquiry reference as a password. */
export async function readOwnEnquiry(id){
 if(!/^[A-Za-z0-9]{8,40}$/.test(String(id||'')))throw new Error('Invalid enquiry reference.');
 const auth=clientAuth();
 if(typeof auth.authStateReady==='function')await auth.authStateReady();
 if(!auth.currentUser)throw new Error('This browser has no active visitor session. Contact the TrawellBeyond team to check your enquiry.');
 try{
  const snapshot=await getDoc(doc(clientDb(),'enquiries',id));
  if(!snapshot.exists())throw new Error('Enquiry not found for this visitor session.');
  return {id:snapshot.id,status:snapshot.data().status||'new',createdAt:snapshot.data().createdAt?.toDate?.()?.toISOString?.()||'',source:snapshot.data().source||'enquiry'};
 }catch(err){if(err.code==='permission-denied')throw new Error('This enquiry belongs to another visitor session or you no longer have access. Please contact the team.');throw err;}
}
