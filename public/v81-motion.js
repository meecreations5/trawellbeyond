/* TrawellBeyond V8.1 | HTML route motion adapter. Enhances; never intercepts navigation. */
(()=>{
 'use strict';
 if(location.pathname.startsWith('/admin')||window.__tbV81Motion)return;
 window.__tbV81Motion=true;
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 const INTRO='tb_intro_seen_v812';
 const POSTCARD='tb_postcard_v81';
 const storage={get(key){try{return sessionStorage.getItem(key);}catch{return null;}},set(key,val){try{sessionStorage.setItem(key,val);return true;}catch{return false;}},take(key){try{const val=sessionStorage.getItem(key);sessionStorage.removeItem(key);return val;}catch{return null;}}};
 function intro(){
  const preview=new URLSearchParams(location.search).get('previewLogo')==='1';
  if(reduce.matches||(!preview&&storage.get(INTRO)))return;
  const node=document.createElement('div');node.className='tb-v81-brand-reveal';node.dataset.tbMotion='v8.1.2';node.setAttribute('aria-hidden','true');
  node.innerHTML='<div class="tb-v81-reveal-inner"><img class="tb-v81-reveal-logo" src="/assets/trawellbeyond-display.svg" alt="" decoding="async"><span class="tb-v81-welcome-line"></span><span class="tb-v81-brand-caption">YOUR JOURNEY, CREATED AROUND YOU.</span></div>';
  document.body.append(node);
  if(!preview)storage.set(INTRO,'1');
  setTimeout(()=>node.remove(),1750);
 }
 function captureCard(event){
  const card=event.target.closest('[data-destination-slug],[data-journey-slug],a.tb-card[href]');
  if(!card)return;
  const kind=card.dataset.destinationSlug?'destinations':card.dataset.journeySlug?'journeys':'';
  const slug=card.dataset.destinationSlug||card.dataset.journeySlug||'';
  let match=kind&&slug?{kind,slug}:null;
  if(!match){try{const m=new URL(card.href,location.href).pathname.match(/^\/(destinations|journeys|experiences)\/([a-z0-9-]+)\/?$/);if(m)match={kind:m[1],slug:m[2]};}catch{}}
  if(!match||!/^[a-z0-9-]{1,120}$/.test(match.slug))return;
  storage.set(POSTCARD,JSON.stringify(match));
  if(!reduce.matches){card.classList.add('tb-v81-card-pressed');setTimeout(()=>card.classList.remove('tb-v81-card-pressed'),190);}
 }
 document.addEventListener('pointerdown',captureCard,{passive:true});
 document.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')captureCard(event);});
 function arrival(){
  const value=storage.take(POSTCARD);if(!value||reduce.matches)return;
  try{
   const source=JSON.parse(value);
   const m=location.pathname.match(/^\/(destinations|journeys|experiences)\/([a-z0-9-]+)\/?$/);
   if(!m||source.kind!==m[1]||source.slug!==m[2])return;
   const hero=document.querySelector('.destination-hero__image,.journey-main-image,.ex-hero__image');
   if(hero)hero.classList.add('tb-v81-arrived');
  }catch{}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{intro();arrival();},{once:true});
 else {intro();arrival();}
})();
