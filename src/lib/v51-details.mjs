import {renderTravelEssentials,renderVideoPreview} from './travel-guide.mjs';
import {resolveImageVariant} from './media-variants.mjs';
import {renderSiteChrome} from './site-chrome.mjs';
import {galleryButton,renderPhotoCredits} from './photo-credits.mjs';
import {journeyGalleryPhotos,journeyDayPhotos} from './journey-photos.mjs';
/** Keep the approved V5.1 destination / journey DOM structure and motion intact. */
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const encode=value=>encodeURIComponent(String(value||''));
const safeImg=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:'';}catch{return '';}};
const photo=value=>esc(safeImg(value)||'/assets/hero-fallback.svg');
const line=value=>esc(value).replace(/\r?\n/g,'<br/>');
const rich=value=>line(value).replace(/\*([^*]+)\*/g,'<em>$1</em>');
function attrs(html,context){
 let result=html;
 for(const [key,value] of Object.entries(context))result=result.replaceAll(`__TB_${key}__`,String(value));
 if(/__TB_[A-Z0-9_]+__/.test(result))throw new Error('A V5.1 page placeholder was not resolved: '+result.match(/__TB_[A-Z0-9_]+__/)[0]);
 return result;
}
const json=data=>JSON.stringify(data).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
const shortTitle=title=>`<span class="line-reveal"><span>${esc(title)}</span></span><span class="line-reveal subtitle"><span><em>your way.</em></span></span>`;
const trimPara=value=>String(value||'').split(/\n\s*\n/).map(v=>v.trim()).filter(Boolean).slice(0,10);
const itemsFrom=value=>String(value||'').split('\n').map(x=>x.trim()).filter(Boolean);
const pickUniqueImages=values=>[...new Set(values.filter(safeImg))];
function purposeOption(value,desc,keys){const [first,...rest]=String(value||'').split('|');return {desc:first?.trim()||desc,keys:rest.join('|').trim()||keys};}
function fallbackFaqs(title){return [
  [`Can I customize a journey to ${title}?`,'Absolutely. Share the people, pace, dates, budget and experiences that matter, and our team will create a personal proposal.'],
  ['Do you confirm travel services and availability?','Yes. Availability, inclusions, schedules and prices are confirmed with you before arrangements are finalized.'],
  ['Does an enquiry confirm a booking?','No. Sending an enquiry starts a conversation; it does not confirm a booking or process a payment.']
 ];}
