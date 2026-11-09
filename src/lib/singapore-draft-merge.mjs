import {SG_PHOTOS} from './singapore-photos.mjs';
/** Prepare a SAFE, optional visual-only update for an existing Singapore draft.
 * Never touches published content or replaces already-entered images/credits.
 * Only eligible starter slugs are supplied by the caller.
 */
const photoFields={
 destinations:['heroImage','storyImage1','storyImage2','storyImage3','galleryImages'],
 experiences:['heroImage','galleryImages'],
 journeys:['heroImage','dayImages','galleryImages']
};
export function mergeSingaporeDraftVisuals(type,current,starter){
 if(!current||!starter||current.slug!==starter.slug||current.status!=='draft'||!photoFields[type])return null;
 const added=[];const patch={...current};
 for(const field of photoFields[type]){
  if(!String(patch[field]||'').trim()&&String(starter[field]||'').trim()){
   patch[field]=starter[field];added.push(field);
  }
 }
 if(!added.length)return null;
 // Credit the starter photographs only when they are genuinely used. Never
 // change a credit on an existing custom cover image.
 if(!String(patch.imageCredits||'').trim()&&starter.imageCredits){
  const used=new Set(photoFields[type].flatMap(field=>String(patch[field]||'').split(/\r?\n/).map(x=>x.trim())).filter(Boolean));
  const credited=[...used].map(url=>Object.values(SG_PHOTOS).find(photo=>photo.url===url)).filter(Boolean).map(p=>`${p.caption||p.filename} | ${p.credit} | ${p.license} | ${p.source}`);
  if(credited.length)patch.imageCredits=credited.join('\n');
 }
 if(added.includes('heroImage'))for(const field of ['photoCredit','photoLicense','photoSourceUrl']){
  if(!patch[field]&&starter[field])patch[field]=starter[field];
 }
 return {record:patch,added};
}

/** Attach verified Firebase Storage photos to both Draft and Published records.
 * Important: published records with missing photos must be repairable, without
 * changing their status, text or custom images.
 */
import {restoreSingaporeRecordPhotos} from './singapore-photo-recovery.mjs';
export function attachSingaporeStoredPhotos(type,current,starter,imports){
 return restoreSingaporeRecordPhotos(type,current,starter,imports)?.record||null;
}
