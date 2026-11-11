'use client';
import {useCallback,useEffect,useMemo,useState} from 'react';
import './enquiry-inbox.css';
const STATUSES=['new','reviewing','contacted','proposal_ready','closed'];
const label={new:'New enquiry',reviewing:'Reviewing',contacted:'Contacted',proposal_ready:'Proposal ready',closed:'Closed'};
const showDate=x=>{try{return x?.toDate?.()?.toLocaleString('en-IN')||new Date(x).toLocaleString('en-IN');}catch{return '—';}};
const cleanPhone=value=>String(value||'').replace(/[^+0-9]/g,'');
export default function EnquiryInbox({request,role}){
 const [items,setItems]=useState([]),[assignees,setAssignees]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[filter,setFilter]=useState('all'),[search,setSearch]=useState('');
 const load=useCallback(async()=>{
  setBusy(true);setError('');
  try{
   const [response,staff]=await Promise.all([request('/api/admin/enquiries'),request('/api/admin/enquiries/assignees')]);
   setItems(response.items||[]);setAssignees(staff.items||[]);
  }catch(e){setError(e.message||'Unable to load enquiries.');}
  finally{setBusy(false);}
 },[request]);
 useEffect(()=>{load();},[load]);
 async function update(item,fields){
  setBusy(true);setError('');setNotice('');
  try{await request('/api/admin/enquiries',{method:'PATCH',body:{id:item.id,status:fields.status||item.status,...(Object.prototype.hasOwnProperty.call(fields,'assignedTo')?{assignedTo:fields.assignedTo}:{})}});setNotice('Enquiry updated.');await load();}
  catch(e){setError(e.message||'Unable to update enquiry.');}finally{setBusy(false);}
 }
 const visible=useMemo(()=>items.filter(x=>(filter==='all'||x.status===filter)&&[x.name,x.phone,x.destination,x.leadSummary,x.purpose,x.id].some(v=>String(v||'').toLowerCase().includes(search.toLowerCase().trim()))),[items,filter,search]);
 const counts=useMemo(()=>Object.fromEntries(STATUSES.map(s=>[s,items.filter(x=>x.status===s).length])),[items]);
 return <section className="ei-root" aria-labelledby="ei-title">
  <div className="ei-hero"><span>TRAWELLBEYOND / HUMAN HANDOFF</span><h2 id="ei-title">Behind every enquiry, a person.</h2><p>Only submitted, consented enquiries appear here. The Journey Companion does not retain visitors' unfinished conversations or silently create leads.</p></div>
  <div className="ei-stats">{STATUSES.slice(0,4).map(s=><div key={s}><strong>{counts[s]||0}</strong><span>{label[s]}</span></div>)}</div>
  <div className="ei-tools"><label>Find an enquiry<input placeholder="Search name, destination or reference" value={search} onChange={e=>setSearch(e.target.value)}/></label><label>Status<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option>{STATUSES.map(x=><option key={x} value={x}>{label[x]}</option>)}</select></label><button type="button" className="a-btn a-outline" onClick={load} disabled={busy}>Refresh inbox</button></div>
  {notice&&<p className="ei-notice" role="status">{notice}</p>}{error&&<p className="ei-error" role="alert">{error}</p>}
  {!visible.length&&!busy?<div className="ei-empty">No enquiries match the current filters. The team sees only submitted customer requests.</div>:null}
  <div className="ei-list">{visible.map(x=><article key={x.id} className="ei-card"><div className="ei-card-head"><div><small>{(x.source||'enquiry').toUpperCase()} / {x.id}</small><h3>{x.name||'Visitor'}</h3><p>{x.destination||'Open to suggestions'} · {x.dates||'Dates flexible'}</p></div><span className={`ei-pill ei-${x.status}`}>{label[x.status]||x.status}</span></div>
    <div className="ei-details"><div><span>CONTACT</span><p>{x.phone||'—'}</p>{x.email&&<p>{x.email}</p>}</div><div><span>JOURNEY</span><p>{x.purpose||'Not specified'}</p><p>{x.travelers||'Travellers to confirm'}</p></div><div><span>PREFERENCE</span><p>{x.followUpChannel==='whatsapp'?'WhatsApp':x.followUpChannel==='email'?'Email':'Call'} preferred</p>{x.preferredContactTime&&<p>Best time: {x.preferredContactTime}</p>}<p>{showDate(x.createdAt)}</p></div></div>
    {x.leadSummary?<details className="ei-summary"><summary>Journey Companion qualification summary</summary><pre>{x.leadSummary}</pre></details>:null}
    {x.notes?<details className="ei-summary"><summary>Full enquiry and requested changes</summary><pre>{x.notes}</pre></details>:null}
    <div className="ei-card-actions"><label>Progress<select value={x.status||'new'} disabled={busy} onChange={e=>update(x,{status:e.target.value})}>{STATUSES.map(s=><option key={s} value={s}>{label[s]}</option>)}</select></label>
     {['super_admin','admin'].includes(role)&&<label>Assigned advisor<select value={x.assignedTo||''} disabled={busy} onChange={e=>update(x,{assignedTo:e.target.value})}><option value="">Unassigned</option>{assignees.map(a=><option key={a.uid} value={a.uid}>{a.name} · {a.role}</option>)}</select></label>}
     <a href={`tel:${cleanPhone(x.phone)}`} className="a-btn a-outline">Call</a>{x.followUpChannel==='whatsapp'&&<a href={`https://wa.me/${cleanPhone(x.phone).replace(/^\+/,'')}`} target="_blank" rel="noopener noreferrer" className="a-btn a-outline">Open WhatsApp</a>}
    </div>
   </article>)}</div>
  <p className="ei-footnote">No automated WhatsApp messages, bookings or quotations are sent. Team assignments and customer status updates are protected by Firestore rules.</p>
 </section>;
}
