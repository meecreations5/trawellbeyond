import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {LAUNCH_STARTERS,STARTER_COUNTS} from '../src/lib/launch-starters.mjs';
import {EXPANSION_STARTERS,EXPANSION_COUNTS} from '../src/lib/dubai-thailand-starters.mjs';
import {EXPANSION_MASTER} from '../src/lib/dubai-thailand-master.mjs';
import {EXPANSION_PHOTOS,EXPANSION_PHOTO_LIST} from '../src/lib/dubai-thailand-photos.mjs';
import {EXPANSION_TRAVEL_GUIDES} from '../src/lib/dubai-thailand-knowledge.mjs';
import {expansionMediaPlan,expansionPhotoKeysFor,attachExpansionPhotos} from '../src/lib/dubai-thailand-media.mjs';
import {validateContent} from '../src/lib/content.mjs';
import {blankOnlyChanges} from '../src/lib/completion-engine.mjs';
import {auditRecord} from '../src/lib/completion-engine.mjs';
const read=filename=>readFile(filename,'utf8');
const candidateAsset=(key,i=0)=>({
 id:`media_${String(i).padStart(6,'0')}_${key.slice(0,10).replace(/[^a-z0-9]/g,'')}`,
 url:`https://firebasestorage.googleapis.com/v0/b/trawell-demo/o/${encodeURIComponent(key)}.webp?alt=media`,
 variants:{display:{url:`https://firebasestorage.googleapis.com/v0/b/trawell-demo/o/${encodeURIComponent(key)}.webp?alt=media`},medium:{url:`https://firebasestorage.googleapis.com/v0/b/trawell-demo/o/${encodeURIComponent(key)}-medium.webp?alt=media`},thumb:{url:`https://firebasestorage.googleapis.com/v0/b/trawell-demo/o/${encodeURIComponent(key)}-thumb.webp?alt=media`}},
 credit:'Verified Photographer',license:'CC BY 4.0',sourcePage:`https://commons.wikimedia.org/wiki/File:${key}.jpg`,altText:key
});
const imports=Object.fromEntries(EXPANSION_PHOTO_LIST.map((p,i)=>[p.key,candidateAsset(p.key,i)]));

test('V7.8 is exactly two destinations, 28 experiences and five journeys, all private draft capable',()=>{
 assert.deepEqual(EXPANSION_COUNTS,{destinations:2,experiences:28,journeys:5,total:35});
 assert.equal(LAUNCH_STARTERS.length,64);
 assert.equal(Object.values(STARTER_COUNTS).reduce((a,b)=>a+b,0),64);
 const ids=new Set();
 for(const row of EXPANSION_STARTERS){
  const key=`${row.type}/${row.slug}`;
  assert.ok(!ids.has(key),`Duplicate ${key}`);ids.add(key);
  assert.ok(!('status' in row),'Starter must never have published status');
  const validated=validateContent(row.type,row,'draft');
  assert.equal(validated.status,'draft');
  assert.equal(validated.slug,row.slug);
  if(row.type!=='destinations')assert.ok(['dubai','thailand'].includes(row.destinationSlug));
  if(row.type==='experiences'){
   assert.ok(validated.officialUrl.startsWith('https://'),`${row.slug}: official URL missing`);
   assert.ok(validated.duration,`${row.slug}: duration missing`);
   assert.ok(validated.ticketNotes,`${row.slug}: ticket guidance missing`);
   assert.ok(validated.locationAddress,`${row.slug}: location missing`);
  }
 }
 assert.equal(EXPANSION_MASTER.length,20,'20 from source workbook');
 const museum=EXPANSION_STARTERS.find(r=>r.slug==='museum-of-the-future');
 assert.match(museum.openingHours,/TEMPORARILY CLOSED/);
 assert.match(museum.ticketNotes,/Do not sell or promise admission/);
 for(const seasonal of ['dubai-miracle-garden','global-village-dubai']){
  const item=EXPANSION_STARTERS.find(r=>r.slug===seasonal);
  assert.equal(item.visitVerifiedOn,'2026-11-09');
  assert.match(item.openingHours,/2026/);
 }
});

test('Dubai and Thailand have travel guidance, accessible destination structure, verified source links and videos',()=>{
 for(const slug of ['dubai','thailand']){
  const d=EXPANSION_STARTERS.find(r=>r.type==='destinations'&&r.slug===slug);
  assert.ok(d);
  for(const key of ['summary','description','storyTitle1','storyTitle2','storyTitle3','travelLanguages','travelCurrency','travelTimeZone','travelTransport','travelFood','travelStay','travelEntry','travelEssentials','travelGuideUrl','travelTransportUrl','travelEntryUrl','videoUrl','videoTitle','videoCredit']){
   assert.ok(String(d[key]||'').length,`${slug} destination missing ${key}`);
  }
  assert.equal(validateContent('destinations',d,'draft').slug,slug);
  const travel=EXPANSION_TRAVEL_GUIDES[slug];assert.ok(travel);
  assert.ok(d.featuredExperienceSlugs.split('\n').length>=4);
  assert.ok(d.featuredJourneySlug);
 }
});

