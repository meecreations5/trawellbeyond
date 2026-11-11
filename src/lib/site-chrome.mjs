import {renderGlobalFooter,replaceGlobalFooter} from './global-footer.mjs';
/** One safe, public Website Settings record powers the approved V5.1 HTML
 * home/detail templates and the React-based content pages.
 */
export const DEFAULT_NAV=[
 ['Destinations','/destinations'],['Experiences','/experiences'],
 ['Journeys','/journeys'],['Journey Match','/journey-match'],['Our Story','/our-story'],['Contact','/contact']
];
export const DEFAULT_FOOTER=[
 ['Destinations','/destinations'],['Experiences','/experiences'],
 ['Journeys','/journeys'],['Journey Match','/journey-match'],['My Journey','/my-journey'],['My Enquiries','/my-enquiries'],['Offers','/offers'],['Our Story','/our-story'],
 ['Services','/services'],['FAQs','/faq'],['Contact','/contact'],
 ['Privacy','/privacy'],['Terms','/terms']
];
export const htmlEscape=value=>String(value??'').replace(/[&<>"']/g,ch=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[ch]));

export function validSiteHref(value){
 const v=String(value||'').trim();
 return /^\/(?!\/)[a-zA-Z0-9/_#?=&.%~-]*$/.test(v) && !v.includes('..') && !v.includes('\\');
}
export function parseLinks(input,fallback=DEFAULT_NAV,max=12){
 const lines=String(input||'').split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
 if(!lines.length)return fallback;
 const links=lines.slice(0,max).map(line=>{
  const [label,...remaining]=line.split('|');
  return [String(label||'').trim().slice(0,40),remaining.join('|').trim()];
 }).filter(([label,href])=>label && validSiteHref(href));
 return links.length?links:fallback;
}
const markLinks=(links)=>links.map(([label,href])=>`<a href="${htmlEscape(href)}">${htmlEscape(label)}</a>`).join('');
function replaceInner(html,id,value){
 const pattern=new RegExp(`(<([a-z][a-z0-9]*)[^>]*\\bid="${id}"[^>]*>)[\\s\\S]*?(<\\/\\2>)`,'i');
 return html.replace(pattern,(_all,opening,_tag,closing)=>opening+value+closing);
}
function safeEmail(value){
 const v=String(value||'').trim();
 return /^[^\s@<>]+@[^\s@<>]+\.[A-Za-z]{2,}$/.test(v)?v:'';
}
function safePhone(value){
 const v=String(value||'').trim();
 return /^[+0-9() \-]{7,25}$/.test(v)?v:'';
}
export function siteConfig(record={}){
 return {
  topLeft:record.siteTopLeft||'Travel \u2022 Journeys \u2022 Experiences',
  topRight:record.siteTopRight||'A DreamTrawell Destination Venture',
  headerCta:record.siteHeaderCta||'CREATE a journey',
  nav:parseLinks(record.siteNavLinks,DEFAULT_NAV,7),
  footerLinks:parseLinks(record.siteFooterLinks,DEFAULT_FOOTER,15),
  footerLine1:record.siteFooterLine1||'Travel \u2022 Journeys \u2022 Experiences',
  footerLine2:record.siteFooterLine2||'Created Around You.',
  footerCompany:record.siteFooterCompany||'A DreamTrawell Destination Venture',
  footerBottom:record.siteFooterBottom||'Enquiry-led travel. No online payments.',
  footerCta:record.siteFooterCta||'CREATE your journey',
  email:safeEmail(record.siteFooterEmail),
  phone:safePhone(record.siteFooterPhone)
 };
}
export function renderSiteChrome(source,record={},detail=false){
 const cfg=siteConfig(record);
 let html=source;
 html=replaceInner(html,'tbTopLeft',htmlEscape(cfg.topLeft));
 html=replaceInner(html,'tbTopRight',htmlEscape(cfg.topRight));
 html=replaceInner(html,'tbDesktopNav',markLinks(cfg.nav));
 const mobile=markLinks(cfg.nav)+(detail?`<a href="/create">${htmlEscape(cfg.headerCta)} &nearr;</a>`:`<button data-action="builder">${htmlEscape(cfg.headerCta)} &nearr;</button>`);
 html=replaceInner(html,detail?'navMobile':'tbMobileNav',mobile);
 if(!detail)html=replaceInner(html,'tbHeaderCta',htmlEscape(cfg.headerCta));
 // Replace the original homepage, destination, experience and journey footers
 // with ONE CMS-driven footer, regardless of each template's old markup.
 html=replaceGlobalFooter(html,renderGlobalFooter(cfg));
 // Share the Journey Tray across approved HTML templates without changing their layout.
 if(!html.includes('/journey-tray.css'))html=html.replace('</head>','<link rel="stylesheet" href="/journey-tray.css" />\n</head>');
 if(!html.includes('/journey-tray.js'))html=html.replace('</body>','<script src="/journey-tray.js" defer></script>\n</body>');
 // V8.2 assistant is present on legacy HTML templates and React pages alike.
 if(!html.includes('/v82-companion.css'))html=html.replace('</head>','<link rel="stylesheet" href="/v82-companion.css" />\n</head>');
 if(!html.includes('/v82-companion.js'))html=html.replace('</body>','<script src="/v82-companion.js" defer></script>\n</body>');
 // V8.3: mobile app presentation is shared by the original HTML routes and React pages.
 if(!html.includes('/mobile-app.css'))html=html.replace('</head>','<link rel="stylesheet" href="/mobile-app.css" />\n</head>');
 if(!html.includes('/mobile-app-dock.js'))html=html.replace('</body>','<script src="/mobile-app-dock.js" defer></script>\n</body>');
 // Never leave a prototype disclosure visible on a public live route.
 return html.replace(/V5\.1\s*[·-]\s*DESIGN PROTOTYPE/gi,'');
}
