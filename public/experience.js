/* TrawellBeyond Singapore pages — motion and local-only interaction demo. */
(()=>{
'use strict';
const q=(s,root=document)=>root.querySelector(s), qa=(s,root=document)=>Array.from(root.querySelectorAll(s));
let cms={};try{const el=q('#tb-page-data');if(el)cms=JSON.parse(el.textContent);}catch(error){console.error('V5.1 CMS payload could not be read',error);}
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
document.documentElement.classList.add('js');
const navBtn=q('#navToggle'), mobileNav=q('#navMobile');
const closeNav=()=>{if(mobileNav){mobileNav.hidden=true;navBtn?.setAttribute('aria-expanded','false');navBtn?.setAttribute('aria-label','Open menu')}};
if(navBtn&&mobileNav){navBtn.addEventListener('click',()=>{mobileNav.hidden=!mobileNav.hidden;navBtn.setAttribute('aria-expanded',String(!mobileNav.hidden));navBtn.setAttribute('aria-label',mobileNav.hidden?'Open menu':'Close menu')});qa('a',mobileNav).forEach(a=>a.addEventListener('click',closeNav));}
const reveal=qa('.rise');
if(!reduced.matches&&'IntersectionObserver' in window){const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}}),{rootMargin:'0px 0px -35px 0px',threshold:0.08});reveal.forEach((el,i)=>{if(el.getBoundingClientRect().top < innerHeight*.93){el.classList.add('visible')}else{el.style.transitionDelay=`${Math.min(i%3*90,180)}ms`;obs.observe(el)}})}else reveal.forEach(e=>e.classList.add('visible'));
const progress=q('#scrollProgress'),destinationHero=q('.destination-hero__image'),story=q('.story-chapters');
let raf=false;
function scrollUpdate(){raf=false;if(progress){const full=Math.max(1,document.documentElement.scrollHeight-innerHeight);progress.style.width=`${clamp(scrollY/full,0,1)*100}%`};if(destinationHero&&!reduced.matches){const parent=q('.destination-hero');const distance=clamp(scrollY/Math.max(1,parent.offsetHeight),0,1);destinationHero.style.translate=`0 ${Math.round(distance*75)}px`}
 if(story&&!reduced.matches){const box=story.getBoundingClientRect();const distance=Math.max(1,story.offsetHeight-innerHeight);const p=clamp(-box.top/distance,0,1);const ix=Math.min(2,Math.floor(p*3));setChapter(ix)} }
