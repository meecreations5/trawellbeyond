import {renderVisitGuide,renderVideoPreview} from './travel-guide.mjs';
import {renderSiteChrome} from './site-chrome.mjs';
import {safeImage} from './content.mjs';
import {resolveImageVariant} from './media-variants.mjs';
import {galleryButton,renderPhotoCredits} from './photo-credits.mjs';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const encode=x=>encodeURIComponent(String(x||''));
const lines=x=>String(x||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const paragraphs=x=>String(x||'').split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
const img=x=>esc(safeImage(x)||'/assets/hero-fallback.svg');
const json=x=>JSON.stringify(x).replace(/[<>&]/g,c=>({'<':'\\u003c','>':'\\u003e','&':'\\u0026'}[c]));
const fill=(template,fields)=>{
 let html=template;
 for(const [key,value] of Object.entries(fields))html=html.replaceAll(`__TB_${key}__`,String(value));
 const unresolved=html.match(/__TB_[A-Z0-9_]+__/);
 if(unresolved)throw new Error('Unresolved experience template field: '+unresolved[0]);
 return html;
};
function infoRow(label,value){return value?`<div class="ex-fact"><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`:'';}
function infoCard(label,items){return items.length?`<div class="ex-note-card rise"><span>${esc(label)}</span>${items.map(t=>`<p>${esc(t)}</p>`).join('')}</div>`:'';}
export function renderV51Experience(template,{experience,destination=null,relatedExperiences=[],site={}}){
 const item=experience;
 const title=item.title||'Experience';
 const destSlug=item.destinationSlug||destination?.slug||'';
 const destinationName=destination?.title||destSlug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())||'Explore';
 const hero=item.heroImage;
 const summary=item.summary||`An experience to explore in ${destinationName}.`;
 const description=paragraphs(item.description||summary);
 const high=lines(item.highlights).slice(0,8);
 const highlights=high.length?high:[summary];
 const gallery=[...new Set([hero,...lines(item.galleryImages)].filter(safeImage))].slice(0,8);
 const destUrl=destination?.slug?`/destinations/${encode(destSlug)}`:'/destinations';
 const createUrl=`/create?destination=${encode(destinationName)}&experience=${encode(title)}&experienceSlug=${encode(item.slug||item.id)}`;
 const enquireUrl=`/enquire?destination=${encode(destinationName)}&experience=${encode(title)}`;
 const category=item.bestFor||'Discovery';
 const facts=[infoRow('Typical duration',item.duration),infoRow('Opening / operating hours',item.openingHours),infoRow('Pick-up / meeting',item.pickup),infoRow('Return / drop-off',item.dropoff),infoRow('Ideal for',item.bestFor)].filter(Boolean);
 if(!facts.length)facts.push(infoRow('Visit planning','Details confirmed for your chosen dates'));
 facts.push(infoRow('Pricing',item.priceFrom?`${item.currency||'SGD'} ${item.priceFrom} (indicative)`:'Quotation on request'));
 const notes=[infoCard('Inclusions / possibilities',lines(item.inclusions)),infoCard('Exclusions / not included',lines(item.exclusions)),infoCard('Tickets & admissions',paragraphs(item.ticketNotes)),infoCard('Before you go',paragraphs(item.seasonalNotes))].filter(Boolean);
 const related=relatedExperiences.filter(x=>x.slug!==item.slug&&x.id!==item.id).sort((a,b)=>Number(!!b.featured)-Number(!!a.featured)).slice(0,3);
 const gallerySection=gallery.length?`<section class="ex-gallery" id="gallery" aria-labelledby="galleryTitle"><div class="page-width"><div class="ex-section-top rise"><span class="ex-section-no">03 / A CLOSER LOOK</span><h2 id="galleryTitle">Experience it<br/><em>in pictures.</em></h2><p>Explore a few perspectives before you make this experience your own.</p></div><div class="ex-photo-grid count-${gallery.length}">${gallery.map((url,i)=>`<figure class="ex-gallery-item rise ${i===0?'featured':''}">${galleryButton(url,`${title} / view ${i+1}`,i,{thumbUrl:resolveImageVariant(item,url,'thumb')})}<figcaption>${String(i+1).padStart(2,'0')} / ${esc(title)}</figcaption></figure>`).join('')}</div></div></section>`:'';
 const relatedSection=related.length?`<section class="ex-related page-width" aria-labelledby="relatedTitle"><div class="ex-section-top rise"><span class="ex-section-no">EXPLORE MORE / ${esc(destinationName.toUpperCase())}</span><h2 id="relatedTitle">More ways to<br/><em>make it yours.</em></h2><p>Choose another moment, or build an entire journey around your interests.</p></div><div class="ex-related-grid">${related.map(x=>`<a href="/experiences/${encode(x.slug||x.id)}" class="ex-related-card rise"><div class="ex-related-photo" style="background-image:url('${img(resolveImageVariant(x,x.heroImage,'medium'))}')"></div><span>EXPERIENCE / ${esc(destinationName)}</span><h3>${esc(x.title)}</h3><span class="ex-related-arrow">↗</span></a>`).join('')}</div></section>`:'';
 const source=safeImage(item.officialUrl);
 const photoSource=safeImage(item.photoSourceUrl);
 const sourceNote=source||item.photoCredit?`<div class="ex-source-note rise">${source?`<a href="${esc(source)}" rel="noopener noreferrer" target="_blank">Official attraction information ↗</a>`:''}${item.photoCredit?`<span>Photo: ${esc(item.photoCredit)}${item.photoLicense?' / '+esc(item.photoLicense):''}${photoSource?` / <a href="${esc(photoSource)}" rel="noopener noreferrer" target="_blank">Image source ↗</a>`:''}</span>`:''}</div>`:'';
 return renderSiteChrome(fill(template,{
  META_TITLE:esc(`${title} | ${destinationName} | TrawellBeyond`),META_DESCRIPTION:esc(summary.slice(0,250)),
  TITLE:esc(title),SUMMARY:esc(summary),DEST_NAME:esc(destinationName),DEST_URL:destUrl,CATEGORY:esc(category),IMAGE:img(hero),
  DESCRIPTION:description.map(p=>`<p>${esc(p)}</p>`).join(''),
  CREATE_URL:esc(createUrl),ENQUIRE_URL:esc(enquireUrl),
  HIGHLIGHTS:highlights.map((text,i)=>`<article class="ex-highlight rise"><span class="ex-highlight-index">${String(i+1).padStart(2,'0')}</span><p>${esc(text)}</p><span class="ex-highlight-arrow" aria-hidden="true">↗</span></article>`).join(''),
  GALLERY_SECTION:gallerySection,EXPERIENCE_VIDEO:renderVideoPreview(item,{eyebrow:'EXPERIENCE / FILM',heading:'A closer look, in motion.',image:item.heroImage}),VISIT_GUIDE:renderVisitGuide(item),ADD_TO_TRAY:`<button type="button" class="tb-inline-add" data-tb-add-experience data-tb-title="${esc(title)}" data-tb-slug="${esc(item.slug||item.id)}" data-tb-destination-slug="${esc(destSlug)}">+ Save to My Journey</button>`,FACTS:facts.length?facts.join(''):'<div class="ex-fact"><small>Planning</small><strong>On request</strong></div>',
  NOTES:notes.join(''),SOURCE_NOTE:sourceNote,RELATED_SECTION:relatedSection,PHOTO_CREDITS:renderPhotoCredits(item.imageCredits),
  BOOTSTRAP:json({type:'experience',name:destinationName,destinationSlug:destSlug,title,slug:item.slug||item.id})
 }),site,true);
}
