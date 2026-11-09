/* TrawellBeyond | discreet, cross-page Journey Tray. No login, payments or PII. */
(function(){
 'use strict';
 if(window.__tbTrayReady||location.pathname.startsWith('/admin'))return;
 window.__tbTrayReady=true;
 const KEY='tb_journey_v73';
 const escape=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const slug=value=>String(value||'').toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-|-$/g,'').slice(0,100);
 let state={version:1,destinations:[],experiences:[],purpose:''};
 const clean=items=>Array.isArray(items)?items.filter(x=>x&&x.slug&&x.title).slice(0,25).map(x=>({slug:slug(x.slug),title:String(x.title).slice(0,160),...(x.destinationSlug?{destinationSlug:slug(x.destinationSlug)}:{})})):[];
 function load(){try{const raw=JSON.parse(localStorage.getItem(KEY)||'{}');state={version:1,destinations:clean(raw.destinations).slice(0,6),experiences:clean(raw.experiences),purpose:String(raw.purpose||'').slice(0,100)};}catch{state={version:1,destinations:[],experiences:[],purpose:''};}return state;}
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}render();window.dispatchEvent(new CustomEvent('tb:journey-updated',{detail:state}));}
 function save(type,item){load();if(type==='purpose')state.purpose=String(item||'').slice(0,100);else if(['destinations','experiences'].includes(type)){
  const candidate={slug:slug(item.slug||item.title),title:String(item.title||'').slice(0,160),...(item.destinationSlug?{destinationSlug:slug(item.destinationSlug)}:{})};
  if(candidate.slug&&candidate.title&&!state[type].some(x=>x.slug===candidate.slug))state[type].push(candidate);
 }persist();}
 const root=document.createElement('div');root.id='tb-journey-tray';
 root.innerHTML='<button id="tb-tray-toggle" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="tb-tray-panel"><span class="tb-tray-dot">✳</span> My Journey <span id="tb-tray-count">0</span></button><div id="tb-tray-shade" hidden></div><aside id="tb-tray-panel" role="dialog" aria-modal="true" aria-label="Your journey selections" hidden><div class="tb-tray-top"><span>CREATED AROUND YOU</span><button id="tb-tray-close" type="button" aria-label="Close My Journey">×</button></div><h2>Moments you<br/><em>might make yours.</em></h2><p class="tb-tray-intro">Keep what interests you as you browse. Nothing is booked or sent until you submit an enquiry.</p><div id="tb-tray-items" aria-live="polite"></div><a href="/create" id="tb-tray-create">Continue to CREATE ↗</a><button id="tb-tray-clear" type="button">Clear selections</button></aside><span id="tb-tray-toast" role="status" aria-live="polite"></span>';
 document.body.append(root);
 const button=root.querySelector('#tb-tray-toggle'),panel=root.querySelector('#tb-tray-panel'),shade=root.querySelector('#tb-tray-shade'),list=root.querySelector('#tb-tray-items');
 let lastFocus=null,toastTimer=null;
 function notice(text){const toast=root.querySelector('#tb-tray-toast');toast.textContent=text;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2200);}
 function render(){
  const count=state.destinations.length+state.experiences.length;
  root.querySelector('#tb-tray-count').textContent=String(count);
  root.querySelector('#tb-tray-items').innerHTML=count||state.purpose?[
   state.purpose?`<section><h3>YOUR PURPOSE</h3><p>${escape(state.purpose)}</p></section>`:'',
   ...[['destinations','Destinations'],['experiences','Experiences']].map(([type,label])=>state[type].length?`<section><h3>${label.toUpperCase()}</h3>${state[type].map(x=>`<div class="tb-tray-item"><span>${escape(x.title)}</span><button type="button" data-remove-type="${type}" data-remove-slug="${escape(x.slug)}" aria-label="Remove ${escape(x.title)}">×</button></div>`).join('')}</section>`:'')].join(''):'<p>No destinations or experiences selected yet. Browse Singapore and add your favourites.</p>';
  root.querySelector('#tb-tray-clear').hidden=!count&&!state.purpose;
 }
 function open(){lastFocus=document.activeElement;panel.hidden=false;shade.hidden=false;button.setAttribute('aria-expanded','true');document.body.classList.add('tb-tray-open');root.querySelector('#tb-tray-close').focus();}
 function close(){panel.hidden=true;shade.hidden=true;button.setAttribute('aria-expanded','false');document.body.classList.remove('tb-tray-open');lastFocus?.focus?.();}
 button.addEventListener('click',()=>panel.hidden?open():close());
 root.querySelector('#tb-tray-close').addEventListener('click',close);shade.addEventListener('click',close);
 root.querySelector('#tb-tray-clear').addEventListener('click',()=>{state={version:1,destinations:[],experiences:[],purpose:''};persist();notice('Your selections were cleared.');});
 list.addEventListener('click',event=>{const target=event.target.closest('[data-remove-type]');if(!target)return;const type=target.dataset.removeType;state[type]=state[type].filter(x=>x.slug!==target.dataset.removeSlug);persist();});
 document.addEventListener('click',event=>{
  const ex=event.target.closest('[data-tb-add-experience]');const dest=event.target.closest('[data-tb-add-destination]');
  const target=ex||dest;if(!target)return;
  event.preventDefault();
  const type=ex?'experiences':'destinations';save(type,{slug:target.dataset.tbSlug,title:target.dataset.tbTitle,destinationSlug:target.dataset.tbDestinationSlug});
  notice(`${target.dataset.tbTitle||'Selection'} added to My Journey.`);
  target.setAttribute('aria-label',`${target.dataset.tbTitle||'Selection'} added to My Journey`);
 });
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)close();if(event.key!=='Tab'||panel.hidden)return;const focus=Array.from(panel.querySelectorAll('button:not(:disabled):not([hidden]),a[href]'));if(!focus.length)return;const first=focus[0],last=focus[focus.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
 window.addEventListener('storage',event=>{if(event.key===KEY){load();render();}});
 window.TBJourneyTray={add:(type,item)=>save(type,item),setPurpose:value=>save('purpose',value),snapshot:()=>JSON.parse(JSON.stringify(load())),open,clear:()=>{state={version:1,destinations:[],experiences:[],purpose:''};persist();}};
 load();render();
})();
