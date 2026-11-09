'use client';
/** The only privileged CMS data path is Firebase Web SDK + Security Rules.
 * Team memberships are read-only and are never self-provisioned by the website.
 */
import {collection,doc,getDoc,getDocs,query,limit,orderBy,documentId,startAfter,setDoc,runTransaction,deleteDoc,updateDoc,serverTimestamp} from 'firebase/firestore';
import {ref as storageRef,uploadBytes,getDownloadURL,deleteObject,getBlob} from 'firebase/storage';
import {clientAuth,clientDb,clientStorage,getIdTokenResult} from './firebase-client';
import {CONTENT_TYPES,typePath,validateContent,slugify} from './content.mjs';
import {permittedCommonsLicense} from './commons-license.mjs';
import {optimizeImageFile} from './image-optimizer.js';
import {blankOnlyChanges} from './completion-engine.mjs';
import {bulkReadiness} from './bulk-rollout.mjs';
import {REMAINING_DESTINATION_SLUGS} from './remaining-destinations-starters.mjs';


function normalizeFirebaseError(error){
 const code=error?.code||'';
 if(code==='permission-denied'||code==='storage/unauthorized')return new Error('Firebase permission denied. Verify that the new Firestore AND Storage rules are deployed, and that teamUsers/<your Firebase UID> has active: true and role: super_admin or admin.');
 if(code==='unavailable')return new Error('Cannot connect to Firestore. Check your connection and Firebase project configuration.');
 return new Error(error?.message||'Unable to complete the CMS operation.');
}
export async function verifyTeamUser(user){
 if(!user)throw new Error('Sign in with Microsoft first.');
 const token=await getIdTokenResult(user,true);
 if(token.signInProvider!=='microsoft.com')throw new Error('The Admin requires Microsoft sign-in. Sign out and choose Microsoft.');
 let snapshot;
 try{snapshot=await getDoc(doc(clientDb(),'teamUsers',user.uid));}
 catch(error){if(error.code==='permission-denied')throw new Error(`Unable to read teamUsers/${user.uid}. Deploy the V5 Firestore rules, then confirm the document ID matches this Microsoft Firebase UID.`);throw error;}
 if(!snapshot.exists())throw new Error(`Your Microsoft account has no teamUsers record. In Firebase Console, create Firestore teamUsers/${user.uid} with active: true and role: super_admin. (UID only, not email.)`);
 const data=snapshot.data();
 if(data.active!==true || !['admin','super_admin'].includes(data.role))throw new Error('This account is not an active CMS administrator. Check your teamUsers active and role values.');
 return {email:user.email,uid:user.uid,role:data.role,db:'connected'};
}
async function currentStaff(){
 const user=clientAuth().currentUser;
 if(!user)throw new Error('Your Microsoft session has expired. Please sign in again.');
 await verifyTeamUser(user);
 return user;
}
const listDocs=async path=>{
 const snapshot=await getDocs(query(collection(clientDb(),path),limit(500)));
 return snapshot.docs.map(d=>({...d.data(),id:d.id})).sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')));
};
const pathnameParts=path=>String(path||'').split('?')[0].split('/').filter(Boolean);
/** Scan every item, not just the first 500 shown in ordinary editor lists. */
async function listAllDocs(path,max=10000){
 const items=[];let last=null,truncated=false;
 for(;;){
  const amount=Math.min(200,max-items.length);
  if(amount<=0){truncated=true;break;}
  const clauses=[orderBy(documentId()),limit(amount)];
  if(last)clauses.push(startAfter(last));
  const page=await getDocs(query(collection(clientDb(),path),...clauses));
  items.push(...page.docs.map(d=>({...d.data(),id:d.id})));
  if(page.docs.length<amount)break;
  last=page.docs[page.docs.length-1];
 }
 return {items,truncated};
}


