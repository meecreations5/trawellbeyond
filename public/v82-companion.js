/* V8.2 Journey Companion. Guided, CMS-grounded, explicit consent, no silent transcript persistence. */
(function(){
 'use strict';
 if(window.__tbV82CompanionReady||location.pathname.startsWith('/admin'))return;
 window.__tbV82CompanionReady=true;
 const PURPOSES=['Togetherness','Discovery','Celebration','Rest and renewal','Meaningful journeys'];
 const PACES=['Relaxed','Balanced','Active','Flexible'];
 const STYLES=['Need guidance','Value conscious','Comfort','Premium'];
 const INTERESTS=['Culture & heritage','Nature & wildlife','Food & local life','Beach & relaxation','Family moments','Adventure','Celebrations','City discoveries'];
 const KEY='tb_companion_preferences_v82';
 const fresh=()=>({purpose:'',pace:'Flexible',budgetBand:'Need guidance',budgetNote:'',days:5,travelers:'',dates:'',destination:'',interests:[],selectedJourneys:[]});
 let prefs=fresh(),stage='purpose',opened=false,loading=false,catalogLoaded=false,previousFocus=null,catalog={destinations:[],journeys:[]};
 try{const raw=JSON.parse(sessionStorage.getItem(KEY)||'null');if(raw&&typeof raw==='object'){prefs={...fresh(),...raw,interests:INTERESTS.filter(x=>raw.interests?.includes(x)).slice(0,6)};}}catch{}
 const root=document.createElement('div');root.id='tb-v82-companion';
 root.innerHTML=`<button class="tb-v82-launch" data-tb-assistant-trigger type="button" aria-label="Open TrawellBeyond Journey Companion"><img class="tb-v82-motif" src="/assets/trawellbeyond-accent-motif.svg" alt="" aria-hidden="true"> Ask TrawellBeyond</button>
 <div class="tb-v82-shade" hidden></div><section class="tb-v82-panel" role="dialog" aria-modal="true" aria-labelledby="tb-v82-title" hidden>
 <header><img class="tb-v82-mark" src="/assets/trawellbeyond-accent-motif.svg" alt="" aria-hidden="true"><div><span>YOUR PERSONAL JOURNEY COMPANION</span><h2 id="tb-v82-title">Let's begin with you.</h2></div><button class="tb-v82-close" aria-label="Close Journey Companion" type="button">×</button></header>
 <div class="tb-v82-progress" aria-hidden="true"><span></span></div><div class="tb-v82-body" aria-live="polite"></div>
 <footer><button type="button" class="tb-v82-back">← Back</button><button type="button" class="tb-v82-human">Talk to our team ↗</button></footer>
 </section>`;
 document.body.append(root);
 if(document.querySelector('.tb-concierge'))root.querySelector('.tb-v82-launch').hidden=true;
 const panel=root.querySelector('.tb-v82-panel'),shade=root.querySelector('.tb-v82-shade'),body=root.querySelector('.tb-v82-body'),back=root.querySelector('.tb-v82-back'),bar=root.querySelector('.tb-v82-progress>span');
 const stages=['purpose','travelers','timing','interests','pace','budget','results'];
 const setText=(tag,cls,text,parent=body)=>{const node=document.createElement(tag);if(cls)node.className=cls;node.textContent=text;parent.append(node);return node;};
 function persist(){try{sessionStorage.setItem(KEY,JSON.stringify({purpose:prefs.purpose,pace:prefs.pace,budgetBand:prefs.budgetBand,days:prefs.days,travelers:prefs.travelers,dates:prefs.dates,destination:prefs.destination,budgetNote:prefs.budgetNote,interests:prefs.interests,selectedJourneys:prefs.selectedJourneys}));}catch{}}
 function actions(list,selected,onClick){const wrap=document.createElement('div');wrap.className='tb-v82-options';list.forEach(x=>{const btn=document.createElement('button');btn.type='button';btn.className=x===selected?'is-selected':'';btn.setAttribute('aria-pressed',String(x===selected));btn.textContent=x;btn.addEventListener('click',()=>{onClick(x);persist();render();});wrap.append(btn);});body.append(wrap);}
 function next(){const index=stages.indexOf(stage);stage=stages[Math.min(stages.length-1,index+1)];persist();render();}
 function previous(){if(stage==='handoff'){stage='results';render();return;}stage=stages[Math.max(0,stages.indexOf(stage)-1)];render();}
 function action(label,fn,primary=true){const b=setText('button',primary?'tb-v82-action':'tb-v82-outline',label);b.type='button';b.addEventListener('click',fn);return b;}
 async function loadCatalog(){
  if(loading||catalogLoaded)return;
  loading=true;
  try{if(!window.TrawellBeyondCatalog)throw new Error('Catalog is unavailable.');const [destinations,journeys]=await Promise.all([window.TrawellBeyondCatalog.list('destinations',150),window.TrawellBeyondCatalog.list('journeys',160)]);catalog={destinations,journeys};}
  catch{catalog={destinations:[],journeys:[]};}
  finally{catalogLoaded=true;loading=false;render();}
 }
 function recordCard(item,type,reason){
  const card=document.createElement('article');card.className='tb-v82-record';
  const kicker=setText('span','',reason||'Published travel inspiration',card);
  const heading=setText('h4','',item.title||'Journey',card);
  const para=setText('p','',String(item.summary||'').slice(0,140),card);
  const row=document.createElement('div');row.className='tb-v82-record-actions';
  const link=document.createElement('a');link.href=`/${type}/${encodeURIComponent(item.slug||item.id)}`;link.textContent='Explore ↗';row.append(link);
  const save=document.createElement('button');save.type='button';save.textContent='+ My Journey';save.addEventListener('click',()=>{
   if(type==='destinations'){if(window.TBJourneyTray)window.TBJourneyTray.add('destinations',{slug:item.slug||item.id,title:item.title});else{location.href='/my-journey';return;}}
   else{const key='tb_saved_journeys_v82';try{const list=JSON.parse(localStorage.getItem(key)||'[]');const names=[...new Set([...(Array.isArray(list)?list:[]),item.slug||item.id])].slice(0,12);localStorage.setItem(key,JSON.stringify(names));prefs.selectedJourneys=[...new Set([...prefs.selectedJourneys,item.slug||item.id])].slice(0,8);persist();}catch{}}
   save.textContent='✓ Saved';save.disabled=true;
  });row.append(save);card.append(row);return card;
 }
 function render(){
  if(!opened)return;
  body.replaceChildren();
  const stepIdx=stages.indexOf(stage);bar.style.width=(stage==='handoff'?100:Math.max(12,(stepIdx+1)/stages.length*100))+'%';
  back.hidden=stage==='purpose';
  if(stage==='purpose'){
   setText('small','tb-v82-eyebrow','01 / WHY TRAVEL?');setText('h3','', 'What would make this journey matter?');setText('p','', 'A place can come later. Start with the reason.');
   actions(PURPOSES,prefs.purpose,x=>{prefs.purpose=x;});action('Continue ↗',next).disabled=!prefs.purpose;
  }else if(stage==='travelers'){
   setText('small','tb-v82-eyebrow','02 / YOUR PEOPLE');setText('h3','','Who is travelling with you?');
   const label=setText('label','tb-v82-label','Travellers (optional)');const input=document.createElement('input');input.type='text';input.maxLength=80;input.placeholder='2 adults and 1 child, or travelling solo';input.value=prefs.travelers;input.addEventListener('input',e=>{prefs.travelers=e.target.value;persist();});label.append(input);
   const daysLabel=setText('label','tb-v82-label','How many days are you considering?');const days=document.createElement('input');days.type='number';days.min='1';days.max='30';days.value=prefs.days;days.addEventListener('change',e=>{prefs.days=Math.max(1,Math.min(30,Number(e.target.value)||5));persist();});daysLabel.append(days);
   action('Continue ↗',next);
  }else if(stage==='timing'){
   setText('small','tb-v82-eyebrow','03 / WHEN & WHERE');setText('h3','','Is a place or travel date on your mind?');setText('p','','Both are optional. We can help you decide.');
   const destLabel=setText('label','tb-v82-label','Destination (optional)');const dest=document.createElement('input');dest.maxLength=100;dest.placeholder='A place in mind, or open to suggestions';dest.value=prefs.destination;dest.addEventListener('input',e=>{prefs.destination=e.target.value;persist();});destLabel.append(dest);
   const dateLabel=setText('label','tb-v82-label','Preferred departure date (optional)');const date=document.createElement('input');date.type='date';date.min=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);date.value=prefs.dates;date.addEventListener('change',e=>{prefs.dates=e.target.value;persist();});dateLabel.append(date);
   action('Continue ↗',next);
  }else if(stage==='interests'){
   setText('small','tb-v82-eyebrow','04 / WHAT YOU LOVE');setText('h3','','Which moments sound like yours?');
   const wrap=document.createElement('div');wrap.className='tb-v82-options';INTERESTS.forEach(x=>{const btn=document.createElement('button');btn.type='button';btn.className=prefs.interests.includes(x)?'is-selected':'';btn.setAttribute('aria-pressed',String(prefs.interests.includes(x)));btn.textContent=(prefs.interests.includes(x)?'✓ ':'')+x;btn.addEventListener('click',()=>{prefs.interests=prefs.interests.includes(x)?prefs.interests.filter(v=>v!==x):[...prefs.interests,x].slice(0,6);persist();render();});wrap.append(btn);});body.append(wrap);action('Continue ↗',next);
  }else if(stage==='pace'){
   setText('small','tb-v82-eyebrow','05 / YOUR PACE');setText('h3','','How would you like to feel on this trip?');actions(PACES,prefs.pace,x=>{prefs.pace=x;});action('Continue ↗',next);
  }else if(stage==='budget'){
   setText('small','tb-v82-eyebrow','06 / YOUR TRAVEL STYLE');setText('h3','','What kind of comfort suits you?');setText('p','','These describe a planning style, not an estimated or confirmed price.');actions(STYLES,prefs.budgetBand,x=>{prefs.budgetBand=x;});const budgetLabel=setText('label','tb-v82-label','Approximate budget (optional)');const budget=document.createElement('input');budget.maxLength=80;budget.placeholder='Total trip budget or ask our advisor';budget.value=prefs.budgetNote;budget.addEventListener('input',e=>{prefs.budgetNote=e.target.value;persist();});budgetLabel.append(budget);action('Show possibilities ↗',next);
  }else if(stage==='results'){
   setText('small','tb-v82-eyebrow','07 / POSSIBILITIES');setText('h3','','A few places to begin.');setText('p','','Suggestions use published TrawellBeyond content only. Our advisors confirm current prices, timings and availability.');
   if(!window.TrawellBeyondCatalog){setText('p','tb-v82-notice','Published suggestions are unavailable. You can still CREATE a journey or talk to our team.');}
   else if(!catalogLoaded){setText('p','','Finding relevant journeys…');loadCatalog();}
   else if(!catalog.destinations.length&&!catalog.journeys.length){setText('p','','No published recommendations are available yet. A travel advisor can still help.');}
   else{
    const rank=window.TrawellBeyondCatalog.rank;
    const matches=[...rank(catalog.destinations,prefs,'destinations',2).map(x=>({...x,type:'destinations'})),...rank(catalog.journeys,prefs,'journeys',2).map(x=>({...x,type:'journeys'}))];
    if(!matches.length)setText('p','','Published matches are being added. You can still talk to our travel team.');
    for(const {item,reasons,type} of matches)body.append(recordCard(item,type,reasons[0]));
   }
   action('Explore all Journey Matches ↗',()=>{location.href='/journey-match';});
   action('CREATE from my preferences ↗',()=>{
    try{const key='tb_create_draft_v73',old=JSON.parse(localStorage.getItem(key)||'{}');localStorage.setItem(key,JSON.stringify({...old,version:1,purpose:prefs.purpose,nights:Math.max(1,prefs.days-1),notes:`Journey Companion: ${prefs.interests.join(', ')}; pace ${prefs.pace}; style ${prefs.budgetBand}; budget ${prefs.budgetNote||'to discuss'}.`}));}catch{}
    location.href='/create';
   },false);
  }else if(stage==='handoff'){
   setText('small','tb-v82-eyebrow','CONNECT / YOUR TRAVEL ADVISOR');setText('h3','',"Let's make it personal.");setText('p','','Share your contact details only if you would like our team to respond. Your unfinished conversation is not stored in our Admin.');
   const form=document.createElement('form');form.className='tb-v82-form';form.innerHTML=`<label>Name *<input name="name" autocomplete="name" required maxlength="120" placeholder="Full name"></label><label>Phone *<input name="phone" autocomplete="tel" required inputmode="tel" maxlength="40" placeholder="Phone with country code"></label><label>Email (optional)<input name="email" type="email" autocomplete="email" maxlength="160" placeholder="you@example.com"></label><label>Preferred contact<select name="followUpChannel"><option value="call">Call</option><option value="whatsapp">WhatsApp</option><option value="email">Email</option></select></label><label>Convenient contact time (optional)<input name="preferredContactTime" maxlength="80" placeholder="For example, evenings IST"></label><label class="tb-v82-consent"><input type="checkbox" name="consent" required><span>I agree that TrawellBeyond may contact me about this travel enquiry.</span></label><button type="submit" class="tb-v82-action">Send my enquiry ↗</button><p role="alert" class="tb-v82-error" hidden></p>`;
   form.addEventListener('submit',async e=>{
    e.preventDefault();const data=new FormData(form),error=form.querySelector('.tb-v82-error'),send=form.querySelector('[type=submit]');error.hidden=true;send.disabled=true;send.textContent='Sending enquiry…';
    try{
     if(!window.TrawellBeyondEnquiries?.submit)throw new Error('The enquiry service is unavailable. Please retry or use the enquiry page.');
     const summary=window.TrawellBeyondCatalog?.summary?.(prefs,{journeys:prefs.selectedJourneys})||`Purpose: ${prefs.purpose}`;
     const result=await window.TrawellBeyondEnquiries.submit({source:'companion',name:data.get('name'),phone:data.get('phone'),email:data.get('email'),followUpChannel:data.get('followUpChannel'),preferredContactTime:data.get('preferredContactTime'),destination:prefs.destination||'Open to suggestions',dates:prefs.dates||'Flexible',travelers:prefs.travelers,purpose:prefs.purpose,leadSummary:summary,notes:summary,consent:data.get('consent')==='on'});
     if(!result?.ok)throw new Error('Enquiry not confirmed. Please retry.');
     body.replaceChildren();setText('small','tb-v82-eyebrow','THANK YOU / ENQUIRY RECEIVED');setText('h3','','Our team has your journey idea.');setText('p','','We will review your preferences and get in touch. No booking has been made.');setText('p','tb-v82-ref',`Reference: ${result.id}`);
     const link=document.createElement('a');link.href='/my-enquiries';link.className='tb-v82-action';link.textContent='Check enquiry progress ↗';body.append(link);back.hidden=true;
    }catch(err){error.textContent=err.message||'Unable to submit enquiry.';error.hidden=false;}
    finally{send.disabled=false;send.textContent='Send my enquiry ↗';}
   });body.append(form);
  }
 }
 function open(){if(opened)return;opened=true;previousFocus=document.activeElement;panel.hidden=false;shade.hidden=false;document.body.classList.add('tb-v82-open');render();panel.querySelector('.tb-v82-close').focus();}
 function close(){if(!opened)return;opened=false;panel.hidden=true;shade.hidden=true;document.body.classList.remove('tb-v82-open');previousFocus?.focus?.();}
 document.addEventListener('click',event=>{if(event.target.closest('[data-tb-assistant-trigger]')){event.preventDefault();open();}});
 root.querySelector('.tb-v82-close').addEventListener('click',close);shade.addEventListener('click',close);back.addEventListener('click',previous);root.querySelector('.tb-v82-human').addEventListener('click',()=>{stage='handoff';render();});
 document.addEventListener('keydown',event=>{if(!opened)return;if(event.key==='Escape'){event.preventDefault();close();return;}if(event.key!=='Tab')return;
  const focus=Array.from(panel.querySelectorAll('button:not([disabled]):not([hidden]),a[href],input:not([disabled]),select:not([disabled])')).filter(el=>el.offsetParent!==null);
  if(!focus.length)return;const first=focus[0],last=focus[focus.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
 window.addEventListener('tb:v82-bridge-ready',()=>{if(opened&&stage==='results')render();});
 window.TBJourneyCompanion={open,close};
})();
