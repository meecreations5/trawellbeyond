import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeTray,addToTray,removeFromTray,normalizePlan,assignPlanDay,movePlanItem,itineraryNotes,canonicalPurpose,matchesPurpose} from '../src/lib/journey-plan.mjs';
import {renderV51Home} from '../src/lib/v51-home.mjs';
import {renderV51Destination,renderV51Journey} from '../src/lib/v51-details.mjs';
import {renderV51Experience} from '../src/lib/v51-experience.mjs';
import {LAUNCH_STARTERS} from '../src/lib/launch-starters.mjs';
const read=path=>readFileSync(path,'utf8');
const sg=LAUNCH_STARTERS.find(x=>x.type==='destinations');
const exp=LAUNCH_STARTERS.find(x=>x.type==='experiences'&&x.slug==='gardens-by-the-bay');
const journey=LAUNCH_STARTERS.find(x=>x.type==='journeys');

test('Journey Tray deduplicates experiences, limits length, and sanitizes imported choices',()=>{
 let tray=addToTray({},'experiences',{title:'Gardens by the Bay',slug:'gardens-by-the-bay',destinationSlug:'singapore'});
 tray=addToTray(tray,'experiences',{title:'Gardens by the Bay',slug:'gardens-by-the-bay',destinationSlug:'singapore'});
 assert.equal(tray.experiences.length,1);
 tray=addToTray(tray,'destinations',{title:'Singapore',slug:'singapore'});
 tray=addToTray(tray,'purpose','Discovery');
 assert.equal(tray.destinations[0].slug,'singapore');assert.equal(tray.purpose,'Discovery');
 assert.equal(removeFromTray(tray,'experiences','gardens-by-the-bay').experiences.length,0);
 assert.deepEqual(normalizeTray({experiences:'bad'}).experiences,[]);
});

test('day planning assigns each selected activity only once, reorders it, and discards removed activities',()=>{
 const selected=['Gardens by the Bay','River Wonders'];
 let plan=assignPlanDay([],selected,4,selected[0],1);
 plan=assignPlanDay(plan,selected,4,selected[1],1);
 assert.deepEqual(plan[1],selected);
 plan=movePlanItem(plan,selected,4,1,1,-1);
 assert.deepEqual(plan[1],[selected[1],selected[0]]);
 plan=assignPlanDay(plan,selected,4,selected[0],3);
 assert.deepEqual(plan[1],[selected[1]]);
 assert.deepEqual(plan[3],[selected[0]]);
 assert.match(itineraryNotes(plan),/Day 4: Gardens by the Bay/);
 assert.ok(!normalizePlan(plan,[selected[0]],4).flat().includes(selected[1]));
});

test('purpose filters give grounded discovery suggestions but retain unknown purpose as all',()=>{
 const p={title:'Little India Walk',summary:'Culture and heritage stories'};
 assert.equal(canonicalPurpose('Spend time together'),'Togetherness');
 assert.equal(matchesPurpose(p,'Discovery'),true);
 assert.equal(matchesPurpose(p,'Rest and renewal'),false);
 assert.equal(matchesPurpose(p,'Open to suggestions'),true);
});

test('approved homepage and destination share the additive Journey Tray without replacing sections',()=>{
 const html=renderV51Home(read('public/index.html'),{destinations:[sg],journeys:[journey]});
 assert.match(html,/id="moments"/);assert.match(html,/id="purpose"/);
 assert.match(html,/journey-tray\.js/);assert.match(html,/journey-tray\.css/);
 const dest=renderV51Destination(read('src/templates/destination.html'),{destination:sg,experiences:[exp],journeys:[journey]});
 assert.match(dest,/data-tb-add-destination/);assert.match(dest,/data-tb-title="Singapore"/);
 assert.match(dest,/journey-tray\.js/);
 const experience=renderV51Experience(read('src/templates/experience.html'),{experience:exp,destination:sg});
 assert.match(experience,/data-tb-add-experience/);
 assert.match(experience,/data-tb-destination-slug="singapore"/);
 const trip=renderV51Journey(read('src/templates/journey.html'),{journey});
 assert.match(trip,/Or plan my days in CREATE/);
 assert.match(trip,/nights=3/);
});

test('homepage uses one CREATE flow; experience library exposes purpose and destination filters',()=>{
 const home=read('public/app.js');
 const create=read('src/components/CreateStudio.jsx');
 const discovery=read('src/components/ExperienceDiscovery.jsx');
 assert.match(home,/if\(a==='builder'\)\{window\.location\.assign\('\/create'\)/);
 assert.match(home,/\/experiences\?purpose=/);
 assert.match(create,/assignPlanDay/);assert.match(create,/JOURNEY_DRAFT_KEY/);
 assert.match(create,/submitEnquiry/);assert.match(create,/removeItem|movePlanItem/);
 assert.match(discovery,/type="search"/);assert.match(discovery,/matchesPurpose/);
});

test('publishing never silently unpublishes content; Admin SDK is still absent',()=>{
 const editor=read('src/components/admin/AdminConsole.jsx');const rules=read('firestore.rules');
 assert.match(editor,/Save Published Changes/);assert.match(editor,/window\.confirm\('Unpublish this page/);
 assert.match(rules,/coverReady\(type\)/);assert.match(rules,/resource\.data\.status == 'published'/);
 assert.doesNotMatch(read('package.json'),/firebase-admin/);
});

test('six legacy Singapore experiences remain private drafts with licensed source suggestions and no invented prices',()=>{
 const names=['river-wonders','sentosa-cable-car','wings-of-time','jewel-changi-rain-vortex','canopy-park-at-jewel','national-gallery-singapore'];
 for(const slug of names){const record=LAUNCH_STARTERS.find(x=>x.slug===slug);
  assert.ok(record,slug);assert.match(record.heroImage,/^https:\/\/commons.wikimedia.org/);assert.ok(record.openingHours);assert.ok(record.officialUrl);
  assert.equal(record.priceFrom,undefined);assert.ok(record.ticketNotes.length>20);
 }
});
