'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {publishedOne} from '@/lib/content-server';
import {formatDayRequests} from '@/lib/journey-assistant.mjs';
import InquiryForm from '@/components/InquiryForm';
import './v82.css';
const extractDays=text=>String(text||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean).slice(0,20).map((line,i)=>({index:i+1,text:line.replace(/^day\s*\d+\s*[:.\-]\s*/i,'')}));
export default function DayCustomizer(){
 const [journey,setJourney]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[requests,setRequests]=useState([]),[extra,setExtra]=useState(''),[ready,setReady]=useState(false);
 useEffect(()=>{const slug=new URLSearchParams(window.location.search).get('journey');if(!slug||!/^[a-z0-9-]{2,120}$/.test(slug)){setError('Choose a published journey to personalize.');setLoading(false);return;}
  let live=true;publishedOne('journeys',slug).then(record=>{if(!live)return;if(!record)setError('This journey is not currently published.');else{setJourney(record);setRequests(Array(extractDays(record.itinerary).length).fill(''));}}).finally(()=>{if(live)setLoading(false);});return ()=>{live=false;};},[]);
 const days=useMemo(()=>extractDays(journey?.itinerary),[journey]);
 const summary=useMemo(()=>[`Journey: ${journey?.title||''}`,formatDayRequests(requests)||'No specific day changes requested.',extra&&`Other wishes: ${extra}`,'Please review feasibility and send a personalized quotation.'].filter(Boolean).join('\n').slice(0,2450),[journey,requests,extra]);
 return <main className="v82-page v82-wrap v82-customize"><header className="v82-hero v82-hero-plain"><span className="v82-kicker">PERSONALIZE / THE DETAILS MATTER</span><h1>Every day,<br/><em>a little more yours.</em></h1><p>Request changes to individual itinerary days. Your travel expert will check routes, timings and availability before making a proposal.</p><Link className="v82-textlink" href="/my-journey">← Back to My Journey</Link></header>
 {loading?<p className="v82-empty">Loading published journey…</p>:error?<p role="alert" className="v82-error">{error} <Link href="/journeys">Browse journeys ↗</Link></p>:<><div className="v82-customizer-head"><span className="v82-kicker">YOUR STARTING JOURNEY</span><h2>{journey.title}</h2><p>{journey.summary}</p></div>
 <section className="v82-days" aria-label="Itinerary day preferences">{days.length?days.map((d,i)=><article className="v82-day" key={i}><div><span className="v82-kicker">DAY {String(d.index).padStart(2,'0')}</span><h3>{d.text.split(' | ')[0]}</h3><p>{d.text.split(' | ').slice(1).join(' | ')||'Details to be confirmed by your travel team.'}</p></div><label>What would you change?<textarea rows={3} maxLength={300} placeholder="More time to relax, replace an experience, change the pace…" value={requests[i]||''} disabled={ready} onChange={e=>setRequests(old=>old.map((x,j)=>j===i?e.target.value:x))}/></label></article>):<p className="v82-empty">This journey's day plan is still being developed. Describe what you would like in the notes below.</p>}</section>
 <section className="v82-finish"><label>Other preferences or practical needs<textarea rows={4} maxLength={500} value={extra} disabled={ready} onChange={e=>setExtra(e.target.value)} placeholder="Dates, accessible travel, dietary needs or a special celebration…"/></label><p>Your changes are requests, not confirmed travel arrangements.</p>{!ready?<button className="v82-primary" onClick={()=>{setReady(true);requestAnimationFrame(()=>document.getElementById('v82-customize-send')?.scrollIntoView({behavior:'smooth'}));}}>Review and enquire ↗</button>:null}</section>
 {ready&&<section id="v82-customize-send" className="v82-customize-send"><span className="v82-kicker">SEND THIS TO YOUR ADVISOR</span><h2>Let's shape it together.</h2><pre>{summary}</pre><button type="button" className="v82-outline" onClick={()=>setReady(false)}>Edit day requests</button><InquiryForm source="customize" initialDestination={journey.destinationSlug||''} initialPurpose={`Customize: ${journey.title}`} initialNotes={summary}/></section>}
 </>}</main>;
}