function experienceTile(item,i){
 const classes=['tile-wide','tile-tall','tile-low','tile-low'];
 return `<a class="experience-tile ${classes[i%4]} rise" href="/experiences/${encode(item.slug||item.id)}"><div class="scenic" style="--remote:url('${photo(resolveImageVariant(item,item.heroImage,'medium'))}');--local:url('/assets/hero-fallback.svg')"></div><div class="tile-shade"></div><div class="tile-head">${String(i+1).padStart(2,'0')} / EXPERIENCE</div><div class="tile-bottom"><h3>${esc(item.title)}</h3><span class="circle-mini">↗</span></div></a>`;
}
export function renderV51Destination(template,{destination,experiences=[],journeys=[],site={}}){
 const item=destination;
 const title=item.title||'';
 const mainJourney=journeys.find(j=>j.slug===item.featuredJourneySlug)||journeys.find(j=>j.featured)||journeys[0];
 const summary=item.summary||`Discover ${title}, your way.`;
 const paragraphs=trimPara(item.description);
 const notes=itemsFrom(item.highlights);
 const gallery=pickUniqueImages(itemsFrom(item.galleryImages));
 const storyTitles=['The moments that matter.','Discover the possibilities.','Created around you.'];
 const chapterImages=[item.storyImage1,item.storyImage2,item.storyImage3];
 const storyDesc=[summary,paragraphs[0]||'Take time to discover the places, pace and experiences that feel right for you.',paragraphs[1]||'Share your preferences and our team will help shape a journey around them.'];
 const featuredSlugs=itemsFrom(item.featuredExperienceSlugs);
 const chosen=featuredSlugs.map(slug=>experiences.find(x=>x.slug===slug||x.id===slug)).filter(Boolean);
 const featuredExperiences=[...chosen,...experiences.filter(x=>!chosen.includes(x)).sort((a,b)=>Number(!!b.featured)-Number(!!a.featured))];
 const defaultPurpose={first:purposeOption(item.purposeFirst,`Discover ${title} at a pace that suits your plans.`,notes.slice(0,2).join(' / ')||'Your highlights / Your interests'),family:purposeOption(item.purposeFamily,'Balance meaningful experiences with comfortable time together.','Family time / Flexible pace'),couple:purposeOption(item.purposeCouple,'Share memorable moments, with space to enjoy your own rhythm.','Connection / Discovery'),wild:purposeOption(item.purposeExplorer,'Discover local experiences and explore something unexpected.','Culture / Nature / Experiences')};
 const customFaqs=itemsFrom(item.faqs).map(line=>{const [q,...a]=line.split('|');return [(q||'').trim(),a.join('|').trim()]}).filter(([q,a])=>q&&a);
 const faq=customFaqs.length?customFaqs:fallbackFaqs(title);
 const faqs=faq.map(([q,a])=>`<details><summary>${esc(q)} <span>+</span></summary><p>${esc(a)}</p></details>`).join('');
 const starts=mainJourney?`${esc(mainJourney.nights||'?')} nights / ${esc(mainJourney.days||'?')} days`:'Created on request';
 const firstJourney=mainJourney?`/journeys/${encode(mainJourney.slug||mainJourney.id)}`:`/enquire?destination=${encode(title)}`;
 const feature=mainJourney?`<div class="feature-photo scenic" style="--remote:url('${photo(mainJourney.heroImage||item.heroImage)}');--local:url('/assets/hero-fallback.svg')"><span class="image-caption">A STARTING POINT, CREATED AROUND YOU</span></div><div class="feature-copy"><span class="section-index">${esc(title.toUpperCase())} / ${starts}</span><h3>${esc(mainJourney.title)}</h3><p>${esc(mainJourney.summary||'A thoughtful beginning, with room to make it yours.')}</p><div class="feature-tags">${notes.slice(0,3).map(x=>`<span>${esc(x).toUpperCase()}</span>`).join('')}</div><div class="feature-actions"><a class="solid-link" href="${firstJourney}">Explore the journey <span>↗</span></a><a class="text-action" href="/enquire?destination=${encode(title)}">Make it mine ↗</a></div><small>No online checkout · Quotation on request</small></div>`:`<div class="feature-copy"><span class="section-index">MADE AROUND YOU</span><h3>Let's create<br/><em>your journey.</em></h3><p>We can build a personal itinerary around your dates, preferred pace and travel interests.</p><div class="feature-actions"><a class="solid-link" href="/enquire?destination=${encode(title)}">Plan with us <span>↗</span></a></div><small>No online payments</small></div>`;
 const ctx={
  META_TITLE:esc(`${title}, Your Way | TrawellBeyond`),META_DESCRIPTION:esc(summary.slice(0,300)),
  NAME:esc(title),NAME_UPPER:esc(title.toUpperCase()),HERO_HEADING:shortTitle(title),REGION:esc((item.region||'EXPLORE').toUpperCase()+' / CREATED AROUND YOU'),
  SUMMARY:esc(summary),IMAGE:photo(item.heroImage),
  INTRO_HEADING:rich(`Discover ${title}.\n*Created around you.*`),
  INTRO_COPY:(paragraphs.length?paragraphs:[summary]).map(p=>`<p>${esc(p)}</p>`).join('')+`<div class="tb-intro-actions" role="group" aria-label="Ways to explore ${esc(title)}"><a class="tb-intro-primary" href="${firstJourney}">${mainJourney?'Explore a curated journey':'Start creating your journey'} <span aria-hidden="true">↗</span></a><button type="button" class="tb-inline-add tb-intro-save" data-tb-add-destination data-tb-title="${esc(title)}" data-tb-slug="${esc(item.slug||item.id)}">+ Save ${esc(title)} to My Journey</button></div>`,
  GOODFOR:esc(item.goodFor||notes[0]||'Travellers seeking something personal'), STYLE:esc(item.journeyStyle||notes[1]||'Designed around your preferences'),STARTING:starts,
  STORY_LABEL:esc(`${title.toUpperCase()} / THREE WAYS TO FEEL IT`),
  STORY_H_0:rich(item.storyTitle1||notes[0]||storyTitles[0]),STORY_H_1:rich(item.storyTitle2||notes[1]||storyTitles[1]),STORY_H_2:rich(item.storyTitle3||notes[2]||storyTitles[2]),
  STORY_P_0:esc(item.storyBody1||storyDesc[0]),STORY_P_1:esc(item.storyBody2||storyDesc[1]),STORY_P_2:esc(item.storyBody3||storyDesc[2]),
  STORY_IMAGE_0:photo(chapterImages[0]||gallery[0]),STORY_IMAGE_1:photo(chapterImages[1]||gallery[1]),STORY_IMAGE_2:photo(chapterImages[2]||gallery[2]),
  DEST_GUIDE:renderTravelEssentials(item)+`<div class="tb-v82-insider-callout page-width"><span>DESTINATION INSIDER / LOCAL KNOW-HOW</span><a href="/insider/${encode(item.slug||item.id)}">Explore the ${esc(title)} insider guide &nearr;</a></div>`,DEST_VIDEO:renderVideoPreview(item,{eyebrow:'DESTINATION / FILM',heading:`${title}, in motion.`,image:item.heroImage}),
  DESTINATION_GALLERY:gallery.length?`<section class="tb-editorial-gallery page-width" id="photo-gallery" aria-labelledby="galleryHeading"><div class="tb-editorial-gallery__heading rise"><div><span class="section-index">${esc(title.toUpperCase())} / ANOTHER PERSPECTIVE</span><h2 id="galleryHeading">A closer look.<br/><em>At the moments.</em></h2></div><p>Explore different perspectives of ${esc(title)}. Tap a photograph for a closer view.</p></div><div class="tb-editorial-gallery__grid">${gallery.map((url,i)=>galleryButton(url,`${title} / travel photograph ${i+1}`,i,{className:'rise',thumbUrl:resolveImageVariant(item,url,'thumb')})).join('')}</div></section>`:'',
  PHOTO_CREDITS:renderPhotoCredits(item.imageCredits),
  EXPERIENCE_TILES:featuredExperiences.length?featuredExperiences.slice(0,4).map(experienceTile).join(''):`<div class="cms-empty"><p>Experiences are being added for this destination.</p><a href="/enquire?destination=${encode(title)}">Tell us what you would love to explore ↗</a></div>`,
  EXPERIENCE_INTRO:esc(`Discover different sides of ${title}, then choose the experiences that suit your people and pace.`),ALL_EXPERIENCES_URL:`/experiences?destination=${encode(item.slug||item.id)}`,
  PURPOSE_HEADING:rich(`What kind of ${title}\n*feels like yours?*`),PURPOSE_FIRST_DESC:esc(defaultPurpose.first.desc),PURPOSE_FIRST_KEYS:esc(defaultPurpose.first.keys),
  FEATURE_JOURNEY:feature,FAQS:faqs,
  CTA_HEADING:rich(`Let's make ${title}\n*feel like yours.*`),ENQUIRE_URL:`/enquire?destination=${encode(title)}`,JOURNEY_URL:`/create?destination=${encode(title)}`,
  BOOTSTRAP:json({type:'destination',name:title,slug:item.slug||item.id,summary,highlights:notes,purposes:defaultPurpose})
 };
 return renderSiteChrome(attrs(template,ctx),site,true);
}
export function parseItinerary(value,photoUrl,dayImages='',galleryImages=''){
 const count=itemsFrom(value).slice(0,20).length||1;
 const photos=journeyDayPhotos({heroImage:photoUrl,dayImages,galleryImages},count);
 const entries=itemsFrom(value).slice(0,20);
 const days=entries.map((line,i)=>{
  const match=line.match(/^day\s*\d+\s*[:.\-]\s*(.*)$/i);
  const text=(match?match[1]:line).trim();
  const parts=text.split(/\s+\|\s+/).map(s=>s.trim());
  return {b:`DAY ${String(i+1).padStart(2,'0')}`,title:parts[0]||`Day ${i+1}`,copy:parts[1]||'Your travel team will confirm the activities, timing and arrangements.',tags:parts.slice(2,5),remote:photos[i]||'/assets/hero-fallback.svg',local:'/assets/hero-fallback.svg'};
 });
 return days.length?days:[{b:'DAY 01',title:'Your itinerary, created around you.',copy:'Tell us your dates and interests; our team will propose a day-by-day journey.',tags:['Personal planning'],remote:photos[0]||'/assets/hero-fallback.svg',local:'/assets/hero-fallback.svg'}];
}
export function renderV51Journey(template,{journey,relatedExperiences=[],site={}}){
 const item=journey,title=item.title||'',dest=item.destinationSlug||'';
 const destTitle=dest.replace(/-/g,' ').replace(/\b\w/g,x=>x.toUpperCase())||'Your journey';
 const days=parseItinerary(item.itinerary,item.heroImage,item.dayImages,item.galleryImages).map(day=>({...day,remote:resolveImageVariant(item,day.remote,'medium')||day.remote}));
 const notes=itemsFrom(item.highlights);
 const gallery=journeyGalleryPhotos(item);
 const story=trimPara(item.description);
 const specs=(item.nights?`${item.nights} nights`:'Flexible')+(item.days?` / ${item.days} days`:'');
 const buttons=days.map((d,i)=>`<button id="day-tab-${i}" role="tab" aria-selected="${i===0}" aria-controls="day-panel" tabindex="${i===0?'0':'-1'}" data-day="${i}" class="${i===0?'active':''}"><small>DAY ${String(i+1).padStart(2,'0')}</small><span>${esc(d.title)}</span><b>↗</b></button>`).join('');
 const inclusions=notes.length?notes:['Personalized itinerary proposal','Experience recommendations','Schedule and services discussed with our team'];
 const interestItems=[...itemsFrom(item.journeyInterests),...relatedExperiences.slice(0,12).map(x=>x.title),...notes].filter((x,i,arr)=>arr.indexOf(x)===i).slice(0,12);
 const customInterests=itemsFrom(item.journeyInterests);
 const defaultInterests=(customInterests.length?customInterests:interestItems).length?(customInterests.length?customInterests:interestItems):['Discover local experiences','Relaxed exploration','Quality time together'];
 const boot={type:'journey',name:destTitle,slug:item.slug||item.id,journeyTitle:title,nights:Number(item.nights)||3,days};
 const ctx={META_TITLE:esc(`${title} | TrawellBeyond`),META_DESCRIPTION:esc((item.summary||title).slice(0,300)),
  NAME:esc(destTitle),DEST_LABEL:esc(destTitle.toUpperCase()),SUMMARY:esc(item.summary),IMAGE:photo(item.heroImage),
  DEST_URL:`/destinations/${encode(dest)}`,JOURNEY_NAME:esc(title),DAY_FIRST_IMAGE:photo(resolveImageVariant(item,days[0].remote,'medium')),NIGHTS:esc(item.nights||3),
  JOURNEY_HEADING:rich(title),DAY_COUNT:`01 / ${String(days.length).padStart(2,'0')}`,DAY_TOTAL:String(days.length).padStart(2,'0'),
  DURATION:esc(specs),STYLE:esc(notes.slice(0,2).join(' / ')||'Created around you'),GOODFOR:esc(item.journeyGoodFor||'Your people and preferences'),PRICE:item.priceFrom?`Indicative ${esc(item.currency||'INR')} ${esc(item.priceFrom)}`:'On request',
  STORY_HEADING:rich(item.journeyStoryTitle||`A journey that\n*feels like yours.*`),STORY_COPY:(story.length?story:[item.summary||'Every journey begins with what matters to you.']).map(p=>`<p>${esc(p)}</p>`).join(''),
  GALLERY_0:photo(gallery[0]),GALLERY_1:photo(gallery[1]),GALLERY_2:photo(gallery[2]),
  JOURNEY_GALLERY_SECTION:gallery.length?`<section class="trip-gallery page-width${gallery.length===1?' trip-gallery--single':gallery.length===2?' trip-gallery--pair':''}" aria-label="Journey photography">${galleryButton(gallery[0],`${title} / view 1`,0,{className:'gallery-main rise',thumbUrl:resolveImageVariant(item,gallery[0],'medium')})}${gallery.length>1?`<div class="gallery-side">${gallery.slice(1,3).map((url,i)=>galleryButton(url,`${title} / view ${i+2}`,i+1,{className:'rise',thumbUrl:resolveImageVariant(item,url,'thumb')})).join('')}</div>`:''}</section>`:'',
  PHOTO_CREDITS:renderPhotoCredits(item.imageCredits),
  DAY_BUTTONS:buttons,DAY_FIRST_EYEBROW:esc(days[0].b),DAY_FIRST_TITLE:esc(days[0].title),DAY_FIRST_COPY:esc(days[0].copy),DAY_FIRST_TAGS:days[0].tags.map(t=>`<span>${esc(t)}</span>`).join(''),
  INCLUSIONS:`<span class="include-number">01</span><h3>Proposed starting points</h3>${(itemsFrom(item.includedNotes).length?itemsFrom(item.includedNotes):inclusions).slice(0,7).map(x=>`<div><span>↗</span> ${esc(x)}</div>`).join('')}`,
  TO_CONFIRM:`<span class="include-number">02</span><h3>To confirm in your quote</h3>${(itemsFrom(item.toConfirmNotes).length?itemsFrom(item.toConfirmNotes):['Availability and dates','Accommodation and transport','Admissions and operating schedules','Final inclusions, visa and travel requirements']).map(x=>`<div><span>↗</span> ${esc(x)}</div>`).join('')}`,
  INTEREST_CHECKBOXES:defaultInterests.map((x,i)=>`<label><input type="checkbox" value="${esc(x)}" ${i<2?'checked':''}><span>${esc(x)}</span><small>Personal choice</small></label>`).join(''),
  BOOTSTRAP:json(boot)
 };
 let html=attrs(template,ctx);
 // Links and messages that were demonstration-only are no longer on production pages.
 html=html.replaceAll('This page is a proposed journey concept. Nothing listed is a guaranteed booking inclusion, service availability or confirmed price.', 'This is a proposed journey. Inclusions, availability and pricing will be confirmed in your personalized quotation.');
 html=html.replaceAll('Start with three or stay a little longer.','Choose the stay that suits your plans.');
 // The approved template has a generic destination breadcrumb. Its path is filled from CMS.
 const plannerLink=`/create?destination=${encode(destTitle)}&nights=${encode(item.nights||3)}&notes=${encode(`Starting from ${title}. Preferred stay: ${item.nights||3} nights.`)}`;
 html=html.replace(/(<button\b[^>]*id="reviewJourney"[^>]*>)/,
  `<a class="tb-inline-add" href="${plannerLink}" style="margin-bottom:14px">Or plan my days in CREATE ↗</a><a class="tb-inline-add" style="margin:0 12px 14px" href="/customize?journey=${encode(item.slug||item.id)}">Request day-by-day changes ↗</a>$1`);
 return renderSiteChrome(html,site,true);
}
