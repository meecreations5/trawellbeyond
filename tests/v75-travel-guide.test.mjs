import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateContent} from '../src/lib/content.mjs';
import {LAUNCH_STARTERS} from '../src/lib/launch-starters.mjs';
import {SINGAPORE_TRAVEL_GUIDE,SINGAPORE_VISITOR_GUIDES,fillMissingKnowledge} from '../src/lib/singapore-knowledge.mjs';
import {youtubeVideoId,renderTravelEssentials,renderVisitGuide,renderVideoPreview} from '../src/lib/travel-guide.mjs';
import {renderV51Destination} from '../src/lib/v51-details.mjs';
import {renderV51Experience} from '../src/lib/v51-experience.mjs';
const destTemplate=readFileSync(new URL('../src/templates/destination.html',import.meta.url),'utf8');
const exTemplate=readFileSync(new URL('../src/templates/experience.html',import.meta.url),'utf8');
const destination=LAUNCH_STARTERS.find(x=>x.type==='destinations'&&x.slug==='singapore');
const exp=slug=>LAUNCH_STARTERS.find(x=>x.type==='experiences'&&x.slug===slug);
const files={
 rules:readFileSync(new URL('../firestore.rules',import.meta.url),'utf8'),
 admin:readFileSync(new URL('../src/components/admin/AdminConsole.jsx',import.meta.url),'utf8'),
 browser:readFileSync(new URL('../public/video-preview-v75.js',import.meta.url),'utf8'),
 css:readFileSync(new URL('../public/travel-guide-v75.css',import.meta.url),'utf8'),
};
test('Singapore official travel guide and video appear within approved V5.1 destination template',()=>{
 assert.ok(destination.travelLanguages.includes('English'));
 assert.ok(destination.travelTransport.includes('MRT'));
 assert.equal(destination.travelVerifiedOn,'2026-11-09');
 assert.ok(destination.travelEntryUrl.startsWith('https://www.ica.gov.sg/'));
 assert.equal(youtubeVideoId(destination.videoUrl),'Idjvkpp5OlM');
 assert.doesNotThrow(()=>validateContent('destinations',destination,'published'));
 const html=renderV51Destination(destTemplate,{destination,experiences:[exp('gardens-by-the-bay')],journeys:[]});
 for(const required of ['id="destinationTitle"','id="travel-essentials"','BEFORE YOU GO / TRAVEL ESSENTIALS','Getting around','Food &amp; dining','Official entry requirements','data-tb-play-video','data-video-id="Idjvkpp5OlM"','video-preview-v75.js','travel-guide-v75.css'])assert.ok(html.includes(required),'Missing '+required);
 assert.ok(html.indexOf('id="travel-essentials"')<html.indexOf('id="before-you-go"'));
 assert.doesNotMatch(html,/__TB_[A-Z0-9_]+__/);
 assert.doesNotMatch(html,/<iframe[^>]*youtube/);
});
test('Four Singapore experience previews remain valid with new visit guidance',()=>{
 const slugs=['gardens-by-the-bay','marina-bay-waterfront','universal-studios-singapore','singapore-zoo'];
 for(const slug of slugs){
  const item=exp(slug);assert.ok(item,slug);
  assert.ok(item.visitSourceUrl?.startsWith('https://'),slug);
  assert.ok(item.gettingThere&&item.nearestTransit,slug);
  assert.doesNotThrow(()=>validateContent('experiences',item,'published'));
  const html=renderV51Experience(exTemplate,{experience:item,destination,relatedExperiences:[]});
  for(const text of ['id="experienceTitle"','id="plan-your-visit"','Nearest transport','Open directions','id="experience-enquiry"','data-tb-add-experience','video-preview-v75.js'])assert.ok(html.includes(text),slug+' missing '+text);
  assert.doesNotMatch(html,/__TB_[A-Z0-9_]+__/);
 }
 assert.ok(renderV51Experience(exTemplate,{experience:exp('gardens-by-the-bay'),destination}).includes('data-video-id="vNFly4xvAXo"'));
 assert.ok(renderV51Experience(exTemplate,{experience:exp('singapore-zoo'),destination}).includes('data-video-id="xl2R6MvMwjM"'));
});
test('YouTube validation rejects arbitrary domains, HTTP, invalid IDs and HTML injection',()=>{
 for(const bad of ['http://youtube.com/watch?v=vNFly4xvAXo','https://youtube.com.evil.test/watch?v=vNFly4xvAXo','https://evil.test/watch?v=vNFly4xvAXo','https://www.youtube.com/watch?v=short','javascript:alert(1)','https://youtube.com/watch?v=%22%3E%3Cscript%3E']){
  assert.equal(youtubeVideoId(bad),'');
  assert.throws(()=>validateContent('experiences',{...exp('gardens-by-the-bay'),videoUrl:bad},'draft'),/YouTube video/);
 }
 assert.equal(youtubeVideoId('https://youtu.be/vNFly4xvAXo?t=42'),'vNFly4xvAXo');
 assert.equal(youtubeVideoId('https://www.youtube.com/shorts/vNFly4xvAXo'),'vNFly4xvAXo');
 const html=renderVideoPreview({...exp('gardens-by-the-bay'),videoTitle:'<img src=x onerror=alert(1)>'});
 assert.doesNotMatch(html,/<img src=x/);
 assert.match(html,/&lt;img/);
 assert.doesNotMatch(html,/<iframe/);
});
test('Travel-guide links are HTTPS only; empty pages stay visually clean',()=>{
 assert.equal(renderTravelEssentials({}), '');
 assert.equal(renderVisitGuide({}), '');
 assert.equal(renderVideoPreview({videoUrl:'https://example.com/video'}),'');
 const html=renderVisitGuide({nearestTransit:'MRT',mapUrl:'javascript:alert(1)',visitSourceUrl:'http://example.com'});
 assert.doesNotMatch(html,/href=/);
 assert.match(html,/MRT/);
});
test('Starter merge never overwrites published custom content',()=>{
 const old={slug:'singapore',status:'published',travelLanguages:'Custom business approved line',videoUrl:''};
 const {record,added}=fillMissingKnowledge(old,SINGAPORE_TRAVEL_GUIDE);
 assert.equal(record.travelLanguages,old.travelLanguages);
 assert.equal(record.status,'published');
 assert.equal(record.travelEntryUrl,SINGAPORE_TRAVEL_GUIDE.travelEntryUrl);
 assert.ok(added.includes('travelEntryUrl'));
 assert.ok(!added.includes('travelLanguages'));
});
test('Firestore rules, CMS form and source scripts support guide/video fields with no Admin SDK',()=>{
 for(const field of ['travelLanguages','travelFood','travelEntry','travelVerifiedOn','mapUrl','visitVerifiedOn','videoUrl','videoTitle','videoCredit']){
  assert.ok(files.rules.includes(`'${field}'`),'rules missing '+field);
  assert.ok(files.admin.includes(field),'admin missing '+field);
 }
 assert.ok(files.admin.includes('Fill missing travel / video guidance'));
 assert.ok(files.admin.includes('a-knowledge-panel'));
 assert.ok(files.browser.includes('youtube-nocookie.com'));
 assert.ok(files.browser.includes('document.addEventListener'));
 assert.ok(files.css.includes('@media(max-width:580px)'));
 assert.doesNotMatch(files.admin,/firebase-admin[\/'"]/);
});
