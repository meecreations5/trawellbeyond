/** Global, deterministic content audit. No external AI claims, auto-publishing or
 * external media imports. Only trusted, already prepared copy is proposed.
 * Safe for a browser-only Firebase Web SDK deployment.
 */
import {CONTENT_TYPES,CONTENT_FIELDS} from './content.mjs';
import {LAUNCH_STARTERS} from './launch-starters.mjs';
import {SINGAPORE_EDITORIAL} from './singapore-editorial.mjs';
import {SINGAPORE_TRAVEL_GUIDE,SINGAPORE_VISITOR_GUIDES} from './singapore-knowledge.mjs';
import {imageUrls,getAssetByUrl,recordImageUrls,assetVariants,attachExistingMediaVariants} from './media-variants.mjs';
import {youtubeVideoId} from './travel-guide.mjs';

const present = x => typeof x==='string'?Boolean(x.trim()):x!==null&&x!==undefined;
const labels={heroImage:'Cover photograph',galleryImages:'Gallery photography',dayImages:'Day-by-day photography',description:'Full story',summary:'Card description',travelLanguages:'Local languages',travelCurrency:'Currency and local payment tips',travelTransport:'Transport guide',travelFood:'Dining and dietary advice',travelEntry:'Official entry guidance',videoUrl:'Attraction or destination video',videoTitle:'Video title',videoCredit:'Video source',photoCredit:'Cover photographer',photoLicense:'Image licence',photoSourceUrl:'Photograph source page',imageCredits:'Gallery photo attribution',highlights:'Experience highlights',ticketNotes:'Ticket information',officialUrl:'Operator reference',openingHours:'Opening hours',duration:'Suggested activity duration',nearestTransit:'Nearest transport',gettingThere:'Directions',visitSourceUrl:'Visitor information source',travelVerifiedOn:'Travel guide verification date',visitVerifiedOn:'Attraction information verification date',itinerary:'Daily itinerary',featuredExperienceSlugs:'Featured experiences',storyImage1:'Story image 1',storyImage2:'Story image 2',storyImage3:'Story image 3',storyTitle1:'Story title 1',storyTitle2:'Story title 2',storyTitle3:'Story title 3',imageVariants:'WebP display, medium and thumbnail mapping'};
const tag=(field,label=labels[field]||field,category='content',severity='important',note='')=>({field,label,category,severity,note});
export const CATEGORY_LABELS={content:'Editorial & practical information',images:'Photos & galleries',video:'Video references',metadata:'Rights, credits & optimization'};
const definitions={
 destinations:[tag('summary','Short summary','content','critical'),tag('heroImage','Destination hero','images','critical'),tag('description'),tag('storyTitle1'),tag('storyTitle2'),tag('storyTitle3'),tag('storyImage1','Story photograph 1','images'),tag('storyImage2','Story photograph 2','images'),tag('storyImage3','Story photograph 3','images'),tag('galleryImages','Destination gallery','images'),tag('featuredExperienceSlugs'),tag('travelLanguages'),tag('travelCurrency'),tag('travelTransport'),tag('travelFood'),tag('travelEntry'),tag('travelVerifiedOn','Travel facts reviewed on','content','recommended'),tag('videoUrl','Destination video','video','recommended')],
 experiences:[tag('summary','Short summary','content','critical'),tag('destinationSlug','Parent destination','content','critical'),tag('heroImage','Experience hero','images','critical'),tag('description'),tag('highlights'),tag('galleryImages','Experience gallery','images'),tag('duration'),tag('openingHours'),tag('ticketNotes'),tag('officialUrl'),tag('nearestTransit'),tag('gettingThere'),tag('visitSourceUrl'),tag('videoUrl','Attraction video','video','recommended')],
 journeys:[tag('summary','Short summary','content','critical'),tag('destinationSlug','Parent destination','content','critical'),tag('heroImage','Journey hero','images','critical'),tag('description'),tag('itinerary'),tag('dayImages','Individual day images','images'),tag('galleryImages','Journey gallery','images','recommended')],
 offers:[tag('summary','Offer summary','content','critical'),tag('heroImage','Offer photo','images','critical'),tag('description')],
 pages:[tag('summary','Page summary','content','critical'),tag('description','Page copy')]
};
const first = value => imageUrls(value)[0]||'';
const isMissing=(record,field)=>!present(record?.[field]);
const imageRecord=(record)=>record?.heroImage||record?.storyImage1||first(record?.galleryImages)||'';
const hasCredit=(v)=>v?.rightsConfirmed===true&&present(v?.credit)&&present(v?.license);
const imagePattern=/\.(?:jpe?g|png)(?:\?|$)/i;
const same= (a,b) => String(a||'').trim()===String(b||'').trim();

