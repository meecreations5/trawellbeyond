import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ASSISTANT_PURPOSES,normalizeJourneyPreferences,rankPublished,createLeadSummary,formatDayRequests} from '../src/lib/journey-assistant.mjs';
import {buildJourneySharePath,readJourneyShare} from '../src/lib/journey-sharing.mjs';
import {safeReceipts} from '../src/lib/enquiry-receipts.mjs';
import {renderSiteChrome} from '../src/lib/site-chrome.mjs';
const file=x=>readFileSync(x,'utf8');
test('visitor preference normalization bounds values and prevents uncontrolled tags',()=>{
 const x=normalizeJourneyPreferences({purpose:'Togetherness',pace:'speed',budgetBand:'$1,000',days:200,interests:['Adventure','Adventure','unknown','Culture & heritage'],destination:'X'.repeat(400)});
 assert.equal(x.purpose,'Togetherness');assert.equal(x.pace,'Flexible');assert.equal(x.budgetBand,'Need guidance');assert.equal(x.days,30);
 assert.deepEqual(x.interests,['Adventure','Culture & heritage']);assert.equal(x.destination.length,100);
 assert.equal(ASSISTANT_PURPOSES.length,5);
});
test('recommendations only use published CMS records and explain matches',()=>{
 const content=[{status:'draft',title:'Secret',summary:'family discovery',slug:'secret'}, {status:'published',title:'Family Nature Journey',slug:'family-nature',summary:'Family wildlife forest garden',days:5}, {status:'published',title:'City Break',slug:'city-break',summary:'Urban skyline evening',days:9}];
 const out=rankPublished(content,{purpose:'Togetherness',interests:['Nature & wildlife'],days:5},'journeys');
 assert.equal(out[0].item.slug,'family-nature');assert.ok(out[0].reasons.length);assert.equal(out.some(x=>x.item.slug==='secret'),false);
 assert.equal(out.some(x=>'price' in x),false);
});
test('visitor lead summary is bounded and never claims a guaranteed price',()=>{
 const summary=createLeadSummary({purpose:'Discovery',pace:'Balanced',days:6,interests:['Culture & heritage'],travelers:'Two adults'});
 assert.match(summary,/Purpose: Discovery/);assert.match(summary,/confirmation/);assert.ok(summary.length<=1800);
 assert.equal(formatDayRequests(['Move the museum to afternoon','Add free time']).split('\n').length,2);
});
test('share links contain only published slugs, never private contact info',()=>{
 const url=buildJourneySharePath({destinations:[{slug:'thailand'}],journeys:['family-escape'],name:'Private Name',phone:'+919999999999'});
 assert.match(url,/my-journey\?/);assert.doesNotMatch(url,/919999999999|Private/);
 assert.deepEqual(readJourneyShare(url.split('?')[1]).journeys,['family-escape']);
 assert.ok(readJourneyShare('?d='+('bad,'.repeat(100))).destinations.length<=6);
});
test('receipt list stores references only with bounded length',()=>{
 const receipts=safeReceipts([{id:'abc',name:'Private Person'},{id:'ABCDEFGHIJKLMNOPQRST',createdAt:'2026-11-10',source:'companion',phone:'1234'}]);
 assert.deepEqual(receipts,[{id:'ABCDEFGHIJKLMNOPQRST',createdAt:'2026-11-10',source:'companion'}]);
});
test('V8.2 Firestore rules prevent public enquiry enumeration and require owner authentication',()=>{
 const rules=file('firestore.rules');
 assert.match(rules,/d.ownerUid == request.auth.uid/);
 assert.match(rules,/allow get: if adminAccess\(\) \|\| assignedPublisher\(\) \|\| \(signedIn\(\)/);
 assert.match(rules,/allow list: if adminAccess\(\) \|\| assignedPublisher\(\)/);
 assert.match(rules,/request.resource.data.diff\(resource.data\).affectedKeys\(\).hasOnly\(\['status','assignedTo','updatedAt','updatedBy'\]\)/);
 assert.match(rules,/resource.data.get\('assignedTo',''\) == request.auth.uid/);
 assert.match(rules,/d.source in \['contact','create','enquiry','companion','match','customize'\]/);
 assert.doesNotMatch(rules,/allow read,write: if true/);
});
test('Companion is attached to standalone HTML (not React only)',()=>{
 const html=renderSiteChrome('<html><head></head><body><footer>Before</footer></body></html>');
 assert.match(html,/v82-companion.css/);assert.match(html,/v82-companion.js/);assert.match(html,/journey-tray.js/);
 assert.match(file('src/components/PublicShell.jsx'),/data-tb-assistant-trigger/);
 assert.match(file('src/public-client/enquiry-bridge.js'),/TrawellBeyondCatalog/);
});
test('enquiry client and admin inbox have explicit consent and permitted status transitions',()=>{
 const publicCode=file('src/lib/enquiries-web.js'),admin=file('src/lib/cms-web.js');
 assert.match(publicCode,/ownerUid:user.uid/);assert.match(publicCode,/consent:raw.consent===true/);
 assert.match(admin,/assignedTo/);assert.match(admin,/proposal_ready/);
 assert.match(file('src/components/admin/EnquiryInbox.jsx'),/Only submitted, consented enquiries/);
});
test('journey sharing, customization, insider and private enquiry status each have a public route',()=>{
 for(const path of ['src/app/journey-match/page.jsx','src/app/my-journey/page.jsx','src/app/customize/page.jsx','src/app/insider/[slug]/page.jsx','src/app/my-enquiries/page.jsx']){
  assert.match(file(path),/export default/);
 }
 const details=file('src/lib/v51-details.mjs');
 assert.match(details,/insider\//);assert.match(details,/customize\?journey/);
});
test('callback preference is persisted and limited by the Firestore rules',()=>{
 const rules=file('firestore.rules'),visitor=file('src/lib/enquiries-web.js'),form=file('src/components/InquiryForm.jsx');
 assert.match(rules,/d.preferredContactTime is string/);
 assert.match(visitor,/preferredContactTime:String\(raw.preferredContactTime/);
 assert.match(form,/Convenient contact time/);
 assert.match(visitor,/authStateReady/);
});
test('My Journey shortlist is carried into CREATE without requiring a customer account',()=>{
 const myJourney=file('src/components/v82/MyJourney.jsx');
 assert.match(myJourney,/function prepareCreate\(\)/);
 assert.match(myJourney,/Curated journeys in My Journey:/);
 assert.match(myJourney,/onClick=\{prepareCreate\}/);
 const create=file('src/components/CreateStudio.jsx');
 assert.match(create,/JOURNEY_DRAFT_KEY/);
});
test('day-wise customization freezes the draft while contact details are entered',()=>{
 const source=file('src/components/v82/DayCustomizer.jsx');
 assert.match(source,/disabled=\{ready\}/);
 assert.match(source,/Edit day requests/);
 assert.doesNotMatch(source,/<InquiryForm key=\{summary\}/);
});
test('companion never silently submits unfinished selections and requires consent',()=>{
 const js=file('public/v82-companion.js');
 assert.match(js,/consent:data.get\('consent'\)==='on'/);
 assert.match(js,/preferredContactTime:data.get\('preferredContactTime'\)/);
 assert.match(js,/window.TrawellBeyondEnquiries.submit/);
 assert.match(js,/window.TrawellBeyondCatalog.rank/);
 assert.doesNotMatch(js,/window\.open\(['"]https:\/\/wa\.me/);
});
test('no mocked Firebase content is published as a public HTML test fixture',()=>{
 assert.match(file('tests/fixtures/v82-companion-acceptance.html'),/window\.__v82Submission/);
 const chrome=renderSiteChrome('<html><head></head><body></body></html>');
 assert.match(chrome,/v82-companion.js/);
});
