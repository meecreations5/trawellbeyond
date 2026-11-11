'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {savedReceipts} from '@/lib/enquiry-receipts.mjs';
import {readOwnEnquiry} from '@/lib/enquiries-web';
import './v82.css';
const states={new:{label:'Received',desc:'We have received your journey request.'},reviewing:{label:'Under review',desc:'Our travel team is considering the details you shared.'},contacted:{label:'Contacted',desc:'Our team has marked this enquiry as contacted.'},proposal_ready:{label:'Proposal ready',desc:'Our team has prepared a proposal. Contact your advisor for the details.'},closed:{label:'Closed',desc:'This enquiry is marked as closed. Please contact us if you need further assistance.'}};
export default function EnquiryTracker(){
 const [records,setRecords]=useState([]),[busy,setBusy]=useState(true),[error,setError]=useState('');
 async function refresh(){setBusy(true);setError('');const saved=savedReceipts();
  if(!saved.length){setRecords([]);setBusy(false);return;}
  const results=await Promise.all(saved.map(async item=>{try{return {...item,data:await readOwnEnquiry(item.id)};}catch(err){return {...item,error:err.message||'Access unavailable'};}}));
  setRecords(results);setBusy(false);
 }
 useEffect(()=>{refresh();},[]);
 return <main className="v82-page v82-wrap v82-tracker"><header className="v82-hero v82-hero-plain"><span className="v82-kicker">YOUR JOURNEY / ENQUIRY PROGRESS</span><h1>From your first idea<br/><em>to the next conversation.</em></h1><p>Check enquiries submitted from this browser. A reference number alone cannot unlock private enquiry details.</p><button onClick={refresh} disabled={busy} className="v82-outline">{busy?'Checking…':'Refresh status ↗'}</button></header>
 {error&&<p role="alert" className="v82-error">{error}</p>}
 {!busy&&!records.length&&<div className="v82-empty">No enquiry references have been saved in this browser. <Link href="/create">Start your journey ↗</Link></div>}
 <div className="v82-tracker-list">{records.map(item=><article key={item.id}><span className="v82-kicker">{item.source.toUpperCase()} / REFERENCE {item.id}</span><h2>{item.data?(states[item.data.status]?.label||'Received'):'Session access unavailable'}</h2><p>{item.data?(states[item.data.status]?.desc||'Contact our team to check the latest status.'):item.error}</p><small>Submitted: {item.createdAt?new Date(item.createdAt).toLocaleString('en-IN'):'Date unavailable'}</small></article>)}</div>
 <p className="v82-private">This feature relies on the original signed-in Firebase visitor session. Clearing browser data, switching devices or signing out can prevent access. It does not send emails or display private proposals. For help, <Link href="/contact">contact TrawellBeyond</Link>.</p>
 </main>;
}
