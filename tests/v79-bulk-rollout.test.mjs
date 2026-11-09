import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {REMAINING_DESTINATIONS_DATA} from '../src/lib/remaining-destinations-data.mjs';
import {REMAINING_STARTERS,REMAINING_COUNTS,REMAINING_DESTINATION_SLUGS,MEDIA_SEARCH_PLAN} from '../src/lib/remaining-destinations-starters.mjs';
import {LAUNCH_STARTERS} from '../src/lib/launch-starters.mjs';
import {EXPANSION_STARTERS} from '../src/lib/dubai-thailand-starters.mjs';
import {validateContent} from '../src/lib/content.mjs';
import {planBulkInstall,bulkReadiness,bulkSelectionForPublish,validReviewDate} from '../src/lib/bulk-rollout.mjs';

const fakePhoto=n=>`https://firebasestorage.googleapis.com/v0/b/example/o/${n}.webp?alt=media`;
const base={openingHours:'09:00–18:00; subject to maintenance closures',gettingThere:'Use the locally signed public transport entrance or an arranged accessible transfer.',heroImage:fakePhoto('cover'),photoCredit:'Reviewed photographer',photoLicense:'CC BY 4.0',photoSourceUrl:'https://commons.wikimedia.org/wiki/File:Example.jpg',galleryImages:[fakePhoto('gallery-1'),fakePhoto('gallery-2')].join('\n'),imageCredits:'Gallery | Reviewed photographer | CC BY 4.0 | https://commons.wikimedia.org/wiki/File:Example.jpg'};
test('17 remaining destinations, 102 experiences and 34 journeys produce 153 distinct, valid private drafts',()=>{
 assert.deepEqual(REMAINING_COUNTS,{destinations:17,experiences:102,journeys:34,total:153});
 assert.equal(REMAINING_DESTINATION_SLUGS.length,17);
 assert.equal(new Set(REMAINING_DESTINATION_SLUGS).size,17);
 const existingIds=new Set([...LAUNCH_STARTERS,...EXPANSION_STARTERS].map(x=>`${x.type}:${x.slug}`));
 const newIds=new Set();
 for(const row of REMAINING_STARTERS){
  const id=`${row.type}:${row.slug}`;
  assert.ok(!newIds.has(id),`Duplicate V7.9: ${id}`);newIds.add(id);
  assert.ok(!existingIds.has(id),`V7.9 overlaps Singapore or V7.8: ${id}`);
  assert.equal(validateContent(row.type,row,'draft').status,'draft');
  assert.ok(!('status' in row),`Never force publication: ${id}`);
  assert.ok(!row.heroImage&&!row.videoUrl&&!row.priceFrom,`Draft contains unapproved media/rate: ${id}`);
  if(row.type==='experiences'){
   assert.ok(row.officialUrl.startsWith('https://'));assert.ok(row.ticketNotes.includes('NOT included'));
   assert.ok(REMAINING_DESTINATION_SLUGS.includes(row.destinationSlug));
  }
  if(row.type==='journeys'){
   const dayCount=(row.itinerary.match(/^Day\s+\d+\s*:/gm)||[]).length;
   assert.equal(dayCount,Number(row.days),`Day mismatch ${row.slug}`);
   assert.equal(Number(row.nights)+1,Number(row.days));
  }
 }
 assert.equal(newIds.size,153);
});
test('travel essentials, stories, featured links and regional sources are specific to each destination',()=>{
 for(const d of REMAINING_DESTINATIONS_DATA){
  const r=REMAINING_STARTERS.find(x=>x.type==='destinations'&&x.slug===d.slug);
  assert.ok(r);assert.equal(d.places.length,6);assert.equal(d.routes.length,2);
  assert.ok(['India','International'].includes(d.region));
  for(const field of ['storyBody1','storyBody2','storyBody3','storyTitle1','storyTitle2','storyTitle3','travelLanguages','travelCurrency','travelTimeZone','travelWeather','travelTransport','travelFood','travelStay','travelEntry','travelEssentials','travelGuideUrl'])assert.ok(r[field],`${d.slug}: missing ${field}`);
  assert.ok(d.source.startsWith('https://'));
  assert.equal(r.featuredExperienceSlugs.split('\n').length,6);
  assert.ok(REMAINING_STARTERS.find(x=>x.type==='journeys'&&x.slug===r.featuredJourneySlug));
  assert.ok(!r.travelVerifiedOn,'No invented current review date');
 }
 assert.equal(MEDIA_SEARCH_PLAN.length,17);
});
test('install preview filters only selected destinations and preserves existing records',()=>{
 const source=REMAINING_STARTERS;
 const before=JSON.stringify(source);
 const existing={destinations:[{slug:'bali',status:'published'}],experiences:[{slug:'ubud-rice-terrace-walk',status:'published'}],journeys:[]};
 const result=planBulkInstall(['bali','goa','singapore'],existing,source);
 assert.deepEqual(result.selectedDestinations,['bali','goa']);
 assert.equal(result.selected.length,18);
 assert.equal(result.skipped.length,2);
 assert.equal(result.create.length,16);
 assert.ok(result.create.every(x=>['bali','goa'].includes(x.type==='destinations'?x.slug:x.destinationSlug)));
 assert.equal(JSON.stringify(source),before,'No client-side mutation during preview');
});
test('bulk publication blocks incomplete photos, missing licensing and stale verification',()=>{
 const d=REMAINING_STARTERS.find(x=>x.type==='destinations'&&x.slug==='kerala');
 const failing=bulkReadiness('destinations',d,new Date('2026-11-09T00:00:00Z'));
 assert.equal(failing.ready,false);assert.ok(failing.missing.some(x=>x.includes('photograph')));
 const ready={...d,...base,storyImage1:fakePhoto('story1'),storyImage2:fakePhoto('story2'),storyImage3:fakePhoto('story3'),travelVerifiedOn:'2026-11-09'};
 assert.equal(bulkReadiness('destinations',ready,new Date('2026-11-09T00:00:00Z')).ready,true);
 assert.equal(bulkReadiness('destinations',{...ready,storyImage2:fakePhoto('story1')},new Date('2026-11-09T00:00:00Z')).ready,false,'Repeated story photograph must block');
 assert.equal(bulkReadiness('destinations',{...ready,travelVerifiedOn:'2025-01-01'},new Date('2026-11-09T00:00:00Z')).ready,false);
 assert.equal(bulkReadiness('destinations',{...ready,imageCredits:''},new Date('2026-11-09T00:00:00Z')).ready,false);
 assert.equal(bulkReadiness('destinations',{...ready,photoSourceUrl:'',photoLicense:''},new Date('2026-11-09T00:00:00Z')).ready,false);
});
test('experience and journey launch gates require visit review and accurate day-image alignment',()=>{
 const e=REMAINING_STARTERS.find(x=>x.type==='experiences'&&x.destinationSlug==='bali');
 const j=REMAINING_STARTERS.find(x=>x.type==='journeys'&&x.destinationSlug==='bali');
 const now=new Date('2026-11-09T00:00:00Z');
 assert.equal(bulkReadiness('experiences',{...e,...base,visitVerifiedOn:'2026-11-09'},now).ready,true);
 assert.equal(bulkReadiness('experiences',{...e,...base,visitVerifiedOn:'2026-11-09',openingHours:'Check official opening hours'},now).ready,false,'Generic opening hours cannot pass');
 assert.equal(bulkReadiness('experiences',{...e,...base,visitVerifiedOn:'2026-11-09',gettingThere:'Local transfer, public transport or guided access to be confirmed once the exact route and hotel are selected.'},now).ready,false,'Placeholder access directions cannot pass');
 assert.equal(bulkReadiness('experiences',{...e,...base,visitVerifiedOn:''},now).ready,false);
 const dayImages=Array.from({length:Number(j.days)},(_,i)=>fakePhoto(`day-${i}`)).join('\n');
 assert.equal(bulkReadiness('journeys',{...j,...base,dayImages},now).ready,true);
 assert.equal(bulkReadiness('journeys',{...j,...base,dayImages:fakePhoto('only-one')},now).ready,false);
 assert.ok(validReviewDate('2026-11-09',now));
 assert.ok(!validReviewDate('2026-11-10',now));
 assert.ok(!validReviewDate('2026-02-29',now));
});
test('pending bulk queue contains only draft records from the chosen destination',()=>{
 const records={destinations:[{slug:'bali',status:'draft'},{slug:'singapore',status:'published'}],experiences:[{slug:'a',destinationSlug:'bali',status:'draft'},{slug:'b',destinationSlug:'bali',status:'published'}],journeys:[{slug:'c',destinationSlug:'kerala',status:'draft'}]};
 const queue=bulkSelectionForPublish(records,['bali']);
 assert.deepEqual(queue.map(x=>x.record.slug),['bali','a']);
});
test('authenticated transactional publication checks staleness, media readiness and parent status',async()=>{
 const client=await readFile('src/lib/cms-web.js','utf8');
 const admin=await readFile('src/components/admin/AdminConsole.jsx','utf8');
 const view=await readFile('src/components/admin/BulkRollout.jsx','utf8');
 assert.match(client,/if\(parts\[2\]==='bulk'&&parts\[3\]==='publish'/);
 assert.match(client,/currentStaff\(\)/);
 assert.match(client,/runTransaction\(clientDb\(\),async transaction/);
 assert.match(client,/previous.updatedAt!==body.expectedUpdatedAt/);
 assert.match(client,/bulkReadiness\(type,previous\)/);
 assert.match(client,/parent.data\(\).status!=='published'/);
 assert.match(client,/REMAINING_DESTINATION_SLUGS.includes/);
 assert.match(admin,/BulkRollout/);
 assert.match(view,/window.prompt/);
 assert.match(view,/Open Media Library/);
 assert.match(view,/status:'draft'/);
 assert.doesNotMatch(client,/firebase-admin|serviceAccount/i);
});
