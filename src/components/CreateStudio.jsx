'use client';
import {resolveImageVariant} from '@/lib/media-variants.mjs';
import {useEffect,useMemo,useState} from 'react';
import {publishedList} from '@/lib/content-server';
import {submitEnquiry} from '@/lib/enquiries-web';
import {JOURNEY_TRAY_KEY,JOURNEY_DRAFT_KEY,normalizeTray,normalizePlan,assignPlanDay,movePlanItem,itineraryNotes,canonicalPurpose} from '@/lib/journey-plan.mjs';
import './create-studio.css';
import JourneyLine from './motion/JourneyLine';

const stages=['Your purpose','Your destination','Your preferences','Your enquiry'];
const options=[
 ['Togetherness','More time together.','For the people you love being with.'],
 ['Discovery','Something new to discover.','For curiosity, culture and unexpected stories.'],
 ['Celebration','A moment worth marking.','For milestones and memories worth making.'],
 ['Rest and renewal','A little room to breathe.','For slower mornings and time to unwind.'],
 ['Meaningful journeys','A journey with purpose.','For traditions, places and experiences that stay with you.']
];
/** Purpose is intentionally people-first: no unrelated destination photos. */
function PurposeArtwork({kind}){
 const common={fill:'none',stroke:'currentColor',strokeWidth:1.8,strokeLinecap:'round',strokeLinejoin:'round'};
 return <span className="cr-purpose-art" aria-hidden="true"><svg viewBox="0 0 148 100" focusable="false">
  <g {...common}>
   {kind==='Togetherness'&&<><circle cx="56" cy="32" r="12"/><circle cx="91" cy="34" r="11"/><path d="M31 77c0-16 12-28 25-28s24 12 24 28M76 75c2-15 8-25 17-25s25 10 25 26"/><path d="M63 64c6 3 13 3 19 0"/></>}
   {kind==='Discovery'&&<><circle cx="75" cy="50" r="32"/><path d="M73 25l6 22 22 7-22 7-6 21-7-21-20-7 20-7z"/><path d="M16 22h12M22 16v12M112 73h15M120 66v15"/></>}
   {kind==='Celebration'&&<><path d="M73 24l8 17 19 3-14 13 3 19-16-9-17 9 4-19-14-13 19-3z"/><path d="M26 24v12M20 30h12M119 28v13M113 35h12M118 70l6 6M24 72l-7 8"/></>}
   {kind==='Rest and renewal'&&<><path d="M42 58a32 32 0 0 1 64 0"/><path d="M20 59h108M31 69c13-7 23-7 36 0s24 7 37 0 19-7 29-3M32 81c13-7 23-7 36 0s24 7 37 0"/><path d="M75 9v10M34 25l9 8M113 25l-9 8"/></>}
   {kind==='Meaningful journeys'&&<><path d="M25 73c24-5 18-38 46-36 21 1 22 24 50 7" strokeDasharray="4 6"/><circle cx="25" cy="74" r="8"/><circle cx="72" cy="37" r="8"/><circle cx="121" cy="44" r="8"/><path d="M119 15l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></>}
  </g>
 </svg></span>;
}
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
 const next=()=>{setError('');if(stage===0&&!purpose)return setError('Choose why you want to travel, or select Help me decide.');if(stage===1&&!destination&&!customDestination.trim())return setError('Select a destination or enter your own.');showStep(clamp(stage+1,0,3));};
 const back=()=>{setError('');showStep(Math.max(0,stage-1));};
 async function submit(e){e.preventDefault();if(busy)return;setBusy(true);setError('');
  try{const lines=[`Why: ${purpose}`,`Destination: ${chosenPlace}`,`Duration: ${nights} nights`, `Travellers: ${adults} adult(s), ${children} child(ren)`, `Stay: ${stay}`, `Experiences: ${selected.join(', ')||'Open to suggestions'}`, ...(planMode==='detailed'?[`Preferred day plan (to be checked by our team):\n${itineraryNotes(planned)}`]:[]), `Additional details: ${notes||'None'}`];
   const result=await submitEnquiry({source:'create',name,phone,email,destination:chosenPlace,dates:date||'Flexible',travelers:`${adults} adults, ${children} children`,purpose:purpose||'Personalized travel',notes:lines.join('\n').slice(0,2450),consent});
   if(!result?.ok)throw new Error('Your enquiry could not be saved. Please retry.');setReference(result.id||'Received');try{localStorage.removeItem(JOURNEY_DRAFT_KEY);window.TBJourneyTray?.clear?.();}catch{}requestAnimationFrame(()=>document.getElementById('create-studio')?.scrollIntoView({behavior:'smooth',block:'start'}));
  }catch(err){setError(err.message||'Unable to send your enquiry. Please retry.');}finally{setBusy(false);}}
 const previewImage=resolveImageVariant(current,current?.heroImage,'medium')||'/assets/hero-fallback.svg';
 const progressPct=Math.round((stage+1)/stages.length*100);
 const showStep=nextStage=>{setStage(nextStage);const target=document.getElementById('create-studio');requestAnimationFrame(()=>target?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}));};
 const Counter=({label,value,onChange,min,max})=><div className="cr-counter"><span>{label}</span><div><button type="button" disabled={value<=min} aria-label={`Fewer ${label}`} onClick={()=>onChange(n=>clamp(n-1,min,max))}>−</button><output>{value}</output><button type="button" disabled={value>=max} aria-label={`More ${label}`} onClick={()=>onChange(n=>clamp(n+1,min,max))}>+</button></div></div>;
 return <main className="cr-page" id="top" data-tb-ui-version="v8.1.2">
  <section className="cr-hero"><div className="cr-hero-copy"><small className="cr-kicker">TRAWELLBEYOND / CREATE</small><h1>Every journey<br/>starts <em>with you.</em></h1><p>{page.summary||'The best journeys begin with people, purpose and the moments you want to share. Tell us what matters.'}</p><span>PEOPLE FIRST · DESTINATION SECOND</span></div><div className="cr-hero-photo tb-parallax-media" data-parallax="18"><img src={previewImage} alt={current?`Travel inspiration for ${current.title}`:'Illustrated journey inspiration'} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/assets/hero-fallback.svg';}}/><span>CREATED AROUND YOU.</span></div></section>
  <div className="cr-studio" id="create-studio"><div className="cr-progress"><small className="cr-kicker cr-v81-progress-label"><img src="/assets/trawellbeyond-accent-motif.svg" alt="" aria-hidden="true"/>THE JOURNEY BUILDER</small><span>STEP {stage+1} / 4</span></div><JourneyLine className="cr-v812-meter" progress={progressPct/100} count={0} label="Journey builder progress"/><div className="cr-steps" aria-label="Journey builder steps">{stages.map((label,i)=><button type="button" key={label} disabled={i>stage} aria-current={stage===i?'step':undefined} aria-label={`Step ${i+1}: ${label}${i>stage?", not yet available":""}`} className={stage===i?'active':i<stage?'done':''} onClick={()=>showStep(i)}><b>{String(i+1).padStart(2,'0')}</b> {label}</button>)}</div>
   <div className="cr-grid"><div className="cr-main">
   {reference?<div className="cr-success" role="status"><span className="cr-v81-success-mark" aria-hidden="true">✓</span><h2>We have received<br/><em>your journey.</em></h2><p>Our team will contact you to understand the details and prepare a personal proposal. Reference: <strong>{reference}</strong></p><button type="button" className="cr-next" onClick={()=>{setReference('');setStage(0);setConsent(false);}}>Create another journey ↗</button></div>:<>
   {stage===0&&<section><small className="cr-kicker">01 / THE REASON</small><h2>What would make<br/>this journey <em>matter?</em></h2><p className="cr-lead">Choose what speaks to you. A place can come later.</p><div className="cr-purposes" role="group" aria-label="Choose the reason for your journey">{options.map(([id,label,desc],i)=><button type="button" className={purpose===id?'selected':''} aria-pressed={purpose===id} key={id} onClick={()=>setPurpose(id)}><div className="cr-purpose-top"><small>{String(i+1).padStart(2,'0')} / {id.toUpperCase()}</small><PurposeArtwork kind={id}/></div><strong>{label}</strong><span className="cr-purpose-desc">{desc}</span><span className="cr-purpose-foot">{purpose===id?'✓ THIS FEELS RIGHT':'CHOOSE THIS REASON'} <span aria-hidden="true">↗</span></span></button>)}</div><div className="cr-choice-bottom"><button type="button" className="cr-link" onClick={()=>setPurpose('Open to suggestions')} aria-pressed={purpose==='Open to suggestions'}>Not sure yet? Let us help you decide ↗</button><span role="status" aria-live="polite">{purpose?purpose==='Open to suggestions'?'We will help you discover what fits.':`${purpose} selected. You can change your mind anytime.`:'Choose one to begin, or ask for our help.'}</span></div></section>}
   {stage===1&&<section><small className="cr-kicker">02 / THE PLACE</small><h2>Where shall<br/><em>we begin?</em></h2><p className="cr-lead">Choose from our published destinations, or share your own idea.</p>{destinations.length?<div className="cr-destinations">{destinations.map(d=><button type="button" key={d.slug} className={current?.slug===d.slug?'selected':''} aria-pressed={current?.slug===d.slug} onClick={()=>{setDestination(d.title);setCustomDestination('');setSelected([]);}}><img src={resolveImageVariant(d,d.heroImage,'thumb')||'/assets/hero-fallback.svg'} alt={`${d.title} destination`} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/assets/hero-fallback.svg';}}/><strong>{d.title}</strong><span>↗</span></button>)}</div>:<p className="cr-notice">No published destinations yet. Once Singapore is published in Admin, its photograph and card will appear here. You can still send an enquiry now.</p>}<label className="cr-label">Another destination on your mind?<input placeholder="e.g. Singapore, Dubai, somewhere new…" maxLength={120} value={customDestination} onChange={e=>{setCustomDestination(e.target.value);if(e.target.value)setDestination('');}}/></label></section>}
   {stage===2&&<section><small className="cr-kicker">03 / YOUR PREFERENCES</small><h2>Small choices.<br/><em>Personal moments.</em></h2><p className="cr-lead">These are choices for your enquiry, not a booking.</p>{related.length>0&&<><h3 className="cr-subheading">Experiences to make yours</h3><div className="cr-experiences">{related.map(x=><button type="button" key={x.slug} className={selected.includes(x.title)?'selected':''} aria-pressed={selected.includes(x.title)} onClick={()=>toggle(x.title)}><img src={resolveImageVariant(x,x.heroImage,'thumb')||'/assets/hero-fallback.svg'} alt={`${x.title} experience`} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/assets/hero-fallback.svg';}}/><small>{selected.includes(x.title)?'✓ ADDED':'+ ADD EXPERIENCE'}</small><strong>{x.title}</strong></button>)}</div></>}{selected.length>0&&<div className="cr-selected"><small className="cr-kicker">YOUR INTERESTS</small>{selected.map(x=><button type="button" onClick={()=>toggle(x)} key={x} title={`Remove ${x}`}>{x} ×</button>)}</div>}
   <div className="cr-plan-option"><span className="cr-kicker">CHOOSE HOW MUCH TO PLAN</span><div role="group" aria-label="Journey planning mode"><button type="button" aria-pressed={planMode==='guided'} className={planMode==='guided'?'selected':''} onClick={()=>setPlanMode('guided')}><strong>Create it for me</strong><small>We'll arrange the details together</small></button><button type="button" aria-pressed={planMode==='detailed'} className={planMode==='detailed'?'selected':''} onClick={()=>setPlanMode('detailed')}><strong>I'll plan my days</strong><small>Optional day-wise experience plan</small></button></div></div>
   {planMode==='detailed'&&<div className="cr-day-planner"><h3 className="cr-subheading">Your preferred day plan</h3><p className="cr-lead">Assign experiences to the day that feels right. Use arrows to reorder activities. Our team will verify opening hours, travel times and feasibility before quoting.</p>{selected.length===0?<p className="cr-notice">Choose some experiences above first, or continue with a flexible plan.</p>:<div className="cr-assignments">{selected.map(x=>{const assigned=planned.findIndex(day=>day.includes(x));return <label key={x}>{x}<select aria-label={`Preferred day for ${x}`} value={assigned} onChange={event=>setPlanDays(current=>assignPlanDay(current,selected,nights+1,x,Number(event.target.value)))}><option value={-1}>Let the team decide</option>{Array.from({length:nights+1},(_,day)=><option value={day} key={day}>Day {day+1}</option>)}</select></label>;})}</div>}
     <div className="cr-day-list">{planned.map((day,i)=><div className="cr-day-card" key={i}><h4>DAY {String(i+1).padStart(2,'0')}</h4>{day.length?day.map((item,j)=><div className="cr-day-line" key={item}><span>{item}</span><div><button type="button" disabled={j===0} aria-label={`Move ${item} earlier on day ${i+1}`} onClick={()=>setPlanDays(x=>movePlanItem(x,selected,nights+1,i,j,-1))}>↑</button><button type="button" disabled={j===day.length-1} aria-label={`Move ${item} later on day ${i+1}`} onClick={()=>setPlanDays(x=>movePlanItem(x,selected,nights+1,i,j,1))}>↓</button></div></div>):<p>Open for your ideas.</p>}</div>)}</div>
    </div>}
   <div className="cr-counters"><fieldset><legend>Your stay</legend><Counter label="Nights" value={nights} onChange={setNights} min={1} max={21}/></fieldset><fieldset><legend>Your people</legend><Counter label="Adults" value={adults} onChange={setAdults} min={1} max={20}/><Counter label="Children" value={children} onChange={setChildren} min={0} max={20}/></fieldset></div><fieldset className="cr-stay"><legend>Stay preference</legend>{['Comfort','Premium','Flexible'].map(x=><button type="button" key={x} className={stay===x?'selected':''} onClick={()=>setStay(x)}>{x}</button>)}</fieldset><label className="cr-label">Preferred travel date<input type="date" min={today()} value={date} onChange={e=>setDate(e.target.value)}/></label><label className="cr-label">What else should we know?<textarea value={notes} maxLength={1500} rows={4} onChange={e=>setNotes(e.target.value)} placeholder="Special moments, interests, travel requirements, preferred pace…"/></label></section>}
   {stage===3&&<section><small className="cr-kicker">04 / THE CONVERSATION</small><h2>Your journey,<br/><em>almost ready.</em></h2><p className="cr-lead">Share your details and our team will follow up. No online payment or booking takes place.</p><form id="cr-lead" className="cr-contact" onSubmit={submit}><label>Name *<input required minLength={2} maxLength={120} value={name} autoComplete="name" onChange={e=>setName(e.target.value)}/></label><label>Phone *<input required type="tel" maxLength={40} value={phone} autoComplete="tel" onChange={e=>setPhone(e.target.value)}/></label><label>Email (optional)<input type="email" maxLength={160} value={email} autoComplete="email" onChange={e=>setEmail(e.target.value)}/></label><label className="cr-consent"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/> I agree that TrawellBeyond may contact me about this enquiry.</label><button className="cr-next" disabled={busy||!consent} type="submit">{busy?'Sending…':'Send my journey enquiry'} ↗</button></form></section>}
   {error&&<p role="alert" className="cr-error">{error}</p>}
   <div className="cr-draft-actions"><button type="button" onClick={saveProgress}>Save journey choices on this device ↗</button>{draftNotice&&<p role="status">{draftNotice}</p>}</div>
   <p className="cr-workflow-note" role="note">You can change any earlier step. Your choices are not a booking and are not sent until you submit the final enquiry.</p><div className="cr-nav">{stage>0&&<button type="button" className="cr-back" onClick={back}>← Back</button>}{stage<3&&<button className="cr-next" type="button" onClick={next}>Continue ↗</button>}</div>
   </>}
   </div><aside className="cr-summary"><small className="cr-kicker">YOUR JOURNEY / TAKING SHAPE</small><img src={previewImage} alt={current?`${current.title} journey inspiration`:'Journey idea illustration'} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/assets/hero-fallback.svg';}}/><h3>Made around <em>you.</em></h3><dl>{[['PURPOSE',purpose||'Not selected'],['DESTINATION',chosenPlace],['TRAVELLERS',`${adults} adults · ${children} children`],['DURATION',`${nights} nights`],['EXPERIENCES',`${selected.length} selected`]].map(([a,b])=><div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}</dl><p>We take the time to understand what you need, then create a personal quotation.</p></aside></div>
  </div><section className="cr-closure"><small>UNDERSTAND. CREATE. EXPERIENCE.</small><h2>No two stories.<br/><em>No two journeys.</em></h2><p>Your journey, created around you.</p></section>
 </main>;
}
