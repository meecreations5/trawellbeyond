import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderV51Home} from '../src/lib/v51-home.mjs';
import {renderV51Destination,renderV51Journey,parseItinerary} from '../src/lib/v51-details.mjs';
import {validateContent} from '../src/lib/content.mjs';
const base=process.cwd();
const read=path=>readFile(`${base}/${path}`,'utf8');

test('V5.1 homepage retains all main sections while using published content',async()=>{
 const src=await read('public/index.html');
 const result=renderV51Home(src,{page:{summary:'Create memories around YOU',homeHeroLine1:'Explore the world',homeHeroAccent:'your way',homeHeroLine3:'always.'},destinations:[{slug:'singapore',title:'Singapore',region:'International',heroImage:'https://example.com/s.jpg'}],journeys:[{slug:'city-firsts',title:'A city full of firsts',summary:'Your own itinerary',destinationSlug:'singapore',heroImage:'https://example.com/1.jpg'}]});
 for(const id of ['discover','moments','destinations','journeys','purpose','create','worlds'])assert.ok(result.includes(`id="${id}"`));
 for(const marker of ['Create memories around YOU','A city full of firsts','data-journey-slug="city-firsts"','data-destination-slug="singapore"','id="tb-cms-data"'])assert.ok(result.includes(marker));
 assert.ok(!result.includes('Sample journeys for design review'));
});
test('V5.1 homepage displays no false published journey records after reset',async()=>{
 const result=renderV51Home(await read('public/index.html'),{destinations:[],journeys:[]});
 assert.ok(result.includes('Our destination collection is being curated'));
 assert.ok(result.includes('Our next collection of journeys is taking shape'));
 assert.ok(!result.includes('data-package="sri"'));
});
test('destination uses V5.1 sections with CMS experience, related journey and FAQ',async()=>{
 const result=renderV51Destination(await read('src/templates/destination.html'),{destination:{title:'Dubai',slug:'dubai',region:'International',summary:'Explore Dubai',description:'Discover it together.',highlights:'City views\nFamily experiences',faqs:'Is it customizable? | Yes, tell us what you need.'},experiences:[{title:'Museum of the Future',slug:'museum-future'}],journeys:[{title:'Dubai Together',slug:'dubai-together',destinationSlug:'dubai'}]});
 assert.ok(result.includes('/experiences/museum-future'));
 assert.ok(result.includes('/journeys/dubai-together'));
 assert.ok(result.includes('Is it customizable?'));
 assert.ok(result.includes('id="stories"'));
 assert.ok(!result.includes('Marina Bay &amp;'));
 assert.ok(!result.includes('__TB_'));
});
test('journey generates variable-length itinerary controls from CMS',async()=>{
 const result=renderV51Journey(await read('src/templates/journey.html'),{journey:{title:'Kerala Escape',slug:'kerala-escape',destinationSlug:'kerala',summary:'Travel your way',itinerary:'Day 1: Arrive | Meet team\nDay 2: Explore | Choose experiences\nDay 3: Depart | Return home'}});
 assert.ok(result.includes('day-tab-2'));
 assert.ok(result.includes('Kerala Escape'));
 assert.ok(result.includes('Send enquiry'));
 assert.ok(!result.includes('__TB_'));
 assert.equal(parseItinerary('Day 1: Arrive\nDay 2: Explore','').length,2);
});
test('homepage CMS fields save; gallery must be HTTPS',()=>{
 const item=validateContent('pages',{title:'Homepage',slug:'homepage',summary:'Something lovely',homeHeroAccent:'Your journey',homeEntryTitle:'Every journey\n*begins differently.*'},'published');
 assert.equal(item.homeEntryTitle,'Every journey\n*begins differently.*');
 assert.throws(()=>validateContent('destinations',{title:'Dubai',summary:'Dubai',galleryImages:'javascript:alert(1)'},'draft'),/Gallery/);
});