export async function cmsRequest(path,{method='GET',body,formData}={}){
 try{
  const parts=pathnameParts(path);
  if(parts[0]!=='api'||parts[1]!=='admin')throw new Error('Unsupported CMS operation.');
  const user=await currentStaff();
  if(parts[2]==='health')return {ok:true,email:user.email,uid:user.uid,db:'connected'};
  if(parts[2]==='content'){
   const type=parts[3],id=parts[4];
   if(!CONTENT_TYPES.includes(type))throw new Error('Unknown CMS section.');
   const col=typePath(type);
   if(method==='GET'){
    if(id){const snap=await getDoc(doc(clientDb(),col,id));if(!snap.exists())throw new Error('Record not found.');return {ok:true,item:{...snap.data(),id:snap.id}};}
    return {ok:true,items:await listDocs(col)};
   }
   if(method==='POST'){
    const status=body?.status==='published'?'published':'draft';
    const record=validateContent(type,body,status);
    const ref=doc(clientDb(),col,record.slug);
    const now=new Date().toISOString();
    const payload={...record,createdAt:now,updatedAt:now,updatedBy:user.uid,publishedAt:status==='published'?now:null};
    await runTransaction(clientDb(),async transaction=>{
     const exists=await transaction.get(ref);
     if(exists.exists())throw new Error('This URL slug already exists. Edit the existing content instead.');
     transaction.set(ref,payload);
    });
    return {ok:true,item:{...payload,id:record.slug}};
   }
   if(!id||id!==slugify(id))throw new Error('Invalid content URL.');
   const ref=doc(clientDb(),col,id);
   if(method==='PUT'){
    const snap=await getDoc(ref);
    if(!snap.exists())throw new Error('Record not found.');
    if(body?.slug && slugify(body.slug)!==id)throw new Error('The URL slug cannot change after creation.');
    const status=body?.status==='published'?'published':'draft';
    const previous=snap.data();
    const validated=validateContent(type,{...body,slug:id},status,{previouslyPublished:previous.status==='published'});
    const now=new Date().toISOString();
    const payload={...validated,createdAt:previous.createdAt||now,updatedAt:now,updatedBy:user.uid,publishedAt:status==='published'?(previous.publishedAt||now):null};
    await setDoc(ref,payload);
    return {ok:true,item:{...payload,id}};
   }
   if(method==='DELETE'){await deleteDoc(ref);return {ok:true};}
  }
  if(parts[2]==='bulk'&&parts[3]==='publish'&&method==='POST'){
   const type=body?.type,id=body?.id;
   if(!['destinations','experiences','journeys'].includes(type)||typeof id!=='string'||id!==slugify(id))
    throw new Error('Invalid destination, experience or journey selection.');
   if(body?.reviewed!==true||!body?.expectedUpdatedAt||typeof body.expectedUpdatedAt!=='string')
    throw new Error('Review confirmation and current record version are required.');
   const target=doc(clientDb(),typePath(type),id);
   return await runTransaction(clientDb(),async transaction=>{
    const snap=await transaction.get(target);
    if(!snap.exists())throw new Error('Draft was deleted. Refresh your preview.');
    const previous=snap.data();
    if(!REMAINING_DESTINATION_SLUGS.includes(type==='destinations'?id:previous.destinationSlug))throw new Error('Bulk rollout only publishes the 17 V7.9 destinations, not Singapore, Dubai or Thailand.');
    if(previous.status==='published')return {ok:true,skipped:true,reason:'Already published'};
    if(previous.status!=='draft')throw new Error('Only existing Draft records can be bulk published.');
    if(previous.updatedAt!==body.expectedUpdatedAt)throw new Error('Record changed after review. Rescan and approve the latest version.');
    const gate=bulkReadiness(type,previous);
    if(!gate.ready)throw new Error(`Publication blocked: ${gate.missing.slice(0,4).join(', ')}`);
    if(type!=='destinations'){
     const parent=await transaction.get(doc(clientDb(),typePath('destinations'),previous.destinationSlug||''));
     if(!parent.exists()||parent.data().status!=='published')throw new Error('Publish the associated destination before its experiences or journeys.');
    }
    const validated=validateContent(type,{...previous,slug:id},'published');
    const now=new Date().toISOString();
    const payload={...validated,createdAt:previous.createdAt||now,updatedAt:now,updatedBy:user.uid,publishedAt:now};
    transaction.set(target,payload);
    return {ok:true,skipped:false,item:{...payload,id}};
   });
  }
  if(parts[2]==='completion'){
   if(parts[3]==='snapshot'&&method==='GET'){
    const content={},truncated=[];
    for(const type of CONTENT_TYPES){
     const page=await listAllDocs(typePath(type));
     content[type]=page.items;
     if(page.truncated)truncated.push(type);
    }
    const media=await listAllDocs('cms/media/items');
    if(media.truncated)truncated.push('media');
    return {ok:true,content,assets:media.items,truncated};
   }
   if(parts[3]==='fill'&&method==='POST'){
    const type=body?.type,id=body?.id,fields=body?.fields;
    if(!CONTENT_TYPES.includes(type)||!id||id!==slugify(id)||!fields||typeof fields!=='object'||Array.isArray(fields)||Object.keys(fields).length>32)
     throw new Error('Select a valid content record and reviewed suggestions.');
    const target=doc(clientDb(),typePath(type),id);
    return await runTransaction(clientDb(),async transaction=>{
     const latestSnap=await transaction.get(target);
     if(!latestSnap.exists())throw new Error('Content record was removed. Scan again.');
     const previous=latestSnap.data();
     const {applied,skipped}=blankOnlyChanges(type,previous,fields);
     if(!Object.keys(applied).length)return {ok:true,applied:[],skipped,item:{...previous,id}};
     const status=previous.status==='published'?'published':'draft';
     const next=validateContent(type,{...previous,...applied,slug:id},status,{previouslyPublished:status==='published'});
     const now=new Date().toISOString();
     const payload={...next,createdAt:previous.createdAt||now,updatedAt:now,updatedBy:user.uid,publishedAt:previous.publishedAt||null};
     transaction.set(target,payload);
     return {ok:true,applied:Object.keys(applied),skipped,item:{...payload,id}};
    });
   }
   throw new Error('Unsupported completion action.');
  }
  if(parts[2]==='enquiries'){
   if(method==='GET')return {ok:true,items:await listDocs('enquiries')};
   if(method==='PATCH'){
    if(!body?.id || !['new','contacted','closed'].includes(body.status))throw new Error('Invalid enquiry status.');
    await updateDoc(doc(clientDb(),'enquiries',body.id),{status:body.status,updatedAt:new Date().toISOString()});
    return {ok:true};
   }
  }
  if(parts[2]==='media'){
   if(parts[3]==='reprocess'&&method==='POST'){
    if(!body?.id||!body?.crop)throw new Error('Select a saved image and crop options.');
    const snapshot=await getDoc(doc(clientDb(),'cms/media/items',body.id));
    if(!snapshot.exists())throw new Error('Media record not found.');
    const original=snapshot.data();
    if(!original?.rightsConfirmed||!/^cms-public\/[A-Za-z0-9_-]+\.(jpg|png|webp)$/.test(original.path||''))
     throw new Error('Only approved CMS Storage images can be re-optimized.');
    let blob;
    try{blob=await getBlob(storageRef(clientStorage(),original.path),20*1024*1024);}
    catch{throw new Error('Cannot download the stored image. Verify Firebase Storage access and browser CORS configuration.');}
    const file=new File([blob],original.name||'reoptimized-photo',{type:blob.type});
    const item=await uploadMedia(file,{crop:body.crop,credit:original.credit,license:original.license,
     sourcePage:original.sourcePage,licenseUrl:original.licenseUrl,altText:original.altText,rightsConfirmed:true,source:original.source});
    return {ok:true,item};
   }
   if(parts[3]==='search'){
    const params=new URLSearchParams(path.split('?')[1]||'');
    const response=await fetch(`/api/commons/search?q=${encodeURIComponent(params.get('q')||'')}`);
    const data=await response.json();if(!response.ok)throw new Error(data.error||'Image search failed.');return data;
   }
   if(parts[3]==='import'&&method==='POST'){
    if(!body?.rightsAccepted||!body?.sourcePage?.startsWith('https://commons.wikimedia.org/wiki/')||!permittedCommonsLicense(body?.license))throw new Error('Review the Wikimedia licence and source before importing.');
    const imageResponse=await fetch(`/api/commons/image?url=${encodeURIComponent(body.url)}`);
    if(!imageResponse.ok){const err=await imageResponse.json().catch(()=>({}));throw new Error(err.error||'Wikimedia download failed.');}
    const blob=await imageResponse.blob();
    const ext=blob.type==='image/png'?'png':blob.type==='image/webp'?'webp':'jpg';
    const file=new File([blob],`Wikimedia-${crypto.randomUUID()}.${ext}`,{type:blob.type});
    const item=await uploadMedia(file,{credit:body.credit,license:body.license,licenseUrl:body.licenseUrl,sourcePage:body.sourcePage,altText:body.altText,rightsConfirmed:true,source:'wikimedia',crop:body.crop});
    return {ok:true,item};
   }
   if(method==='PATCH'){
    if(!body?.id||!/^[a-zA-Z0-9_-]{8,80}$/.test(body.id))throw new Error('Choose a valid Media Library record.');
    const ref=doc(clientDb(),'cms/media/items',body.id),snap=await getDoc(ref);
    if(!snap.exists())throw new Error('Media record was not found.');
    const data=snap.data();
    if(data.rightsConfirmed!==true)throw new Error('Image rights must be confirmed before updating metadata.');
    const patch={};
    for(const [key,max] of [['credit',250],['altText',240],['license',140],['sourcePage',700],['licenseUrl',700]]){
     if(body[key]!==undefined){if(typeof body[key]!=='string'||body[key].length>max)throw new Error(`Invalid ${key}.`);patch[key]=body[key].trim();}
    }
    for(const key of ['sourcePage','licenseUrl'])if(patch[key]&&!/^https:\/\//i.test(patch[key]))throw new Error(`${key} must be a secure HTTPS URL.`);
    await updateDoc(ref,{...patch,metadataUpdatedAt:new Date().toISOString(),metadataUpdatedBy:user.uid});
    return {ok:true,item:{...data,...patch,id:body.id}};
   }
   if(method==='GET')return {ok:true,items:await listDocs('cms/media/items')};
   if(method==='POST'){
    const file=formData?.get('file');
    if(formData?.get('rights')!=='true')throw new Error('Confirm commercial image rights.');
    return {ok:true,item:await uploadMedia(file,{credit:formData?.get('credit'),altText:formData?.get('altText'),rightsConfirmed:true,source:'manual',license:'Uploader confirmed commercial rights',crop:{preset:formData.get('preset'),focusX:formData.get('focusX'),focusY:formData.get('focusY'),zoom:formData.get('zoom'),brightness:formData.get('brightness'),contrast:formData.get('contrast'),saturation:formData.get('saturation')}})};
   }
  }
  throw new Error('Unsupported CMS operation.');
 }catch(error){throw normalizeFirebaseError(error);}
}
export async function uploadMedia(file,details={}){
 const user=await currentStaff();
 if(!details.rightsConfirmed)throw new Error('Confirm your commercial usage rights before uploading.');
 // Every path uses the Web SDK and its deployed security rules. No Firebase Admin SDK.
 const optimized=await optimizeImageFile(file,details.crop||{});
 const id=crypto.randomUUID(),written=[];
 try{
  const variants={};
  for(const variant of optimized.variants){
   const ext=variant.contentType==='image/webp'?'webp':'jpg';
   const path=`cms-public/${id}-${variant.name}.${ext}`;
   const storage=storageRef(clientStorage(),path);
   await uploadBytes(storage,variant.blob,{contentType:variant.contentType,customMetadata:{kind:variant.name}});
   written.push(storage);
   variants[variant.name]={url:await getDownloadURL(storage),path,width:variant.width,height:variant.height,bytes:variant.bytes};
  }
  const now=new Date().toISOString(),display=variants.display;
  const item={url:display.url,path:display.path,variants,optimized:true,
   width:display.width,height:display.height,bytes:display.bytes,originalBytes:optimized.sourceBytes,
   crop:optimized.crop,
   name:String(file.name||'Image').slice(0,150),credit:String(details.credit||'').slice(0,250),
   altText:String(details.altText||'').replace(/[<>]/g,'').slice(0,240),
   license:String(details.license||'').slice(0,140),licenseUrl:String(details.licenseUrl||'').slice(0,700),
   sourcePage:String(details.sourcePage||'').slice(0,700),source:details.source||'manual',
   createdAt:now,createdBy:user.uid,rightsConfirmed:true};
  await setDoc(doc(clientDb(),'cms/media/items',id),item);
  return {...item,id};
 }catch(error){
  await Promise.allSettled(written.map(storage=>deleteObject(storage)));
  throw error;
 }
}
