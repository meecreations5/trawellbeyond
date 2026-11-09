import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LAUNCH_STARTERS} from '../src/lib/launch-starters.mjs';
import {renderV51Experience} from '../src/lib/v51-experience.mjs';
import {validateContent} from '../src/lib/content.mjs';
const htmlTemplate=readFileSync(new URL('../src/templates/experience.html',import.meta.url),'utf8');
const destination=LAUNCH_STARTERS.find(r=>r.type==='destinations'&&r.slug==='singapore');
const experienceRecords=LAUNCH_STARTERS.filter(r=>r.type==='experiences'&&r.destinationSlug==='singapore');
const checks={
 'gardens-by-the-bay':'gardensbythebay.com.sg',
 'marina-bay-waterfront':'visitsingapore.com',
 'universal-studios-singapore':'rwsentosa.com',
 'singapore-zoo':'mandai.com'
};
for(const [slug,officialDomain] of Object.entries(checks)){
 test(`Experience Details: ${slug} has working template, practical content, photos and CREATE context`,()=>{
  const item=experienceRecords.find(r=>r.slug===slug);assert.ok(item,'Missing Singapore experience '+slug);
  assert.ok(item.heroImage?.startsWith('https://'),'Hero image missing for '+slug);
  assert.ok(item.description.length>item.summary.length,'Description must be richer than summary');
  assert.ok(item.duration&&item.openingHours,'Practical information missing');
  assert.ok(item.officialUrl?.includes(officialDomain),'Official link incorrect');
  assert.doesNotThrow(()=>validateContent('experiences',item,'published'));
  const html=renderV51Experience(htmlTemplate,{experience:{...item,status:'published'},destination,relatedExperiences:experienceRecords});
  for(const required of ['id="experienceTitle"','id="experience-story"','id="highlights"','id="gallery"','id="practical"','id="experience-enquiry"','experienceEnquiryForm','data-tb-add-experience','src="/enquiry-bridge.bundle.js"','sg-gallery.css','sg-gallery.js']){
   assert.ok(html.includes(required),`Missing ${required} on ${slug}`);
  }
  assert.match(html,new RegExp(`experienceSlug=${slug}`));
  assert.match(html,/Opening \/ operating hours/);
  assert.match(html,/Typical duration/);
  assert.match(html,/Photography &amp; licences/);
  assert.doesNotMatch(html,/__TB_[A-Z0-9_]+__/);
  assert.doesNotMatch(html,/<script>alert\(/);
 });
}
test('all 16 Singapore experiences have detailed source-linked text and Commons candidates pending import',()=>{
 assert.equal(experienceRecords.length,16);
 for(const e of experienceRecords){
  assert.ok(e.description?.length>e.summary?.length,`${e.slug}: detailed description missing`);
  assert.ok(e.duration&&e.openingHours&&e.officialUrl,`${e.slug}: verified practical field missing`);
  assert.ok(e.highlights.split('\n').length>=3,`${e.slug}: highlights incomplete`);
  assert.equal(e.priceFrom,undefined,`${e.slug}: do not invent attraction prices`);
  validateContent('experiences',e,'draft');
 }
 assert.equal(experienceRecords.filter(e=>!e.heroImage).length,0,'Every experience needs a licensed candidate photo');
 assert.ok(experienceRecords.every(e=>e.heroImage.includes('commons.wikimedia.org')),'Candidates must remain unimported Commons sources');
});
