import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const get=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const experience=get('../src/templates/experience.html');
const destination=get('../src/templates/destination.html');
const journey=get('../src/templates/journey.html');
const css=get('../public/sg-gallery.css');
const js=get('../public/sg-gallery.js');
test('all three public gallery templates load the viewer stylesheet before its script',()=>{
 for(const [name,html] of Object.entries({experience,destination,journey})){
  assert.match(html,/<link[^>]+href="\/sg-gallery\.css"/i,`${name} missing viewer styles`);
  assert.match(html,/<script[^>]+src="\/sg-gallery\.js"/i,`${name} missing viewer interactions`);
  assert.ok(html.indexOf('sg-gallery.css')<html.indexOf('sg-gallery.js'),`${name}: CSS must load before JS`);
 }
});
test('lightbox bounds its image to the viewport and keeps its caption in overlay',()=>{
 assert.match(css,/\.tb-lightbox\{[\s\S]*?position:fixed;inset:0/);
 assert.match(css,/grid-template-rows:minmax\(0,1fr\) auto/);
 assert.match(css,/\.tb-lightbox__image\{[\s\S]*?object-fit:contain/);
 assert.match(css,/\.tb-lightbox\[hidden\][\s\S]*?display:none!important/);
 assert.match(js,/tb-lightbox__stage/);
 assert.match(js,/tb-lightbox__details/);
});
test('viewer supports keyboard controls and restores focus, without exposing publication changes',()=>{
 assert.match(js,/e.key==='Escape'/);
 assert.match(js,/e.key==='ArrowRight'/);
 assert.match(js,/e.key==='Tab'/);
 assert.match(js,/lastFocus.focus\(\)/);
 assert.match(js,/document.documentElement.classList.add\('tb-gallery-open'\)/);
});
