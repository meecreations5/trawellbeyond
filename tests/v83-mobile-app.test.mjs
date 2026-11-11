import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderSiteChrome} from '../src/lib/site-chrome.mjs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');

test('The mobile dock is rendered in React without client-only initial markup changes',()=>{
 const shell=read('../src/components/PublicShell.jsx');
 const dock=read('../src/components/MobileAppDock.jsx');
 assert.match(shell,/MobileAppDock/);
 assert.match(dock,/usePathname/);
 assert.match(dock,/data-tb-assistant-trigger="true"/);
 assert.match(dock,/aria-current/);
 assert.doesNotMatch(dock,/Date\.now|Math\.random|window\.location\.pathname/);
 for(const url of ['\/','\/destinations','\/create','\/my-journey','\/enquire'])assert.ok(dock.includes(url));
});

test('The approved original HTML templates receive the same app assets at render time',()=>{
 const base=read('../public/index.html');
 const result=renderSiteChrome(base,{},false);
 assert.match(result,/\/mobile-app\.css/);
 assert.match(result,/\/mobile-app-dock\.js/);
 assert.match(result,/tb-app-discover-links/);
 assert.equal(result.match(/\/mobile-app-dock\.js/g)?.length,1);
 const detail=renderSiteChrome(read('../src/templates/destination.html'),{},true);
 assert.match(detail,/\/mobile-app-dock\.js/);
 assert.match(detail,/\/v82-companion\.js/);
});

test('Mobile CSS is isolated, safe-area aware, keyboard friendly, and hides dock for open dialogs',()=>{
 const css=read('../public/mobile-app.css');
 assert.match(css,/@media \(max-width:850px\)/);
 assert.match(css,/@media \(min-width:851px\)/);
 assert.match(css,/safe-area-inset-bottom/);
 assert.match(css,/\.tb-app-dock/);
 assert.match(css,/body\.tb-v82-open/);
 assert.match(css,/body:has\(input:focus\)/);
 assert.match(css,/prefers-reduced-motion/);
 assert.equal(css,read('../src/app/mobile-app.css'));
});

test('Standalone navigation uses real links and an existing assistant trigger',()=>{
 const script=read('../public/mobile-app-dock.js');
 assert.match(script,/document\.createElement\('nav'\)/);
 assert.match(script,/dataset\.tbAssistantTrigger='true'/);
 assert.match(script,/href=paths\[id\]\|\|'\/enquire'/);
 assert.match(script,/tb-app-dock/);
 assert.doesNotMatch(script,/innerHTML\s*=\s*location\.|document\.write/);
});

test('Desktop logo assets and Firebase files are not part of the mobile-only source changes',()=>{
 const shell=read('../src/components/PublicShell.jsx');
 assert.match(shell,/\/trawellbeyond-logo\.svg/);
 const code=read('../src/components/MobileAppDock.jsx');
 assert.match(code,/\/assets\/trawellbeyond-accent-motif\.svg/);
 assert.doesNotMatch(code,/firebase|submitEnquiry|setDoc|deleteDoc/);
});