function issue(type,record,field,category,severity,label,reason,action='edit'){
 return {id:`${type}:${record.slug||record.id}:${field}`,type,slug:record.slug||record.id,title:record.title||'Untitled',status:record.status||'draft',field,category,severity,label,reason,action};
}
function countItinerary(value){return imageUrls(value).length;}
export function auditRecord(type,record,assets=[]){
 if(!CONTENT_TYPES.includes(type))return [];
 const out=[],add=(field,category,severity,label,reason,action)=>out.push(issue(type,record,field,category,severity,label,reason,action));
 let checks=definitions[type]||[];
 if(type==='pages'){
  if(record.slug==='site-settings')checks=[tag('siteFooterLine2','Footer brand statement'),tag('siteNavLinks','Main navigation')];
  else if(record.slug==='homepage')checks=[tag('summary','Homepage summary','content','critical'),tag('heroImage','Hero photograph','images','critical'),tag('homeHeroLine1','Hero heading'),tag('homeMomentImage1','Motion chapter 1 image','images'),tag('homeMomentImage2','Motion chapter 2 image','images'),tag('homeMomentImage3','Motion chapter 3 image','images')];
  else if(['privacy','terms'].includes(record.slug))checks=[tag('description','Legally reviewed public text','content','critical')];
 }
 for(const spec of checks){
  if(isMissing(record,spec.field)){
   // Journey gallery is rendered from explicit day images in current V7.6.
   if(type==='journeys'&&spec.field==='galleryImages'&&present(record.dayImages))continue;
   add(spec.field,spec.category,spec.severity,spec.label,'Missing or not yet completed');
  }
 }
 if(type==='journeys'&&present(record.itinerary)){
  const days=countItinerary(record.itinerary),photos=imageUrls(record.dayImages).length;
  if(photos<days)add('dayImagesCount','images','important','Missing day photographs',`${days} itinerary day(s), ${photos} explicit day photo(s)`);
 }
 if(['destinations','experiences'].includes(type)&&present(record.videoUrl)){
  if(!youtubeVideoId(record.videoUrl))add('videoUrlInvalid','video','important','Video URL needs correction','Not a recognized YouTube URL');
  if(!present(record.videoTitle))add('videoTitle','video','recommended','Missing video title','Video selected without title');
  if(!present(record.videoCredit))add('videoCredit','video','recommended','Missing video creator','Attribution has not been entered');
 }
 if(imageRecord(record)){
  const coverAsset=getAssetByUrl(assets,record.heroImage);
  if(!present(record.photoCredit))add('photoCredit','metadata','important','Cover image credit','No photographer or source credit');
  if(!present(record.photoLicense))add('photoLicense','metadata','important','Cover licence','Confirm the image usage licence');
  if(!present(record.photoSourceUrl)&&!(coverAsset?.source==='manual'&&coverAsset.rightsConfirmed))add('photoSourceUrl','metadata','important','Cover source page','Source URL not recorded');
 }
 const gallery=[...imageUrls(record.galleryImages),...imageUrls(record.dayImages)];
 if(gallery.length&&!present(record.imageCredits))add('imageCredits','metadata','important','Gallery attribution','Gallery contains images without credit lines');
 const stored=recordImageUrls(record).map(url=>getAssetByUrl(assets,url)).filter(Boolean);
 if(stored.some(a=>assetVariants(a)&&!Object.hasOwn(record.imageVariants||{},a.id))){
  add('imageVariants','metadata','recommended','Use responsive WebP variants','One or more selected Media Library photos have no saved public variant mapping','link-variants');
 }
 if(recordImageUrls(record).some(url=>imagePattern.test(new URL(url).pathname))){
  add('legacyImages','metadata','recommended','Check JPEG / PNG usage','An image is not known to be a displayed WebP variant. Import or optimize it before changing the URL.','media');
 }
 return out;
}
export function auditMediaAsset(asset){
 const issues=[],push=(field,label,severity='important')=>issues.push({id:`media:${asset.id}:${field}`,type:'media',slug:asset.id,title:asset.name||'Saved image',status:'stored',field,category:'metadata',severity,label,reason:'Media Library metadata needs review',action:'media'});
 if(!asset.rightsConfirmed)push('rightsConfirmed','Commercial reuse not confirmed','critical');
 if(!present(asset.credit))push('credit','Missing photographer / source');
 if(!present(asset.license))push('license','Missing licence information');
 if(!present(asset.altText))push('altText','Missing descriptive alt text','recommended');
 if(!asset.optimized || !asset.variants?.thumb?.url || !asset.variants?.medium?.url || !asset.variants?.display?.url)push('variants','Responsive WebP variants missing','recommended');
 if(asset.bytes>600000)push('fileSize','Large optimized display image','recommended');
 return issues;
}
export function buildCompletionReport(content={},assets=[],options={}){
 const all=[],records=[],destination=String(options.destination||'all');
 for(const type of CONTENT_TYPES){
  if(options.type && options.type!=='all'&&options.type!==type)continue;
  for(const record of content[type]||[]){
   if(destination!=='all' && !(type==='destinations'&&record.slug===destination) && record.destinationSlug!==destination)continue;
   const issues=auditRecord(type,record,assets);all.push(...issues);
   records.push({type,slug:record.slug||record.id,title:record.title,status:record.status,issues,issueCount:issues.length,record});
  }
 }
 if((!options.type||options.type==='all'||options.type==='media')&&destination==='all'){
  for(const item of assets){const issues=auditMediaAsset(item);all.push(...issues);if(issues.length)records.push({type:'media',slug:item.id,title:item.name,status:'stored',issues,issueCount:issues.length,record:item});}
 }
 const byCategory=Object.fromEntries(Object.keys(CATEGORY_LABELS).map(cat=>[cat,all.filter(issue=>issue.category===cat).length]));
 const bySeverity={critical:all.filter(x=>x.severity==='critical').length,important:all.filter(x=>x.severity==='important').length,recommended:all.filter(x=>x.severity==='recommended').length};
 return {recordCount:records.filter(r=>r.type!=='media').length,mediaCount:assets.length,issues:all,rows:records,byCategory,bySeverity,issuesCount:all.length};
}
const PROHIBITED_AUTO=new Set(['heroImage','galleryImages','dayImages','storyImage1','storyImage2','storyImage3','homeCreateImage','homeMomentImage1','homeMomentImage2','homeMomentImage3','priceFrom','validUntil','travelVerifiedOn','visitVerifiedOn']);
const SOURCE_FIELDS={destinations:'Curated destination starter',experiences:'Curated attraction starter',journeys:'Curated itinerary starter',offers:'Curated offer draft',pages:'Approved website starter'};
function safeSource(record){return typeof record==='object'&&record&&!Array.isArray(record);}
export function proposeCompletion(type,record,assets=[]){
 if(!CONTENT_TYPES.includes(type)||!safeSource(record))return [];
 const proposals=new Map(),allowed=new Set(CONTENT_FIELDS[type]);
 const add=(source,values)=>{
  if(!safeSource(values))return;
  for(const [field,value] of Object.entries(values)){
   if(!allowed.has(field)||PROHIBITED_AUTO.has(field)||['slug','title','featured','currency','photoCredit','photoLicense','photoSourceUrl','imageCredits'].includes(field)||proposals.has(field))continue;
   if(typeof value!=='string'||!value.trim()||present(record[field]))continue;
   // URLs are only suggested when the curated source provides them. Videos are
   // never discovered or embedded automatically from a search result.
   proposals.set(field,{field,label:labels[field]||field,value,source,kind:field==='videoUrl'?'video':'content'});
  }
 };
 if(type==='experiences'&&record.destinationSlug==='singapore'){
  add('Singapore attraction editorial master',SINGAPORE_EDITORIAL[record.slug]);
  add('Singapore operator/travel-board references',SINGAPORE_VISITOR_GUIDES[record.slug]);
 }
 if(type==='destinations'&&record.slug==='singapore')add('Singapore official-source travel guide',SINGAPORE_TRAVEL_GUIDE);
 const starter=LAUNCH_STARTERS.find(x=>x.type===type&&x.slug===record.slug);
 if(starter)add(SOURCE_FIELDS[type],starter);
 // Reuse only photographs explicitly assigned to THIS journey, not a search
 // result that merely shares a destination name.
 if(type==='journeys'&&!present(record.galleryImages)&&imageUrls(record.dayImages).length){
  const images=[...new Set(imageUrls(record.dayImages))].slice(0,8);
  if(images.length)proposals.set('galleryImages',{field:'galleryImages',label:'Gallery from this journey’s own day photos',value:images.join('\n'),source:'Already attached itinerary photographs',kind:'images'});
 }
 // Metadata is copied only from the exact asset already used in the record.
 const hero=getAssetByUrl(assets,record.heroImage);
 if(hero&&hasCredit(hero)){
  for(const [field,value] of Object.entries({photoCredit:hero.credit,photoLicense:hero.license,photoSourceUrl:hero.sourcePage||''})){
   if(allowed.has(field)&&present(value)&&!present(record[field]))proposals.set(field,{field,label:labels[field],value,source:'Exact approved photo in Media Library',kind:'metadata'});
  }
 }
 const images=recordImageUrls(record);
 const mediaWithRights=[...new Set(images.map(url=>getAssetByUrl(assets,url)).filter(a=>a?.rightsConfirmed&&hasCredit(a)))];
 if(!present(record.imageCredits)&&allowed.has('imageCredits')){
  const creditLines=mediaWithRights.slice(0,25).map(a=>`${String(a.altText||a.name||'Photograph').replace(/[|\r\n]/g,' ')} | ${String(a.credit).replace(/[|\r\n]/g,' ')} | ${String(a.license).replace(/[|\r\n]/g,' ')} | ${a.sourcePage||''}`);
  if(creditLines.length)proposals.set('imageCredits',{field:'imageCredits',label:'Photo credits from exact saved images',value:creditLines.join('\n'),source:'Existing approved Media Library assets',kind:'metadata'});
 }
 const variants=attachExistingMediaVariants(record,assets);
 if(variants.added.length){
  proposals.set('imageVariants',{field:'imageVariants',label:'Link optimized WebP display / medium / thumbnail',value:variants.record.imageVariants,source:'Existing optimized Media Library copies',kind:'metadata'});
 }
 return [...proposals.values()];
}
/** Ensures apply never overwrites an existing user value, even if a second
 * editor changed it after the scan. The caller must load the current document.
 */
