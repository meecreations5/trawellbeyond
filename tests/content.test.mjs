import test from 'node:test';
import assert from 'node:assert/strict';
import {slugify,validateContent,typePath,safeImage,CONTENT_TYPES} from '../src/lib/content.mjs';
import {readFileSync} from 'node:fs';
test('fresh CMS supports a small, unambiguous set of content types',()=>{assert.deepEqual(CONTENT_TYPES,['destinations','experiences','journeys','offers','pages']);assert.equal(typePath('journeys'),'cms/journeys/items');assert.throws(()=>typePath('enquiries'));});
test('generates stable URL slugs',()=>{assert.equal(slugify('  Dubai & Abu Dhabi   '),'dubai-abu-dhabi');assert.equal(slugify('Singapore Flyer'),'singapore-flyer');});
test('a draft saves without media and lengthy content',()=>{const record=validateContent('experiences',{title:'Night Safari',destinationSlug:'singapore'},'draft');assert.equal(record.status,'draft');assert.equal(record.heroImage,'');});
test('publishing requires summary and correct destination association',()=>{assert.throws(()=>validateContent('experiences',{title:'Night Safari'},'published'),/short description/i);assert.throws(()=>validateContent('experiences',{title:'Night Safari',summary:'Wildlife after dark'},'published'),/destination/i);assert.equal(validateContent('experiences',{title:'Night Safari',summary:'Wildlife after dark',destinationSlug:'singapore',heroImage:'https://example.com/photo.jpg'},'published').status,'published');});
test('new pages require a cover image to publish but legacy published pages can be repaired safely',()=>{
 assert.throws(()=>validateContent('destinations',{title:'Singapore',summary:'A city of possibilities'},'published'),/cover photograph/i);
 assert.equal(validateContent('destinations',{title:'Singapore',summary:'A city of possibilities'},'published',{previouslyPublished:true}).status,'published');
 assert.equal(validateContent('destinations',{title:'Singapore',summary:'A city of possibilities'},'draft').status,'draft');
 const rules=readFileSync('firestore.rules','utf8');
 assert.match(rules,/coverReady/);assert.match(rules,/resource.data.status == 'published'/);
});
test('publication never accepts javascript or insecure image URLs',()=>{assert.equal(safeImage('javascript:alert(1)'),'');assert.equal(safeImage('http://example.com/photo.jpg'),'');assert.equal(safeImage('https://example.com/photo.jpg'),'https://example.com/photo.jpg');assert.throws(()=>validateContent('destinations',{title:'Dubai',summary:'Explore Dubai',heroImage:'javascript:alert(1)'},'published'),/HTTPS/);});
test('no Firebase Admin SDK dependency or server credentials required',()=>{
 const pkg=JSON.parse(readFileSync('package.json','utf8'));
 assert.equal(pkg.dependencies['firebase-admin'],undefined);
 const rules=readFileSync('firestore.rules','utf8');
 assert.match(rules,/teamUsers/);assert.match(rules,/microsoft\.com/);
 assert.match(rules,/allow create,update,delete: if false/);
 const storage=readFileSync('storage.rules','utf8');
 assert.match(storage,/firestore\.get/);
 assert.match(storage,/request\.resource\.size/);
});
test('all customer enquiries require consent and are unreadable publicly',()=>{
 const rules=readFileSync('firestore.rules','utf8');
 assert.match(rules,/d\.consent == true/);
 assert.match(rules,/allow get,list: if staff\(\)/);
 assert.match(rules,/d\.createdAt == request\.time/);
});
