import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {destinationRegion,destinationSections,normalizeRegionFilter} from '../src/lib/destination-region.mjs';
import {visitorAuthErrorMessage} from '../src/lib/visitor-auth-errors.mjs';
const read=path=>readFileSync(path,'utf8');

test('published CMS regions are segregated without rewriting records',()=>{
 const records=[
  {slug:'kerala',title:'Kerala',region:'India'},
  {slug:'singapore',title:'Singapore',region:'International'},
  {slug:'himachal-pradesh',title:'Himachal',region:'Domestic'},
  {slug:'bali',title:'Bali'},
  {slug:'new-unknown',title:'New place'},
 ];
 assert.equal(destinationRegion(records[0]),'domestic');
 assert.equal(destinationRegion(records[1]),'international');
 assert.equal(destinationRegion(records[2]),'domestic');
 assert.equal(destinationRegion(records[3]),'international');
 assert.equal(destinationRegion(records[4]),'unclassified');
 const groups=destinationSections(records);
 assert.deepEqual(groups.domestic.map(x=>x.slug),['kerala','himachal-pradesh']);
 assert.deepEqual(groups.international.map(x=>x.slug),['singapore','bali']);
 assert.deepEqual(groups.unclassified.map(x=>x.slug),['new-unknown']);
 assert.equal(normalizeRegionFilter('domestic'),'domestic');
 assert.equal(normalizeRegionFilter('other'),'all');
});

test('destination UI has working server-driven International and Domestic filters',()=>{
 const source=read('src/app/destinations/page.jsx');
 const catalogue=read('src/components/DestinationCatalogue.jsx');
 assert.match(source,/searchParams/);
 assert.match(source,/normalizeRegionFilter/);
 assert.match(catalogue,/\/destinations\?region=\$\{key\}/);
 assert.match(catalogue,/Domestic · India/);
 assert.match(catalogue,/sections\[g.key\]/);
 assert.match(catalogue,/aria-current/);
 const create=read('src/components/CreateStudio.jsx');
 assert.match(create,/destinationSections\(destinations\)/);
 assert.match(create,/visibleDestinations\.map/);
 assert.match(create,/aria-pressed=\{destinationScope===option.key\}/);
});

test('a deterministic chatbot anchor supports both hydration and no-JS fallback',()=>{
 const shell=read('src/components/PublicShell.jsx');
 assert.match(shell,/<a className="tb-concierge" href="\/enquire" data-tb-assistant-trigger/);
 assert.doesNotMatch(shell,/<button className="tb-concierge"/);
 assert.match(read('public/v82-companion.js'),/event\.target\.closest\('\[data-tb-assistant-trigger\]'\)/);
});

test('disabled Firebase account creation is explained instead of exposing a raw error code',()=>{
 for(const code of ['auth/admin-restricted-operation','auth/operation-not-allowed']){
  const message=visitorAuthErrorMessage({code});
  assert.match(message,/visitor access is temporarily unavailable/);
  assert.doesNotMatch(message,/Firebase|Authentication|Anonymous/);
  assert.doesNotMatch(message,/auth\//);
 }
 assert.match(visitorAuthErrorMessage({code:'auth/too-many-requests'}),/too many/);
 assert.match(visitorAuthErrorMessage({code:'auth/network-request-failed'}),/connection/);
 const enquiries=read('src/lib/enquiries-web.js');
 assert.match(enquiries,/visitorAuthErrorMessage\(err\)/);
 assert.match(enquiries,/signInAnonymously\(auth\)/);
 assert.match(enquiries,/ownerUid:user\.uid/);
 assert.match(read('firestore.rules'),/d.ownerUid == request.auth.uid/);
});


test('Experience Discovery and Journey Match respect published destination region metadata',()=>{
 const discovery=read('src/components/ExperienceDiscovery.jsx');
 const route=read('src/app/experiences/page.jsx');
 const matcher=read('src/components/v82/JourneyMatch.jsx');
 assert.match(route,/destinationsMeta=\{destinationsMeta\}/);
 assert.match(discovery,/regionBySlug\.get\(item\.destinationSlug\)/);
 assert.match(discovery,/Domestic · India/);
 assert.match(matcher,/catalog\.journeys\.filter\(j=>inRegion\(j,'journeys'\)\)/);
 assert.match(matcher,/Explore journeys by destination region/);
});


test('Journeys listing also separates domestic and international journeys by its parent destination',()=>{
 const route=read('src/app/journeys/page.jsx');
 const component=read('src/components/JourneyCatalogue.jsx');
 assert.match(route,/searchParams/);
 assert.match(route,/JourneyCatalogue items=\{items\} destinations=\{destinations\}/);
 assert.match(component,/bySlug\.get\(j\.destinationSlug\)/);
 assert.match(component,/\/journeys\?region=\$\{x\.key\}/);
});
