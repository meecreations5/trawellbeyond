import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {clampMotionProgress,postcardDestination,samePostcard,INTRO_SESSION_KEY,POSTCARD_SESSION_KEY} from '../src/lib/motion-policy.mjs';
const read=path=>readFileSync(path,'utf8');
const css=read('public/v81-motion.css'), adapter=read('public/v81-motion.js');
test('approved master and display SVG bytes remain locked',()=>{
 const sha=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
 assert.equal(sha('public/assets/trawellbeyond-master.svg'),'799a9fe32266ba8afffb9edf0ba392983c4cddc433626fdff4166d89e0333e58');
 assert.equal(sha('public/assets/trawellbeyond-display.svg'),'06bdaa3267c1e35d113a8b4218b0ac8c7d98180776cf678f59c403da43b43149');
});
test('home and all standalone detail templates use the identical motion layer',()=>{
 for(const file of ['public/index.html','src/templates/destination.html','src/templates/journey.html','src/templates/experience.html']){
  const html=read(file);assert.match(html,/\/v81-motion.css/);assert.match(html,/\/v81-motion.js/);
 }
});
test('React public pages load motion stylesheet and non-blocking logo component',()=>{
 assert.match(read('src/app/layout.jsx'),/\/v81-motion.css/);
 assert.match(read('src/components/PublicShell.jsx'),/BrandReveal/);
 const source=read('src/components/motion/BrandReveal.jsx');
 assert.match(source,/trawellbeyond-display.svg/);assert.match(source,/sessionStorage/);assert.match(source,/prefers-reduced-motion/);
 assert.doesNotMatch(source,/window\.location\.assign|window\.location\.replace|overflow\s*:\s*hidden/);
});
test('signature welcome never blocks pointer or keyboard interaction',()=>{
 assert.match(css,/\.tb-v81-brand-reveal\{[^}]*pointer-events:none/);
 assert.match(adapter,/aria-hidden/);assert.match(adapter,/tb_intro_seen_v812/);
 assert.match(adapter,/setTimeout\(\(\)=>node.remove\(\),1750\)/);
});
test('progress handles invalid, low and high values',()=>{
 for(const [v,n] of [[-1,0],[0,0],[.375,.375],[1,1],[2,1],[NaN,0],[Infinity,0],['.5',.5]])assert.equal(clampMotionProgress(v),n);
});
test('postcard destination matcher allows only supported CMS slug paths',()=>{
 assert.deepEqual(postcardDestination('/destinations/singapore'),{kind:'destinations',slug:'singapore'});
 assert.deepEqual(postcardDestination('/journeys/singapore-family'),{kind:'journeys',slug:'singapore-family'});
 assert.deepEqual(postcardDestination('/experiences/marina-bay'),{kind:'experiences',slug:'marina-bay'});
 for(const candidate of ['/admin','/create','/destinations/../../admin','/destinations/space name','/journeys/','/offers/deal'])assert.equal(postcardDestination(candidate),null);
});
test('postcards only match identical destination kind and slug',()=>{
 assert.equal(samePostcard({kind:'destinations',slug:'singapore'},{kind:'destinations',slug:'singapore'}),true);
 assert.equal(samePostcard({kind:'journeys',slug:'singapore'},{kind:'destinations',slug:'singapore'}),false);
 assert.equal(samePostcard(null,null),false);
});
test('HTML adapter captures intent without delaying navigation',()=>{
 assert.match(adapter,/pointerdown/);assert.match(adapter,/keydown/);assert.match(adapter,/source\.kind!==m\[1\]/);
 assert.doesNotMatch(adapter,/preventDefault\(|stopPropagation\(|stopImmediatePropagation\(/);
 assert.equal(INTRO_SESSION_KEY,'tb_intro_seen_v812');assert.equal(POSTCARD_SESSION_KEY,'tb_postcard_v81');
});
test('React listing captures postcard identity for standalone detail pages',()=>{
 const code=read('src/components/PageMotion.jsx');assert.match(code,/a\.tb-card\[href\]/);
 assert.match(code,/POSTCARD_SESSION_KEY/);assert.match(code,/postcardDestination/);
});
test('Story has six accessible chapter anchors and progressive section navigation',()=>{
 const page=read('src/app/our-story/page.jsx');
 for(const id of ['story-top','our-beginning','what-we-believe','the-people','your-chapter'])assert.match(page,new RegExp(id));
 assert.match(read('src/components/StoryPhilosophy.jsx'),/our-philosophy/);
 const rail=read('src/components/motion/ChapterProgress.jsx');assert.match(rail,/aria-label="Our Story chapters"/);assert.match(rail,/aria-current/);
});
test('philosophy preserves keyboard tab semantics and uses shared journey line',()=>{
 const code=read('src/components/StoryPhilosophy.jsx');
 for(const text of ['role="tablist"','role="tab"','role="tabpanel"','ArrowRight','ArrowLeft','Home:0','End:steps.length-1','<JourneyLine'])assert.ok(code.includes(text),`Missing ${text}`);
});
test('CREATE uses original four stages, validated submission and shared motion line',()=>{
 const code=read('src/components/CreateStudio.jsx');
 assert.match(code,/const stages=\['Your purpose','Your destination','Your preferences','Your enquiry'\]/);
 assert.match(code,/className="cr-v812-meter"/);
 assert.match(code,/if\(!result\?\.ok\)throw/);
 assert.match(code,/setReference\(result.id/);
 assert.match(code,/No online payment or booking takes place/);
});
test('shared tray retains storage and event contract while allowing save/remove',()=>{
 const code=read('public/journey-tray.js');assert.match(code,/tb_journey_v73/);
 assert.match(code,/tb:journey-updated/);assert.match(code,/tb:journey-updated/);
 assert.match(code,/aria-pressed/);assert.match(code,/removed from My Journey/);
 assert.match(code,/tb-v81-save-pulse/);
 assert.match(code,/window\.TBJourneyTray=\{/);
});
test('branded states keep error and success separate, with truthful enquiry confirmation',()=>{
 const component=read('src/components/motion/BrandedState.jsx'),enquiry=read('src/components/InquiryForm.jsx');
 assert.match(component,/tb-v81-state-\$\{kind\}/);
 assert.match(component,/role=\{kind==='error'\?'alert':'status'\}/);
 assert.match(enquiry,/BrandedState kind="loading"/);
 assert.match(enquiry,/BrandedState kind="success"/);
 assert.match(enquiry,/BrandedState kind="error"/);
 assert.match(enquiry,/if\(!result\?\.ok\)throw/);
});
test('motion respects reduce-motion, touch, transform-only line and static content',()=>{
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/@media\(hover:hover\) and \(pointer:fine\)/);
 assert.match(css,/transform-origin:left center/);
 assert.match(css,/pointer-events:none/);
 assert.doesNotMatch(css,/animation:[^;{}]+infinite/);
});
test('marketing visual identity remains charcoal and orange with unchanged logos',()=>{
 assert.match(css,/#ff751f/);assert.match(css,/#1a1a1a/);
 assert.doesNotMatch(read('public/v81-motion.js'),/\.innerHTML\s*=.*<svg/);
});
test('Admin routes are not affected by motion adapter or React shell',()=>{
 assert.match(adapter,/location\.pathname\.startsWith\('\/admin'\)/);
 assert.match(read('src/components/PublicShell.jsx'),/pathname\?\.startsWith\('\/admin'\)/);
});
test('browser-native cross-document transitions are restricted to public standalone templates',()=>{
 assert.doesNotMatch(read('public/v81-motion.css'),/@view-transition/);
 assert.doesNotMatch(read('src/app/layout.jsx'),/v81-page-transitions.css/);
 assert.match(read('public/v81-page-transitions.css'),/@view-transition\{navigation:auto\}/);
 for(const file of ['public/index.html','src/templates/destination.html','src/templates/experience.html','src/templates/journey.html']){
  assert.match(read(file),/v81-page-transitions.css/);
 }
});
test('reused orange logo accent uses exact master path and clip geometry',()=>{
 const original=read('public/assets/trawellbeyond-display.svg');
 const derivative=read('public/assets/trawellbeyond-accent-motif.svg');
 const orangePath=source=>source.match(/<path fill="#ff751f" d="([^"]+)"/i)?.[1];
 assert.ok(orangePath(original));assert.equal(orangePath(derivative),orangePath(original));
 for(const id of ['c7a11ffa9c','21dd8d5d59','940a718247'])assert.ok(derivative.includes(id));
 for(const component of ['src/components/motion/ChapterProgress.jsx','src/components/motion/BrandedState.jsx','src/components/CreateStudio.jsx']){
  assert.match(read(component),/trawellbeyond-accent-motif.svg/);
 }
});
