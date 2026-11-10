import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderV51Destination,renderV51Journey} from '../src/lib/v51-details.mjs';
const file=rel=>readFileSync(new URL('../'+rel,import.meta.url),'utf8');
const destinationTemplate=file('src/templates/destination.html');
const journeyTemplate=file('src/templates/journey.html');

test('destination Save and Explore actions have distinct, accessible layout and correct destinations',()=>{
 const html=renderV51Destination(destinationTemplate,{
  destination:{title:'Singapore',slug:'singapore',summary:'Explore at your pace',description:'City of possibility.'},
  journeys:[{title:'Singapore at your pace',slug:'singapore-at-your-pace',featured:true}]
 });
 assert.match(html,/class="tb-intro-actions" role="group" aria-label="Ways to explore Singapore"/);
 assert.match(html,/class="tb-intro-primary" href="\/journeys\/singapore-at-your-pace"/);
 assert.match(html,/class="tb-inline-add tb-intro-save" data-tb-add-destination/);
 assert.match(html,/>\+ Save Singapore to My Journey<\/button><\/div>/);
 assert(!html.includes('</button><a class="text-action"')); // regression: glued controls
 assert(html.indexOf('Explore a curated journey')<html.indexOf('Save Singapore to My Journey'));
});

test('destinations without published journey still offer CREATE and a working tray action',()=>{
 const html=renderV51Destination(destinationTemplate,{
  destination:{title:'Turkey',slug:'turkey',summary:'Discover Turkey'}
 });
 assert.match(html,/class="tb-intro-primary" href="\/enquire\?destination=Turkey"/);
 assert.match(html,/Start creating your journey/);
 assert.match(html,/data-tb-slug="turkey"/);
});

test('logo change is limited to journey pages and artwork is unchanged',()=>{
 const css=file('public/experience.css');
 assert.match(css,/\.package-page \.brand-link img\{width:234px/);
 assert.match(css,/@media\(max-width:760px\)\{\.package-page \.brand-link img\{width:clamp\(174px,50vw,198px\)/);
 assert(!css.includes('.destination-page .brand-link img{width:234px'));
 const journey=renderV51Journey(journeyTemplate,{journey:{title:'A Singapore Journey',slug:'sg-journey',destinationSlug:'singapore',summary:'Made for you'}});
 assert.match(journey,/class="brand-link"/);
 assert.match(journey,/src="\/assets\/trawellbeyond-display\.svg"/);
});

test('action group respects mobile widths, focus visibility and reduced-motion settings',()=>{
 const css=file('public/experience.css');
 assert.match(css,/\.destination-page \.tb-intro-actions\{display:flex/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/\.destination-page \.tb-intro-actions :is\(a,button\):focus-visible/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.destination-page \.tb-intro-actions/);
 assert.match(file('public/journey-tray.js'),/data-tb-add-destination/);
});
