import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderV51Experience} from '../src/lib/v51-experience.mjs';
const read=name=>readFileSync(new URL(`../${name}`,import.meta.url),'utf8');
const template=read('src/templates/experience.html');
const render=extras=>renderV51Experience(template,{experience:{slug:'island-day',title:'Island Day',destinationSlug:'thailand',summary:'Beaches and coastal scenery',highlights:'Beaches\nBoat trip\nWater activities\nFree time',...extras},destination:{slug:'thailand',title:'Thailand'}});

test('CREATE uses a single scoped progress track, not old wildcard span styling',()=>{
 const code=read('src/components/CreateStudio.jsx'),css=read('src/components/create-studio.css');
 assert.match(code,/count=\{0\} label="Journey builder progress"/);
 assert.doesNotMatch(css,/\.cr-progress-meter span\{/);
 assert.match(css,/\.cr-v812-meter \.tb-v81-line-fill\{/);
 assert.match(css,/\.cr-steps button\.active/);
 assert.match(css,/@media\(max-width:640px\)/);
});

test('purpose chooser is people-first and has an accessible selection state',()=>{
 const code=read('src/components/CreateStudio.jsx');
 assert.match(code,/role="group" aria-label="Choose the reason for your journey"/);
 assert.match(code,/aria-pressed=\{purpose===id\}/);
 assert.match(code,/const options=\[/);
 assert.match(code,/More time together/);
 assert.match(code,/PurposeArtwork/);
 assert.doesNotMatch(code,/SG_PHOTOS\./);
 assert.match(code,/We will help you discover what fits/);
 assert.match(code,/submitEnquiry\(/);
});

test('four experience highlights are rendered as four content cards without filler cells',()=>{
 const html=render({heroImage:''});
 assert.equal((html.match(/class="ex-highlight rise"/g)||[]).length,4);
 assert.match(html,/class="ex-highlights-layout without-media"/);
 assert.doesNotMatch(html,/class="ex-highlight-media/);
 assert.match(html,/Include this experience in my journey/);
 assert.doesNotMatch(html,/__TB_[A-Z0-9_]+__/);
});

test('experience editorial image only appears when it belongs to the experience',()=>{
 const html=render({heroImage:'https://images.example.org/island.jpg',galleryImages:'https://images.example.org/coast.jpg'});
 assert.match(html,/class="ex-highlights-layout with-media"/);
 assert.match(html,/class="ex-highlight-media rise"/);
 assert.match(html,/src="https:\/\/images\.example\.org\/coast\.jpg"/);
 assert.match(html,/loading="lazy" decoding="async"/);
 assert.match(html,/Island Day - experience preview/);
});

test('highlight section has 2-column composition, mobile stack, reduced-motion and focus styles',()=>{
 const css=read('public/experience-detail.css');
 assert.match(css,/\.ex-highlights-layout\.with-media\{grid-template-columns/);
 assert.match(css,/\.ex-highlight-grid\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/\.ex-highlight-grid>\.ex-highlight:last-child:nth-child\(odd\)/);
 assert.match(css,/@media\(max-width:740px\)/);
 assert.match(css,/\.ex-highlights-foot a:focus-visible/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test('broken published highlight media collapses gracefully rather than leaving a blank panel',()=>{
 const source=read('public/experience-detail.js');
 assert.match(source,/highlightPhoto\.addEventListener\('error',hideFailedPhoto/);
 assert.match(source,/layout\?\.classList\.remove\('with-media'\)/);
 assert.match(source,/layout\?\.classList\.add\('without-media'\)/);
 assert.match(read('public/experience-detail.css'),/scroll-margin-top:75px/);
});
