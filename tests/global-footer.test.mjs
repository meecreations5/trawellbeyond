import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderGlobalFooter} from '../src/lib/global-footer.mjs';
import {siteConfig,renderSiteChrome} from '../src/lib/site-chrome.mjs';
import {renderV51Home} from '../src/lib/v51-home.mjs';
import {renderV51Destination,renderV51Journey} from '../src/lib/v51-details.mjs';
import {renderV51Experience} from '../src/lib/v51-experience.mjs';
import {LAUNCH_STARTERS} from '../src/lib/launch-starters.mjs';

const source = path => readFile(new URL(`../${path}`,import.meta.url),'utf8');
const footer = html => html.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/i)?.[0]||'';
const settings=LAUNCH_STARTERS.find(item=>item.slug==='site-settings');
const destination={...LAUNCH_STARTERS.find(item=>item.type==='destinations'),status:'published'};
const journey={...LAUNCH_STARTERS.find(item=>item.type==='journeys'),status:'published'};
const experience={...LAUNCH_STARTERS.find(item=>item.type==='experiences'),status:'published'};

test('one footer HTML renderer is used by HTML and React routes',async()=>{
 const expected=renderGlobalFooter(siteConfig(settings));
 const htmls=[
  renderV51Home(await source('public/index.html'),{site:settings}),
  renderV51Destination(await source('src/templates/destination.html'),{destination,site:settings}),
  renderV51Journey(await source('src/templates/journey.html'),{journey,site:settings}),
  renderV51Experience(await source('src/templates/experience.html'),{experience,site:settings})
 ];
 for(const [i,html] of htmls.entries()){
  assert.equal(footer(html),expected,`route ${i} must use the same footer DOM`);
  assert.equal((html.match(/<footer\b/gi)||[]).length,1,`route ${i} must render exactly one footer`);
  assert.match(html,/href="\/global-footer\.css"/);
  assert.match(html,/id="tbFooterLinks"/);
  assert.doesNotMatch(html,/<footer class="tb-footer/);
 }
 const shell=await source('src/components/PublicShell.jsx');
 assert.match(shell,/renderGlobalFooter\(cfg\)/);
 assert.doesNotMatch(shell,/<footer className="tb-footer"/);
 const layout=await source('src/app/layout.jsx');
 assert.match(layout,/global-footer\.css/);
});

test('footer content updates globally through the published site-settings record',async()=>{
 const edited={...settings,siteFooterLine2:'Your own journeys, made personal',siteFooterEmail:'hello@example.com',siteFooterPhone:'+91 98765 43210',siteFooterCta:'Start a journey',siteFooterCompany:'TrawellBeyond',siteFooterLinks:'Destinations | /destinations\nFAQs | /faq'};
 const expected=renderGlobalFooter(siteConfig(edited));
 assert.match(expected,/Your own journeys, made personal/);
 assert.match(expected,/mailto:hello@example\.com/);
 assert.match(expected,/tel:\+919876543210/);
 assert.match(expected,/href="\/faq"/);
 assert.doesNotMatch(expected,/href="\/privacy"/);
 const html=renderSiteChrome(await source('public/index.html'),edited);
 assert.equal(footer(html),expected);
});

test('footer safely escapes CMS text and rejects unsafe navigation links',()=>{
 const dangerous={...settings,siteFooterLine1:'<script>alert(1)</script>',siteFooterCta:'<svg onload=alert(1)>',siteFooterLinks:'Click | javascript:alert(1)\nGood | /contact'};
 const html=renderGlobalFooter(siteConfig(dangerous));
 assert.match(html,/&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
 assert.match(html,/&lt;svg onload=alert\(1\)&gt;/);
 assert.doesNotMatch(html,/<script>|<svg|javascript:/);
 assert.match(html,/href="\/contact"/);
});
