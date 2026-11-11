'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {publishedList} from '@/lib/content-server';
import {ASSISTANT_PURPOSES,ASSISTANT_INTERESTS,ASSISTANT_PACES,ASSISTANT_BUDGETS,normalizeJourneyPreferences,rankPublished,normalizeSlug} from '@/lib/journey-assistant.mjs';
import {JOURNEY_DRAFT_KEY,JOURNEY_TRAY_KEY,addToTray} from '@/lib/journey-plan.mjs';
import {destinationRegion} from '@/lib/destination-region.mjs';
import './v82.css';
const art='/assets/hero-fallback.svg';
const niceImage=x=>/^https:\/\//.test(String(x||''))?x:art;
export default function JourneyMatch(){
 const [region,setRegion]=useState('all');
 const [input,setInput]=useState({purpose:'',pace:'Flexible',budgetBand:'Need guidance',days:5,travelers:'',dates:'',budgetNote:'',interests:[],destination:''});
 const [catalog,setCatalog]=useState({destinations:[],journeys:[]}),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState('');
 useEffect(()=>{let live=true;Promise.all([publishedList('destinations',150),publishedList('journeys',200)]).then(([destinations,journeys])=>{if(live)setCatalog({destinations,journeys});}).catch(()=>{if(live)setError('Published journeys are unavailable right now. Our team can still help you.');}).finally(()=>{if(live)setLoading(false);});return ()=>{live=false;};},[]);
 const prefs=useMemo(()=>normalizeJourneyPreferences(input),[input]);
 const matches=useMemo(()=>{
  const bySlug=new Map(catalog.destinations.map(d=>[d.slug||d.id,destinationRegion(d)]));
  const inRegion=(item,type)=>region==='all'||(type==='destinations'?destinationRegion(item):(bySlug.get(item.destinationSlug)||destinationRegion({slug:item.destinationSlug})))===region;
  return {destinations:rankPublished(catalog.destinations.filter(d=>inRegion(d,'destinations')),prefs,'destinations',4),journeys:rankPublished(catalog.journeys.filter(j=>inRegion(j,'journeys')),prefs,'journeys',4)};
 },[catalog,prefs,region]);
 const update=(key,val)=>setInput(p=>({...p,[key]:val}));
 const toggle=interest=>setInput(p=>({...p,interests:p.interests.includes(interest)?p.interests.filter(x=>x!==interest):[...p.interests,interest].slice(0,6)}));
 function save(type,item){
  try{
   if(type==='destinations'){
    const next=addToTray(JSON.parse(localStorage.getItem(JOURNEY_TRAY_KEY)||'{}'),'destinations',{slug:item.slug||item.id,title:item.title});
    localStorage.setItem(JOURNEY_TRAY_KEY,JSON.stringify(next));window.TBJourneyTray?.refresh?.();
   }else{
    const key='tb_saved_journeys_v82',stored=JSON.parse(localStorage.getItem(key)||'[]');
    localStorage.setItem(key,JSON.stringify([...new Set([...(Array.isArray(stored)?stored:[]),normalizeSlug(item.slug||item.id)])].slice(0,12)));
    window.dispatchEvent(new Event('tb:journey-updated'));
   }
   setNotice(`${item.title} saved to My Journey.`);
  }catch{setNotice('Your browser cannot save selections. You can still enquire about this journey.');}
 }
 function prepareCreate(){
  try{
   const draft=JSON.parse(localStorage.getItem(JOURNEY_DRAFT_KEY)||'null')||{};
   localStorage.setItem(JOURNEY_DRAFT_KEY,JSON.stringify({...draft,version:1,purpose:prefs.purpose||draft.purpose||'',destination:prefs.destination||draft.destination||'',nights:Math.max(1,prefs.days-1),notes:`Journey Match preferences: ${prefs.interests.join(', ')||'Open to suggestions'}; pace ${prefs.pace}; budget style ${prefs.budgetBand}; budget guidance ${prefs.budgetNote||'needed'}.`,date:/^\d{4}-\d{2}-\d{2}$/.test(prefs.dates)?prefs.dates:''}));
  }catch{}
 }
 const selected=!!prefs.purpose||prefs.interests.length>0;
 return <main className="v82-page v82-match" id="top"><header className="v82-hero v82-wrap"><div><span className="v82-kicker">THE JOURNEY MATCH / 01</span><h1>Where you go<br/><em>comes after why.</em></h1><p>Start with the moments you want to make. Explore published destinations and journeys that share your interests, then let our team create your personal proposal.</p><p className="v82-disclaimer">Matches are editorial suggestions, not guaranteed itineraries or prices.</p></div><div className="v82-hero-art" aria-hidden="true"><img src="/assets/trawellbeyond-accent-motif.svg" alt=""/><span>CREATED AROUND YOU.</span></div></header>
 <section className="v82-wrap v82-match-layout" aria-label="Find a journey"><div className="v82-panel v82-match-form"><span className="v82-kicker">TELL US ABOUT YOUR JOURNEY</span><h2>A little about what matters.</h2><fieldset><legend>01 / Your reason</legend><div className="v82-choice-grid">{ASSISTANT_PURPOSES.map(x=><button type="button" key={x} className={prefs.purpose===x?'is-selected':''} aria-pressed={prefs.purpose===x} onClick={()=>update('purpose',x)}>{x}</button>)}</div></fieldset>
 <fieldset><legend>02 / What interests you?</legend><div className="v82-chip-grid">{ASSISTANT_INTERESTS.map(x=><button key={x} type="button" className={prefs.interests.includes(x)?'is-selected':''} aria-pressed={prefs.interests.includes(x)} onClick={()=>toggle(x)}>{prefs.interests.includes(x)?'✓ ':''}{x}</button>)}</div></fieldset>
 <div className="v82-fields"><label>Journey length <span>Days</span><input type="number" min="1" max="30" value={prefs.days} onChange={e=>update('days',e.target.value)}/></label><label>Pace<select value={prefs.pace} onChange={e=>update('pace',e.target.value)}>{ASSISTANT_PACES.map(x=><option key={x}>{x}</option>)}</select></label><label>Travel style<select value={prefs.budgetBand} onChange={e=>update('budgetBand',e.target.value)}>{ASSISTANT_BUDGETS.map(x=><option key={x}>{x}</option>)}</select></label><label>Travelling with<input placeholder="2 adults, 1 child" value={input.travelers} maxLength={80} onChange={e=>update('travelers',e.target.value)}/></label><label>Preferred destination<input placeholder="Optional / open to ideas" value={input.destination} maxLength={100} onChange={e=>update('destination',e.target.value)}/></label><label>Travel date (optional)<input type="date" value={input.dates} onChange={e=>update('dates',e.target.value)}/></label><label>Approximate budget (optional)<input placeholder="For example, total trip budget" value={input.budgetNote} maxLength={80} onChange={e=>update('budgetNote',e.target.value)}/></label></div>
 <button type="button" className="v82-primary" onClick={()=>{prepareCreate();window.location.href='/create';}}>Continue in CREATE ↗</button><p className="v82-note">Selections stay on this device until you choose to submit an enquiry. No payment is taken online.</p></div>
 <div className="v82-match-results" aria-live="polite"><div className="v82-region-choices" role="group" aria-label="Explore journeys by destination region">{[{key:'all',label:'Everywhere'},{key:'international',label:'International'},{key:'domestic',label:'Domestic · India'}].map(x=><button type="button" key={x.key} className={region===x.key?'is-active':''} aria-pressed={region===x.key} onClick={()=>setRegion(x.key)}>{x.label}</button>)}</div><div className="v82-results-head"><span className="v82-kicker">SUGGESTED FOR YOU</span><h2>A starting point.<br/><em>Not a fixed formula.</em></h2><p>{selected?'These suggestions are based on your chosen interests and published content.':'Choose a purpose or interests to make the suggestions more personal.'}</p></div>
 {loading&&<p className="v82-empty">Finding published journeys…</p>}{error&&<p className="v82-error" role="alert">{error}</p>}{notice&&<p className="v82-notice" role="status">{notice}</p>}
 {!loading&&<><h3>Destinations</h3><div className="v82-result-list">{matches.destinations.map(({item,reasons})=><article key={item.id||item.slug} className="v82-result"><img src={niceImage(item.heroImage)} alt={item.heroImage?item.title:'Illustrated travel placeholder'} loading="lazy"/><div><span>{reasons[0]||'A possibility to explore'}</span><h4>{item.title}</h4><p>{item.summary}</p><div className="v82-result-links"><Link href={`/destinations/${item.slug||item.id}`}>Explore ↗</Link><button type="button" onClick={()=>save('destinations',item)}>+ My Journey</button><Link href={`/insider/${item.slug||item.id}`}>Insider guide</Link></div></div></article>)}</div>
 <h3>Journeys</h3><div className="v82-result-list">{matches.journeys.map(({item,reasons})=><article key={item.id||item.slug} className="v82-result"><img src={niceImage(item.heroImage)} alt={item.heroImage?item.title:'Illustrated travel placeholder'} loading="lazy"/><div><span>{reasons[0]||'A published journey'}</span><h4>{item.title}</h4><p>{item.summary}</p><div className="v82-result-links"><Link href={`/journeys/${item.slug||item.id}`}>Discover ↗</Link><button type="button" onClick={()=>save('journeys',item)}>+ My Journey</button><Link href={`/customize?journey=${encodeURIComponent(item.slug||item.id)}`}>Change the days</Link></div></div></article>)}</div>
 {!matches.journeys.length&&!matches.destinations.length&&<p className="v82-empty">No published options are available yet. <Link href="/enquire">Tell our team what you have in mind ↗</Link></p>}</>}
 <Link href="/my-journey" className="v82-outline">Review and compare My Journey ↗</Link>
 </div></section></main>;
}
