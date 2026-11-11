import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {REMAINING_STARTERS} from '../src/lib/remaining-destinations-starters.mjs';
import {TEAM_ROLES,normalizedEmail,canManageTeam,canPublishContent,canEditRecord,canCreateContent,canReadEnquiries,assertContentWrite,quarantineDraftPhotoEdits} from '../src/lib/team-access.mjs';
import {plannedMissingPhotoSlots,rankPhotoCandidate,fillAutoPhotoSlots,canAutoAttachSlot,summarizePhotoCoverage} from '../src/lib/global-photo-completion.mjs';
import {validateContent} from '../src/lib/content.mjs';
import {bulkReadiness} from '../src/lib/bulk-rollout.mjs';
const asset=(id,name='Petronas_Twin_Towers')=>({id,source:'wikimedia',rightsConfirmed:true,sourcePage:`https://commons.wikimedia.org/wiki/File:${name}.jpg`,license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',credit:'Photographer',url:`https://example.com/${id}.webp`,variants:{display:{url:`https://example.com/${id}.webp`},medium:{url:`https://example.com/${id}-medium.webp`},thumb:{url:`https://example.com/${id}-thumb.webp`}}});
const wiki=(title)=>({title,sourcePage:`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(title).replace(/%20/g,'_')}.jpg`,url:'https://upload.wikimedia.org/photo.jpg',preview:'https://upload.wikimedia.org/thumb.jpg',credit:'Photographer',license:'CC BY-SA 4.0'});
const records={destinations:[],experiences:[],journeys:[]};
for(const item of REMAINING_STARTERS)records[item.type].push({...item,status:'draft',updatedAt:'rev-1'});
records.destinations.push({title:'Singapore',slug:'singapore',status:'draft',updatedAt:'rev-1',summary:'Singapore editorial',description:'A city of discovery'});
records.experiences.push({title:'Singapore Flyer',slug:'singapore-flyer',destinationSlug:'singapore',status:'draft',updatedAt:'rev-1'});
records.journeys.push({title:'Singapore Week',slug:'singapore-week',destinationSlug:'singapore',status:'draft',days:'3',itinerary:'Day 1: Marina Bay\nDay 2: Gardens\nDay 3: Sentosa',updatedAt:'rev-1'});
const sample=records.destinations.find(x=>x.slug==='malaysia');
test('staff invitations are email-normalized, role limited and never grant editor publish rights',()=>{
 assert.deepEqual(TEAM_ROLES,['super_admin','admin','publisher','editor','media']);
 assert.equal(normalizedEmail('  Teammate@Example.com  '),'teammate@example.com');
 assert.throws(()=>normalizedEmail('bad-address'),/valid Microsoft/);
 assert.equal(canManageTeam('super_admin'),true);assert.equal(canManageTeam('admin'),false);
 assert.equal(canPublishContent('publisher'),true);assert.equal(canPublishContent('editor'),false);
 assert.equal(canCreateContent('media'),false);assert.equal(canReadEnquiries('media'),false);
 assert.equal(canEditRecord('media',{status:'draft'}),true);assert.equal(canEditRecord('media',{status:'published'}),false);
});
test('media assistant may edit draft photos but cannot modify content, publish, or approve',()=>{
 const prior={title:'Malaysia',summary:'Unique destination',status:'draft',heroImage:''};
 assertContentWrite('media',prior,{...prior,heroImage:'https://example.com/malaysia.webp'});
 assert.throws(()=>assertContentWrite('media',prior,{...prior,title:'Different title'}),/cannot change/);
 assert.throws(()=>assertContentWrite('media',prior,{...prior,status:'published'}),/Only a Publisher/);
 assert.throws(()=>assertContentWrite('media',prior,{...prior,mediaReviewStatus:'approved'}),/cannot approve/);
 assert.throws(()=>assertContentWrite('editor',{...prior,status:'published'},{...prior,status:'published',title:'Other'}),/read-only/);
});
test('new or changed draft photos are returned to pending review',()=>{
 const a={title:'Malaysia',heroImage:'',status:'draft',mediaReviewStatus:'approved'};
 const edited=quarantineDraftPhotoEdits('editor',a,{...a,heroImage:'https://example.com/photo.webp'});
 assert.equal(edited.mediaReviewStatus,'pending');
 assert.equal(quarantineDraftPhotoEdits('publisher',a,{...a,heroImage:'https://example.com/photo.webp'}).mediaReviewStatus,'pending');
 assert.equal(quarantineDraftPhotoEdits('publisher',a,{...a,title:'Refined description'}).mediaReviewStatus,'approved');
});
test('global photo plan handles V7.9 queue and earlier legacy destination/experience/journey drafts',()=>{
 const slots=plannedMissingPhotoSlots({content:records},{destinations:['malaysia','singapore']});
 assert.ok(slots.some(s=>s.destination==='singapore'&&s.type==='destinations'&&s.field==='storyImage2'));
 assert.ok(slots.some(s=>s.destination==='singapore'&&s.type==='journeys'&&s.field==='dayImages'&&s.index===2));
 assert.ok(slots.some(s=>s.destination==='malaysia'&&s.type==='experiences'&&s.field==='galleryImages'));
 assert.equal(slots.filter(s=>s.destination==='malaysia'&&s.type==='destinations').length,6);
 assert.equal(plannedMissingPhotoSlots({content:records},{destinations:['singapore'],group:'journeys'}).filter(s=>s.type==='journeys').length,6);
});
test('strong matches require two distinguishing title tokens, not just the location or a random image',()=>{
 const slot={query:'Petronas Twin Towers & KLCC Malaysia'};
 assert.equal(rankPhotoCandidate(slot,wiki('The Petronas Twin Towers Kuala Lumpur')).confidence,'strong');
 assert.notEqual(rankPhotoCandidate(slot,wiki('A Lovely View of Malaysia')).confidence,'strong');
 assert.equal(rankPhotoCandidate(slot,{...wiki('Petronas Twin Towers'),license:'CC BY-NC 4.0'}).confidence,'rejected');
});
test('auto photo writing is draft-only, blank-only and immediately locked for image review',()=>{
 const initial={...sample,status:'draft'};
 const a=asset('12345678'),b=asset('23456789','KLCC_Towers');
 const outcome=fillAutoPhotoSlots('destinations',initial,[{field:'heroImage',index:0,asset:a},{field:'galleryImages',index:0,asset:b}]);
 assert.deepEqual(outcome.added,['heroImage:0','galleryImages:0']);
 assert.equal(outcome.record.mediaReviewStatus,'pending');
 assert.equal(outcome.record.heroImage,a.url);
 assert.match(outcome.record.imageCredits,/Photographer/);
 assert.equal(outcome.record.summary,initial.summary);
 assert.equal(fillAutoPhotoSlots('destinations',outcome.record,[{field:'heroImage',index:0,asset:a}]).added.length,0);
 assert.throws(()=>fillAutoPhotoSlots('destinations',{...initial,status:'published'},[{field:'heroImage',index:0,asset:a}]),/not allowed/i);
 assert.equal(canAutoAttachSlot('journeys',{slug:'x',status:'draft',days:'3'},'dayImages',3),false);
});
test('pending auto-photographs block normal and bulk publication',()=>{
 assert.throws(()=>validateContent('destinations',{title:'Malaysia',summary:'Visit Malaysia',heroImage:'https://example.com/x.webp',mediaReviewStatus:'pending'},'published'),/Review automatically imported/);
 assert.equal(validateContent('destinations',{title:'Malaysia',summary:'Visit Malaysia',heroImage:'https://example.com/x.webp',mediaReviewStatus:'approved'},'published').mediaReviewStatus,'approved');
 assert.ok(bulkReadiness('destinations',{...sample,mediaReviewStatus:'pending'}).missing.some(x=>/visual review/i.test(x)));
});
test('published missing-image records are included in audit but excluded from automatic writes',()=>{
 const published={...records,experiences:[...records.experiences,{title:'Old Place',slug:'old-place',destinationSlug:'singapore',status:'published'}]};
 const overview=summarizePhotoCoverage({content:published},['singapore','malaysia']);
 assert.ok(overview.missingDraft>0);assert.ok(overview.missingPublished>0);
 assert.equal(plannedMissingPhotoSlots({content:published},{destinations:['singapore']}).some(x=>x.slug==='old-place'),false);
});
test('Firebase rules explicitly separate invite, member, media, public and publisher permissions',()=>{
 const firestore=readFileSync('firestore.rules','utf8');const storage=readFileSync('storage.rules','utf8');
 assert.match(firestore,/match \/teamInvites\/\{email\}/);
 assert.match(firestore,/allow create: if validInvitedMember\(uid\)/);
 assert.match(firestore,/role\(\) == 'super_admin'/);
 assert.match(firestore,/mediaOnlyChanges/);
 assert.match(firestore,/function photoFieldsChanged\(\)/);
 assert.match(firestore,/!photoFieldsChanged\(\) \|\| request.resource.data.get\('mediaReviewStatus',''\) == 'pending'/);
 assert.match(firestore,/mediaReviewStatus/);
 assert.match(firestore,/allow list: if adminAccess\(\) \|\| assignedPublisher\(\)/);
 assert.match(storage,/role in \['super_admin','admin','publisher','editor','media'\]/);
});
