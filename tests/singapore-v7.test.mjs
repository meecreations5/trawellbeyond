import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LAUNCH_STARTERS} from '../src/lib/launch-starters.mjs';
import {SG_PHOTOS,SINGAPORE_EXPERIENCE_PHOTOS} from '../src/lib/singapore-photos.mjs';
import {mergeSingaporeDraftVisuals,attachSingaporeStoredPhotos} from '../src/lib/singapore-draft-merge.mjs';
import {renderPhotoCredits,galleryButton} from '../src/lib/photo-credits.mjs';
import {renderV51Destination,renderV51Journey} from '../src/lib/v51-details.mjs';
import {renderV51Experience} from '../src/lib/v51-experience.mjs';
import {validateContent} from '../src/lib/content.mjs';
const template=x=>readFileSync(new URL(`../src/templates/${x}.html`,import.meta.url),'utf8');
const singapore=LAUNCH_STARTERS.find(x=>x.type==='destinations'&&x.slug==='singapore');
const journey=LAUNCH_STARTERS.find(x=>x.type==='journeys'&&x.slug==='singapore-at-your-pace');
const experiences=LAUNCH_STARTERS.filter(x=>x.type==='experiences'&&x.destinationSlug==='singapore');
const creditedExperiences=experiences.filter(x=>x.photoSourceUrl);
const site=LAUNCH_STARTERS.find(x=>x.type==='pages'&&x.slug==='site-settings');

