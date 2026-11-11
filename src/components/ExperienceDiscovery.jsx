'use client';
import {useMemo,useState} from 'react';
import {ContentCards} from './ContentCards';
import {canonicalPurpose,matchesPurpose,PURPOSE_OPTIONS} from '@/lib/journey-plan.mjs';
import {destinationRegion} from '@/lib/destination-region.mjs';
import './experience-discovery.css';
export default function ExperienceDiscovery({items=[],destinationsMeta=[],initialDestination='',initialPurpose=''}){
 const [keyword,setKeyword]=useState('');
 const [destination,setDestination]=useState(initialDestination);
 const [purpose,setPurpose]=useState(canonicalPurpose(initialPurpose));
 const [duration,setDuration]=useState('all'),[region,setRegion]=useState('all');
 const regionBySlug=useMemo(()=>new Map(destinationsMeta.map(d=>[d.slug||d.id,destinationRegion(d)])),[destinationsMeta]);
 const destinations=useMemo(()=>[...new Set(items.map(item=>item.destinationSlug).filter(Boolean))].sort(),[items]);
 const destinationOptions=useMemo(()=>destinations.filter(value=>region==='all'||(regionBySlug.get(value)||destinationRegion({slug:value}))===region),[destinations,region,regionBySlug]);
 const results=useMemo(()=>items.filter(item=>{
  if(destination&&item.destinationSlug!==destination)return false;
  if(region!=='all'&&(regionBySlug.get(item.destinationSlug)||destinationRegion({slug:item.destinationSlug}))!==region)return false;
  if(keyword&&!['title','summary','description','highlights'].some(key=>String(item[key]||'').toLowerCase().includes(keyword.trim().toLowerCase())))return false;
  if(!matchesPurpose(item,purpose))return false;
  if(duration!=='all'){
   const text=String(item.duration||'').toLowerCase();const hours=Number(text.match(/\d+(?:\.\d+)?/)?.[0]);
   if(!Number.isFinite(hours))return false;
   const minutes=/(minute|min\b)/.test(text)?hours:hours*60;
   if(duration==='short'&&minutes>120)return false;
   if(duration==='half'&&(minutes<=120||minutes>300))return false;
   if(duration==='full'&&minutes<=300)return false;
  }
  return true;
 }),[items,keyword,destination,purpose,duration,region,regionBySlug]);
 return <div className="ex-discovery">
  <div className="ex-discovery-head"><div><span>DISCOVER WHAT SPEAKS TO YOU</span><h2>Find your kind of <em>experience.</em></h2></div><p>Explore verified published experiences and keep what interests you for CREATE.</p></div>
  <div className="ex-purpose-picks" role="group" aria-label="Explore experiences by travel purpose"><span>EXPLORE BY FEELING</span><div><button type="button" aria-pressed={!purpose} className={!purpose?'active':''} onClick={()=>setPurpose('')}>All experiences</button>{PURPOSE_OPTIONS.map(item=><button type="button" key={item.id} aria-pressed={purpose===item.label} className={purpose===item.label?'active':''} onClick={()=>setPurpose(item.label)}>{item.label}</button>)}</div></div><div className="ex-discovery-filters"><label>Find an experience<input type="search" autoComplete="off" value={keyword} placeholder="Try gardens, wildlife, culture…" onChange={e=>setKeyword(e.target.value)}/></label><label>Region<select value={region} onChange={e=>{setRegion(e.target.value);setDestination('');}}><option value="all">Everywhere</option><option value="international">International</option><option value="domestic">Domestic · India</option></select></label><label>Destination<select value={destination} onChange={e=>setDestination(e.target.value)}><option value="">All destinations</option>{destinationOptions.map(value=><option value={value} key={value}>{value.replaceAll('-',' ')}</option>)}</select></label><label>Travel purpose<select value={purpose} onChange={e=>setPurpose(e.target.value)}><option value="">Every purpose</option>{PURPOSE_OPTIONS.map(item=><option value={item.label} key={item.id}>{item.label}</option>)}</select></label><label>Suggested duration<select value={duration} onChange={e=>setDuration(e.target.value)}><option value="all">Any duration</option><option value="short">Up to 2 hours</option><option value="half">2–5 hours</option><option value="full">More than 5 hours</option></select></label></div>
  <div className="ex-discovery-count"><span aria-live="polite">{results.length} of {items.length} published experiences</span><button type="button" disabled={!keyword&&!destination&&!purpose&&duration==='all'&&region==='all'} onClick={()=>{setKeyword('');setDestination('');setPurpose('');setDuration('all');setRegion('all');}}>Clear filters</button></div>
  {results.length?<ContentCards items={results} type="experiences"/>:<div className="ex-discovery-empty"><h3>No matching experiences yet.</h3><p>Try a different filter, or CREATE a journey with your own requirements.</p><a href="/create">CREATE around your ideas ↗</a></div>}
 </div>;
}
