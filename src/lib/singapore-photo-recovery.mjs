/** Singapore photo recovery for existing CMS records.
 * Only references verified, imported Firebase Storage assets.
 * Existing custom images, editorial text, publish state and document identity are preserved.
 */
import {SG_PHOTOS} from './singapore-photos.mjs';

const PHOTO_FIELDS={
 destinations:['heroImage','storyImage1','storyImage2','storyImage3','galleryImages'],
 experiences:['heroImage','galleryImages'],
 journeys:['heroImage','dayImages','galleryImages']
};
const LINE_FIELDS=new Set(['galleryImages','dayImages']);
const photoBySuggestedUrl=new Map(Object.values(SG_PHOTOS).map(photo=>[photo.url,photo]));
const text=value=>String(value||'').trim();
const lines=value=>text(value).split(/\r?\n/).map(x=>x.trim()).filter(Boolean);

export function singaporePhotoPlan(type,current,starter){
 if(!PHOTO_FIELDS[type]||!current||!starter||current.slug!==starter.slug)return [];
 const urls=new Set();
 for(const field of PHOTO_FIELDS[type]){
  const stored=lines(current[field]);
  const needed=stored.length?stored:lines(starter[field]);
  for(const url of needed)if(photoBySuggestedUrl.has(url))urls.add(url);
 }
 return Object.values(SG_PHOTOS).filter(photo=>urls.has(photo.url));
}

export function restoreSingaporeRecordPhotos(type,current,starter,imports){
 if(!PHOTO_FIELDS[type]||!current||!starter||current.slug!==starter.slug)return null;
 const record={...current}, added=[],replaced=[];
 for(const field of PHOTO_FIELDS[type]){
  const existing=lines(current[field]);
  // Empty fields receive only the photographs successfully imported into Firebase.
  const planned=existing.length?existing:lines(starter[field]);
  const result=planned.map(url=>{
   const asset=imports[url];
   if(asset?.url){if(asset.url!==url)replaced.push(field);return asset.url;}
   return existing.length?url:'';
  }).filter(Boolean);
  if(!result.length)continue;
  const final=LINE_FIELDS.has(field)?[...new Set(result)].join('\n'):result[0];
  if(final!==text(current[field])){
   record[field]=final;
   if(!existing.length)added.push(field);
  }
 }
 const allUsed=new Set(PHOTO_FIELDS[type].flatMap(field=>lines(record[field])));
 const credited=[];
 for(const photo of Object.values(SG_PHOTOS)){
  const asset=imports[photo.url];
  if(asset?.url&&allUsed.has(asset.url)){
   const line=`${photo.caption||photo.filename} | ${asset.credit||photo.credit} | ${asset.license||photo.license} | ${asset.sourcePage||photo.source}`;
   if(!credited.includes(line))credited.push(line);
  }
 }
 if(credited.length&&(!text(current.imageCredits)||text(current.imageCredits)===text(starter.imageCredits))){
  const value=credited.join('\n');
  if(value!==text(current.imageCredits))record.imageCredits=value;
 }
 const sourcePhoto=Object.values(SG_PHOTOS).find(photo=>imports[photo.url]?.url===record.heroImage);
 if(sourcePhoto && (!text(current.heroImage)||current.heroImage===sourcePhoto.url)){
  const asset=imports[sourcePhoto.url];
  if(text(current.photoCredit)!==text(asset.credit))record.photoCredit=asset.credit||'';
  if(text(current.photoLicense)!==text(asset.license))record.photoLicense=asset.license||'';
  if(text(current.photoSourceUrl)!==text(asset.sourcePage))record.photoSourceUrl=asset.sourcePage||'';
 }
 const altered=Object.keys(record).some(key=>record[key]!==current[key]);
 if(!altered)return null;
 const stillMissing=PHOTO_FIELDS[type].filter(field=>!text(record[field]));
 return {record,added:[...new Set(added)],replaced:[...new Set(replaced)],stillMissing};
}
