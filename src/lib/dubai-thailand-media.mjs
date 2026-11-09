/** V7.8 curated photo-to-content map. A key represents a real subject, never
 * a loosely related stock image. Proposals are not public image URLs until
 * the operator accepts licence terms and the file is stored in Firebase.
 */
import {EXPANSION_PHOTOS} from './dubai-thailand-photos.mjs';
import {withMediaAsset} from './media-variants.mjs';
const photoKeys=(keys)=>keys.filter(x=>Boolean(EXPANSION_PHOTOS[x]));
const DESTINATION_MEDIA={
 dubai:{
  heroImage:'burj-khalifa-observation-deck',storyImage1:'dubai-gold-souk',
  storyImage2:'dubai-desert-safari',storyImage3:'dubai-marina-dhow-cruise',
  galleryImages:photoKeys(['dubai-frame','dubai-miracle-garden','global-village-dubai','museum-of-the-future','aquaventure-waterpark','dubai-aquarium-underwater-zoo'])
 },
 thailand:{
  heroImage:'phi-phi-islands-boat-excursion',storyImage1:'the-grand-palace-wat-phra-kaew',
  storyImage2:'chiang-mai-old-city-temples',storyImage3:'krabi-island-hopping-experience',
  galleryImages:photoKeys(['wat-arun-temple-of-dawn','chatuchak-market-discovery','phuket-old-town-heritage-walk','elephant-nature-park-visit-chiang-mai','sanctuary-of-truth-pattaya','james-bond-island-phang-nga'])
 }
};
const JOURNEY_MEDIA={
 'dubai-beyond-the-skyline':{
  heroImage:'dubai-city-highlights',
  dayImages:['dubai-city-highlights','burj-khalifa-observation-deck','dubai-gold-souk','dubai-desert-safari','dubai-marina-dhow-cruise'],
  galleryImages:['dubai-frame','museum-of-the-future','global-village-dubai']
 },
 'dubai-and-abu-dhabi-discovery':{
  heroImage:'burj-khalifa-observation-deck',
  dayImages:['dubai-city-highlights','burj-khalifa-observation-deck','abu-dhabi-city-discovery','dubai-desert-safari','dubai-marina-dhow-cruise','dubai-gold-souk'],
  galleryImages:['abu-dhabi-city-discovery','dubai-frame','dubai-aquarium-underwater-zoo']
 },
 'bangkok-and-pattaya-your-way':{
  heroImage:'the-grand-palace-wat-phra-kaew',
  dayImages:['chao-phraya-river-experience','the-grand-palace-wat-phra-kaew','sanctuary-of-truth-pattaya','coral-island-koh-larn-pattaya','wat-arun-temple-of-dawn'],
  galleryImages:['wat-arun-temple-of-dawn','chatuchak-market-discovery','sanctuary-of-truth-pattaya']
 },
 'phuket-and-krabi-island-moments':{
  heroImage:'phi-phi-islands-boat-excursion',
  dayImages:['phuket-old-town-heritage-walk','phuket-old-town-heritage-walk','phi-phi-islands-boat-excursion','krabi-island-hopping-experience','james-bond-island-phang-nga','krabi-island-hopping-experience'],
  galleryImages:['phi-phi-islands-boat-excursion','james-bond-island-phang-nga','phuket-old-town-heritage-walk']
 },
 'bangkok-and-chiang-mai-culture':{
  heroImage:'chiang-mai-old-city-temples',
  dayImages:['chao-phraya-river-experience','the-grand-palace-wat-phra-kaew','chatuchak-market-discovery','chiang-mai-old-city-temples','wat-phra-that-doi-suthep-chiang-mai','chiang-mai-old-city-temples'],
  galleryImages:['wat-arun-temple-of-dawn','elephant-nature-park-visit-chiang-mai','ayutthaya-heritage-day-trip']
 }
};
export function expansionMediaPlan(type,slug){
 if(type==='destinations')return DESTINATION_MEDIA[slug]||null;
 if(type==='journeys')return JOURNEY_MEDIA[slug]||null;
 if(type==='experiences'&&EXPANSION_PHOTOS[slug])return {heroImage:slug};
 return null;
}
export function expansionPhotoKeysFor(type,slug){
 const plan=expansionMediaPlan(type,slug)||{};
 return [...new Set(Object.values(plan).flat().filter(key=>Boolean(EXPANSION_PHOTOS[key])))];
}
/** Only missing fields get a real imported Storage image. Existing covers,
 * text, other gallery photos and publication status are always retained.
 * A dayImages field must have all N photos to retain itinerary-day alignment.
 */
export function attachExpansionPhotos(type,current,imports={}){
 if(!current?.slug||!['destinations','journeys','experiences'].includes(type))return null;
 const plan=expansionMediaPlan(type,current.slug);if(!plan)return null;
 let updated={...current};const changed=[];
 for(const field of ['heroImage','storyImage1','storyImage2','storyImage3']){
  if(!plan[field]||String(updated[field]||'').trim())continue;
  const asset=imports[plan[field]];
  if(asset?.url){updated=withMediaAsset(updated,field,asset);changed.push(field);}
 }
 if(Array.isArray(plan.dayImages)&&!String(updated.dayImages||'').trim()){
  // Never shift Day N to the wrong photo when one import is unavailable.
  const selected=plan.dayImages.map(key=>imports[key]);
  if(selected.every(asset=>asset?.url)){
   for(const asset of selected)updated=withMediaAsset(updated,'dayImages',asset);
   // Preserve an explicit photograph for every day, even when the same
   // destination image appropriately appears on more than one day.
   updated.dayImages=selected.map(asset=>asset.variants?.display?.url||asset.url).join('\n');
   changed.push('dayImages');
  }
 }
 if(Array.isArray(plan.galleryImages)&&!String(updated.galleryImages||'').trim()){
  const selected=[...new Set(plan.galleryImages)].map(key=>imports[key]).filter(asset=>asset?.url);
  for(const asset of selected.slice(0,8))updated=withMediaAsset(updated,'galleryImages',asset);
  if(selected.length)changed.push('galleryImages');
 }
 return changed.length?{record:updated,added:changed}:null;
}
