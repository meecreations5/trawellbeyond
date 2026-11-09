import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { galleryButton } from '../src/lib/photo-credits.mjs';
import { renderV51Journey } from '../src/lib/v51-details.mjs';

const galleryCss=readFileSync(new URL('../public/sg-gallery.css',import.meta.url),'utf8');
const experienceCss=readFileSync(new URL('../public/experience.css',import.meta.url),'utf8');

// Earlier: scenic::after used inset:0, turning the white EXPAND label into
// an opaque full-image block on the large Singapore journey gallery tile.
test('gallery overlay is restricted to the bottom-right label',()=>{
  assert.match(experienceCss,/\.scenic::after\{[^}]*inset:0/);
  assert.match(galleryCss,/\.tb-gallery-trigger::after\{[^}]*inset:auto 15px 15px auto/);
  assert.match(galleryCss,/\.tb-gallery-trigger::after\{[^}]*width:max-content/);
  assert.match(galleryCss,/\.tb-gallery-trigger::after\{[^}]*height:auto/);
});

test('journey photography tiles do not inherit scenic full-panel overlays',()=>{
  const button=galleryButton('https://example.org/photo.jpg','Singapore view',0,{className:'gallery-main rise'});
  assert.match(button,/class="tb-gallery-trigger gallery-main rise"/);
  assert.doesNotMatch(button,/class="[^"]*\bscenic\b/);
  const input={title:'Singapore at your pace',slug:'singapore-at-your-pace',destination:'Singapore',heroImage:'https://example.org/hero.jpg',galleryImages:'https://example.org/photo1.jpg\nhttps://example.org/photo2.jpg\nhttps://example.org/photo3.jpg',nights:3,days:4};
  const template=readFileSync(new URL('../src/templates/journey.html',import.meta.url),'utf8');
  const html=renderV51Journey(template,{journey:input,site:{}});
  assert.match(html,/class="tb-gallery-trigger gallery-main rise"/);
  assert.doesNotMatch(html,/class="tb-gallery-trigger [^"]*scenic/);
  assert.match(html,/class="gallery-side"/);
});