function schedule(){if(!raf){raf=true;requestAnimationFrame(scrollUpdate)}};
window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});schedule();
const chapters=qa('.story-panel'),dots=qa('[data-dot]');let chapterNow=-1;
function setChapter(idx){if(!chapters.length||chapterNow===idx)return;chapterNow=idx;chapters.forEach((c,i)=>{const active=i===idx;c.classList.toggle('active',active);c.setAttribute('aria-hidden',String(!active))});dots.forEach((b,i)=>{const on=i===idx;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')});if(q('#chapterNumber'))q('#chapterNumber').textContent=String(idx+1).padStart(2,'0')}
if(story){if(reduced.matches){chapters.forEach(c=>c.setAttribute('aria-hidden','false'))}else{setChapter(0)}dots.forEach((d,i)=>d.addEventListener('click',()=>{const y=story.getBoundingClientRect().top+window.scrollY;const travel=Math.max(1,story.offsetHeight-innerHeight);window.scrollTo({top:y+travel*((i+.17)/3),behavior:reduced.matches?'instant':'smooth'});setChapter(i)}))}
const purpose={first:{desc:'Make room for icons, vibrant neighbourhoods and one experience that feels completely new.',keys:'Marina Bay · Gardens · Sentosa'},family:{desc:'Balance the must-sees with wildlife, easy-paced mornings and plenty of time to enjoy being together.',keys:'Sentosa · Mandai · Gardens'},couple:{desc:'A city of striking views, small discoveries and evenings you will want to linger in.',keys:'Waterfront views · Neighbourhoods · Experiences'},wild:{desc:'Go beyond the skyline: meet nocturnal wildlife, follow greener trails and discover Singapore from another angle.',keys:'Night Safari · River Wonders · Bird Paradise'}};
if(cms.type==='destination'){
 const name=cms.name||'your destination';
 const defaults={
  first:{desc:`Discover ${name} at a pace that suits your plans.`,keys:'Your highlights / Your interests'},
  family:{desc:'Balance meaningful experiences with comfortable time together.',keys:'Family time / Flexible pace'},
  couple:{desc:'Share memorable moments, with space to enjoy your own rhythm.',keys:'Connection / Discovery'},
  wild:{desc:'Explore local experiences and discover something unexpected.',keys:'Culture / Nature / Experiences'}
 };
 for(const key of Object.keys(defaults))purpose[key]={...defaults[key],...(cms.purposes?.[key]||{})};
 const first=purpose.first;
 if(q('#purposeAnswer'))q('#purposeAnswer').textContent=first.desc;
 if(q('#purposeKeywords'))q('#purposeKeywords').textContent=first.keys;
}
qa('[data-purpose]').forEach(b=>b.addEventListener('click',()=>{qa('[data-purpose]').forEach(x=>x.classList.toggle('on',x===b));const o=purpose[b.dataset.purpose];if(q('#purposeAnswer'))q('#purposeAnswer').textContent=o.desc;if(q('#purposeKeywords'))q('#purposeKeywords').textContent=o.keys;const mapping={first:'Discovery',family:'Togetherness',couple:'Celebration',wild:'Discovery'};window.TBJourneyTray?.setPurpose?.(mapping[b.dataset.purpose]||'Discovery')}));
const defaultDays=[
 {b:'01 / ARRIVAL',title:'A warm welcome to Singapore.',copy:'Arrive, settle in and enjoy the evening at your own pace. Start with a relaxed glimpse of the city.',tags:['Airport arrival','Hotel check-in','Evening at leisure'],remote:'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1100&q=80',local:'assets/singapore-skyline.svg'},
 {b:'02 / THE CITY',title:'The icons, and the life around them.',copy:'Discover Marina Bay, the Gardens and local neighbourhoods. Your day can be as iconic or as unhurried as you choose.',tags:['Marina Bay','Gardens by the Bay','Local culture'],remote:'https://images.unsplash.com/photo-1546842051-8426a3a45a39?w=1100&q=80',local:'assets/singapore-gardens.svg'},
 {b:'03 / YOUR ADVENTURE',title:'A day to make entirely yours.',copy:'Choose from Sentosa, wildlife at Mandai, or a slower day exploring Singapore at your pace. We will shape the sequence around your preferences.',tags:['Choose your experiences','Sentosa or Mandai','Flexible timing'],remote:'https://images.unsplash.com/photo-1536626375075-d90e699bf633?w=1100&q=80',local:'assets/singapore-sentosa.svg'},
 {b:'04 / DEPARTURE',title:'One more memory before you go.',copy:'Depending on your flight schedule, enjoy time for a relaxed breakfast or a final local experience, followed by your onward journey.',tags:['Breakfast','Optional stop','Onward departure'],remote:'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1100&q=80',local:'assets/singapore-night.svg'}
];
const days=Array.isArray(cms.days)&&cms.days.length?cms.days:defaultDays;
const dayBtns=qa('[data-day]');
function chooseDay(i){const d=days[i];if(!d)return;dayBtns.forEach((b,k)=>{const selected=k===i;b.classList.toggle('active',selected);b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1});const panel=q('#day-panel');if(panel)panel.setAttribute('aria-labelledby',`day-tab-${i}`);q('#dayEyebrow').textContent=d.b;q('#dayTitle').textContent=d.title;q('#dayCopy').textContent=d.copy;q('#dayTags').replaceChildren(...d.tags.map(s=>{const tag=document.createElement('span');tag.textContent=s;return tag}));const img=q('#dayPhoto');img.style.setProperty('--remote',`url('${d.remote}')`);img.style.setProperty('--local',`url('${d.local}')`)}
dayBtns.forEach((b,i)=>{b.addEventListener('click',()=>chooseDay(i));b.addEventListener('keydown',e=>{let next=i;if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(i+1)%days.length;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(i+days.length-1)%days.length;else return;e.preventDefault();chooseDay(next);dayBtns[next].focus()})});
const initial={nights:Math.min(12,Math.max(2,Number(cms.nights)||3)),adults:2,children:0,stay:'Comfort'};
let state={...initial};
const minmax={nights:[2,12],adults:[1,14],children:[0,10]};
const storesafely=()=>{try{localStorage.setItem(`tb-journey-${cms.slug||'draft'}`,JSON.stringify(state))}catch(e){}};
try{const stored=JSON.parse(localStorage.getItem(`tb-journey-${cms.slug||'draft'}`)||'null');if(stored&&typeof stored==='object'){for(const k of Object.keys(initial)){if(k==='stay'){if(['Comfort','Premium','Flexible'].includes(stored[k]))state.stay=stored[k]}else if(Number.isInteger(stored[k]))state[k]=clamp(stored[k],...minmax[k])}}}catch(e){}
function selectedExtras(){return qa('.extras input[type=checkbox]:checked').map(el=>el.value)}
function travellerText(){return `${state.adults} adult${state.adults===1?'':'s'}${state.children?` · ${state.children} child${state.children===1?'':'ren'}`:''}`}
function sync(){Object.keys(minmax).forEach(k=>{const out=q(`#${k}Value`);if(out)out.textContent=String(state[k]);qa(`[data-counter="${k}"]`).forEach(btn=>{const target=state[k]+Number(btn.dataset.change);btn.disabled=target<minmax[k][0]||target>minmax[k][1]})});qa('[data-stay]').forEach(b=>b.classList.toggle('active',b.dataset.stay===state.stay));if(q('#sumStay'))q('#sumStay').textContent=`${state.nights} nights / ${state.nights+1} days`;if(q('#sumTravellers'))q('#sumTravellers').textContent=travellerText();if(q('#sumComfort'))q('#sumComfort').textContent=state.stay;if(q('#sumExtras'))q('#sumExtras').textContent=`${selectedExtras().length} selected`;storesafely()}
qa('[data-counter]').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.counter;state[key]=clamp(state[key]+Number(b.dataset.change),...minmax[key]);sync()}));qa('[data-stay]').forEach(b=>b.addEventListener('click',()=>{state.stay=b.dataset.stay;sync()}));qa('.extras input[type=checkbox]').forEach(el=>el.addEventListener('change',sync));if(q('#reviewJourney'))sync();
// Prevent a past departure date from being selected in the enquiry prototype.
const preferredTravelDate=q('#travelDate');
if(preferredTravelDate){
  const now=new Date();
  const yyyy=now.getFullYear(), mm=String(now.getMonth()+1).padStart(2,'0'), dd=String(now.getDate()).padStart(2,'0');
  preferredTravelDate.min=`${yyyy}-${mm}-${dd}`;
  preferredTravelDate.addEventListener('change',()=>{
    if(preferredTravelDate.value && preferredTravelDate.value<preferredTravelDate.min){
      preferredTravelDate.value='';
      toast('Please choose a future travel date.');
    }
  });
}
const drawer=q('#enquiryDrawer'),shade=q('#enquiryShade');let lastFocus=null;
function close(){if(!drawer)return;drawer.hidden=true;shade.hidden=true;document.body.classList.remove('drawer-open');lastFocus?.focus()}
function show(){lastFocus=document.activeElement;if(!drawer)return;renderReview();drawer.hidden=false;shade.hidden=false;document.body.classList.add('drawer-open');q('#createDraft').hidden=false;q('#copyDraft').hidden=true;q('#draftResult').hidden=true;q('#leadName').focus()}
function renderReview(){const rows=[['Destination',cms.name||'Your destination'],['Journey',`${state.nights} nights / ${state.nights+1} days`],['Travellers',travellerText()],['Stay preference',state.stay],['Experience interests',selectedExtras().join(', ')||'Open to suggestions']];const date=q('#travelDate')?.value;if(date)rows.push(['Preferred date',date]);const el=q('#reviewSummary');if(!el)return;el.replaceChildren();const title=document.createElement('strong');title.textContent=(cms.journeyTitle||'Your journey')+' · Your preferences';el.append(title);rows.forEach(([key,val])=>{const div=document.createElement('div'),l=document.createElement('span'),v=document.createElement('span');l.textContent=key;v.textContent=val;div.append(l,v);el.append(div)})}
q('#reviewJourney')?.addEventListener('click',show);q('#closeEnquiry')?.addEventListener('click',close);q('#cancelEnquiry')?.addEventListener('click',close);shade?.addEventListener('click',close);
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer&&!drawer.hidden)close();if(e.key==='Tab'&&drawer&&!drawer.hidden){const focusable=qa('button:not([hidden]):not(:disabled),input:not([disabled]),textarea:not([disabled])',drawer).filter(x=>x.offsetParent!==null);if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
function validContact(value){
  const v=value.trim();
  const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const digits=(v.match(/\d/g)||[]).length;
  const phone=/^\+?[\d\s().-]+$/.test(v)&&digits>=7&&digits<=15;
  return email||phone;
}
function draftText(){const who=q('#leadName')?.value.trim()||'',contact=q('#leadContact')?.value.trim()||'',start=q('#travelDate')?.value||'Flexible',notes=q('#customNotes')?.value.trim()||'None';return `TRAWELLBEYOND — JOURNEY REQUEST\nName: ${who}\nPhone: ${contact}\nJourney: ${cms.journeyTitle||'Curated journey'}\nDestination: ${cms.name||'To discuss'}\nPreferred duration: ${state.nights} nights / ${state.nights+1} days\nTravellers: ${travellerText()}\nStay preference: ${state.stay}\nTravel start: ${start}\nExperience interests: ${selectedExtras().join(', ')||'Open to suggestions'}\nOther details: ${notes}\nPlease share a personalized quote with confirmed availability and inclusions.`}
function toast(message){const el=q('#toast');if(!el)return;el.textContent=message;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{el.hidden=true},3800)}
q('#createDraft')?.addEventListener('click',async()=>{
 const who=q('#leadName'),contact=q('#leadContact'),consent=q('#leadConsent');
 if(who.value.trim().length<2){who.focus();toast('Please enter your name.');return;}
 if(!/^\+?[0-9() .-]{7,22}$/.test(contact.value.trim()) || (contact.value.match(/\d/g)||[]).length<7){contact.focus();toast('Please enter a valid phone number.');return;}
 if(!consent?.checked){consent?.focus();toast('Please agree to be contacted about your enquiry.');return;}
 const send=q('#createDraft');send.disabled=true;send.textContent='Sending enquiry…';
 try{
  if(!window.TrawellBeyondEnquiries)throw new Error('Enquiry service is loading. Please retry.');
  const result=await window.TrawellBeyondEnquiries.submit({source:'create',name:who.value.trim(),phone:contact.value.trim(),destination:cms.name||'To discuss',travelers:travellerText(),dates:q('#travelDate')?.value||'Flexible',purpose:cms.journeyTitle||'Curated journey',notes:draftText(),consent:true});
  if(!result.ok)throw new Error('The enquiry was not saved.');
  const info=q('#draftResult');info.hidden=false;info.innerHTML='<strong role="status">Your enquiry was sent successfully.</strong><p>Our team can now review your travel request.</p><p>Reference: <b id="sentRef"></b></p>';
  q('#sentRef').textContent=result.id||'Received';send.hidden=true;q('#copyDraft').hidden=true;toast('Your enquiry has reached the TrawellBeyond team.');
 }catch(error){toast(error.message||'Enquiry not sent. Please retry.');}
 finally{send.disabled=false;if(!send.hidden)send.textContent='Send enquiry ↗';}
});
q('#copyDraft')?.addEventListener('click',async()=>{const text=q('#enquiryOutput').value;try{await navigator.clipboard.writeText(text);toast('Enquiry text copied.') }catch(e){const box=q('#enquiryOutput');box.focus();box.select();try{document.execCommand('copy');toast('Enquiry text selected and copied.')}catch(er){toast('Select and copy the enquiry text manually.')}}});
})();
