/** Publication gate for V7.9. A passing gate is still NOT a licence or fact
 * certification; the operator must explicitly approve the records in Admin.
 */
import {CONTENT_TYPES,safeImage} from './content.mjs';
import {REMAINING_DESTINATION_SLUGS} from './remaining-destinations-starters.mjs';
const present=v=>typeof v==='string'&&v.trim().length>0;
const photos=value=>String(value||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
const ownRights=value=>/\b(owned|original photograph|licensed to trawellbeyond|owned by)\b/i.test(String(value||''));
export function bulkReadiness(type,record,now=new Date()){
 const missing=[];
 const require=(condition,label)=>{if(!condition)missing.push(label);};
 require(CONTENT_TYPES.includes(type),'Known content type');
 require(present(record?.title)&&present(record?.summary)&&present(record?.description),'Complete editorial text');
 require(Boolean(safeImage(record?.heroImage)),'Cover photograph uploaded');
 require(present(record?.photoCredit)&&present(record?.photoLicense),'Cover image credit and usage permission');
 require(present(record?.photoSourceUrl)||ownRights(record?.photoLicense),'Cover photo source or owned-photo declaration');
 if(photos(record?.galleryImages).length+photos(record?.dayImages).length>0)require(present(record?.imageCredits),'Gallery / itinerary photo attribution');
 if(type==='destinations'){
  const chapterPhotos=['storyImage1','storyImage2','storyImage3'].map(k=>safeImage(record?.[k]));
  require(chapterPhotos.every(Boolean)&&new Set(chapterPhotos).size===3,'Three distinct story photographs');
  require(new Set(photos(record?.galleryImages)).size>=2,'At least two different gallery photographs');
  require(present(record?.travelTransport)&&present(record?.travelEntry)&&present(record?.travelGuideUrl),'Transport, entry guidance and official tourism reference');
  require(present(record?.travelVerifiedOn)&&validReviewDate(record.travelVerifiedOn,now),'Travel facts reviewed within 180 days');
 }
 if(type==='experiences'){
  require(present(record?.destinationSlug),'Destination association');
  require(photos(record?.galleryImages).length>=1,'At least one gallery photograph');
  require(present(record?.openingHours)&&present(record?.officialUrl)&&Boolean(safeImage(record?.officialUrl)),'Operator schedule guidance and HTTPS source');
  require(!/^(check|verify|refer|tbd|to confirm|subject to)/i.test(String(record?.openingHours||'').trim()),'Replace generic opening hours with source-checked guidance');
  require(present(record?.gettingThere),'Visitor access guidance');
  require(!/to be confirmed once the exact route|local transfer, public transport or guided access/i.test(String(record?.gettingThere||'')),'Replace generic visitor directions with source-checked access information');
  require(present(record?.visitVerifiedOn)&&validReviewDate(record.visitVerifiedOn,now),'Attraction details reviewed within 180 days');
 }
 if(type==='journeys'){
  const days=Number(record?.days),itinerary=String(record?.itinerary||'');
  require(Number.isInteger(days)&&days>=2&&days<=20,'Valid itinerary day count');
  if(Number.isInteger(days)&&days>=2&&days<=20){
   require(photos(record?.dayImages).length===days,'One reviewed day photo for every itinerary day');
   require((itinerary.match(/^Day\s+\d+\s*:/gim)||[]).length===days,'Complete day-wise plan');
  }
  require(photos(record?.galleryImages).length>=2,'At least two journey gallery photographs');
 }
 if(!['destinations','experiences','journeys'].includes(type))missing.push('Unsupported type for bulk launch');
 return {ready:missing.length===0,missing};
}
export function validReviewDate(value,now=new Date()){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||'')))return false;
 const dt=new Date(`${value}T00:00:00Z`);
 if(Number.isNaN(dt.getTime())||dt.toISOString().slice(0,10)!==value)return false;
 const days=(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate())-dt.getTime())/86400000;
 return days>=0&&days<=180;
}
export function planBulkInstall(selectedSlugs,existing={},starters=[]){
 const selection=new Set(selectedSlugs.filter(slug=>REMAINING_DESTINATION_SLUGS.includes(slug)));
 const exists=(type,slug)=>(existing[type]||[]).some(r=>r.slug===slug||r.id===slug);
 const selected=starters.filter(r=>selection.has(r.type==='destinations'?r.slug:r.destinationSlug));
 return {selected,create:selected.filter(r=>!exists(r.type,r.slug)),skipped:selected.filter(r=>exists(r.type,r.slug)),selectedDestinations:[...selection]};
}
export function bulkSelectionForPublish(content,selectedDestinations){
 const allowed=new Set(selectedDestinations);
 return ['destinations','experiences','journeys'].flatMap(type=>(content[type]||[]).filter(r=>allowed.has(type==='destinations'?r.slug:r.destinationSlug)&&r.status==='draft').map(record=>({type,record})));
}
