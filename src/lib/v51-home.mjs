import {renderSiteChrome} from './site-chrome.mjs';
import {resolveImageVariant} from './media-variants.mjs';
/**
 * Populate the approved V5.1 homepage without reconstructing its layout.
 * All output comes from sanitized CMS records, and only published records are
 * passed here by the server. The original CSS/animation markup is retained.
 */
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cssUrl=url=>String(url||'').startsWith('https://')?`url('${String(url).replace(/'/g,'%27').replace(/[<>]/g,'')}')`:'';
const slug=value=>encodeURIComponent(String(value||'').replace(/[^a-z0-9-]/gi,''));
const label=(s)=>esc(s).toUpperCase();
function heading(input){
 return esc(input).replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/\r?\n/g,'<br/>');
}
function replaceById(html,id,content){
 const expression=new RegExp(`(<([a-z][a-z0-9]*)[^>]*\\bid="${id}"[^>]*>)[\\s\\S]*?(<\\/\\2>)`,'i');
 return html.replace(expression,(_match,open,_tag,close)=>open+content+close);
}
function replaceOne(html,before,after){return html.includes(before)?html.replace(before,after):html;}
function swapParagraph(html,old,value){return value?replaceOne(html,old,esc(value)):html;}
function ordered(items){const featured=items.filter(x=>x.featured);const rest=items.filter(x=>!x.featured);return [...featured,...rest];}
function destinationGroups(items){
 const groups={international:[],domestic:[]};
 for(const item of ordered(items)){
  const key=String(item.region||'').toLowerCase()==='india'?'domestic':'international';
  groups[key].push({id:item.slug||item.id,name:item.title,region:item.region||'',photo:resolveImageVariant(item,item.heroImage,'medium')||'',imageVariants:item.imageVariants||{},fallback:key==='domestic'?'hills':'coast'});
 }
 return groups;
}
function cardPhoto(x,defaultFallback='coast'){
 return `--photo:${cssUrl(resolveImageVariant(x,x.photo||x.heroImage,'medium'))||`url('/assets/${defaultFallback}-fallback.svg')`};--fallback:url('/assets/${defaultFallback}-fallback.svg')`;
}
export function renderDestinationCards(items){
 if(!items.length)return `<div class="cms-empty" role="status"><p>Our destination collection is being curated.</p><a href="/destinations">Explore destinations ↗</a></div>`;
 const [main,...small]=items.slice(0,3);
 const big=`<button class="destination-big photo" id="destinationBig" style="${cardPhoto(main,'coast')}" data-destination="${esc(main.name)}" data-destination-slug="${esc(main.id)}"><span class="photo-shade"></span><span class="place-index">01 / FEATURED PLACE</span><span class="place-copy"><span class="place-region">${label(main.region||'DISCOVER')}</span><strong>${esc(main.name)}</strong><span class="place-learn">Explore the possibilities <i>↗</i></span></span></button>`;
 const secondary=small.map((item,i)=>`<button class="destination-small photo" id="${i===0?'destinationSmallOne':'destinationSmallTwo'}" style="${cardPhoto(item,'hills')}" data-destination="${esc(item.name)}" data-destination-slug="${esc(item.id)}"><span class="photo-shade"></span><span class="small-place-copy"><span>0${i+2} / DISCOVER</span><strong>${esc(item.name)}</strong><i>↗</i></span></button>`).join('');
 return big+`<div class="destination-side">${secondary}</div>`;
}
export function renderJourneyCards(items){
 if(!items.length)return `<div class="cms-empty" role="status"><p>Our next collection of journeys is taking shape.</p><a href="/create">CREATE your journey ↗</a></div>`;
 return items.slice(0,10).map(item=>{
  const dest=(item.destinationSlug||'').replace(/-/g,' ');
  const nights=item.nights?` · ${esc(item.nights)} NIGHTS`:'';
  return `<article class="journey-card"><button class="journey-img photo" data-journey-slug="${esc(item.slug||item.id)}" style="${cardPhoto(item,'city')}"><span class="image-chip">CURATED JOURNEY</span><span class="photo-arrow">↗</span></button><div class="journey-card-meta"><span>${label(dest||'TRAWELLBEYOND')}${nights}</span><span>${esc(item.days?`${item.days} DAYS`:'CREATED AROUND YOU')}</span></div><h3>${esc(item.title)}</h3><div class="journey-card-bottom"><span>${esc(item.summary||'A journey created around you.')}</span><button data-journey-slug="${esc(item.slug||item.id)}">Make it mine <span>↗</span></button></div></article>`;
 }).join('');
}
export function renderV51Home(source,{page={},destinations=[],journeys=[],site={}}={}){
 let html=source;
 const visual={
  homeEntryTitle:'entryTitle',homeDestinationsTitle:'destTitle',homeJourneysTitle:'journeysTitle',homePurposeTitle:'purposeTitle',homeCreateTitle:'createTitle'
 };
 for(const [key,id] of Object.entries(visual))if(page[key])html=replaceById(html,id,heading(page[key]));
 if(page.homeHeroLine1||page.homeHeroAccent||page.homeHeroLine3){
  const parts=[page.homeHeroLine1||'The world is wide.',page.homeHeroAccent||'Your journey',page.homeHeroLine3||'is personal.'];
  const inner=parts.map((line,i)=>`<span class="hero-line"><span>${i===1?`<em>${esc(line)}</em>`:esc(line)}</span></span>`).join('');
  html=replaceById(html,'heroTitle',inner);
 }
 const swapPairs=[
  ['Wherever life takes you, we help create a journey that feels like your own.',page.summary],
  ['Some begin with a place. Others, with a feeling. Tell us what matters and discover a way to make it yours.',page.homeEntryLead],
  ['Travel can mean a first glimpse of snow, a long-awaited family reunion, a quiet escape or simply getting somewhere you need to be.',page.homeManifestoLead],
  ["Across India and around the world, the places you know and the ones you've yet to discover.",page.homeDestinationsLead],
  ['Explore a starting point, then adjust the details to make it your own. No two journeys need to feel the same.',page.homeJourneysLead],
  ["There isn't just one way to travel. Choose what matters most and we'll help you explore where it might lead.",page.homePurposeLead],
  ["Have a destination in mind, a half-formed idea or something entirely different? Start shaping it yourself, or tell us what you're imagining.",page.homeCreateLead],
  ['Some journeys are planned. Some begin with a conversation.',page.homeClosingLead],
 ];
 for(const [original,value] of swapPairs)html=swapParagraph(html,original,value);
 const complexPairs=[
  ["It's not simply <em>where</em><br/>you go. It's <em>what the<br/>journey becomes.</em>",page.homeManifestoTitle],
  ["If the right journey<br/>doesn't exist,<br/><em>we create it.</em>",page.homeCreateTitle],
  ['Where shall<br/><em>we begin?</em>',page.homeClosingTitle]
 ];
 for(const [original,value] of complexPairs)if(value)html=replaceOne(html,original,heading(value));
 if(page.heroImage && cssUrl(page.heroImage))html=html.replace(/(<div class="hero-photo photo" style=")[^"]*("\s*>)/,`$1--photo:${cssUrl(page.heroImage)};--fallback:url('/assets/hero-fallback.svg')$2`);
 if(page.homeCreateImage && cssUrl(page.homeCreateImage))html=html.replace(/(<div class="create-photo photo" style=")[^"]*("\s*>)/,`$1--photo:${cssUrl(page.homeCreateImage)};--fallback:url('/assets/hills-fallback.svg')$2`);
 for(let i=1;i<=3;i++){
  const title=page[`homeMomentTitle${i}`],lead=page[`homeMomentLead${i}`],image=page[`homeMomentImage${i}`];
  if(!title&&!lead&&!cssUrl(image))continue;
  const chapter=new RegExp(`(<article class="motion-scene[^>]*data-scene="${i-1}"[^>]*>)([\\s\\S]*?)(<\/article>)`);
  html=html.replace(chapter,(match,open,inner,close)=>{
   if(title)inner=inner.replace(/(<h2>)[\s\S]*?(<\/h2>)/,(_m,a,b)=>a+heading(title)+b);
   if(lead)inner=inner.replace(/(<p>)[\s\S]*?(<\/p>)/,(_m,a,b)=>a+esc(lead)+b);
   if(cssUrl(image))inner=inner.replace(/(<div class="motion-scene__photo" style=")[^"]*(")/,`$1--frame-image:${cssUrl(image)};--frame-fallback:url('/assets/hero-fallback.svg')$2`);
   return open+inner+close;
  });
 }
 if(page.homeWorldsTitle)html=html.replace(/(<div class="worlds-heading">[\s\S]*?<h2>)[\s\S]*?(<\/h2>)/,(_m,a,b)=>a+heading(page.homeWorldsTitle)+b);
 if(page.homeWorldsLead)html=html.replace(/(<div class="worlds-heading">[\s\S]*?<\/h2><p>)[\s\S]*?(<\/p>)/,(_m,a,b)=>a+esc(page.homeWorldsLead)+b);
 const groups=destinationGroups(destinations);
 const initial=groups.international.length?'international':'domestic';
 const featured=(groups[initial]||[]).slice(0,3);
 // Keep the approved section and motion effects; change only its content.
 html=html.replace(/(<div class="destination-editorial" id="destinationGrid">)[\s\S]*?(\n  <div class="destination-foot">)/,
  (_match,before,after)=>before+renderDestinationCards(featured)+'\n  </div>'+after);
 html=html.replace(/(<div class="journey-rail" id="journeyRail"[^>]*>)[\s\S]*?(\n  <\/div><div class="journey-disclaimer">)/,
  (_match,before,after)=>before+renderJourneyCards(ordered(journeys)) + after);
 html=html.replace(/Sample journeys for design review\. Final availability, package content, duration and pricing require approval before publishing\./,
  'Every journey is tailored to your requirements. Final services, availability and quotation are confirmed with our team.');
 html=html.replace(/8 INTERNATIONAL DESTINATION ENTRIES &nbsp;·&nbsp; 12 ACROSS INDIA/,`${groups.international.length} INTERNATIONAL DESTINATIONS &nbsp;·&nbsp; ${groups.domestic.length} ACROSS INDIA`);
 html=html.replace(/Explore all 20 destinations/,`Explore destinations`);
 const cmsData={destinations:groups,journeys:journeys.map(j=>({id:j.slug||j.id,title:j.title,destinationSlug:j.destinationSlug||''}))};
 const script=`<script id="tb-cms-data" type="application/json">${JSON.stringify(cmsData).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026')}</script>`;
 html=html.replace('</head>',`${script}\n</head>`);
 // No stale sample-only / demo notification on published site.
 html=html.replace('<title>TrawellBeyond — Created Around You | Motion Edition V4.2</title>','<title>TrawellBeyond | Created Around You</title>');
 return renderSiteChrome(html,site,false);
}
