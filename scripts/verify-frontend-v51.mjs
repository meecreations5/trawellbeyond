import {readFile,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {renderV51Home} from '../src/lib/v51-home.mjs';
import {renderV51Destination,renderV51Journey} from '../src/lib/v51-details.mjs';

const root=process.cwd();
const references=[
 ['public/index.html',['id="discover"','id="moments"','id="destinations"','id="journeys"','id="purpose"','id="create"','id="worlds"','motion.js','home-routing.js']],
 ['docs/v51-reference/singapore.html',['destination-hero','id="experiences"','id="travel-style"','id="journeys"','experience.js']],
 ['docs/v51-reference/singapore-journey.html',['id="itinerary"','id="personalize"','id="enquiryDrawer"','experience.js']],
 ['src/templates/destination.html',['__TB_HERO_HEADING__','__TB_EXPERIENCE_TILES__','__TB_FEATURE_JOURNEY__']],
 ['src/templates/journey.html',['__TB_JOURNEY_HEADING__','__TB_DAY_BUTTONS__','__TB_INTEREST_CHECKBOXES__']]
];
for(const [file,markers] of references){
 const raw=await readFile(join(root,file));const str=raw.toString('utf8');
 for(const marker of markers)assert.ok(str.includes(marker),`${file} missing ${marker}`);
 console.log(`${file}: ${raw.length} bytes, sha256 ${createHash('sha256').update(raw).digest('hex').slice(0,12)}; ${markers.length} markers`);
}
for(const asset of ['styles.css','motion.css','experience.css','app.js','motion.js','home-routing.js','experience.js','assets/trawellbeyond-master.svg','assets/trawellbeyond-display.svg'])
 assert.ok((await stat(join(root,'public',asset))).size>0,`Missing ${asset}`);
const h=renderV51Home((await readFile(join(root,'public/index.html'))).toString(),{destinations:[],journeys:[]});
assert.ok(h.includes('cms-empty')&&h.includes('tb-cms-data'));
const d=renderV51Destination(await readFile(join(root,'src/templates/destination.html'),'utf8'),{destination:{title:'Dubai',slug:'dubai',summary:'Discover Dubai'}});
assert.ok(d.includes('Discover Dubai')&&!d.includes('__TB_'));
const j=renderV51Journey(await readFile(join(root,'src/templates/journey.html'),'utf8'),{journey:{title:'Dubai Family Holiday',slug:'family-holiday',summary:'Family trip',itinerary:'Day 1: Arrival | Settling in'}});
assert.ok(j.includes('Dubai Family Holiday')&&!j.includes('__TB_'));
console.log('Approved frontend assets and dynamic V5.1 CMS templates verified.');
