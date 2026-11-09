'use client';
import {useMemo,useState} from 'react';
import {ContentCards} from './ContentCards';
import {canonicalPurpose,matchesPurpose,PURPOSE_OPTIONS} from '@/lib/journey-plan.mjs';
import './experience-discovery.css';
export default function ExperienceDiscovery({items=[],initialDestination='',initialPurpose=''}){
 const [keyword,setKeyword]=useState('');
 const [destination,setDestination]=useState(initialDestination);
 const [purpose,setPurpose]=useState(canonicalPurpose(initialPurpose));
 const [duration,setDuration]=useState('all');
 const destinations=useMemo(()=>[...new Set(items.map(item=>item.destinationSlug).filter(Boolean))].sort(),[items]);
 const results=useMemo(()=>items.filter(item=>{
  if(destination&&item.destinationSlug!==destination)return false;
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
 }),[items,keyword,destination,purpose,duration]);
 return <div className="ex-discovery">
  <div className="ex-discovery-head"><div><span>DISCOVER WHAT SPEAKS TO YOU</span><h2>Find your kind of <em>experience.</em></h2></div><p>Explore verified published experiences and keep what interests you for CREATE.</p></div>
  <div className="ex-discovery-filters"><label>Find an experience<input type="search" value={keyword} placeholder="Try gardens, wildlife, culture…" onChange={e=>setKeyword(e.target.value)}/></label><label>Destination<select value={destination} onChange={e=>setDestination(e.target.value)}><option value="">All destinations</option>{destinations.map(value=><option value={value} key={value}>{value.replaceAll('-',' ')}</option>)}</select></label><label>Travel purpose<select value={purpose} onChange={e=>setPurpose(e.target.value)}><option value="">Every purpose</option>{PURPOSE_OPTIONS.map(item=><option value={item.label} key={item.id}>{item.label}</option>)}</select></label><label>Suggested duration<select value={duration} onChange={e=>setDuration(e.target.value)}><option value="all">Any duration</option><option value="short">Up to 2 hours</option><option value="half">2–5 hours</option><option value="full">More than 5 hours</option></select></label></div>
  <div className="ex-discovery-count"><span aria-live="polite">{results.length} of {items.length} published experiences</span><button type="button" onClick={()=>{setKeyword('');setDestination('');setPurpose('');setDuration('all');}}>Clear filters</button></div>
  {results.length?<ContentCards items={results} type="experiences"/>:<div className="ex-discovery-empty"><h3>No matching experiences yet.</h3><p>Try a different filter, or CREATE a journey with your own requirements.</p><a href="/create">CREATE around your ideas ↗</a></div>}
 </div>;
}
