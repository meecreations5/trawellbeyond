'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {publishedList} from '@/lib/content-server';
import {JOURNEY_TRAY_KEY,normalizeTray,removeFromTray} from '@/lib/journey-plan.mjs';
import {readJourneyShare,buildJourneySharePath} from '@/lib/journey-sharing.mjs';
import {normalizeSlug} from '@/lib/journey-assistant.mjs';
import './v82.css';
const SAVED='tb_saved_journeys_v82';
const safeArray=v=>Array.isArray(v)?v.map(normalizeSlug).filter(Boolean).slice(0,12):[];
const niceImage=v=>/^https:\/\//.test(String(v||''))?v:'/assets/hero-fallback.svg';
export default function MyJourney(){
 const [tray,setTray]=useState(normalizeTray()),[journeyIds,setJourneyIds]=useState([]),[compare,setCompare]=useState([]),[shared,setShared]=useState(null),[catalog,setCatalog]=useState({destinations:[],experiences:[],journeys:[]}),[notice,setNotice]=useState('');
 const refresh=()=>{try{setTray(normalizeTray(JSON.parse(localStorage.getItem(JOURNEY_TRAY_KEY)||'{}')));setJourneyIds(safeArray(JSON.parse(localStorage.getItem(SAVED)||'[]')));}catch{}};
 useEffect(()=>{refresh();const fromUrl=readJourneyShare(window.location.search);if([...fromUrl.destinations,...fromUrl.experiences,...fromUrl.journeys].length)setShared(fromUrl);const update=()=>refresh();window.addEventListener('tb:journey-updated',update);window.addEventListener('storage',update);return ()=>{window.removeEventListener('tb:journey-updated',update);window.removeEventListener('storage',update);};},[]);
 useEffect(()=>{let live=true;Promise.all(['destinations','experiences','journeys'].map(type=>publishedList(type,300))).then(([destinations,experiences,journeys])=>{if(live)setCatalog({destinations,experiences,journeys});});return ()=>{live=false;};},[]);
 const find=(type,slug)=>catalog[type].find(r=>(r.slug||r.id)===slug);
 const selected={destinations:tray.destinations.map(x=>find('destinations',x.slug)).filter(Boolean),experiences:tray.experiences.map(x=>find('experiences',x.slug)).filter(Boolean),journeys:journeyIds.map(id=>find('journeys',id)).filter(Boolean)};
 const compareItems=useMemo(()=>selected.journeys.filter(x=>compare.includes(x.slug||x.id)),[selected.journeys,compare]);
 function remove(type,slug){
  if(type==='journeys'){const next=journeyIds.filter(x=>x!==slug);localStorage.setItem(SAVED,JSON.stringify(next));setJourneyIds(next);setCompare(q=>q.filter(v=>v!==slug));}
  else{const next=removeFromTray(tray,type,slug);localStorage.setItem(JOURNEY_TRAY_KEY,JSON.stringify(next));setTray(next);window.TBJourneyTray?.refresh?.();}
  setNotice('Removed from your shortlist.');
 }
 function adoptShared(){
  if(!shared)return;
  let next=tray;
  for(const type of ['destinations','experiences'])for(const slug of shared[type]){const item=find(type,slug);if(item)next=normalizeTray({...next,[type]:[...next[type],{slug,title:item.title,destinationSlug:item.destinationSlug}]});}
  const newJ=[...new Set([...journeyIds,...shared.journeys.filter(slug=>!!find('journeys',slug))])].slice(0,12);
  try{localStorage.setItem(JOURNEY_TRAY_KEY,JSON.stringify(next));localStorage.setItem(SAVED,JSON.stringify(newJ));setTray(next);setJourneyIds(newJ);window.TBJourneyTray?.refresh?.();setShared(null);setNotice('Shared published selections added to your own My Journey.');}catch{setNotice('Unable to save choices in this browser.');}
 }
 function prepareCreate(){
  try{
   const key='tb_create_draft_v73',draft=JSON.parse(localStorage.getItem(key)||'null')||{};
   const curated=selected.journeys.map(item=>item.title).slice(0,8);
   const summary=curated.length?`Curated journeys in My Journey: ${curated.join(', ')}.`:'';
   const oldNotes=String(draft.notes||'');
   const notes=[summary,oldNotes].filter(Boolean).join('\n').slice(0,1500);
   localStorage.setItem(key,JSON.stringify({...draft,version:1,notes,destination:draft.destination||selected.destinations[0]?.title||'',selected:Array.from(new Set([...(Array.isArray(draft.selected)?draft.selected:[]),...selected.experiences.map(item=>item.title)])).slice(0,25)}));
  }catch{/* CREATE still uses the separate My Journey tray when storage is unavailable. */}
 }
 async function share(){
  const path=buildJourneySharePath({...tray,journeys:journeyIds});const url=window.location.origin+path;
  try{if(navigator.share)await navigator.share({title:'A TrawellBeyond journey shortlist',url});else{await navigator.clipboard.writeText(url);setNotice('Shareable shortlist link copied. It includes no private contact details.');}}
  catch(e){if(e.name!=='AbortError')setNotice('Unable to share automatically. Copy the page URL instead.');}
 }
 const all=[['destinations','Destinations'],['journeys','Curated journeys'],['experiences','Experiences']];
 return <main className="v82-page v82-wrap v82-journal"><header className="v82-hero v82-hero-plain"><span className="v82-kicker">MY JOURNEY / YOUR OWN COLLECTION</span><h1>Gather what<br/><em>feels like yours.</em></h1><p>Collect inspiration, compare possible journeys, and share a shortlist. Your choices stay on this device until you ask our team to create a personalized proposal.</p><div className="v82-hero-actions"><button className="v82-primary" onClick={share}>Share this shortlist ↗</button><Link className="v82-outline" href="/journey-match">Find more to explore</Link></div></header>
 {shared&&<div className="v82-shared"><strong>Someone shared travel inspiration with you.</strong><p>Review their published destinations, experiences and journeys, then add them to your own collection if you wish.</p><div className="v82-shared-chips">{all.map(([type])=>shared[type].map(slug=><span key={type+slug}>{find(type,slug)?.title||slug.replace(/-/g,' ')}</span>))}</div><button onClick={adoptShared} className="v82-primary">Add shared choices ↗</button><button className="v82-quiet" onClick={()=>setShared(null)}>Dismiss</button></div>}
 {notice&&<p role="status" className="v82-notice">{notice}</p>}
 {all.map(([type,heading])=><section className="v82-collection" key={type}><div className="v82-section-head"><span className="v82-kicker">{heading.toUpperCase()}</span><h2>{heading}<span> / {selected[type].length}</span></h2></div>
 {selected[type].length?<div className="v82-collection-grid">{selected[type].map(item=>{const id=item.slug||item.id;return <article key={id} className="v82-card"><img src={niceImage(item.heroImage)} alt={item.heroImage?item.title:'Illustrated travel placeholder'} loading="lazy"/><div className="v82-card-copy"><h3>{item.title}</h3><p>{item.summary}</p><div className="v82-result-links"><Link href={`/${type}/${id}`}>Explore ↗</Link><button type="button" onClick={()=>remove(type,id)}>Remove</button>{type==='journeys'&&<label><input type="checkbox" checked={compare.includes(id)} disabled={!compare.includes(id)&&compare.length>=3} onChange={e=>setCompare(p=>e.target.checked?[...p,id]:p.filter(v=>v!==id))}/> Compare</label>}</div></div></article>;})}</div>:<div className="v82-empty">Nothing saved here yet. <Link href={type==='experiences'?'/experiences':type==='journeys'?'/journeys':'/destinations'}>Explore {heading.toLowerCase()} ↗</Link></div>}
 </section>)}
 {compareItems.length>=2&&<section className="v82-compare"><span className="v82-kicker">YOUR OPTIONS / SIDE BY SIDE</span><h2>Different possibilities. One personal decision.</h2><div className="v82-compare-grid">{compareItems.map(item=><article key={item.slug||item.id}><h3>{item.title}</h3><p>{item.destinationSlug?.replace(/-/g,' ')||'Destination to confirm'}</p><dl><dt>Duration</dt><dd>{item.days?`${item.days} days`:'Ask our team'}</dd><dt>Highlights</dt><dd>{String(item.highlights||item.summary||'').slice(0,300)}</dd><dt>Pricing</dt><dd>Confirmed in your personalized quote</dd></dl><Link href={`/customize?journey=${encodeURIComponent(item.slug||item.id)}`}>Request changes ↗</Link></article>)}</div></section>}
 <section className="v82-final-cta"><span>YOUR COLLECTION / THE NEXT CHAPTER</span><h2>Ready to make<br/><em>this journey yours?</em></h2><p>Our team will review your interests and create an individual proposal. Nothing is booked until arrangements are confirmed.</p><div><Link href="/create" onClick={prepareCreate} className="v82-primary">Continue in CREATE ↗</Link><Link href="/my-enquiries" className="v82-outline">Check my enquiries ↗</Link></div></section>
 </main>;
}
