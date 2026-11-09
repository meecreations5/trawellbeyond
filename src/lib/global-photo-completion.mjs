/** V7.9.2: live-content-driven photo completion for all destinations, not only
 * the V7.9 starter manifest. Preview quality is heuristic and requires human
 * confirmation before publication. Never fills existing photo URLs. */
import {PHOTO_QUEUE} from './v79-photo-queue.mjs';
import {imageUrls,withMediaAsset} from './media-variants.mjs';
import {reviewableCommonsCandidate,photoSlotId} from './bulk-photography.mjs';
const TYPES=['destinations','experiences','journeys'];
const NON_SUBJECT=new Set('the and with from this that travel photo photograph detail image images scenic landscape view views tourist tour journey destination around experience city world day arrive arrival visit visiting enjoy enjoyment explore exploring discovery best iconic beautiful located at in on of for to a an by near over above below local street time including heritage site place trip sights highlights'.split(' '));
export const autoPhotoSlotKey=(type,slug,field,index=0)=>photoSlotId(type,slug,field,index);
export function titleTokens(text){return [...new Set(String(text||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\.[a-z0-9]{2,5}$/,'').replace(/[^a-z0-9]+/g,' ').split(' ').filter(x=>x.length>2&&!NON_SUBJECT.has(x)&&!/^[0-9]+$/.test(x)))];}
export function rankPhotoCandidate(slot,photo){
 if(!reviewableCommonsCandidate(photo))return {score:0,confidence:'rejected',matched:[]};
 const wanted=titleTokens(slot?.query||slot?.recordTitle||'').slice(0,9);
 const actual=new Set(titleTokens(photo.title||''));
 const matched=wanted.filter(t=>actual.has(t));
 const ratio=matched.length/Math.max(2,Math.min(4,wanted.length));
 const score=Math.round((ratio*70)+(Math.min(matched.length,4)*7.5));
 return {score:Math.min(100,score),confidence:matched.length>=2&&ratio>=.5?'strong':matched.length?'review':'weak',matched};
}
const toInt=value=>Number.parseInt(String(value||'').match(/\d+/)?.[0]||'',10);
const dayCount=record=>Math.max(2,Math.min(20,toInt(record?.days)||String(record?.itinerary||'').split(/\n/).filter(x=>/^day\s*\d+/i.test(x.trim())).length||3));
const scalar=new Set(['heroImage','storyImage1','storyImage2','storyImage3']);
function plannedSlots(type,record){
 const dest=type==='destinations'?record.slug:record.destinationSlug||'';
 const existing=PHOTO_QUEUE.filter(([d,t,slug])=>d===dest&&t===type&&slug===record.slug).map(([,t,slug,field,index,query])=>({field,index,query:query.replace(/\s+Wikimedia Commons\b/ig,'').replace(/\s+/g,' ').trim()}));
 if(existing.length)return existing;
 const parts=[{field:'heroImage',index:0,query:`${record.title} ${dest}`}];
 if(type==='destinations')for(let i=1;i<=3;i++)parts.push({field:`storyImage${i}`,index:0,query:`${record.title} ${dest} attractions`});
 if(type!=='experiences')for(let i=0;i<2;i++)parts.push({field:'galleryImages',index:i,query:`${record.title} ${dest} ${i?'landmarks':'sights'}`});
 else parts.push({field:'galleryImages',index:0,query:`${record.title} ${dest}`});
 if(type==='journeys')for(let i=0;i<dayCount(record);i++){
  const line=String(record.itinerary||'').split('\n').find(x=>new RegExp(`^day\\s*${i+1}\\b`,'i').test(x.trim()))||'';
  const trimmed=line.replace(/^day\s*\d+\s*[:.\-–]?\s*/i,'').slice(0,60);
  parts.push({field:'dayImages',index:i,query:`${trimmed||record.title} ${dest}`});
 }
 return parts;
}
export function plannedMissingPhotoSlots(snapshot,{destinations=[],group='all',includePublished=false}={}){
 const allowed=new Set(destinations);
 if(!allowed.size)return [];
 const content=snapshot?.content||{};
 const result=[];
 for(const type of TYPES){
  if(group!=='all'&&group!==type)continue;
  for(const record of content[type]||[]){
   const dest=type==='destinations'?record.slug:record.destinationSlug;
   if(!allowed.has(dest)||(record.status!=='draft'&&!includePublished))continue;
   for(const slot of plannedSlots(type,record)){
    const current=scalar.has(slot.field)?String(record[slot.field]||''):(imageUrls(record[slot.field])[slot.index]||'');
    if(current.trim())continue;
    result.push({id:autoPhotoSlotKey(type,record.slug,slot.field,slot.index),type,slug:record.slug,destination:dest,recordTitle:record.title,recordUpdatedAt:record.updatedAt||'',status:record.status,field:slot.field,index:slot.index,query:slot.query});
   }
  }
 }
 return result;
}
export function canAutoAttachSlot(type,record,field,index){
 if(!TYPES.includes(type)||!record?.slug||record.status!=='draft'||!Number.isInteger(index)||index<0)return false;
 if(field==='heroImage')return index===0;
 if(type==='destinations'&&['storyImage1','storyImage2','storyImage3'].includes(field))return index===0;
 if(field==='galleryImages')return index<8;
 if(type==='journeys'&&field==='dayImages')return index<Math.min(dayCount(record),20);
 return false;
}
/** Full slots and original copy survive; photo auto-fill marks a draft pending review. */
export function fillAutoPhotoSlots(type,record,assignments){
 if(!Array.isArray(assignments)||!assignments.length||assignments.length>24)throw new Error('Choose 1–24 proposed image placements.');
 const ordered=[...assignments].sort((a,b)=>a.field==='heroImage'?-1:b.field==='heroImage'?1:a.field.localeCompare(b.field)||a.index-b.index);
 let next={...record},added=[],skipped=[],keys=new Set();
 for(const {field,index,asset} of ordered){
  if(!canAutoAttachSlot(type,record,field,index))throw new Error('Image placement is not allowed for this Draft record.');
  const key=`${field}:${index}`;
  if(keys.has(key))throw new Error('Duplicate photo slot.');keys.add(key);
  if(!asset?.id||asset.source!=='wikimedia'||asset.rightsConfirmed!==true||!reviewableCommonsCandidate({...asset,preview:asset.url,url:asset.url})||!asset.variants?.display?.url||!asset.variants?.medium?.url||!asset.variants?.thumb?.url)
   throw new Error('Only licensed, optimized and credited Wikimedia photographs can be attached.');
  const url=asset.variants.display.url;
  if(scalar.has(field)){
   if(String(next[field]||'').trim()){skipped.push(`${key}: already filled`);continue;}
   if(field.startsWith('storyImage')&&['storyImage1','storyImage2','storyImage3'].some(f=>next[f]===url)){skipped.push(`${key}: duplicate story`);continue;}
  }else{
   const images=imageUrls(next[field]);
   if(images[index]){skipped.push(`${key}: already filled`);continue;}
   if(index>images.length){skipped.push(`${key}: earlier image missing`);continue;}
   if(images.includes(url)){skipped.push(`${key}: duplicate image`);continue;}
  }
  next=withMediaAsset(next,field,asset);added.push(key);
 }
 if(added.length)next={...next,mediaReviewStatus:'pending',mediaReviewedBy:'',mediaReviewedAt:''};
 return {record:next,added,skipped};
}
export function summarizePhotoCoverage(snapshot,destinations){
 const slots=plannedMissingPhotoSlots(snapshot,{destinations,includePublished:true});
 const needsReview=['destinations','experiences','journeys'].flatMap(type=>(snapshot?.content?.[type]||[]).filter(record=>record.mediaReviewStatus==='pending').map(record=>({type,slug:record.slug,title:record.title,destination:type==='destinations'?record.slug:record.destinationSlug})));
 const byDestination=destinations.map(destination=>({destination,draftMissing:slots.filter(s=>s.destination===destination&&s.status==='draft').length,publishedMissing:slots.filter(s=>s.destination===destination&&s.status==='published').length,needsReview:needsReview.filter(s=>s.destination===destination).length}));
 return {missingDraft:slots.filter(s=>s.status==='draft').length,missingPublished:slots.filter(s=>s.status==='published').length,needsReview,byDestination};
}

/** URLs actually used on public cards, detail heroes, galleries and journey days.
 * The browser can probe these without CORS permissions using Image.onload. */
export function imageHealthTargets(snapshot,destinations){
 const allowed=new Set(destinations),found=[];
 for(const type of TYPES){
  for(const record of snapshot?.content?.[type]||[]){
   const destination=type==='destinations'?record.slug:record.destinationSlug;
   if(!allowed.has(destination))continue;
   for(const field of ['heroImage','storyImage1','storyImage2','storyImage3','galleryImages','dayImages']){
    if(type==='experiences'&&field.startsWith('storyImage'))continue;
    const links=scalar.has(field)?[String(record[field]||'').trim()]:imageUrls(record[field]);
    for(const url of links.filter(Boolean))found.push({type,slug:record.slug,title:record.title,destination,status:record.status,field,url});
   }
   for(const [mediaId,refs] of Object.entries(record.imageVariants||{}))for(const name of ['medium','thumb']){
    if(refs?.[name])found.push({type,slug:record.slug,title:record.title,destination,status:record.status,field:`imageVariants:${mediaId}:${name}`,url:refs[name]});
   }
  }
 }
 return found;
}
