'use client';
import {useMemo,useState} from 'react';
import {CONTENT_LABELS} from '@/lib/content.mjs';
import {buildCompletionReport,proposeCompletion,CATEGORY_LABELS,collectImageHealthTargets} from '@/lib/completion-engine.mjs';
import './completion-center.css';
const caps=['critical','important','recommended'];
const keyOf=(type,slug,field)=>`${type}:${slug}:${field}`;
const csvCell=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
function downloadCsv(issues){
 const lines=[['Type','Slug','Title','Status','Category','Priority','Field','Issue','Description'],...issues.map(i=>[i.type,i.slug,i.title,i.status,i.category,i.severity,i.field,i.label,i.reason])];
 const csv='\uFEFF'+lines.map(row=>row.map(csvCell).join(',')).join('\r\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='trawellbeyond-content-audit.csv';a.click();URL.revokeObjectURL(url);
}
function imageProbe(url,timeout=7500){
 return new Promise(resolve=>{
  const img=new Image();let ended=false;
  const finish=ok=>{if(ended)return;ended=true;clearTimeout(timer);img.onload=null;img.onerror=null;resolve(ok);};
  const timer=setTimeout(()=>finish(false),timeout);
  img.onload=()=>finish(true);img.onerror=()=>finish(false);
  img.src=url;
 });
}
async function inspectImages(targets,onProgress){
 const failed=[];let next=0,completed=0;
 await Promise.all(Array.from({length:Math.min(4,targets.length)},async()=>{
  for(;;){const index=next++;if(index>=targets.length)return;
   const item=targets[index];if(!await imageProbe(item.url))failed.push(item);
   completed++;onProgress(completed);
  }
 }));
 return failed;
}
export default function CompletionCenter({request,onOpenEditor,onOpenMedia}){
 const [snapshot,setSnapshot]=useState(null),[scanBusy,setScanBusy]=useState(false),[scanError,setScanError]=useState('');
 const [type,setType]=useState('all'),[destination,setDestination]=useState('all'),[category,setCategory]=useState('all'),[text,setText]=useState('');
 const [selected,setSelected]=useState({}),[focus,setFocus]=useState(''),[visible,setVisible]=useState(30),[suggestVisible,setSuggestVisible]=useState(100);
 const [applyBusy,setApplyBusy]=useState(false),[result,setResult]=useState(''),[probes,setProbes]=useState(null),[probeBusy,setProbeBusy]=useState(false),[probeCount,setProbeCount]=useState(0);
 const report=useMemo(()=>snapshot?buildCompletionReport(snapshot.content,snapshot.assets,{type,destination}):null,[snapshot,type,destination]);
 const rows=useMemo(()=>!report?[]:report.rows.filter(row=>{
  if(category!=='all'&&!row.issues.some(x=>x.category===category))return false;
  return [row.title,row.slug,row.type].join(' ').toLowerCase().includes(text.toLowerCase());
 }).sort((a,b)=>{
  const priority=r=>r.issues.some(x=>x.severity==='critical')?3:r.issues.some(x=>x.severity==='important')?2:r.issues.length?1:0;
  return priority(b)-priority(a)||b.issueCount-a.issueCount||a.title.localeCompare(b.title);
 }),[report,category,text]);
 const suggestions=useMemo(()=>!snapshot?[]:report.rows.filter(row=>row.type!=='media').flatMap(row=>proposeCompletion(row.type,row.record,snapshot.assets).map(s=>({...s,type:row.type,slug:row.slug,title:row.title,status:row.status,key:keyOf(row.type,row.slug,s.field)}))),[report,snapshot]);
 const chosen=suggestions.filter(s=>selected[s.key]);
 const destinations=useMemo(()=>snapshot?((snapshot.content.destinations||[]).map(x=>({slug:x.slug,title:x.title})).sort((a,b)=>a.title.localeCompare(b.title))):[],[snapshot]);
 async function scan(){
  setScanBusy(true);setScanError('');setResult('');setProbes(null);setSelected({});setFocus('');setVisible(30);setSuggestVisible(100);
  try{
   const data=await request('/api/admin/completion/snapshot');
   if(!data.ok)throw new Error('Content scan could not complete.');
   setSnapshot(data);
  }catch(err){setScanError(err.message);}finally{setScanBusy(false);}
 }
 async function fill(){
  if(!chosen.length||applyBusy)return;
  const grouped=new Map();for(const p of chosen){const k=keyOf(p.type,p.slug,'record');if(!grouped.has(k))grouped.set(k,{type:p.type,id:p.slug,fields:{}});grouped.get(k).fields[p.field]=p.value;}
  if(grouped.size>25)return setScanError('For safe rollout, apply no more than 25 records at a time. Uncheck some items, then retry.');
  if(!window.confirm(`Fill ${chosen.length} reviewed blank field(s) across ${grouped.size} record(s)? Existing values and Draft / Published status are preserved. No new media will be imported and nothing will be published.`))return;
  setApplyBusy(true);setScanError('');const outcomes={updated:0,fields:0,skipped:0,errors:[]};
  for(const group of grouped.values()){
   try{
    const result=await request('/api/admin/completion/fill',{method:'POST',body:{type:group.type,id:group.id,fields:group.fields}});
    if(result.applied?.length)outcomes.updated++;
    outcomes.fields+=(result.applied||[]).length;outcomes.skipped+=(result.skipped||[]).length;
   }catch(error){outcomes.errors.push(`${group.type}/${group.id}: ${error.message}`);}
  }
  setResult(`${outcomes.updated} record(s) updated; ${outcomes.fields} field(s) filled, ${outcomes.skipped} already completed, ${outcomes.errors.length} failed.${outcomes.errors.length?' First issue: '+outcomes.errors[0]:''} Publication status was unchanged.`);
  setApplyBusy(false);await scan();
  // Scan replaces the old snapshot; keep the saved confirmation visible.
  setResult(`${outcomes.updated} record(s) updated; ${outcomes.fields} field(s) filled, ${outcomes.skipped} already completed, ${outcomes.errors.length} failed.${outcomes.errors.length?' First issue: '+outcomes.errors[0]:''}`);
 }
 async function checkImages(){
  if(!snapshot||probeBusy)return;
  const targets=collectImageHealthTargets(snapshot.content,120);if(!targets.length){setProbes({checked:0,failed:[]});return;}
  setProbeBusy(true);setProbes(null);setProbeCount(0);
  try{const failed=await inspectImages(targets,setProbeCount);setProbes({checked:targets.length,failed});}
  finally{setProbeBusy(false);}
 }
 const exportIssues=report?.issues.filter(i=>category==='all'||i.category===category)||[];
 return <div className="cc-root">
  <section className="cc-intro"><div><span>V7.7 / CONTENT &amp; MEDIA INTELLIGENCE</span><h2>Find what is missing. Fill what is verified.</h2><p>Scan destinations, experiences, journeys, offers, website pages and your Media Library from one place. Review every proposed change before it is saved. Existing copy, photos and publication states are protected.</p></div><button className="a-btn a-primary" type="button" disabled={scanBusy||applyBusy} onClick={scan}>{scanBusy?'Scanning Firestore…':snapshot?'Refresh full scan':'Scan all website content ↗'}</button></section>
  {scanError&&<p role="alert" className="a-alert a-error">{scanError}</p>}{result&&<p role="status" className="a-alert a-success">{result}</p>}
  {!snapshot&&!scanBusy&&<div className="cc-empty"><h3>Ready to scan your website</h3><p>The scan reads your content and licensed media metadata. It does not modify your Firestore database or Firebase Storage.</p></div>}
  {snapshot&&<>
   {!!snapshot.truncated?.length&&<p className="a-alert a-error" role="alert">Scan reached the 10,000-item safety cap for {snapshot.truncated.join(', ')}. Export and audit in smaller batches before marking this website complete.</p>}
   <div className="cc-stats"><div><strong>{report.recordCount}</strong><span>Content records reviewed</span></div><div><strong>{report.mediaCount}</strong><span>Saved media assets</span></div><div><strong>{report.issuesCount}</strong><span>Issues / opportunities</span></div><div><strong>{report.bySeverity.critical}</strong><span>Critical requirements</span></div></div>
   <div className="cc-categories">{Object.entries(CATEGORY_LABELS).map(([k,label])=><button key={k} className={category===k?'active':''} onClick={()=>{setCategory(category===k?'all':k);setSelected({});}}><strong>{report.byCategory[k]}</strong><span>{label}</span></button>)}</div>
   <section className="cc-tools"><label>Content type<select value={type} onChange={e=>{setType(e.target.value);setSelected({});}}><option value="all">All records</option>{Object.entries(CONTENT_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}<option value="media">Media only</option></select></label><label>Destination<select value={destination} onChange={e=>{setDestination(e.target.value);setSelected({});}}><option value="all">All destinations</option>{destinations.map(d=><option value={d.slug} key={d.slug}>{d.title}</option>)}</select></label><label>Find records<input value={text} onChange={e=>{setText(e.target.value);setSelected({});}} placeholder="Search title or URL slug"/></label><button className="a-btn a-outline" type="button" onClick={()=>downloadCsv(exportIssues)}>Export audit CSV</button></section>
   <section className="cc-report"><div className="cc-section-head"><div><span>COMPLETENESS AUDIT</span><h3>{rows.length} record(s) in current view</h3></div><small>Red = publication-critical · Amber = important · Grey = recommended</small></div>
    <div className="cc-record-list">{rows.slice(0,visible).map(row=><article key={`${row.type}:${row.slug}`} className="cc-record"><div className="cc-record-top"><div><small>{row.type.toUpperCase()} · {row.status}</small><h4>{row.title}</h4><span className="cc-slug">{row.slug}</span></div><div className="cc-record-actions"><b className={row.issues.some(i=>i.severity==='critical')?'cc-critical':''}>{row.issueCount} item(s)</b>{row.type==='media'?<button className="a-btn a-outline" onClick={onOpenMedia}>Review media ↗</button>:<><button className="a-btn a-outline" onClick={()=>onOpenEditor(row.type,row.record)}>Open editor ↗</button><button className="a-btn a-outline" onClick={()=>{setFocus(focus===`${row.type}:${row.slug}`?'':`${row.type}:${row.slug}`);}}>Details {focus===`${row.type}:${row.slug}`?'−':'+'}</button></>}</div></div>
     {focus===`${row.type}:${row.slug}`&&<div className="cc-issues">{row.issues.length?row.issues.map(i=><div className={`cc-issue cc-${i.severity}`} key={i.id}><span>{i.category} · {i.severity}</span><strong>{i.label}</strong><p>{i.reason}</p></div>):<p>No required fields were flagged. Still verify accuracy, image rights and the public page manually.</p>}</div>}</article>)}
    </div>{rows.length>visible&&<button className="a-btn a-outline cc-more" onClick={()=>setVisible(x=>x+40)}>Show more ({rows.length-visible} remaining)</button>}
   </section>
   <section className="cc-review"><div className="cc-section-head"><div><span>REVIEW &amp; FILL — NEVER OVERWRITE</span><h3>{suggestions.length} available source-backed suggestion(s)</h3></div><small>Only verified existing material and already attached photos</small></div>
    <p>Suggestions come from the saved Singapore editorial/travel reference, existing starter drafts, and exact Media Library matches. No general web or AI search results are silently written. Select the fields you approve, then fill blank values only. Published records stay Published.</p>
    <div className="cc-review-actions"><button type="button" className="a-btn a-outline" onClick={()=>{const unique=new Set();setSelected(Object.fromEntries(suggestions.filter(s=>s.kind!=='video').filter(s=>{const k=`${s.type}:${s.slug}`;if(unique.has(k))return true;if(unique.size>=25)return false;unique.add(k);return true;}).map(s=>[s.key,true])));}}>Select available non-video suggestions (review first)</button><button className="a-btn a-text" type="button" onClick={()=>setSelected({})}>Clear selection</button><strong>{chosen.length} selected · {new Set(chosen.map(x=>`${x.type}:${x.slug}`)).size} records</strong></div>
    <div className="cc-suggestion-list">{suggestions.slice(0,suggestVisible).map(s=><label key={s.key} className="cc-suggestion"><input type="checkbox" checked={!!selected[s.key]} onChange={e=>setSelected(v=>({...v,[s.key]:e.target.checked}))}/><div><small>{s.type} / {s.slug} · {s.source}</small><strong>{s.label}</strong><p>{s.field==='imageVariants'?`${Object.keys(s.value).length} optimized Media Library image(s) linked, without changing their existing URL.`:String(s.value).slice(0,250)+(String(s.value).length>250?'…':'')}</p>{s.kind==='video'&&<span>Video source requires manual viewing before acceptance</span>}</div></label>)}</div>
    {suggestions.length>suggestVisible&&<button className="a-btn a-outline cc-more" type="button" onClick={()=>setSuggestVisible(x=>x+100)}>Show more suggestions ({suggestions.length-suggestVisible} remaining)</button>}
    <div className="cc-submit"><button className="a-btn a-primary" disabled={!chosen.length||applyBusy||scanBusy} type="button" onClick={fill}>{applyBusy?'Filling reviewed fields…':`Fill ${chosen.length} selected missing field(s) ↗`}</button><small>Maximum 25 records per apply. Each record is re-read transactionally before writing. No auto-publishing or media replacement.</small></div>
   </section>
   <section className="cc-image-health"><div className="cc-section-head"><div><span>OPTIONAL IMAGE HEALTH CHECK</span><h3>Check image loading</h3></div><button className="a-btn a-outline" disabled={probeBusy} onClick={checkImages}>{probeBusy?`Checking images… ${probeCount}`:'Check up to 120 image URLs ↗'}</button></div><p>Browser-based checks identify images that fail to load right now. They cannot confirm licence rights, landmark accuracy, or permanent availability. A URL may also fail because of network or hosting restrictions.</p>{probes&&<div><strong>{probes.checked-probes.failed.length} loaded, {probes.failed.length} need review out of {probes.checked} tested</strong>{probes.failed.slice(0,25).map(x=><div className="cc-broken" key={x.url}><span>{x.type} · {x.slug}</span><a href={x.url} target="_blank" rel="noopener noreferrer">Review image source ↗</a><button className="a-btn a-outline" onClick={()=>onOpenEditor(x.type, (snapshot.content[x.type]||[]).find(r=>r.slug===x.slug))}>Open record</button></div>)}</div>}</section>
   <section className="cc-notes"><h3>What cannot be filled safely without human review?</h3><p>Missing photographs that are not already stored, new video sources, real attraction operating hours, prices, licence confirmations, image-to-attraction accuracy and legal policy content must be checked by an editor. Use each record's Media Library picker for approved photographs, then rescan to attach responsive WebP references and missing credits.</p><div><button className="a-btn a-outline" onClick={onOpenMedia}>Open Media Library ↗</button><a className="a-btn a-outline" href="/destinations/singapore" target="_blank" rel="noreferrer">Check Singapore public page ↗</a></div></section>
  </>}
 </div>;
}
