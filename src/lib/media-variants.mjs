/** V7.7: Portable public-safe references to the optimized files already stored
 * in Firebase Storage. Public pages never need to read the private Media Library.
 * Existing JPEG/URL records remain valid and are not rewritten automatically.
 */
export const MAX_MEDIA_REFS = 35;
const https = value => {
 try {const url = new URL(String(value||'')); return url.protocol==='https:' ? url.toString() : '';} catch {return '';}
};
const clean = value => String(value||'').replace(/[|\r\n]/g,' ').trim().slice(0,240);
export const imageUrls = value => String(value||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);

export function assetVariants(asset){
 if(!asset?.id || !asset?.variants?.display?.url)return null;
 const display=https(asset.variants.display.url);
 const medium=https(asset.variants.medium?.url)||display;
 const thumb=https(asset.variants.thumb?.url)||medium;
 if(!display)return null;
 return {display,medium,thumb,alt:clean(asset.altText||'')};
}
export function normalizeImageVariants(value){
 if(value===undefined||value===null)return {};
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Image variants must be an object.');
 const keys=Object.keys(value);
 if(keys.length>MAX_MEDIA_REFS)throw new Error(`No more than ${MAX_MEDIA_REFS} media references per record.`);
 const cleanRefs={};
 for(const id of keys){
  if(!/^[a-zA-Z0-9_-]{8,80}$/.test(id))throw new Error('Invalid media asset ID.');
  const variant=value[id];
  if(!variant||typeof variant!=='object'||Array.isArray(variant))throw new Error('Invalid media variants.');
  const display=https(variant.display),medium=https(variant.medium),thumb=https(variant.thumb);
  if(!display||!medium||!thumb)throw new Error('Media variants must contain secure display, medium and thumbnail URLs.');
  const alt=clean(variant.alt);
  cleanRefs[id]={display,medium,thumb,alt};
 }
 if(JSON.stringify(cleanRefs).length>36000)throw new Error('Too many image variant URLs on this record.');
 return cleanRefs;
}
export function resolveImageVariant(record,url,size='display'){
 const original=https(url);if(!original)return '';
 if(!['display','medium','thumb'].includes(size))return original;
 for(const variant of Object.values(record?.imageVariants||{})){
  if(variant?.display===original||variant?.medium===original||variant?.thumb===original)return https(variant[size])||original;
 }
 return original;
}
export function getAssetByUrl(assets,url){
 const target=https(url);if(!target)return null;
 return (assets||[]).find(item=>[item.url,item.variants?.display?.url,item.variants?.medium?.url,item.variants?.thumb?.url].includes(target))||null;
}
export function recordImageUrls(record){
 const keys=['heroImage','homeCreateImage','storyImage1','storyImage2','storyImage3','homeMomentImage1','homeMomentImage2','homeMomentImage3','storyHeroImage','storyOriginImage','storyPeopleImage'];
 return [...keys.map(key=>record?.[key]),...imageUrls(record?.galleryImages),...imageUrls(record?.dayImages)].map(https).filter(Boolean);
}
export function withMediaAsset(record,field,asset){
 const value=asset?.variants?.display?.url||asset?.url;
 if(!https(value))throw new Error('The selected image needs a secure Firebase Storage URL.');
 const result={...record};
 if(['galleryImages','dayImages'].includes(field)){
  const images=imageUrls(result[field]);
  const cap=field==='dayImages'?20:8;
  if(!images.includes(value)){
   if(images.length>=cap)throw new Error(`This section already has ${cap} photographs. Remove one before adding more.`);
   images.push(value);
  }
  result[field]=images.join('\n');
 }else result[field]=value;
 const variants=assetVariants(asset);
 if(variants){
  const existing={...(result.imageVariants||{})};
  if(!existing[asset.id]&&Object.keys(existing).length>=MAX_MEDIA_REFS)throw new Error('Media variant limit reached. Remove unused images first.');
  existing[asset.id]=variants;
  result.imageVariants=existing;
 }
 if(field==='heroImage'){
  result.photoCredit=asset.credit||'';
  result.photoLicense=asset.license||'';
  result.photoSourceUrl=asset.sourcePage||'';
 }
 const caption=clean(asset.altText||asset.name||result.title);
 if(asset.credit&&asset.license&&asset.sourcePage&&caption){
  const line=`${caption} | ${clean(asset.credit)} | ${clean(asset.license)} | ${String(asset.sourcePage).trim()}`;
  const entries=imageUrls(result.imageCredits);
  if(!entries.includes(line))result.imageCredits=[...entries,line].slice(0,35).join('\n');
 }
 return result;
}
export function attachExistingMediaVariants(record,assets){
 const found={...(record.imageVariants||{})};const used=new Set(recordImageUrls(record));const added=[];
 for(const asset of assets||[]){
  const entry=assetVariants(asset);
  if(!entry||found[asset.id]||!used.has(entry.display))continue;
  if(Object.keys(found).length>=MAX_MEDIA_REFS)break;
  found[asset.id]=entry;added.push(asset.id);
 }
 return {record:{...record,imageVariants:found},added};
}
