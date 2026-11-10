import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PHILOSOPHY,STORY_FIELDS,STORY_IMAGE_FIELDS,STORY_DEFAULTS,storyPhoto,storySteps,storyText,STORY_TEXT_LIMITS} from '../src/lib/brand-story.mjs';
import {CONTENT_FIELDS,validateContent} from '../src/lib/content.mjs';
import {auditMediaRecord,auditMediaCatalogue} from '../src/lib/media-acceptance.mjs';
import {renderV51Journey} from '../src/lib/v51-details.mjs';
const file=rel=>readFileSync(new URL(`../${rel}`,import.meta.url),'utf8');
test('brand story preserves six original philosophy stages in strict order',()=>{
 assert.deepEqual(PHILOSOPHY.map(x=>x.key),['People','Purpose','Requirement','Journey','Experience','Moments']);
 assert.match(STORY_DEFAULTS.storyOriginBody,/DreamTrawell Destination venture/);
 assert.match(STORY_DEFAULTS.storyBeliefTitle,/People first/);
 assert.equal(storyText({},'storyPromise'),STORY_DEFAULTS.storyPromise);
 assert.equal(storySteps({philosophyPeople:'Personal listening'})[0].copy,'Personal listening');
 assert.match(storySteps({})[5].copy,/conversation/);
});
test('new CMS fields stay optional, sanitized, under limits and migrate without deleting old content',()=>{
 assert(STORY_FIELDS.every(k=>CONTENT_FIELDS.pages.includes(k)));
 assert(STORY_IMAGE_FIELDS.every(k=>STORY_TEXT_LIMITS[k]===1700));
 const original={title:'Our Story',slug:'our-story',summary:'People first',description:'Established editorial introduction',storyHeroLead:'Original custom story'};
 const result=validateContent('pages',original,'published',{previouslyPublished:true});
 assert.equal(result.description,original.description);
 assert.equal(result.storyHeroLead,original.storyHeroLead);
 assert.equal(result.philosophyPeople,'');
 assert.equal(result.status,'published');
 assert.throws(()=>validateContent('pages',{...original,storyHeroImage:'javascript:alert(1)'},'draft'),/HTTPS/);
 assert.throws(()=>validateContent('pages',{...original,philosophyPeople:'x'.repeat(901)},'draft'),/too long/i);
});
test('story photography accepts only HTTPS and records licence metadata when imported',()=>{
 assert.equal(storyPhoto({storyHeroImage:'http://wrong.test'},'storyHeroImage'),'');
 assert.equal(storyPhoto({storyHeroImage:'https://media.example/photo.webp'},'storyHeroImage'),'https://media.example/photo.webp');
 assert(file('src/lib/media-variants.mjs').includes("'storyHeroImage'"));
 assert(file('firestore.rules').includes("'storyOriginImage'"));
 assert(file('src/app/our-story/page.jsx').includes('data.imageCredits'));
});
test('story interaction supports keyboard navigation, reduced motion and no forced auto-step',()=>{
 const jsx=file('src/components/StoryPhilosophy.jsx');
 assert(jsx.includes('role="tablist"'));
 assert(jsx.includes('aria-selected={active===i}'));
 assert(jsx.includes('ArrowRight')&&jsx.includes('Home')&&jsx.includes('End'));
 assert(!jsx.includes('setInterval('));
 assert(file('src/components/PageMotion.jsx').includes('prefers-reduced-motion'));
 assert(file('src/components/story-experience.css').includes('prefers-reduced-motion'));
});
test('Admin brand editor has grouped controls while Firestore retains publisher review workflow',()=>{
 const jsx=file('src/components/admin/AdminConsole.jsx');
 assert(jsx.includes('STORY_EDITOR_GROUPS.map'));
 assert(jsx.includes('form.slug===\'our-story\''));
 assert(jsx.includes("mediaReviewStatus:'pending'"));
 assert(jsx.includes('Save Draft')&&jsx.includes('Publish to Website'));
 const rules=file('firestore.rules');assert(rules.includes('request.resource.data.status'));assert(rules.includes("'philosophyMoments'"));
});
test('journey detail generator includes interactive Day navigation with all tokens replaced',()=>{
 const template=file('src/templates/journey.html');
 const html=renderV51Journey(template,{journey:{slug:'j1',title:'A personal journey',destinationSlug:'singapore',summary:'Something meaningful',status:'published',itinerary:'Day 1: Arrival\nDay 2: Discover',nights:'1',days:'2',galleryImages:'',imageCredits:''},relatedExperiences:[]});
 assert(html.includes('id="tb-prev-day"'));
 assert(html.includes('id="tb-next-day"'));
 assert(html.includes('01 / 02'));
 assert(!html.includes('__TB_DAY_TOTAL__'));
});
test('experience detail provides descriptive, accessible section navigation',()=>{
 const html=file('src/templates/experience.html');
 assert(html.includes('aria-label="Experience sections"'));
 assert(html.includes('__TB_CREATE_URL__'));
 assert(html.includes('href="#experience-enquiry"'));
});
test('media acceptance reports missing published photos and never edits data',()=>{
 const record=Object.freeze({title:'Unfinished',slug:'unfinished',status:'published',heroImage:'',galleryImages:'',itinerary:'Day 1: A\nDay 2: B',dayImages:''});
 const result=auditMediaRecord('journeys',record);
 assert(result.missing.some(v=>v.includes('cover')));
 assert(result.missing.some(v=>v.includes('2 missing itinerary-day')));
 assert.equal(record.heroImage,'');
 const audit=auditMediaCatalogue({destinations:[],experiences:[],journeys:[record]});
 assert.equal(audit.checked,1);assert.equal(audit.needsAttention,1);
});
test('launch photo audit requires distinct galleries and licence documentation',()=>{
 const source={slug:'d1',status:'published',title:'Example',heroImage:'https://example.org/cover.webp',galleryImages:'https://example.org/one.webp\nhttps://example.org/one.webp',storyImage1:'https://example.org/s1.webp',storyImage2:'https://example.org/s2.webp',storyImage3:'https://example.org/s3.webp'};
 const result=auditMediaRecord('destinations',source);
 assert(result.missing.some(v=>v.includes('gallery photograph')));
 assert(result.missing.some(v=>v.includes('licence documentation')));
 assert(!result.pass);
 const complete=auditMediaRecord('destinations',{...source,galleryImages:['one','two','three'].map(x=>`https://example.org/${x}.webp`).join('\n'),imageCredits:'Photographer | CC BY 4.0 | https://example.org/source'});
 assert(complete.pass);
});
test('approved logo is referenced from same unchanged canonical asset path',()=>{
 assert(file('src/components/PublicShell.jsx').includes('src="/trawellbeyond-logo.svg"'));
 assert(file('src/app/our-story/page.jsx').includes('storyClosingTitle'));
 assert(!file('src/components/CreateStudio.jsx').includes("||SG_PHOTOS.skyline.url"));
});
