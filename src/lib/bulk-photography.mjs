/** Pure helpers for V7.9.1 reviewed photo sourcing. No photo is treated as
 * approved merely because it appears in a Wikimedia search result.
 */
import {PHOTO_QUEUE} from './v79-photo-queue.mjs';
import {imageUrls,withMediaAsset} from './media-variants.mjs';
import {REMAINING_DESTINATION_SLUGS} from './remaining-destinations-starters.mjs';
import {permittedCommonsLicense} from './commons-license.mjs';

const scalar=new Set(['heroImage','storyImage1','storyImage2','storyImage3']);
export const PHOTO_SLOT_TOTAL=PHOTO_QUEUE.length;
export const photoSlotId=(type,slug,field,index=0)=>`${type}:${slug}:${field}:${index}`;
export const PHOTO_SLOT_KEYS=new Set(PHOTO_QUEUE.map(([destination,type,slug,field,index])=>photoSlotId(type,slug,field,index)));
const stripCommons=x=>String(x||'').replace(/\s+Wikimedia Commons\b/ig,'').replace(/\s+detail\s+/ig,' ').replace(/\s+travel\s+/ig,' ').replace(/\s+/g,' ').trim().slice(0,90);
export const photoSearchText=stripCommons;
/** A narrower fallback helps Commons find exact landmark files when a verbose
 * editorial description yields no usable image. Every result still needs
 * the human source/location/licence review in Admin.
 */
export function photoSearchQueries(query){
 const full=stripCommons(query);
 const words=full.split(/\s+/).filter(word=>Boolean(word)&&!['&','and'].includes(word.toLowerCase()));
 const shorter=words.slice(0,Math.min(words.length,4)).join(' ');
 return [...new Set([full,shorter])].filter(s=>s.length>=3);
}

export function missingPhotoSlots(snapshot,destination,group='all'){
 if(!REMAINING_DESTINATION_SLUGS.includes(destination))return [];
 const content=snapshot?.content||{};
 const indexed=new Map(['destinations','experiences','journeys'].flatMap(type=>(content[type]||[]).map(record=>[`${type}:${record.slug}`,record])));
 return PHOTO_QUEUE.flatMap(([dest,type,slug,field,index,query])=>{
  if(dest!==destination||(group!=='all'&&group!==type))return [];
  const record=indexed.get(`${type}:${slug}`);
  if(!record||record.status!=='draft')return [];
  const current=scalar.has(field)?String(record[field]||''):(imageUrls(record[field])[index]||'');
  if(current.trim())return [];
  return [{id:photoSlotId(type,slug,field,index),type,slug,destination,field,index,query:stripCommons(query),recordTitle:record.title,recordUpdatedAt:record.updatedAt||''}];
 });
}

export function reviewableCommonsCandidate(item){
 if(!item||typeof item!=='object')return false;
 let source;
 try{source=new URL(item.sourcePage);}catch{return false;}
 if(source.protocol!=='https:'||source.hostname!=='commons.wikimedia.org'||!source.pathname.startsWith('/wiki/File:'))return false;
 if(!/^https:\/\//.test(item.url||'')||!/^https:\/\//.test(item.preview||''))return false;
 if(!permittedCommonsLicense(item.license))return false;
 if(!item.credit||/^(unknown|anonymous|not listed)/i.test(String(item.credit).trim()))return false;
 return true;
}

/** Apply photo slots to a fresh Firestore record, never overwriting existing
 * images, existing content or out-of-order itinerary day positions.
 * Throws for malformed/untrusted assets; skips valid but already-filled slots.
 */
export function fillReviewedPhotoSlots(type,record,assignments=[]){
 if(!['destinations','experiences','journeys'].includes(type)||!record?.slug)throw new Error('Invalid photo record.');
 if(!REMAINING_DESTINATION_SLUGS.includes(type==='destinations'?record.slug:record.destinationSlug))throw new Error('Not part of the V7.9 photo rollout.');
 if(!Array.isArray(assignments)||assignments.length>24)throw new Error('Select up to 24 reviewed photos per record.');
 let next={...record},added=[],skipped=[],seen=new Set();
 const ordered=[...assignments].sort((a,b)=>{
  const rank=x=>x.field==='heroImage'?0:x.field.startsWith('storyImage')?1:x.field==='galleryImages'?2:3;
  return rank(a)-rank(b)||a.index-b.index;
 });
 for(const assignment of ordered){
  const {field,index,asset}=assignment||{};
  if(!Number.isInteger(index)||index<0||!PHOTO_SLOT_KEYS.has(photoSlotId(type,record.slug,field,index)))throw new Error('Photo placement was not in the reviewed V7.9 queue.');
  const key=`${field}:${index}`;
  if(seen.has(key))throw new Error('Duplicate photo placement in one request.');
  seen.add(key);
  if(!asset?.id||asset.rightsConfirmed!==true||asset.source!=='wikimedia'||!reviewableCommonsCandidate({...asset,preview:asset.url,url:asset.url}))throw new Error('Only reviewed, credited and commercially reusable Wikimedia assets are supported.');
  if(!asset.variants?.display?.url||!asset.variants?.medium?.url||!asset.variants?.thumb?.url)throw new Error('Image has not been optimized into three responsive variants.');
  const url=asset.variants.display.url;
  if(scalar.has(field)){
   if(String(next[field]||'').trim()){skipped.push(`${key} already filled`);continue;}
   if(field.startsWith('storyImage')&&['storyImage1','storyImage2','storyImage3'].some(f=>next[f]===url)){
    skipped.push(`${key}: repeated story photograph`);continue;
   }
   next=withMediaAsset(next,field,asset);added.push(key);continue;
  }
  const current=imageUrls(next[field]);
  if(current[index]){skipped.push(`${key} already filled`);continue;}
  if(index>current.length){skipped.push(`${key}: earlier slots are still empty`);continue;}
  if(current.includes(url)){skipped.push(`${key}: photo already used here`);continue;}
  next=withMediaAsset(next,field,asset);added.push(key);
 }
 return {record:next,added,skipped};
}
