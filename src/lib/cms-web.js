'use client';
/** Privileged writes use the Firebase Web SDK and deployed Security Rules.
 * Only the owner can grant invitations; teammates cannot promote themselves. */
import {collection,doc,getDoc,getDocs,query,limit,orderBy,documentId,startAfter,setDoc,runTransaction,deleteDoc,updateDoc,serverTimestamp} from 'firebase/firestore';
import {ref as storageRef,uploadBytes,getDownloadURL,deleteObject,getBlob} from 'firebase/storage';
import {clientAuth,clientDb,clientStorage,getIdTokenResult} from './firebase-client';
import {CONTENT_TYPES,typePath,validateContent,slugify} from './content.mjs';
import {permittedCommonsLicense} from './commons-license.mjs';
import {optimizeImageFile} from './image-optimizer.js';
import {blankOnlyChanges} from './completion-engine.mjs';
import {bulkReadiness} from './bulk-rollout.mjs';
import {fillReviewedPhotoSlots,PHOTO_SLOT_KEYS,photoSlotId} from './bulk-photography.mjs';
import {fillAutoPhotoSlots} from './global-photo-completion.mjs';
import {REMAINING_DESTINATION_SLUGS} from './remaining-destinations-starters.mjs';
import {INVITABLE_ROLES,TEAM_ROLES,normalizedEmail,assertContentWrite,canPublishContent,canDeleteContent,canReadEnquiries,canManageTeam,quarantineDraftPhotoEdits} from './team-access.mjs';


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
 const db=clientDb(),member=doc(db,'teamUsers',user.uid);
 let snapshot;
 try{snapshot=await getDoc(member);}
 catch(error){if(error.code==='permission-denied')throw new Error('Access to your team membership was denied. Deploy the V7.9.2 Firestore rules.');throw error;}
 if(!snapshot.exists()){
  // Only a matching owner-created invitation can create the first UID membership.
  const email=normalizedEmail(user.email);
  let invitation;
  try{invitation=await getDoc(doc(db,'teamInvites',email));}
  catch(error){if(error.code==='permission-denied')throw new Error('Invitations are not accessible. The owner must deploy the updated Firestore rules.');throw error;}
  if(!invitation.exists()||invitation.data().active!==true||!INVITABLE_ROLES.includes(invitation.data().role))
   throw new Error(`No active invitation for ${email}. Ask the TrawellBeyond owner to invite this Microsoft email under Admin → Team & Access.`);
  try{
   await runTransaction(db,async transaction=>{
    const existing=await transaction.get(member);
    if(existing.exists())return;
    const inviteSnap=await transaction.get(doc(db,'teamInvites',email));
    if(!inviteSnap.exists()||inviteSnap.data().active!==true||!INVITABLE_ROLES.includes(inviteSnap.data().role))throw new Error('Your invitation was revoked or changed. Ask the owner to resend it.');
    transaction.set(member,{email,name:String(user.displayName||'').slice(0,120),role:inviteSnap.data().role,active:true,createdAt:new Date().toISOString(),createdBy:'invitation'});
   });
   snapshot=await getDoc(member);
  }catch(error){if(error.code==='permission-denied')throw new Error('Invitation sign-in was blocked. Deploy the new team access rules for Firestore, then sign in again.');throw error;}
 }
 if(!snapshot.exists())throw new Error('Team membership could not be activated. Contact the owner.');
 const data=snapshot.data();
 if(data.active!==true||!TEAM_ROLES.includes(data.role))throw new Error('Your team access has been disabled or your role is not recognized. Contact the owner.');
 return {email:user.email,uid:user.uid,name:data.name||user.displayName||'',role:data.role,db:'connected'};
}
async function currentStaff(){
 const user=clientAuth().currentUser;
 if(!user)throw new Error('Your Microsoft session has expired. Please sign in again.');
 const member=await verifyTeamUser(user);
 return {uid:user.uid,email:user.email,role:member.role};
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
  if(parts[2]==='team'){
   if(!canManageTeam(user.role))throw new Error('Only the Super Admin can manage team access.');
   if(parts[3]==='snapshot'&&method==='GET'){
    const [members,invites]=await Promise.all([listDocs('teamUsers'),listDocs('teamInvites')]);
    return {ok:true,members,invites};
   }
   if(parts[3]==='invites'&&method==='POST'){
    const email=normalizedEmail(body?.email),role=body?.role;
    if(!INVITABLE_ROLES.includes(role))throw new Error('Choose Publisher, Content Editor or Media Assistant.');
    const target=doc(clientDb(),'teamInvites',email),now=new Date().toISOString();
    await runTransaction(clientDb(),async tx=>{
     const current=await tx.get(target),previous=current.exists()?current.data():null;
     tx.set(target,{email,role,active:true,createdAt:previous?.createdAt||now,createdBy:previous?.createdBy||user.uid,updatedAt:now,updatedBy:user.uid});
    });
    return {ok:true,email};
   }
   if(parts[3]==='invites'&&method==='PATCH'){
    const email=normalizedEmail(body?.email),active=body?.active,role=body?.role;
    if(typeof active!=='boolean'||!INVITABLE_ROLES.includes(role))throw new Error('Invalid invitation update.');
    const target=doc(clientDb(),'teamInvites',email),old=await getDoc(target);
    if(!old.exists())throw new Error('Invitation not found. Refresh the list.');
    await updateDoc(target,{active,role,updatedAt:new Date().toISOString(),updatedBy:user.uid});
    return {ok:true};
   }
   if(parts[3]==='members'&&method==='PATCH'){
    const uid=body?.uid,role=body?.role,active=body?.active;
    if(typeof uid!=='string'||uid.length<10||uid.length>200||uid===user.uid||typeof active!=='boolean'||!['admin',...INVITABLE_ROLES].includes(role))throw new Error('Invalid membership update. You cannot change your own owner role.');
    const target=doc(clientDb(),'teamUsers',uid),old=await getDoc(target);
    if(!old.exists()||old.data().role==='super_admin')throw new Error('Owner membership cannot be changed here.');
    await updateDoc(target,{role,active,updatedAt:new Date().toISOString(),updatedBy:user.uid});
    return {ok:true};
   }
   throw new Error('Unsupported team management action.');
  }

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
    assertContentWrite(user.role,null,record,{create:true});
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
    // Optimistic concurrency: team members cannot overwrite a colleague's
    // edits from an old tab. Every content update checks the opened version.
    return await runTransaction(clientDb(),async transaction=>{
     const snap=await transaction.get(ref);
     if(!snap.exists())throw new Error('Record not found.');
     if(body?.slug&&slugify(body.slug)!==id)throw new Error('The URL slug cannot change after creation.');
     const previous=snap.data();
     if(previous.updatedAt&&(typeof body?.updatedAt!=='string'||body.updatedAt!==previous.updatedAt))
      throw new Error('This record was changed by another team member. Refresh the record before saving so their changes are not lost.');
     const status=body?.status==='published'?'published':'draft';
     const oldValidated=validateContent(type,{...previous,slug:id},previous.status,{previouslyPublished:true});
     const submitted=validateContent(type,{...body,slug:id},status,{previouslyPublished:previous.status==='published'});
     const validated=quarantineDraftPhotoEdits(user.role,oldValidated,submitted);
     assertContentWrite(user.role,oldValidated,validated);
     const now=new Date().toISOString();
     const payload={...validated,createdAt:previous.createdAt||now,updatedAt:now,updatedBy:user.uid,publishedAt:status==='published'?(previous.publishedAt||now):null};
     transaction.set(ref,payload);
     return {ok:true,item:{...payload,id}};
    });
   }
   if(method==='DELETE'){
    if(!canDeleteContent(user.role))throw new Error('Only Admins may permanently delete content.');
    await deleteDoc(ref);return {ok:true};
   }
  }
  if(parts[2]==='bulk'&&parts[3]==='publish'&&method==='POST'){
   if(!canPublishContent(user.role))throw new Error('Only a Publisher or Admin can publish these records.');
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
  // V7.9.1: attach only separately reviewed and Storage-optimized Commons
  // photos to missing V7.9 slots, in a conflict-safe transaction.
  if(parts[2]==='bulk'&&parts[3]==='photography'&&method==='POST'){
   const type=body?.type,id=body?.id,assignments=body?.assignments;
   if(!['destinations','experiences','journeys'].includes(type)||typeof id!=='string'||id!==slugify(id))throw new Error('Select a valid destination, experience or journey.');
   if(!Array.isArray(assignments)||!assignments.length||assignments.length>24)throw new Error('Choose 1–24 verified image placements per record.');
   if(typeof body?.expectedUpdatedAt!=='string'||!body.expectedUpdatedAt)throw new Error('Refresh the live Firestore scan before attaching photos.');
   if(!assignments.every(item=>item&&PHOTO_SLOT_KEYS.has(photoSlotId(type,id,item.field,item.index))&&/^[a-zA-Z0-9_-]{8,80}$/.test(item.mediaId||'')))throw new Error('Unrecognized image placement or Media Library ID.');
   const target=doc(clientDb(),typePath(type),id);
   return await runTransaction(clientDb(),async transaction=>{
    const snap=await transaction.get(target);
    if(!snap.exists())throw new Error('Record no longer exists. Refresh the scan.');
    const previous=snap.data();
    if(previous.status!=='draft')throw new Error('Guided bulk photo completion edits Draft records only. Use the content editor for published records.');
    if(previous.updatedAt!==body.expectedUpdatedAt)throw new Error('Record was edited after your photo review. Refresh the scan to protect those changes.');
    if(!REMAINING_DESTINATION_SLUGS.includes(type==='destinations'?id:previous.destinationSlug))throw new Error('This record is outside the V7.9 photo rollout.');
    const mediaDocs=await Promise.all(assignments.map(a=>transaction.get(doc(clientDb(),'cms/media/items',a.mediaId))));
    const enriched=assignments.map((a,i)=>{
     if(!mediaDocs[i].exists())throw new Error('A selected image was removed from your Media Library.');
     return {field:a.field,index:a.index,asset:{...mediaDocs[i].data(),id:a.mediaId}};
    });
    const outcome=fillReviewedPhotoSlots(type,{...previous,slug:id},enriched);
    if(!outcome.added.length)return {ok:true,added:[],skipped:outcome.skipped,item:{...previous,id}};
    const now=new Date().toISOString();
    const validated=quarantineDraftPhotoEdits(user.role,validateContent(type,{...previous,slug:id},'draft'),validateContent(type,{...outcome.record,slug:id},'draft'));
    const payload={...validated,createdAt:previous.createdAt||now,updatedAt:now,updatedBy:user.uid,publishedAt:previous.publishedAt||null};
    assertContentWrite(user.role,validateContent(type,{...previous,slug:id},'draft'),validated);
    transaction.set(target,payload);
    return {ok:true,added:outcome.added,skipped:outcome.skipped,item:{...payload,id}};
   });
  }
  if(parts[2]==='bulk'&&parts[3]==='auto-photography'&&method==='POST'){
   const type=body?.type,id=body?.id,assignments=body?.assignments;
   if(!['destinations','experiences','journeys'].includes(type)||typeof id!=='string'||slugify(id)!==id)throw new Error('Select a valid content record.');
   if(!Array.isArray(assignments)||!assignments.length||assignments.length>24)throw new Error('Choose 1–24 automated photo suggestions.');
   if(typeof body?.expectedUpdatedAt!=='string'||!body.expectedUpdatedAt)throw new Error('Rescan your draft before continuing.');
   if(!assignments.every(x=>x&&typeof x.mediaId==='string'&&/^[a-zA-Z0-9_-]{8,80}$/.test(x.mediaId)))throw new Error('A media asset ID is missing.');
   const ref=doc(clientDb(),typePath(type),id);
   return await runTransaction(clientDb(),async tx=>{
    const snap=await tx.get(ref);
    if(!snap.exists())throw new Error('Content was removed. Refresh the audit.');
    const previous=snap.data();
    if(previous.status!=='draft')throw new Error('Automatic photo completion is restricted to Drafts. Published pages need a Publisher to edit them manually.');
    if(previous.updatedAt!==body.expectedUpdatedAt)throw new Error('Another teammate changed this draft. Refresh and retry to protect their work.');
    const mediaDocs=await Promise.all(assignments.map(a=>tx.get(doc(clientDb(),'cms/media/items',a.mediaId))));
    const enriched=assignments.map((a,i)=>{
     if(!mediaDocs[i].exists())throw new Error('An image was removed from Media Library.');
     return {field:a.field,index:a.index,asset:{...mediaDocs[i].data(),id:a.mediaId}};
    });
    const outcome=fillAutoPhotoSlots(type,{...previous,slug:id},enriched);
    if(!outcome.added.length)return {ok:true,added:[],skipped:outcome.skipped,item:{...previous,id}};
    const now=new Date().toISOString();
    const validated=validateContent(type,{...outcome.record,slug:id},'draft');
    assertContentWrite(user.role,validateContent(type,{...previous,slug:id},'draft'),validated);
    const payload={...validated,createdAt:previous.createdAt||now,updatedAt:now,updatedBy:user.uid,publishedAt:previous.publishedAt||null};
    tx.set(ref,payload);
    return {ok:true,added:outcome.added,skipped:outcome.skipped,item:{...payload,id}};
   });
  }
  if(parts[2]==='bulk'&&parts[3]==='review-photography'&&method==='POST'){
   if(!canPublishContent(user.role))throw new Error('Only a Publisher or Admin can approve automatically chosen photographs.');
   const type=body?.type,id=body?.id;
   if(!['destinations','experiences','journeys'].includes(type)||typeof id!=='string'||slugify(id)!==id||body?.reviewed!==true||typeof body?.expectedUpdatedAt!=='string')throw new Error('Review the record and confirm its current version.');
   return await runTransaction(clientDb(),async tx=>{
    const ref=doc(clientDb(),typePath(type),id),snap=await tx.get(ref);
    if(!snap.exists())throw new Error('Record not found.');
    const prior=snap.data();
    if(prior.status!=='draft'||prior.mediaReviewStatus!=='pending')throw new Error('Only pending Draft photo reviews can be approved.');
    if(prior.updatedAt!==body.expectedUpdatedAt)throw new Error('The photos changed after you opened the record. Refresh and review them again.');
    const now=new Date().toISOString();
    const payload={...validateContent(type,{...prior,slug:id,mediaReviewStatus:'approved',mediaReviewedAt:now,mediaReviewedBy:user.uid},'draft'),createdAt:prior.createdAt,updatedAt:now,updatedBy:user.uid,publishedAt:prior.publishedAt||null};
    tx.set(ref,payload);
    return {ok:true,item:{...payload,id}};
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
     const next=quarantineDraftPhotoEdits(user.role,validateContent(type,{...previous,slug:id},status,{previouslyPublished:status==='published'}),validateContent(type,{...previous,...applied,slug:id},status,{previouslyPublished:status==='published'}));
     const now=new Date().toISOString();
     const payload={...next,createdAt:previous.createdAt||now,updatedAt:now,updatedBy:user.uid,publishedAt:previous.publishedAt||null};
     assertContentWrite(user.role,validateContent(type,{...previous,slug:id},status,{previouslyPublished:status==='published'}),next);
     transaction.set(target,payload);
     return {ok:true,applied:Object.keys(applied),skipped,item:{...payload,id}};
    });
   }
   throw new Error('Unsupported completion action.');
  }
  if(parts[2]==='enquiries'){
   if(!canReadEnquiries(user.role))throw new Error('Only Admins can access customer enquiries.');
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
    // Recheck rights against Commons. Do not trust browser-supplied authors, licence or URLs.
    const verifiedResponse=await fetch(`/api/commons/inspect?sourcePage=${encodeURIComponent(body.sourcePage)}`,{cache:'no-store'});
    const verified=await verifiedResponse.json().catch(()=>({}));
    if(!verifiedResponse.ok||!verified.item)throw new Error(verified.error||'Could not verify the exact Commons source and licence.');
    const canonical=verified.item;
    if(!permittedCommonsLicense(canonical.license))throw new Error('Source no longer permits commercial reuse.');
    const imageResponse=await fetch(`/api/commons/image?url=${encodeURIComponent(canonical.url)}`);
    if(!imageResponse.ok){const err=await imageResponse.json().catch(()=>({}));throw new Error(err.error||'Wikimedia download failed.');}
    const blob=await imageResponse.blob();
    const ext=blob.type==='image/png'?'png':blob.type==='image/webp'?'webp':'jpg';
    const file=new File([blob],`Wikimedia-${crypto.randomUUID()}.${ext}`,{type:blob.type});
    const item=await uploadMedia(file,{credit:canonical.credit,license:canonical.license,licenseUrl:canonical.licenseUrl,sourcePage:canonical.sourcePage,altText:body.altText||canonical.title,rightsConfirmed:true,source:'wikimedia',crop:body.crop});
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
    if(data.source==='wikimedia'&&!canPublishContent(user.role)&&['credit','license','sourcePage','licenseUrl'].some(k=>patch[k]!==undefined))throw new Error('Wikimedia author, source and licence details are verified and can be changed only by a Publisher.');
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
   await uploadBytes(storage,variant.blob,{contentType:variant.contentType,customMetadata:{kind:variant.name,ownerUid:user.uid}});
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
