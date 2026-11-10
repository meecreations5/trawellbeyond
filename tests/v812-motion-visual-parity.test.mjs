import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {INTRO_SESSION_KEY,MOTION_DURATION_MS} from '../src/lib/motion-policy.mjs';
import {renderV51Experience} from '../src/lib/v51-experience.mjs';
const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
test('same signature identity triggers on static HTML and React without modifying approved logo',()=>{
 const staticCode=read('public/v81-motion.js');
 const reactCode=read('src/components/motion/BrandReveal.jsx');
 const css=read('public/v81-motion.css');
 const sha=x=>createHash('sha256').update(readFileSync(new URL(`../${x}`,import.meta.url))).digest('hex');
 assert.equal(sha('public/assets/trawellbeyond-display.svg'),'06bdaa3267c1e35d113a8b4218b0ac8c7d98180776cf678f59c403da43b43149');
 assert.equal(sha('public/assets/trawellbeyond-master.svg'),'799a9fe32266ba8afffb9edf0ba392983c4cddc433626fdff4166d89e0333e58');
 assert.equal(INTRO_SESSION_KEY,'tb_intro_seen_v812');
 assert.equal(MOTION_DURATION_MS.welcome,1750);
 for(const part of ['tb-v81-reveal-inner','tb-v81-reveal-logo','tb-v81-welcome-line']){
  assert.ok(staticCode.includes(part),part);assert.ok(reactCode.includes(part),part);
 }
 for(const asset of ['trawellbeyond-display.svg']){
  assert.ok(staticCode.includes(asset));assert.ok(reactCode.includes(asset));
 }
 assert.match(staticCode,/previewLogo/);assert.match(reactCode,/previewLogo/);
 assert.match(css,/@keyframes tb-v812-logo-reveal/);
 assert.doesNotMatch(staticCode,/tb-v81-reveal-accent/); // Avoid a distracting second logo arrow above the approved SVG.
 assert.match(css,/clip-path:inset/);
 assert.match(css,/pointer-events:none/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.doesNotMatch(css,/bottom:clamp\(94px/);
});
test('CREATE has distinct progress meter not inheriting previous rules',()=>{
 const code=read('src/components/CreateStudio.jsx'),css=read('src/components/create-studio.css');
 assert.match(code,/className="cr-v812-meter"/);
 assert.doesNotMatch(code,/className="cr-progress-meter cr-v81-progress"/);
 assert.match(css,/\.cr-studio \.cr-v812-meter\{/);
 assert.match(css,/\.cr-v812-meter \.tb-v81-line-nodes\{display:none/);
 assert.match(code,/data-tb-ui-version="v8\.1\.2"/);
});
test('real experience renderer uses revised highlights and verifiable DOM marker',()=>{
 const template=read('src/templates/experience.html');
 const html=renderV51Experience(template,{experience:{slug:'island-trip',title:'Island trip',summary:'Explore the coastline',destinationSlug:'thailand',highlights:'Boats\nBeaches\nRelax\nViews'},destination:{title:'Thailand',slug:'thailand'}});
 assert.match(html,/data-tb-ui-version="v8\.1\.2"/);
 assert.match(html,/ex-highlights-layout without-media/);
 assert.equal((html.match(/class="ex-highlight rise"/g)||[]).length,4);
 assert.doesNotMatch(html,/__TB_[A-Z0-9_]+__/);
});
