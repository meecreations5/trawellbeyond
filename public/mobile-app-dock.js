/* V8.3 - mobile app dock for CMS-rendered HTML home and detail templates. */
(function(){
 'use strict';
 if(document.querySelector('.tb-app-dock') || location.pathname.startsWith('/admin'))return;
 const paths={home:'/',discover:'/destinations',create:'/create',saved:'/my-journey'};
 const icons={
  home:'<path d="M3.5 10 12 3.5 20.5 10V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z"/>',
  discover:'<circle cx="12" cy="12" r="9"/><path d="m15.9 8.1-2.6 5.2-5.2 2.6 2.6-5.2z"/>',
  saved:'<path d="M5.5 4.5h13v16l-6.5-4-6.5 4z"/>',
  ask:'<path d="M20.5 11.4a7.8 7.8 0 0 1-8.2 7.6 9.2 9.2 0 0 1-3-.5l-4.7 2 1.2-4a7.8 7.8 0 0 1-2.3-5.5A8.3 8.3 0 0 1 12 3a8.3 8.3 0 0 1 8.5 8.4z"/><path d="M8.5 11.5h7"/>'
 };
 const icon=(id)=>`<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[id]}</svg>`;
 const path=location.pathname;
 const selected=path==='/'?'home':/^\/(create|customize)(\/|$)/.test(path)?'create':/^\/(my-journey|my-enquiries)(\/|$)/.test(path)?'saved':/^\/(destinations|experiences|journeys|offers|journey-match|insider)(\/|$)/.test(path)?'discover':'';
 const tabs=[['home','Home'],['discover','Explore'],['create','CREATE'],['saved','Saved'],['ask','Guide']];
 const nav=document.createElement('nav');nav.className='tb-app-dock';nav.dataset.tbMobileApp='v8.3';nav.setAttribute('aria-label','Mobile app navigation');
 const body=document.createElement('div');body.className='tb-app-dock-items';
 for(const [id,label] of tabs){
  const a=document.createElement('a');a.className=`tb-app-tab${id==='create'?' tb-app-tab-create':''}${selected===id?' is-current':''}${id==='ask'?' tb-app-tab-guide':''}`;
  a.href=paths[id]||'/enquire';a.setAttribute('aria-label',id==='ask'?'Open Journey Companion':label);
  if(id===selected)a.setAttribute('aria-current','page');
  if(id==='ask')a.dataset.tbAssistantTrigger='true';
  const graphic=id==='create'?'<img src="/assets/trawellbeyond-accent-motif.svg" alt="" />':icon(id);
  a.innerHTML=`<span class="tb-app-tab-icon">${graphic}</span><span class="tb-app-tab-label">${label}</span>`;
  body.append(a);
 }
 nav.append(body);document.body.append(nav);
})();