test('Singapore starter includes genuine photo slots for hero, three stories, editorial gallery and four itinerary days',()=>{
 assert.ok(singapore.heroImage.startsWith('https://'));
 for(let i=1;i<=3;i++)assert.ok(singapore[`storyImage${i}`].startsWith('https://'));
 assert.equal(singapore.galleryImages.trim().split('\n').length,6);
 assert.equal(journey.dayImages.trim().split('\n').length,4);
 assert.ok(new Set(journey.dayImages.trim().split('\n')).size===4);
 assert.ok(journey.galleryImages.trim().split('\n').length>=3);
 for(const record of [singapore,journey,...creditedExperiences]){
  const normalized=validateContent(record.type,record,'draft');
  assert.match(normalized.imageCredits||'',/https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
 }
});

test('all 16 Singapore experiences have reviewed Commons photo suggestions pending Storage import',()=>{
 assert.equal(experiences.length,16);
 assert.equal(creditedExperiences.length,16);
 assert.equal(experiences.filter(x=>!x.heroImage).length,0);
 assert.equal(Object.keys(SINGAPORE_EXPERIENCE_PHOTOS).length,16);
 for(const item of creditedExperiences){
  assert.ok(item.heroImage.startsWith('https://'),item.slug);
  assert.ok(item.photoSourceUrl.startsWith('https://commons.wikimedia.org/'),item.slug);
  assert.ok(item.photoLicense,item.slug);
 }
 assert.equal(SG_PHOTOS.birdFlamingos.license,'CC0 1.0');
 assert.equal(SG_PHOTOS.universal.credit,'Abhi018');
});

test('destination gallery and journey gallery render clickable images with a single global footer',()=>{
 const destination=renderV51Destination(template('destination'),{destination:singapore,experiences,journeys:[journey],site});
 const trip=renderV51Journey(template('journey'),{journey,relatedExperiences:experiences,site});
 for(const html of [destination,trip]){
  assert.match(html,/class="tb-global-footer"/);
  assert.equal((html.match(/class="tb-global-footer"/g)||[]).length,1);
  assert.match(html,/data-gallery-src="https:\/\//);
  assert.match(html,/sg-gallery.js/);
  assert.match(html,/Photography &amp; licences/);
  assert.doesNotMatch(html,/__TB_[A-Z0-9_]+__/);
 }
 assert.match(destination,/tb-editorial-gallery/);
 assert.match(trip,/class="trip-gallery/);
});

test('experience detail has real responsive gallery and linked CREATE enquiry, even with only a cover photo',()=>{
 const single=experiences.find(x=>x.slug==='singapore-zoo');
 const html=renderV51Experience(template('experience'),{experience:single,destination:singapore,site});
 assert.match(html,/id="gallery"/);
 assert.match(html,/data-gallery-src=/);
 assert.match(html,/class="ex-enquiry/);
 assert.match(html,/\/create\?destination=Singapore/);
 assert.match(html,/Photography &amp; licences/);
});

test('photo credit strings are escaped and malicious image gallery links are rejected',()=>{
 const html=renderPhotoCredits('Danger <svg> | an author | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Test.jpg');
 assert.doesNotMatch(html,/<svg>/);
 assert.match(html,/Danger &lt;svg&gt;/);
 assert.equal(galleryButton('javascript:alert(1)','No image',0),'');
 assert.match(galleryButton('https://example.com/a.jpg','<script>',0),/&lt;script&gt;/);
});

test('safe image fill updates only missing fields of drafts, never edits published records',()=>{
 const draft={...singapore,status:'draft',heroImage:'https://myteam.example/cover.jpg',galleryImages:'',storyImage1:'',imageCredits:''};
 const result=mergeSingaporeDraftVisuals('destinations',draft,singapore);
 assert.ok(result);
 assert.equal(result.record.heroImage,draft.heroImage);
 assert.equal(result.record.galleryImages,singapore.galleryImages);
 assert.equal(result.record.storyImage1,singapore.storyImage1);
 assert.ok(!result.added.includes('heroImage'));
 assert.ok(result.record.imageCredits.includes('commons.wikimedia.org'));
 assert.equal(mergeSingaporeDraftVisuals('destinations',{...draft,status:'published'},singapore),null);
 assert.equal(mergeSingaporeDraftVisuals('destinations',{...singapore,status:'draft'},singapore),null);
});

test('new CMS photo credits field is writable under Firestore rules',()=>{
 const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');
 assert.match(rules,/'imageCredits'/);
 const record=validateContent('destinations',{...singapore,status:'published'},'published');
 assert.equal(record.status,'published');
});

test('CREATE has four visual steps, published destination/experience choices and enquiry submission',()=>{
 const create=readFileSync(new URL('../src/components/CreateStudio.jsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../src/components/create-studio.css',import.meta.url),'utf8');
 for(const phrase of ['Your purpose','Your destination','Your preferences','Your enquiry','publishedList(\'destinations\'','publishedList(\'experiences\'','submitEnquiry','SG_PHOTOS'])assert.ok(create.includes(phrase),phrase);
 assert.match(css,/\.cr-purposes/);
 assert.match(css,/\.cr-experiences/);
 assert.match(css,/@media\(max-width:640px\)/);
});

test('unpublished starter preview route is unavailable in production',()=>{
 const route=readFileSync(new URL('../src/app/preview/singapore/route.js',import.meta.url),'utf8');
 assert.match(route,/process\.env\.NODE_ENV==='production'/);
 assert.match(route,/status:404/);
});

test('stored media replaces exact Commons URLs, preserves unrelated media and published status',()=>{
 const url='https://firebasestorage.googleapis.com/v0/b/example/o/photo.jpg';
 const imports={[SG_PHOTOS.skyline.url]:{url,credit:'Zairon',license:'CC BY-SA 4.0',sourcePage:SG_PHOTOS.skyline.source}};
 const published={...singapore,status:'published',heroImage:SG_PHOTOS.skyline.url,storyImage1:'https://own.example/custom.jpg'};
 const result=attachSingaporeStoredPhotos('destinations',published,singapore,imports);
 assert.ok(result);
 assert.equal(result.status,'published');
 assert.equal(result.heroImage,url);
 assert.equal(result.storyImage1,'https://own.example/custom.jpg');
 assert.equal(result.photoSourceUrl,SG_PHOTOS.skyline.source);
 assert.equal(attachSingaporeStoredPhotos('destinations',published,singapore,{}),null);
});

test('exact Wikimedia metadata resolver is restricted to shortlisted files and thumbnail hosts',()=>{
 const route=readFileSync(new URL('../src/app/api/commons/resolve/route.js',import.meta.url),'utf8');
 const proxy=readFileSync(new URL('../src/app/api/commons/image/route.js',import.meta.url),'utf8');
 assert.match(route,/SG_PHOTOS/);
 assert.match(route,/shortlisted/);
 assert.match(route,/iiurlwidth:'1280'/);
 assert.match(proxy,/thumb\.wikimedia\.org/);
});
