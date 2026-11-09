'use client';
import {resolveImageVariant} from '@/lib/media-variants.mjs';
import {useEffect,useMemo,useState} from 'react';
import {publishedList} from '@/lib/content-server';
import {submitEnquiry} from '@/lib/enquiries-web';
import {SG_PHOTOS} from '@/lib/singapore-photos.mjs';
import {JOURNEY_TRAY_KEY,JOURNEY_DRAFT_KEY,normalizeTray,normalizePlan,assignPlanDay,movePlanItem,itineraryNotes,canonicalPurpose} from '@/lib/journey-plan.mjs';
import './create-studio.css';

const stages=['Your purpose','Your destination','Your preferences','Your enquiry'];
const options=[
 ['Togetherness','More time together.','Family, friends and familiar voices.',SG_PHOTOS.beach.url],
 ['Discovery','Something new to discover.','Streets, stories and unexpected moments.',SG_PHOTOS.littleIndia.url],
 ['Celebration','A moment worth marking.','Milestones, romance and shared memories.',SG_PHOTOS.gardensNight.url],
 ['Rest and renewal','Time to feel like yourself.','Slower mornings and space to unwind.',SG_PHOTOS.botanical.url],
 ['Meaningful journeys','A journey with purpose.','Culture, heritage and places that mean something to you.',SG_PHOTOS.littleIndia.url]
];
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const slug=x=>String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export default function CreateStudio({page={},initialDestination='',initialPurpose='',initialExperience='',initialNotes='',initialNights=3}){
 const [stage,setStage]=useState(0),[destinations,setDestinations]=useState([]),[experiences,setExperiences]=useState([]);
 const [purpose,setPurpose]=useState(canonicalPurpose(initialPurpose)),[destination,setDestination]=useState(initialDestination),[customDestination,setCustomDestination]=useState('');
 const [selected,setSelected]=useState(initialExperience?[initialExperience]:[]);
 const [nights,setNights]=useState(initialNights),[adults,setAdults]=useState(2),[children,setChildren]=useState(0),[stay,setStay]=useState('Comfort');
 const [date,setDate]=useState(''),[notes,setNotes]=useState(initialNotes),[name,setName]=useState(''),[phone,setPhone]=useState(''),[email,setEmail]=useState('');
 const [consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[reference,setReference]=useState('');
 const [planMode,setPlanMode]=useState('guided'),[planDays,setPlanDays]=useState([]),[draftNotice,setDraftNotice]=useState('');
 useEffect(()=>{let live=true;Promise.all([publishedList('destinations',100),publishedList('experiences',300)]).then(([a,b])=>{if(live){setDestinations(a);setExperiences(b);}}).catch(()=>{if(live)setError('Published destination images could not load. You can still describe your ideal destination.');});return ()=>{live=false;};},[]);
 useEffect(()=>{
  // Resume only non-personal trip preferences; never persist names, phones, email or consent.
  try{
   const tray=normalizeTray(JSON.parse(localStorage.getItem(JOURNEY_TRAY_KEY)||'{}'));
   const draft=JSON.parse(localStorage.getItem(JOURNEY_DRAFT_KEY)||'null');
   if(draft?.version===1){
    if(!initialDestination)setDestination(String(draft.destination||'').slice(0,120));
    if(!initialPurpose)setPurpose(canonicalPurpose(draft.purpose));
    if(!initialNotes)setNotes(String(draft.notes||'').slice(0,1500));
    setCustomDestination(String(draft.customDestination||'').slice(0,120));
    setNights(clamp(Number(draft.nights)||3,1,21));
    setAdults(clamp(Number(draft.adults)||2,1,20));
    setChildren(clamp(Number(draft.children)||0,0,20));
    if(['Comfort','Premium','Flexible'].includes(draft.stay))setStay(draft.stay);
    if(['guided','detailed'].includes(draft.planMode))setPlanMode(draft.planMode);
    setPlanDays(Array.isArray(draft.planDays)?draft.planDays:[]);
    setDate(/^\d{4}-\d{2}-\d{2}$/.test(draft.date||'')&&draft.date>=today()?draft.date:'');
    setDraftNotice('Your saved journey choices have been restored on this device. No enquiry has been sent.');
   }
   if(!initialDestination&&tray.destinations.length)setDestination(tray.destinations[0].title);
   if(!initialPurpose&&tray.purpose)setPurpose(canonicalPurpose(tray.purpose));
   const saved=Array.isArray(draft?.selected)?draft.selected:[];
   setSelected(old=>[...new Set([...saved,...tray.experiences.map(item=>item.title),...old].filter(Boolean))].slice(0,25));
  }catch{ /* Private browsing may disable localStorage; CREATE still works. */ }
 },[initialDestination,initialPurpose,initialExperience,initialNotes]);
 function saveProgress(){
  const payload={version:1,purpose,destination,customDestination,selected,nights,adults,children,stay,date,notes,planMode,planDays:normalizePlan(planDays,selected,nights+1)};
  try{localStorage.setItem(JOURNEY_DRAFT_KEY,JSON.stringify(payload));setDraftNotice('Journey choices saved on this device. This is not an enquiry.');}
  catch{setDraftNotice('This browser cannot save local drafts. You can still submit an enquiry.');}
 }
 const planned=normalizePlan(planDays,selected,nights+1);
 const current=useMemo(()=>destinations.find(d=>slug(d.title)===slug(destination)||d.slug===slug(destination)),[destinations,destination]);
 const related=useMemo(()=>experiences.filter(e=>e.destinationSlug===current?.slug),[experiences,current]);
 const chosenPlace=destination||customDestination.trim()||'Open to suggestions';
 const toggle=value=>setSelected(old=>old.includes(value)?old.filter(x=>x!==value):[...old,value]);
 const next=()=>{setError('');if(stage===0&&!purpose)return setError('Choose why you want to travel, or select Help me decide.');if(stage===1&&!destination&&!customDestination.trim())return setError('Select a destination or enter your own.');setStage(s=>clamp(s+1,0,3));window.scrollTo({top:0,behavior:'smooth'});};
 const back=()=>{setError('');setStage(s=>Math.max(0,s-1));window.scrollTo({top:0,behavior:'smooth'});};
 async function submit(e){e.preventDefault();if(busy)return;setBusy(true);setError('');
  try{const lines=[`Why: ${purpose}`,`Destination: ${chosenPlace}`,`Duration: ${nights} nights`, `Travellers: ${adults} adult(s), ${children} child(ren)`, `Stay: ${stay}`, `Experiences: ${selected.join(', ')||'Open to suggestions'}`, ...(planMode==='detailed'?[`Preferred day plan (to be checked by our team):\n${itineraryNotes(planned)}`]:[]), `Additional details: ${notes||'None'}`];
   const result=await submitEnquiry({source:'create',name,phone,email,destination:chosenPlace,dates:date||'Flexible',travelers:`${adults} adults, ${children} children`,purpose:purpose||'Personalized travel',notes:lines.join('\n').slice(0,2450),consent});
   if(!result?.ok)throw new Error('Your enquiry could not be saved. Please retry.');setReference(result.id||'Received');try{localStorage.removeItem(JOURNEY_DRAFT_KEY);window.TBJourneyTray?.clear?.();}catch{}window.scrollTo({top:0,behavior:'smooth'});
  }catch(err){setError(err.message||'Unable to send your enquiry. Please retry.');}finally{setBusy(false);}}
 const previewImage=resolveImageVariant(current,current?.heroImage,'medium')||SG_PHOTOS.skyline.url;
 const Counter=({label,value,onChange,min,max})=><div className="cr-counter"><span>{label}</span><div><button type="button" disabled={value<=min} aria-label={`Fewer ${label}`} onClick={()=>onChange(n=>clamp(n-1,min,max))}>−</button><output>{value}</output><button type="button" disabled={value>=max} aria-label={`More ${label}`} onClick={()=>onChange(n=>clamp(n+1,min,max))}>+</button></div></div>;
 return <main className="cr-page" id="top">
  <section className="cr-hero"><div className="cr-hero-copy"><small className="cr-kicker">TRAWELLBEYOND / CREATE</small><h1>Every journey<br/>starts <em>with you.</em></h1><p>{page.summary||'The best journeys begin with people, purpose and the moments you want to share. Tell us what matters.'}</p><span>PEOPLE FIRST · DESTINATION SECOND</span></div><div className="cr-hero-photo"><img src={previewImage} alt="Destination inspiration" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/assets/singapore-gardens.svg';}}/><span>CREATED AROUND YOU.</span></div></section>
  <div className="cr-studio"><div className="cr-progress"><small className="cr-kicker">THE JOURNEY BUILDER</small><span>STEP {stage+1} / 4</span></div><div className="cr-steps" aria-label="Journey builder steps">{stages.map((label,i)=><button type="button" key={label} disabled={i>stage} aria-current={stage===i?'step':undefined} className={stage===i?'active':i<stage?'done':''} onClick={()=>setStage(i)}><b>{String(i+1).padStart(2,'0')}</b> {label}</button>)}</div>
   <div className="cr-grid"><div className="cr-main">
   {reference?<div className="cr-success" role="status"><span>✓</span><h2>We have received<br/><em>your journey.</em></h2><p>Our team will contact you to understand the details and prepare a personal proposal. Reference: <strong>{reference}</strong></p><button type="button" className="cr-next" onClick={()=>{setReference('');setStage(0);setConsent(false);}}>Create another journey ↗</button></div>:<>
   {stage===0&&<section><small className="cr-kicker">01 / THE REASON</small><h2>What would make<br/>this journey <em>matter?</em></h2><p className="cr-lead">Choose what speaks to you. A place can come later.</p><div className="cr-purposes">{options.map(([id,label,desc,img],i)=><button type="button" className={purpose===id?'selected':''} aria-pressed={purpose===id} key={id} onClick={()=>setPurpose(id)}><img src={img} alt="" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src="/assets/singapore-gardens.svg";}}/><small>0{i+1} / {id.toUpperCase()}</small><strong>{label}</strong><span>{desc}</span><i>↗</i></button>)}</div><button type="button" className="cr-link" onClick={()=>setPurpose('Open to suggestions')}>Not sure yet? Help me decide ↗</button></section>}
   {stage===1&&<section><small className="cr-kicker">02 / THE PLACE</small><h2>Where shall<br/><em>we begin?</em></h2><p className="cr-lead">Choose from our published destinations, or share your own idea.</p>{destinations.length?<div className="cr-destinations">{destinations.map(d=><button type="button" key={d.slug} className={current?.slug===d.slug?'selected':''} aria-pressed={current?.slug===d.slug} onClick={()=>{setDestination(d.title);setCustomDestination('');setSelected([]);}}><img src={resolveImageVariant(d,d.heroImage,'thumb')||'/assets/singapore-skyline.svg'} alt={`${d.title} destination`} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/assets/singapore-skyline.svg';}}/><strong>{d.title}</strong><span>↗</span></button>)}</div>:<p className="cr-notice">No published destinations yet. Once Singapore is published in Admin, its photograph and card will appear here. You can still send an enquiry now.</p>}<label className="cr-label">Another destination on your mind?<input placeholder="e.g. Singapore, Dubai, somewhere new…" maxLength={120} value={customDestination} onChange={e=>{setCustomDestination(e.target.value);if(e.target.value)setDestination('');}}/></label></section>}
   {stage===2&&<section><small className="cr-kicker">03 / YOUR PREFERENCES</small><h2>Small choices.<br/><em>Personal moments.</em></h2><p className="cr-lead">These are choices for your enquiry, not a booking.</p>{related.length>0&&<><h3 className="cr-subheading">Experiences to make yours</h3><div className="cr-experiences">{related.map(x=><button type="button" key={x.slug} className={selected.includes(x.title)?'selected':''} aria-pressed={selected.includes(x.title)} onClick={()=>toggle(x.title)}><img src={resolveImageVariant(x,x.heroImage,'thumb')||'/assets/singapore-gardens.svg'} alt={`${x.title} experience`} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/assets/singapore-gardens.svg';}}/><small>{selected.includes(x.title)?'✓ ADDED':'+ ADD EXPERIENCE'}</small><strong>{x.title}</strong></button>)}</div></>}{selected.length>0&&<div className="cr-selected"><small className="cr-kicker">YOUR INTERESTS</small>{selected.map(x=><button type="button" onClick={()=>toggle(x)} key={x} title={`Remove ${x}`}>{x} ×</button>)}</div>}
   <div className="cr-plan-option"><span className="cr-kicker">CHOOSE HOW MUCH TO PLAN</span><div role="group" aria-label="Journey planning mode"><button type="button" aria-pressed={planMode==='guided'} className={planMode==='guided'?'selected':''} onClick={()=>setPlanMode('guided')}><strong>Create it for me</strong><small>We'll arrange the details together</small></button><button type="button" aria-pressed={planMode==='detailed'} className={planMode==='detailed'?'selected':''} onClick={()=>setPlanMode('detailed')}><strong>I'll plan my days</strong><small>Optional day-wise experience plan</small></button></div></div>
   {planMode==='detailed'&&<div className="cr-day-planner"><h3 className="cr-subheading">Your preferred day plan</h3><p className="cr-lead">Assign experiences to the day that feels right. Use arrows to reorder activities. Our team will verify opening hours, travel times and feasibility before quoting.</p>{selected.length===0?<p className="cr-notice">Choose some experiences above first, or continue with a flexible plan.</p>:<div className="cr-assignments">{selected.map(x=>{const assigned=planned.findIndex(day=>day.includes(x));return <label key={x}>{x}<select aria-label={`Preferred day for ${x}`} value={assigned} onChange={event=>setPlanDays(current=>assignPlanDay(current,selected,nights+1,x,Number(event.target.value)))}><option value={-1}>Let the team decide</option>{Array.from({length:nights+1},(_,day)=><option value={day} key={day}>Day {day+1}</option>)}</select></label>;})}</div>}
     <div className="cr-day-list">{planned.map((day,i)=><div className="cr-day-card" key={i}><h4>DAY {String(i+1).padStart(2,'0')}</h4>{day.length?day.map((item,j)=><div className="cr-day-line" key={item}><span>{item}</span><div><button type="button" disabled={j===0} aria-label={`Move ${item} earlier on day ${i+1}`} onClick={()=>setPlanDays(x=>movePlanItem(x,selected,nights+1,i,j,-1))}>↑</button><button type="button" disabled={j===day.length-1} aria-label={`Move ${item} later on day ${i+1}`} onClick={()=>setPlanDays(x=>movePlanItem(x,selected,nights+1,i,j,1))}>↓</button></div></div>):<p>Open for your ideas.</p>}</div>)}</div>
    </div>}
   <div className="cr-counters"><fieldset><legend>Your stay</legend><Counter label="Nights" value={nights} onChange={setNights} min={1} max={21}/></fieldset><fieldset><legend>Your people</legend><Counter label="Adults" value={adults} onChange={setAdults} min={1} max={20}/><Counter label="Children" value={children} onChange={setChildren} min={0} max={20}/></fieldset></div><fieldset className="cr-stay"><legend>Stay preference</legend>{['Comfort','Premium','Flexible'].map(x=><button type="button" key={x} className={stay===x?'selected':''} onClick={()=>setStay(x)}>{x}</button>)}</fieldset><label className="cr-label">Preferred travel date<input type="date" min={today()} value={date} onChange={e=>setDate(e.target.value)}/></label><label className="cr-label">What else should we know?<textarea value={notes} maxLength={1500} rows={4} onChange={e=>setNotes(e.target.value)} placeholder="Special moments, interests, travel requirements, preferred pace…"/></label></section>}
   {stage===3&&<section><small className="cr-kicker">04 / THE CONVERSATION</small><h2>Your journey,<br/><em>almost ready.</em></h2><p className="cr-lead">Share your details and our team will follow up. No online payment or booking takes place.</p><form id="cr-lead" className="cr-contact" onSubmit={submit}><label>Name *<input required minLength={2} maxLength={120} value={name} autoComplete="name" onChange={e=>setName(e.target.value)}/></label><label>Phone *<input required type="tel" maxLength={40} value={phone} autoComplete="tel" onChange={e=>setPhone(e.target.value)}/></label><label>Email (optional)<input type="email" maxLength={160} value={email} autoComplete="email" onChange={e=>setEmail(e.target.value)}/></label><label className="cr-consent"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/> I agree that TrawellBeyond may contact me about this enquiry.</label><button className="cr-next" disabled={busy||!consent} type="submit">{busy?'Sending…':'Send my journey enquiry'} ↗</button></form></section>}
   {error&&<p role="alert" className="cr-error">{error}</p>}
   <div className="cr-draft-actions"><button type="button" onClick={saveProgress}>Save journey choices on this device ↗</button>{draftNotice&&<p role="status">{draftNotice}</p>}</div>
   <div className="cr-nav">{stage>0&&<button type="button" className="cr-back" onClick={back}>← Back</button>}{stage<3&&<button className="cr-next" type="button" onClick={next}>Continue ↗</button>}</div>
   </>}
   </div><aside className="cr-summary"><small className="cr-kicker">YOUR JOURNEY / TAKING SHAPE</small><img src={previewImage} alt="Selected destination" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/assets/singapore-skyline.svg';}}/><h3>Made around <em>you.</em></h3><dl>{[['PURPOSE',purpose||'Not selected'],['DESTINATION',chosenPlace],['TRAVELLERS',`${adults} adults · ${children} children`],['DURATION',`${nights} nights`],['EXPERIENCES',`${selected.length} selected`]].map(([a,b])=><div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}</dl><p>We take the time to understand what you need, then create a personal quotation.</p></aside></div>
  </div><section className="cr-closure"><small>UNDERSTAND. CREATE. EXPERIENCE.</small><h2>No two stories.<br/><em>No two journeys.</em></h2><p>Your journey, created around you.</p></section>
 </main>;
}