export function blankOnlyChanges(type,latest,requested){
 if(!CONTENT_TYPES.includes(type))throw new Error('Unknown CMS type.');
 const allowed=new Set(CONTENT_FIELDS[type]);
 const applied={},skipped=[];
 for(const [field,value] of Object.entries(requested||{})){
  if(field==='imageVariants'){
   if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid variants.');
   const existing=latest.imageVariants||{},next={...existing};
   for(const [id,entry] of Object.entries(value))if(!next[id])next[id]=entry;
   if(Object.keys(next).length>Object.keys(existing).length)applied.imageVariants=next;
   else skipped.push('imageVariants');
   continue;
  }
  if(field==='imageCredits'&&present(latest.imageCredits)){
   // Append photo attribution only. No existing credit may be removed or edited.
   const existing=imageUrls(latest.imageCredits),proposed=imageUrls(value);
   const complete=existing.every(line=>proposed.includes(line));
   const additions=proposed.filter(line=>!existing.includes(line)&&/^.+ \| .+ \| .+ \| https:\/\/[^\s]+$/.test(line));
   if(complete&&additions.length)applied.imageCredits=[...existing,...new Set(additions)].join('\n');
   else skipped.push(field);
   continue;
  }
  if(!allowed.has(field)||['title','slug','featured','status','destinationSlug','priceFrom','validUntil'].includes(field))throw new Error(`Cannot apply field: ${field}`);
  if(typeof value!=='string'||!value.trim())continue;
  if(present(latest[field]))skipped.push(field);
  else applied[field]=value.trim();
 }
 return {applied,skipped};
}
/** Image health check: browser image decoding, not a guarantee of licence,
 * copyright ownership, landmark accuracy or public uptime. */
export function collectImageHealthTargets(content={},max=80){
 const targets=[],seen=new Set();
 for(const type of CONTENT_TYPES)for(const record of content[type]||[]){
  for(const url of recordImageUrls(record)){
   if(seen.has(url))continue;seen.add(url);
   targets.push({url,type,slug:record.slug,title:record.title});
   if(targets.length>=max)return targets;
  }
 }
 return targets;
}
