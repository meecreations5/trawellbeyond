import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderV51Home} from '../src/lib/v51-home.mjs';
import {renderV51Destination,renderV51Journey} from '../src/lib/v51-details.mjs';
import {validSiteHref,parseLinks,renderSiteChrome} from '../src/lib/site-chrome.mjs';
import {LAUNCH_STARTERS,STARTER_PUBLISH_PAGES,STARTER_REVIEW_REQUIRED,STARTER_COUNTS} from '../src/lib/launch-starters.mjs';
import {validateContent} from '../src/lib/content.mjs';
const read=filename=>readFile(filename,'utf8');

test('all starter records have unique IDs and pass CMS draft validation',()=>{
 const keys=new Set();
 assert.equal(LAUNCH_STARTERS.length,Object.values(STARTER_COUNTS).reduce((sum,n)=>sum+n,0));
 for(const record of LAUNCH_STARTERS){
  const key=`${record.type}/${record.slug}`;
  assert.ok(!keys.has(key),`duplicate: ${key}`);
  keys.add(key);
  assert.equal(validateContent(record.type,record,'draft').slug,record.slug);
 }
});
test('core pages are individually publishable; legal pages remain manual review',()=>{
 for(const slug of STARTER_PUBLISH_PAGES){
  const record=LAUNCH_STARTERS.find(x=>x.type==='pages'&&x.slug===slug);
  assert.ok(record,slug);
  assert.equal(validateContent('pages',record,'published').status,'published');
 }
 for(const slug of STARTER_REVIEW_REQUIRED){
  assert.ok(!STARTER_PUBLISH_PAGES.includes(slug));
 }
});
test('site links reject malicious protocols and untrusted absolute hosts',()=>{
 for(const href of ['javascript:alert(1)','https://other.example/','//evil.example','/../admin','/foo\\bar'])assert.equal(validSiteHref(href),false);
 assert.deepEqual(parseLinks('View | /destinations\nInjected | javascript:alert(1)'),[['View','/destinations']]);
});
test('approved homepage sections are retained and chrome responds to published CMS settings',async()=>{
 const home=await read('public/index.html');
 const settings=LAUNCH_STARTERS.find(x=>x.slug==='site-settings');
 const result=renderV51Home(home,{page:{summary:'Your personal adventure begins here.'},site:{...settings,siteTopRight:'Trusted <script> unsafe & copy',siteFooterLine2:'A different kind of journey.'},destinations:[LAUNCH_STARTERS.find(x=>x.type==='destinations')],journeys:[]});
 for(const id of ['discover','moments','destinations','journeys','purpose','create','worlds','tbFooterLinks','tbDesktopNav'])assert.ok(result.includes(`id="${id}"`),id);
 assert.ok(result.includes('A different kind of journey.'));
 assert.ok(result.includes('Trusted &lt;script&gt; unsafe &amp; copy'));
 assert.ok(!result.includes('Trusted <script>'));
 assert.ok(!result.includes('DESIGN PROTOTYPE'));
 assert.ok(result.includes('href="/journeys"'));
 assert.ok(result.includes('Your personal adventure begins here.'));
});
test('destination and journey V5.1 templates share website settings',async()=>{
 const site={siteTopRight:'A DreamTrawell Destination Venture',siteFooterCompany:'One familiar team'};
 const destination=LAUNCH_STARTERS.find(x=>x.type==='destinations');
 const journey=LAUNCH_STARTERS.find(x=>x.type==='journeys');
 const d=renderV51Destination(await read('src/templates/destination.html'),{destination,journeys:[journey],site});
 assert.ok(d.includes('One familiar team'));
 assert.ok(d.includes('singapore-at-your-pace'));
 assert.ok(!d.includes('DESIGN PROTOTYPE'));
 const j=renderV51Journey(await read('src/templates/journey.html'),{journey,site});
 assert.ok(j.includes('One familiar team'));
 assert.ok(j.includes('id="itinerary"'));
});
test('homepage motion chapters and worlds are editable without replacing interactive layout',async()=>{
 const home=await read('public/index.html');
 const result=renderV51Home(home,{page:{homeMomentTitle1:'Our *moment*',homeMomentLead1:'A detail worth keeping.',homeMomentImage1:'https://example.com/photo.jpg',homeWorldsTitle:'Travel *your way.*',homeWorldsLead:'Every need matters.'}});
 assert.ok(result.includes('Our <em>moment</em>'));
 assert.ok(result.includes('A detail worth keeping.'));
 assert.ok(result.includes("--frame-image:url('https://example.com/photo.jpg')"));
 assert.ok(result.includes('Travel <em>your way.</em>'));
 assert.ok(result.includes('Every need matters.'));
 assert.ok(result.includes('data-story-dot="0"'));
});
test('motion chapter images must be HTTPS',()=>{
 assert.throws(()=>validateContent('pages',{title:'Homepage',slug:'homepage',summary:'Something',homeMomentImage1:'javascript:bad'},'draft'),/HTTPS/);
});
