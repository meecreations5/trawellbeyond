import test from 'node:test';
import assert from 'node:assert/strict';
import {REMAINING_STARTERS} from '../src/lib/remaining-destinations-starters.mjs';
import {PHOTO_SLOT_TOTAL,missingPhotoSlots,reviewableCommonsCandidate,photoSearchQueries,fillReviewedPhotoSlots} from '../src/lib/bulk-photography.mjs';
const candidate=(id,name='Photo')=>({id,source:'wikimedia',rightsConfirmed:true,sourcePage:`https://commons.wikimedia.org/wiki/File:${name}.jpg`,license:'CC BY-SA 4.0',credit:'Jane Photographer',altText:name,url:`https://example.com/${id}.webp`,variants:{display:{url:`https://example.com/${id}.webp`},medium:{url:`https://example.com/${id}-medium.webp`},thumb:{url:`https://example.com/${id}-thumb.webp`}}});
const records={destinations:[],experiences:[],journeys:[]};
for(const x of REMAINING_STARTERS)records[x.type].push({...x,status:'draft',updatedAt:'v1'});
const sample=records.destinations.find(r=>r.slug==='bali');
test('complete photo plan exactly aligns with all 153 V7.9 records',()=>{
 assert.equal(PHOTO_SLOT_TOTAL,590);
 const slots=missingPhotoSlots({content:records},'bali');
 assert.ok(slots.length>25);
 assert.equal(slots.filter(x=>x.type==='destinations').length,6);
 assert.equal(slots.filter(x=>x.type==='experiences').length,12);
 assert.ok(slots.every(s=>s.recordUpdatedAt==='v1'));
 const after={...records,destinations:records.destinations.map(x=>x.slug==='bali'?{...x,heroImage:'https://existing.example/own.webp'}:x)};
 assert.equal(missingPhotoSlots({content:after},'bali').length,slots.length-1);
 assert.deepEqual(missingPhotoSlots({content:records},'singapore'),[]);
});
test('licensing, author and exact Commons source need inspection',()=>{
 const a=candidate('abcdefghi');
 assert.equal(reviewableCommonsCandidate({...a,preview:a.url}),true);
 assert.equal(reviewableCommonsCandidate({...a,preview:a.url,credit:'Unknown author'}),false);
 assert.equal(reviewableCommonsCandidate({...a,preview:a.url,license:'CC BY-NC 4.0'}),false);
 assert.equal(reviewableCommonsCandidate({...a,preview:a.url,sourcePage:'https://evil.example/copyright.jpg'}),false);
});
test('photo placement fills blank URLs with metadata and never replaces existing photographs',()=>{
 const cover=candidate('12345678','Cover');
 const story=candidate('23456789','Story');
 const result=fillReviewedPhotoSlots('destinations',sample,[{field:'heroImage',index:0,asset:cover},{field:'storyImage1',index:0,asset:story},{field:'galleryImages',index:0,asset:story}]);
 assert.equal(result.added.length,3);
 assert.equal(result.record.heroImage,cover.url);
 assert.equal(result.record.photoCredit,cover.credit);
 assert.equal(result.record.storyImage1,story.url);
 assert.equal(result.record.galleryImages,story.url);
 assert.match(result.record.imageCredits,/Jane Photographer/);
 assert.ok(result.record.imageVariants[cover.id]);
 const repeat=fillReviewedPhotoSlots('destinations',result.record,[{field:'heroImage',index:0,asset:candidate('34567890')}]);
 assert.equal(repeat.record.heroImage,cover.url);assert.equal(repeat.added.length,0);
 assert.equal(result.record.summary,sample.summary);
});
test('journey day photos cannot be attached out of order',()=>{
 const journey=records.journeys.find(j=>j.destinationSlug==='bali');
 const out=fillReviewedPhotoSlots('journeys',journey,[{field:'dayImages',index:2,asset:candidate('23456789')},{field:'dayImages',index:0,asset:candidate('12345678')}]);
 assert.equal(out.record.dayImages,candidate('12345678').url);
 assert.ok(out.skipped.some(s=>s.includes('earlier slots')));
});
test('duplicate story photography and invalid media or slots are blocked',()=>{
 const first=candidate('12345678');
 const out=fillReviewedPhotoSlots('destinations',sample,[{field:'storyImage1',index:0,asset:first},{field:'storyImage2',index:0,asset:first}]);
 assert.equal(out.added.length,1);
 assert.ok(out.skipped[0].includes('repeated story'));
 assert.throws(()=>fillReviewedPhotoSlots('destinations',sample,[{field:'videoUrl',index:0,asset:first}]));
 assert.throws(()=>fillReviewedPhotoSlots('destinations',sample,[{field:'heroImage',index:0,asset:{...first,rightsConfirmed:false}}]));
});

test('photo search fallback removes Commons label and preserves landmark keywords',()=>{
 const queries=photoSearchQueries('Petronas Twin Towers & KLCC Malaysia Wikimedia Commons');
 assert.equal(queries[0],'Petronas Twin Towers & KLCC Malaysia');
 assert.equal(queries[1],'Petronas Twin Towers KLCC');
 assert.equal(new Set(queries).size,queries.length);
});
