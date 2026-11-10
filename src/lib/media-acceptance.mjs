/** Read-only V8.0 readiness evaluation. Never changes CMS records or publication status. */
const photos=value=>String(value||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const secure=value=>{try{return new URL(value).protocol==='https:';}catch{return false;}};
export const MEDIA_RECORD_TYPES=['destinations','experiences','journeys'];
export function auditMediaRecord(type,record={}){
 if(!MEDIA_RECORD_TYPES.includes(type))throw new Error('Unsupported media audit category.');
 const missing=[],warnings=[];
 const title=String(record.title||record.slug||'Untitled');
 if(!secure(record.heroImage))missing.push('Missing secure cover photograph');
 const gallery=photos(record.galleryImages);
 const minGallery={destinations:3,experiences:2,journeys:3}[type];
 const galleryUnique=[...new Set(gallery.filter(secure))];
 if(galleryUnique.length<minGallery)missing.push(`${minGallery-galleryUnique.length} more distinct gallery photograph(s) needed for ${type} (minimum ${minGallery})`);
 if(type==='destinations')for(let i=1;i<=3;i++)if(!secure(record[`storyImage${i}`]))missing.push(`Destination story photograph ${i}`);
 if(type==='journeys'){
  const dayCount=Math.min(21,Math.max(0,photos(record.itinerary).length||Number(record.days)||0));
  const dayPhotos=photos(record.dayImages).filter(secure);
  if(dayPhotos.length<dayCount)missing.push(`${dayCount-dayPhotos.length} missing itinerary-day photograph(s)`);
  if(dayPhotos.length>dayCount&&dayCount>0)warnings.push(`More day photographs than itinerary days (${dayPhotos.length}/${dayCount})`);
 }
 const all=[record.heroImage,...gallery,...photos(record.dayImages),...([1,2,3].map(i=>record[`storyImage${i}`]))].filter(Boolean);
 if(all.some(url=>!secure(url)))warnings.push('One or more photo URLs are not HTTPS');
 if(record.mediaReviewStatus==='pending')missing.push('Photography still requires publisher visual approval');
 if(all.length&&!record.photoCredit&&!record.imageCredits)missing.push('Photography source/licence documentation needs review');
 if(record.status==='published'&&missing.length)warnings.push('Published content is missing required launch-quality media');
 return {type,slug:String(record.slug||''),title,status:record.status||'draft',pass:missing.length===0,missing,warnings,photoUrls:[...new Set(all)]};
}
export function auditMediaCatalogue(records={},options={}){
 const includeDrafts=options.includeDrafts===true;
 const rows=[];
 for(const type of MEDIA_RECORD_TYPES){for(const item of records[type]||[]){if(!includeDrafts&&item.status!=='published')continue;rows.push(auditMediaRecord(type,item));}}
 return {checked:rows.length,passed:rows.filter(x=>x.pass).length,needsAttention:rows.filter(x=>!x.pass).length,rows};
}
