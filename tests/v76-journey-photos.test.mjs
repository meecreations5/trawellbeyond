import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {journeyGalleryPhotos,journeyDayPhotos,journeyPhotoReadiness,httpsPhoto} from '../src/lib/journey-photos.mjs';
import {renderV51Journey,parseItinerary} from '../src/lib/v51-details.mjs';
import {normalizeColorCorrection,colorCorrectionFilter} from '../src/lib/image-presets.mjs';
const src=name=>readFileSync(new URL(name,import.meta.url),'utf8');
const template=src('../src/templates/journey.html');
const a='https://cdn.example.org/day1.webp',b='https://cdn.example.org/day2.jpg',c='https://cdn.example.org/day3.webp';
const base={title:'Singapore Journey',slug:'singapore-journey',destinationSlug:'singapore',heroImage:c,summary:'A city journey',itinerary:'Day 1: City | Arrival\nDay 2: Gardens | Nature\nDay 3: Islands | Beaches',dayImages:[a,b,c].join('\n'),galleryImages:''};
test('missing journey gallery is recovered from distinct existing day images, without any guessed imagery',()=>{
 assert.deepEqual(journeyGalleryPhotos(base),[a,b,c]);
 const html=renderV51Journey(template,{journey:base,relatedExperiences:[]});
 assert.match(html,/class="trip-gallery page-width"/);
 assert.equal((html.match(/class="tb-gallery-trigger /g)||[]).length,3);
 assert.match(html,/data-gallery-src="https:\/\/cdn.example.org\/day1.webp"/);
 assert.doesNotMatch(html,/__TB_[A-Z0-9_]+__/);
});
test('one or two available journey photos do not create empty side panels or duplicated slots',()=>{
 const one={...base,heroImage:c,dayImages:'',galleryImages:''};
 const html=renderV51Journey(template,{journey:one});
 assert.match(html,/trip-gallery--single/);
 assert.doesNotMatch(html,/class="gallery-side"/);
 const two={...base,dayImages:a,heroImage:c,galleryImages:''};
 const html2=renderV51Journey(template,{journey:two});
 assert.match(html2,/trip-gallery--pair/);
 assert.equal((html2.match(/data-gallery-src="/g)||[]).length,2);
});
test('individual day photos keep sequence and reuse valid journey images only when absent',()=>{
 const photos=journeyDayPhotos({dayImages:a,galleryImages:[b,c].join('\n'),heroImage:a},3);
 assert.deepEqual(photos,[a,b,c]);
 assert.equal(parseItinerary(base.itinerary,c,[a,b].join('\n'),c).length,3);
 assert.deepEqual(journeyPhotoReadiness(base),{days:3,explicitDayCount:3,missingDayCount:0,galleryCount:0,availableGalleryCount:3});
});
test('never display or import unsafe URLs or make up missing attractions',()=>{
 assert.equal(httpsPhoto('javascript:alert(1)'), '');
 assert.deepEqual(journeyGalleryPhotos({heroImage:'javascript:alert(1)',galleryImages:'data:image/png;base64,...'}),[]);
});
test('subtle colour-correction limits are safe, consistent and reversible',()=>{
 assert.deepEqual(normalizeColorCorrection({}),{brightness:100,contrast:100,saturation:100});
 assert.deepEqual(normalizeColorCorrection({brightness:900,contrast:0,saturation:900}),{brightness:115,contrast:90,saturation:120});
 assert.equal(colorCorrectionFilter({brightness:103,contrast:106,saturation:105}),'brightness(103%) contrast(106%) saturate(105%)');
 const optimizer=src('../src/lib/image-optimizer.js');
 const cms=src('../src/lib/cms-web.js');
 assert.match(optimizer,/ctx.filter=colorCorrectionFilter\(tone\)/);
 assert.match(cms,/brightness:formData.get\('brightness'\)/);
 assert.match(cms,/optimizeImageFile\(file,details.crop\|\|\{\}\)/);
});
test('Admin offers one-click gallery repair, while retaining day-image and media controls',()=>{
 const admin=src('../src/components/admin/AdminConsole.jsx');
 assert.match(admin,/Use existing day photos to complete the gallery/);
 assert.match(admin,/Journey images &amp; photo gallery/);
 assert.match(admin,/Crop \/ optimize copy/);
});
