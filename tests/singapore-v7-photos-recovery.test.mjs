import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LAUNCH_STARTERS} from '../src/lib/launch-starters.mjs';
import {SG_PHOTOS} from '../src/lib/singapore-photos.mjs';
import {singaporePhotoPlan,restoreSingaporeRecordPhotos} from '../src/lib/singapore-photo-recovery.mjs';
import {attachSingaporeStoredPhotos} from '../src/lib/singapore-draft-merge.mjs';
import {permittedCommonsLicense} from '../src/lib/commons-license.mjs';
import {validateContent} from '../src/lib/content.mjs';
const destination=LAUNCH_STARTERS.find(x=>x.type==='destinations'&&x.slug==='singapore');
const trip=LAUNCH_STARTERS.find(x=>x.type==='journeys'&&x.slug==='singapore-at-your-pace');
const experience=LAUNCH_STARTERS.find(x=>x.type==='experiences'&&x.slug==='gardens-by-the-bay');
const stored=key=>({url:`https://firebasestorage.googleapis.com/v0/b/test/o/${key}.jpg`,credit:`Verified ${key}`,license:'CC BY-SA 4.0',sourcePage:SG_PHOTOS[key].source});
const all=Object.fromEntries(Object.entries(SG_PHOTOS).map(([key,photo])=>[photo.url,stored(key)]));

test('published destination with empty images is recoverable without unpublishing or altering text',()=>{
 const original={...destination,status:'published',heroImage:'',storyImage1:'',storyImage2:'',storyImage3:'',galleryImages:'',imageCredits:'',photoCredit:'',photoLicense:'',photoSourceUrl:'',description:'My approved copy'};
 const plan=singaporePhotoPlan('destinations',original,destination);
 assert.equal(plan.length,10);
 const recovery=restoreSingaporeRecordPhotos('destinations',original,destination,all);
 assert.ok(recovery);
 assert.equal(recovery.record.status,'published');
 assert.equal(recovery.record.description,'My approved copy');
 assert.equal(recovery.record.heroImage,stored('skyline').url);
 assert.equal(recovery.record.storyImage1,stored('gardens').url);
 assert.equal(recovery.record.storyImage2,stored('littleIndia').url);
 assert.equal(recovery.record.storyImage3,stored('beach').url);
 assert.equal(recovery.record.galleryImages.split('\n').length,6);
 assert.equal(recovery.record.photoSourceUrl,SG_PHOTOS.skyline.source);
 assert.equal(recovery.record.imageCredits.split('\n').length,10);
 assert.deepEqual(recovery.stillMissing,[]);
 assert.equal(validateContent('destinations',recovery.record,'published').status,'published');
});

test('preserves custom cover and custom gallery, fills only missing stories',()=>{
 const current={...destination,status:'published',heroImage:'https://mybrand.example/my-photo.jpg',storyImage1:'',storyImage2:'',storyImage3:'',galleryImages:'https://mybrand.example/gallery.jpg',photoCredit:'Our studio',photoLicense:'Own photo'};
 const fixed=restoreSingaporeRecordPhotos('destinations',current,destination,all);
 assert.equal(fixed.record.heroImage,current.heroImage);
 assert.equal(fixed.record.galleryImages,current.galleryImages);
 assert.equal(fixed.record.photoCredit,current.photoCredit);
 assert.equal(fixed.record.photoLicense,current.photoLicense);
 assert.equal(fixed.record.storyImage2,stored('littleIndia').url);
});

test('a partial source failure does not insert broken suggestions and allows retry',()=>{
 const current={...destination,status:'published',heroImage:'',storyImage1:'',storyImage2:'',storyImage3:'',galleryImages:'',imageCredits:''};
 const first=restoreSingaporeRecordPhotos('destinations',current,destination,{[SG_PHOTOS.skyline.url]:stored('skyline')});
 assert.equal(first.record.heroImage,stored('skyline').url);
 assert.equal(first.record.storyImage2,'');
 assert.equal(first.record.galleryImages,'');
 assert.ok(first.stillMissing.includes('galleryImages'));
 const retry=restoreSingaporeRecordPhotos('destinations',first.record,destination,all);
 assert.ok(retry.record.galleryImages);
 assert.equal(retry.record.heroImage,first.record.heroImage);
});

test('experience photos and journey day images import without changing publication status',()=>{
 const ex={...experience,status:'published',heroImage:'',galleryImages:''};
 assert.equal(restoreSingaporeRecordPhotos('experiences',ex,experience,all).record.heroImage,all[experience.heroImage].url);
 const publishedTrip={...trip,status:'published',heroImage:'',dayImages:'',galleryImages:''};
 const patched=attachSingaporeStoredPhotos('journeys',publishedTrip,trip,all);
 assert.equal(patched.status,'published');
 assert.equal(patched.dayImages.split('\n').length,4);
 assert.equal(patched.galleryImages.split('\n').length,3);
});

test('rejects non-commercial and unknown Commons licences',()=>{
 for(const l of ['CC BY-SA 4.0','CC BY 4.0','CC0 1.0','Public domain'])assert.ok(permittedCommonsLicense(l),l);
 for(const l of ['CC BY-NC-SA 4.0','CC BY-ND 4.0','All rights reserved','Unknown',''])assert.equal(permittedCommonsLicense(l),false,l);
});

test('Commons image search returns bandwidth-safe thumbs for import, not oversized originals',()=>{
 const fs=readFileSync(new URL('../src/app/api/commons/search/route.js',import.meta.url),'utf8');
 assert.match(fs,/iiurlwidth:'1280'/);
 assert.match(fs,/url:info.thumburl\|\|info.url/);
});
