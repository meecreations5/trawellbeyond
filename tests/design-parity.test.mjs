import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderV51Experience} from '../src/lib/v51-experience.mjs';
import {renderV51Destination,renderV51Journey,parseItinerary} from '../src/lib/v51-details.mjs';
import {validateContent,CONTENT_FIELDS} from '../src/lib/content.mjs';
import {LAUNCH_STARTERS} from '../src/lib/launch-starters.mjs';
const template=name=>readFileSync(new URL(`../src/templates/${name}.html`,import.meta.url),'utf8');
const dest={...LAUNCH_STARTERS.find(x=>x.type==='destinations'),
 heroImage:'https://example.com/hero.jpg',storyImage1:'https://example.com/city.jpg',storyImage2:'https://example.com/neighborhoods.jpg',storyImage3:'https://example.com/nature.jpg',
 purposeFirst:'See the gardens | Gardens, skyline',featuredExperienceSlugs:'bird-paradise\ngardens-by-the-bay',featuredJourneySlug:'singapore-at-your-pace',status:'published'};
const journey={...LAUNCH_STARTERS.find(x=>x.type==='journeys'),heroImage:'https://example.com/journey.jpg',dayImages:['https://example.com/day-1.jpg','https://example.com/day-2.jpg','https://example.com/day-3.jpg','https://example.com/day-4.jpg'].join('\n'),galleryImages:['https://example.com/gallery-a.jpg','https://example.com/gallery-b.jpg','https://example.com/gallery-c.jpg'].join('\n'),status:'published'};
const experiences=[{slug:'gardens-by-the-bay',title:'Gardens by the Bay',destinationSlug:'singapore',heroImage:'https://example.com/gardens.jpg',status:'published'}, {slug:'bird-paradise',title:'Bird Paradise',destinationSlug:'singapore',heroImage:'https://example.com/birds.jpg',status:'published'}];

test('destination CMS retains V5.1 narrative chapters, controls and explicit featured order',()=>{
 const html=renderV51Destination(template('destination'),{destination:dest,experiences,journeys:[journey]});
 assert.match(html,/class="story-chapters"/);assert.match(html,/class="purpose-picker/);
 assert.match(html,/A city with a <em>sense of wonder\.<\/em>/);
 assert.match(html,/https:\/\/example\.com\/city\.jpg/);
 assert.match(html,/See the gardens/);
 assert.match(html,/Gardens, skyline/);
 assert.ok(html.indexOf('Bird Paradise')<html.indexOf('Gardens by the Bay'));
 assert.match(html,/href="\/journeys\/singapore-at-your-pace"/);
 assert.match(html,/SINGAPORE YOUR WAY/);
 assert.doesNotMatch(html,/__TB_[A-Z0-9_]+__/);
});

test('non-Singapore destination does not accidentally render Singapore copy',()=>{
 const item={title:'Dubai',slug:'dubai',region:'International',summary:'A modern city with local stories',description:'Explore Dubai at your pace.',highlights:'City views\nLocal markets',purposeFirst:'See old and new Dubai | Downtown, heritage',featuredExperienceSlugs:''};
 const html=renderV51Destination(template('destination'),{destination:item,experiences:[],journeys:[]});
 assert.match(html,/DUBAI YOUR WAY/);
 assert.doesNotMatch(html,/Marina Bay/);
 assert.doesNotMatch(html,/SINGAPORE YOUR WAY/);
});

test('journey renders different photo for each itinerary day and correct destination links',()=>{
 const html=renderV51Journey(template('journey'),{journey,relatedExperiences:experiences});
 const boot=html.match(/<script id="tb-page-data" type="application\/json">(.*?)<\/script>/s);
 assert.ok(boot);
 const data=JSON.parse(boot[1]);
 assert.equal(data.days.length,4);
 assert.equal(data.days[0].remote,'https://example.com/day-1.jpg');
 assert.equal(data.days[1].remote,'https://example.com/day-2.jpg');
 assert.equal(data.days[2].remote,'https://example.com/day-3.jpg');
 assert.match(html,/id="dayPhoto" style="--remote:url\('https:\/\/example\.com\/day-1\.jpg'\)/);
 assert.match(html,/href="\/destinations\/singapore"/);
 assert.match(html,/Four days, countless/);
 assert.match(html,/Marina Bay/);
 assert.doesNotMatch(html,/__TB_[A-Z0-9_]+__/);
});

test('unprovided journey-day images use neutral fallback rather than duplicate hero',()=>{
 const days=parseItinerary('Day 1: Arrival | Start\nDay 2: Discover | Continue','https://example.com/hero.jpg','https://example.com/day-one.jpg');
 assert.equal(days[0].remote,'https://example.com/day-one.jpg');
 assert.equal(days[1].remote,'/assets/hero-fallback.svg');
});

test('dedicated experience template contains its missing editorial sections and real contextual CTAs',()=>{
 const item={title:'Gardens by the Bay',slug:'gardens-by-the-bay',destinationSlug:'singapore',summary:'A beautiful garden',description:'Nature and the city.\n\nA wonderful place to wander.',heroImage:'https://example.com/gbtb.jpg',galleryImages:'https://example.com/one.jpg\nhttps://example.com/two.jpg',highlights:'Garden walk\nSupertrees\nPhoto moments',duration:'2 hours',openingHours:'Confirm before travel',ticketNotes:'Tickets may need timed admission',officialUrl:'https://www.gardensbythebay.com.sg',status:'published'};
 const html=renderV51Experience(template('experience'),{experience:item,destination:dest,relatedExperiences:experiences});
 for(const fragment of ['class="ex-hero"','class="ex-intro','class="ex-highlights"','class="ex-gallery"','class="ex-info','class="ex-enquiry','id="experienceEnquiryForm"','/experience-detail.js','Official attraction information'])assert.ok(html.includes(fragment),fragment);
 assert.match(html,/\/create\?destination=Singapore&amp;experience=/i); // HTML escaping may preserve & in href
 assert.match(html,/https:\/\/example\.com\/one\.jpg/);
 assert.match(html,/https:\/\/www\.gardensbythebay\.com\.sg/);
 assert.doesNotMatch(html,/__TB_[A-Z0-9_]+__/);
});

test('new CMS record fields are validated, and same names allowed by Firestore rules',()=>{
 for(const type of ['destinations','experiences','journeys']){
  const record={title:'A valid title',summary:'A short summary',slug:'a-valid-title',destinationSlug:'singapore',heroImage:'https://example.com/photo.jpg'};
  if(type==='destinations')Object.assign(record,{storyTitle1:'A good story',storyImage1:'https://example.com/s1.jpg',purposeFirst:'Description | Keywords',featuredExperienceSlugs:'gardens-by-the-bay'});
  if(type==='experiences')Object.assign(record,{galleryImages:'https://example.com/a.jpg',officialUrl:'https://www.example.com',ticketNotes:'Check times'});
  if(type==='journeys')Object.assign(record,{dayImages:'https://example.com/day1.jpg',journeyStoryTitle:'Your moment',journeyInterests:'Bird Paradise'});
  assert.equal(validateContent(type,record,'published').status,'published');
 }
 assert.throws(()=>validateContent('experiences',{title:'A valid title',summary:'Short',slug:'test',destinationSlug:'singapore',officialUrl:'javascript:alert(1)'},'published'),/HTTPS/);
 const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');
 for(const type of ['destinations','experiences','journeys'])for(const field of CONTENT_FIELDS[type])assert.ok(rules.includes(`'${field}'`),`Firestore rules missing ${type}.${field}`);
});