test('media suggestions remain private candidates: no unlicensed URLs in destination drafts',()=>{
 assert.equal(EXPANSION_PHOTO_LIST.length,27);
 for(const photo of EXPANSION_PHOTO_LIST){
  assert.ok(photo.source.startsWith('https://commons.wikimedia.org/wiki/File:'),photo.key);
  assert.ok(photo.filename&&photo.caption);
  assert.ok(['dubai','thailand'].includes(photo.destinationSlug));
  assert.equal(EXPANSION_PHOTOS[photo.key]?.filename,photo.filename);
 }
 for(const record of EXPANSION_STARTERS)for(const key of ['heroImage','storyImage1','storyImage2','storyImage3','galleryImages','dayImages'])assert.ok(!record[key],`${record.slug} contains unapproved URL in ${key}`);
});

test('photo plan maps correct attraction to its exact image and prioritizes preserving previous CMS edits',()=>{
 const dest=EXPANSION_STARTERS.find(r=>r.type==='destinations'&&r.slug==='dubai');
 const plan=expansionMediaPlan('destinations','dubai');
 assert.equal(plan.heroImage,'burj-khalifa-observation-deck');
 assert.ok(expansionPhotoKeysFor('destinations','thailand').length>=6);
 const restored=attachExpansionPhotos('destinations',dest,imports);
 assert.ok(restored?.added.includes('heroImage'));
 assert.ok(restored.record.heroImage.endsWith('alt=media'));
 assert.ok(restored.record.photoCredit==='Verified Photographer');
 assert.ok(restored.record.imageCredits.includes('commons.wikimedia.org'));
 assert.ok(Object.keys(restored.record.imageVariants).length>=3);
 assert.equal(validateContent('destinations',restored.record,'draft').status,'draft');
 const custom={...dest,heroImage:'https://example.com/custom-cover.jpg',status:'published',storyImage1:'https://example.com/story.jpg'};
 const again=attachExpansionPhotos('destinations',custom,imports);
 assert.ok(again);
 assert.equal(again.record.heroImage,custom.heroImage);
 assert.equal(again.record.storyImage1,custom.storyImage1);
 assert.equal(again.record.status,'published');
 const blankOnly=blankOnlyChanges('destinations',custom,{heroImage:'https://example.com/overwrite.jpg',storyImage2:'https://example.com/new-story.jpg'});
 assert.ok(!Object.hasOwn(blankOnly.applied,'heroImage'));
 assert.equal(blankOnly.applied.storyImage2,'https://example.com/new-story.jpg');
 const oldCredit='Old cover | A. Photographer | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:old.jpg';
 const newCredit='New gallery | B. Photographer | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:new.jpg';
 const appended=blankOnlyChanges('destinations',{...custom,imageCredits:oldCredit},{imageCredits:oldCredit+'\n'+newCredit});
 assert.equal(appended.applied.imageCredits,oldCredit+'\n'+newCredit);
 const rejected=blankOnlyChanges('destinations',{...custom,imageCredits:oldCredit},{imageCredits:newCredit});
 assert.ok(!Object.hasOwn(rejected.applied,'imageCredits'));
 assert.equal(validateContent('destinations',{...custom,imageCredits:appended.applied.imageCredits},'draft').imageCredits,oldCredit+'\n'+newCredit);
});

test('journey photo maps preserve exact one-to-one day alignment including deliberately repeated photos',()=>{
 for(const journey of EXPANSION_STARTERS.filter(r=>r.type==='journeys')){
  const plan=expansionMediaPlan('journeys',journey.slug);
  const itineraryDays=journey.itinerary.split(/\r?\n/).length;
  assert.equal(plan.dayImages.length,itineraryDays,journey.slug);
  const complete=attachExpansionPhotos('journeys',journey,imports);
  assert.ok(complete?.added.includes('dayImages'),journey.slug);
  assert.equal(complete.record.dayImages.split('\n').length,itineraryDays,journey.slug);
  assert.equal(auditRecord('journeys',complete.record,[]).filter(x=>x.field==='dayImagesCount').length,0);
  assert.equal(validateContent('journeys',complete.record,'draft').status,'draft');
  const missing={...imports};delete missing[plan.dayImages[0]];
  const incomplete=attachExpansionPhotos('journeys',journey,missing);
  assert.ok(!incomplete?.record.dayImages,`Must not misalign day photos: ${journey.slug}`);
 }
 const koh=EXPANSION_STARTERS.find(r=>r.slug==='phuket-and-krabi-island-moments');
 const rendered=attachExpansionPhotos('journeys',koh,imports).record.dayImages.split('\n');
 assert.equal(rendered[0],rendered[1],'intentional repeated picture must retain its Day 2 position');
});

test('the Admin importer uses reviewed Commons sources, safer blank-only transactions and dedicated expansion controls',async()=>{
 const source=await read('src/components/admin/AdminConsole.jsx');
 const resolver=await read('src/app/api/commons/resolve/route.js');
 assert.match(source,/installExpansionPack/);
 assert.match(source,/reviewed WebP photos/);
 assert.match(source,/expansionRightsReviewed/);
 assert.match(source,/expansionApprovedKeys/);
 assert.match(source,/api\/admin\/completion\/fill/);
 assert.match(source,/Nothing was published/);
 assert.match(resolver,/EXPANSION_PHOTO_LIST/);
 assert.match(resolver,/permittedCommonsLicense\(license\)/);
 assert.doesNotMatch(source,/firebase-admin|admin\.credential/);
});
