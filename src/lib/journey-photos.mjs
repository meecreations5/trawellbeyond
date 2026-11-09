/** Journey imagery is drawn only from photographs explicitly attached to this
 * CMS journey: gallery, individual days, and cover. Never invent a travel photo.
 * This lets an existing set of day photographs populate a missing gallery. */
export function httpsPhoto(value){
 try{const url=new URL(String(value||'').trim());return url.protocol==='https:'?url.href:'';}catch{return '';}
}
export function photoLines(value){return String(value||'').split(/\r?\n/).map(httpsPhoto).filter(Boolean);}
export function uniqueJourneyPhotos(values,max=8){return [...new Set(values.map(httpsPhoto).filter(Boolean))].slice(0,max);}
export function journeyGalleryPhotos(journey){
 return uniqueJourneyPhotos([
  ...photoLines(journey?.galleryImages),
  ...photoLines(journey?.dayImages),
  journey?.heroImage
 ]);
}
/** Explicit day photos retain order; when absent, reuse a journey gallery
 * photo or cover without implying that it depicts a specific attraction. */
export function journeyDayPhotos(journey,count){
 const explicit=photoLines(journey?.dayImages),gallery=photoLines(journey?.galleryImages);
 const fallback=uniqueJourneyPhotos(gallery,20);
 const used=new Set(explicit);
 return Array.from({length:Math.max(0,Math.min(20,Number(count)||0))},(_,index)=>{
  if(explicit[index])return explicit[index];
  const available=fallback.find(url=>!used.has(url));
  if(available){used.add(available);return available;}
  // Keep a neutral day placeholder rather than falsely reusing the hero.
  return '';
 });
}
export function journeyPhotoReadiness(journey){
 const days=String(journey?.itinerary||'').split(/\r?\n/).filter(s=>s.trim()).length;
 const explicitDayCount=photoLines(journey?.dayImages).length;
 return {days,explicitDayCount,missingDayCount:Math.max(0,days-explicitDayCount),galleryCount:photoLines(journey?.galleryImages).length,availableGalleryCount:journeyGalleryPhotos(journey).length};
}
