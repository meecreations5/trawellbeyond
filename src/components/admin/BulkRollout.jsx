'use client';
import {useMemo,useState} from 'react';
import {REMAINING_STARTERS,REMAINING_COUNTS,REMAINING_DESTINATION_SLUGS,MEDIA_SEARCH_PLAN} from '@/lib/remaining-destinations-starters.mjs';
import {REMAINING_DESTINATIONS_DATA} from '@/lib/remaining-destinations-data.mjs';
import {planBulkInstall,bulkReadiness,bulkSelectionForPublish} from '@/lib/bulk-rollout.mjs';
import './bulk-rollout.css';
import PhotoCompletion from './PhotoCompletion';
import AutoPhotoCompletion from './AutoPhotoCompletion';
import {canPublishContent,canCreateContent} from '@/lib/team-access.mjs';

const priority=['destinations','experiences','journeys'];
const getKey=(type,record)=>`${type}:${record.slug}`;
const groupLabel={destinations:'Destinations',experiences:'Experiences',journeys:'Journeys'};
function exportCsv(rows){
 const cell=x=>`"${String(x??'').replace(/"/g,'""')}"`;
 const headers=['Type','Destination','Title','Slug','Current status','Readiness','Missing requirements','Public URL'];
 const body=rows.map(r=>{const x=r.record;return [r.type,r.type==='destinations'?x.slug:x.destinationSlug,x.title,x.slug,x.status,r.ready?'Ready':'Needs review',r.missing.join('; '),`/${r.type}/${x.slug}`];});
 const text=[headers,...body].map(row=>row.map(cell).join(',')).join('\r\n');
 const blob=new Blob(['\ufeff',text],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='TrawellBeyond_V7_9_Review_Report.csv';document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
}
export default function BulkRollout({request,role,onOpenEditor,onOpenMedia}){
 const [selected,setSelected]=useState(REMAINING_DESTINATION_SLUGS);
 const [snapshot,setSnapshot]=useState(null),[busy,setBusy]=useState(false),[progress,setProgress]=useState(''),[error,setError]=useState(''),[result,setResult]=useState('');
 const [approved,setApproved]=useState({}),[rightsAcknowledged,setRightsAcknowledged]=useState(false),[expanded,setExpanded]=useState(''),[filter,setFilter]=useState('all');
 const choices=new Set(selected);
 const rollout=useMemo(()=>snapshot?planBulkInstall(selected,snapshot.content,REMAINING_STARTERS):null,[selected,snapshot]);
 const pending=useMemo(()=>snapshot?bulkSelectionForPublish(snapshot.content,selected).map(({type,record})=>({type,record,...bulkReadiness(type,record)})):[],[snapshot,selected]);
 const allRows=useMemo(()=>snapshot?priority.flatMap(type=>(snapshot.content[type]||[]).filter(r=>choices.has(type==='destinations'?r.slug:r.destinationSlug)).map(record=>({type,record,...bulkReadiness(type,record)}))):[],[snapshot,selected]);
 const visible=allRows.filter(r=>filter==='all'||(filter==='ready'&&r.ready)||(filter==='missing'&&!r.ready)||(filter==='draft'&&r.record.status==='draft') );
 const canPublish=pending.filter(r=>r.ready&&approved[getKey(r.type,r.record)]);
 const recordCounts=priority.map(type=>({type,items:allRows.filter(r=>r.type===type)}));
 const scan=async()=>{
  setBusy(true);setError('');setResult('');setProgress('Reading live Firestore through your authenticated CMS session…');
  try{const data=await request('/api/admin/completion/snapshot');
   if(data.truncated?.length)throw new Error(`Scan reached an item cap: ${data.truncated.join(', ')}. Resolve before bulk operations.`);
   setSnapshot(data);setApproved({});setRightsAcknowledged(false);
   setResult('Scan complete. No content was modified. Review the preview and media requirements before importing or publishing.');
  }catch(e){setError(e.message);}finally{setBusy(false);setProgress('');}
 };
 const toggleDestination=slug=>{setSelected(prev=>prev.includes(slug)?prev.filter(x=>x!==slug):[...prev,slug]);setApproved({});setRightsAcknowledged(false);};
 async function install(){
  if(!canCreateContent(role)||!rollout||busy||!rollout.create.length)return;
  if(!window.confirm(`Install ${rollout.create.length} new DRAFT records across ${selected.length} selected destinations? ${rollout.skipped.length} existing records will not be changed. No public content will be published.`))return;
  setBusy(true);setResult('');setError('');const status={created:0,skipped:rollout.skipped.length,failed:[]};
  try{
   for(let i=0;i<rollout.create.length;i+=4){
    const pack=rollout.create.slice(i,i+4);
    setProgress(`Creating verified-format private drafts: ${i+1}–${Math.min(i+4,rollout.create.length)} of ${rollout.create.length}`);
    const settled=await Promise.allSettled(pack.map(item=>request(`/api/admin/content/${item.type}`,{method:'POST',body:{...item,status:'draft'}})));
    settled.forEach((r,j)=>{if(r.status==='fulfilled')status.created++;
     else if(/already exists/i.test(r.reason?.message||''))status.skipped++;
     else status.failed.push(`${pack[j].slug}: ${r.reason?.message||'Unknown error'}`);});
   }
   const next=await request('/api/admin/completion/snapshot');setSnapshot(next);setApproved({});
   setResult(`Draft import: ${status.created} created, ${status.skipped} preserved, ${status.failed.length} errors. No existing records changed or published.`);
   if(status.failed.length)setError(status.failed.slice(0,5).join(' | '));
  }catch(e){setError(`Import interrupted: ${e.message}. Rescan before retrying; already created drafts will be skipped.`);}
  finally{setBusy(false);setProgress('');}
 }
 async function publishSelected(){
  if(!canPublishContent(role)||busy||!canPublish.length||!rightsAcknowledged)return;
  const expected=`PUBLISH ${canPublish.length}`;
  const entered=window.prompt(`Final approval required. You are publishing ${canPublish.length} previously reviewed drafts to your public website. Type ${expected} to continue.`);
  if(entered!==expected)return;
  setBusy(true);setProgress('');setError('');setResult('');const outcome={published:0,skipped:0,failed:[]};
  try{
   // Destinations first; clients cannot publish a child whose destination is still private.
   const ordered=[...canPublish].sort((a,b)=>priority.indexOf(a.type)-priority.indexOf(b.type));
   for(let i=0;i<ordered.length;i++){
    const row=ordered[i];setProgress(`Publishing ${i+1}/${ordered.length}: ${row.record.title}`);
    try{const data=await request('/api/admin/bulk/publish',{method:'POST',body:{type:row.type,id:row.record.slug,expectedUpdatedAt:row.record.updatedAt,reviewed:true}});
     if(data.skipped)outcome.skipped++;else outcome.published++;
    }catch(e){outcome.failed.push(`${row.record.slug}: ${e.message}`);}
   }
   const next=await request('/api/admin/completion/snapshot');setSnapshot(next);setApproved({});setRightsAcknowledged(false);
   setResult(`Publication: ${outcome.published} published, ${outcome.skipped} already published, ${outcome.failed.length} blocked/failed. Singapore and existing published records were not edited.`);
   if(outcome.failed.length)setError(outcome.failed.slice(0,6).join(' | '));
  }catch(e){setError(`Could not refresh the publication report: ${e.message}`);}
  finally{setBusy(false);setProgress('');}
 }
 return <div className="br-root">
  <section className="br-hero"><span>V7.9 / FULL DESTINATION ROLLOUT</span><h2>Complete the destinations. Review before going live.</h2><p>Install the remaining 17 destination drafts with their curated experiences and journeys. Select verified media in the existing library, review practical details, then publish approved records together. No existing page is overwritten.</p>
   <div className="br-stats"><div><strong>{REMAINING_COUNTS.destinations}</strong><small>Destinations</small></div><div><strong>{REMAINING_COUNTS.experiences}</strong><small>Experience drafts</small></div><div><strong>{REMAINING_COUNTS.journeys}</strong><small>Journey drafts</small></div><div><strong>{REMAINING_COUNTS.total}</strong><small>Total drafts</small></div></div>
  </section>
  <section className="br-section"><div className="br-head"><div><span>01 / SELECT &amp; SCAN</span><h3>Destinations to prepare</h3></div><div className="br-action"><button className="a-btn a-outline" onClick={()=>{setSelected(REMAINING_DESTINATION_SLUGS);setApproved({});}}>Select all 17</button><button className="a-btn a-text" onClick={()=>{setSelected([]);setApproved({});}}>Clear</button></div></div>
   <div className="br-destinations">{REMAINING_DESTINATIONS_DATA.map(d=><label key={d.slug} className={selected.includes(d.slug)?'br-destination is-selected':'br-destination'}><input type="checkbox" checked={selected.includes(d.slug)} onChange={()=>toggleDestination(d.slug)}/><span><b>{d.title}</b><small>{d.region==='India'?'India':'International'}</small></span></label>)}</div>
   <div className="br-actions"><button disabled={busy||selected.length===0} className="a-btn a-primary" onClick={scan}>{busy?'Working…':snapshot?'Refresh Firestore scan':'Scan current Firebase records'}</button><span>{selected.length} destinations selected · Scan is read-only</span></div>
  </section>
  {snapshot&&<>
   <section className="br-section"><div className="br-head"><div><span>02 / IMPORT</span><h3>Draft preview</h3></div><b>{rollout.create.length} to create · {rollout.skipped.length} existing preserved</b></div>
    <p>Publishing, hero images, prices and video URLs are intentionally excluded from draft creation. Every imported record starts private, and rerunning this installation safely skips existing URL slugs.</p>
    <div className="br-actions"><button className="a-btn a-primary" disabled={busy||!canCreateContent(role)||!rollout.create.length} onClick={install}>Install {rollout.create.length} missing private drafts</button><span>Up to four protected draft creations per request group</span></div>
   </section>
   <section className="br-section"><AutoPhotoCompletion request={request} snapshot={snapshot} onRefresh={scan} onOpenEditor={onOpenEditor}/></section>
   <section className="br-section"><PhotoCompletion request={request} snapshot={snapshot} selected={selected} onRefresh={scan}/></section>
   <section className="br-section"><div className="br-head"><div><span>04 / MANUAL PHOTO FALLBACK</span><h3>Assign real, licensed photographs</h3></div><button className="a-btn a-outline" onClick={onOpenMedia}>Open Media Library ↗</button></div>
    <p>No generated images are presented as real attractions. Use the existing Commons licence-review and WebP tools. Each destination needs a hero, three story images, a gallery, and appropriate experience and day-wise photographs.</p>
    <div className="br-media-list">{MEDIA_SEARCH_PLAN.filter(row=>selected.includes(row.destinationSlug)).map(row=>{
     const d=REMAINING_DESTINATIONS_DATA.find(x=>x.slug===row.destinationSlug);
     return <article key={row.destinationSlug} className="br-media-item"><button onClick={()=>setExpanded(expanded===row.destinationSlug?'':row.destinationSlug)} aria-expanded={expanded===row.destinationSlug}><b>{d.title}</b><span>{expanded===row.destinationSlug?'−':'+'} Photo search guidance</span></button>{expanded===row.destinationSlug&&<div className="br-media-detail">{[row.coverSearch,...row.storySearches,...row.gallerySearches].map((query,i)=><a href={`https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(query)}&title=Special:MediaSearch&type=image`} target="_blank" rel="noopener noreferrer" key={query}>{i===0?'Cover':i<=3?`Story ${i}`:`Gallery ${i-3}`}: {query} ↗</a>)}<p>Verify the exact subject, photographer, reuse terms, crop rights and required attribution. Then import the accepted asset in Media Library and assign it from the content editor.</p></div>}</article>;
    })}</div>
   </section>
   <section className="br-section"><div className="br-head"><div><span>05 / READINESS &amp; REVIEW</span><h3>Content approval queue</h3></div><button className="a-btn a-outline" onClick={()=>exportCsv(allRows)}>Export review CSV</button></div>
    <div className="br-summary">{recordCounts.map(x=><div key={x.type}><b>{x.items.length}</b><span>{groupLabel[x.type]} loaded</span><small>{x.items.filter(r=>r.ready).length} ready for final review</small></div>)}</div>
    <label className="br-filter">Display<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All loaded records</option><option value="missing">Needs completion</option><option value="ready">Passes gate</option><option value="draft">Drafts only</option></select></label>
    <div className="br-rows">{visible.slice(0,300).map(row=>{const key=getKey(row.type,row.record),isDraft=row.record.status==='draft';return <article className="br-row" key={key}><div className="br-record"><div><span>{groupLabel[row.type]} · {row.record.destinationSlug||row.record.slug}</span><strong>{row.record.title}</strong><small>/{row.type}/{row.record.slug} · {row.record.status}</small></div><div className="br-record-actions"><b className={row.ready?'br-good':'br-warning'}>{row.ready?'Ready for review':`${row.missing.length} requirement(s)`}</b><button className="a-btn a-outline" onClick={()=>onOpenEditor(row.type,row.record)}>Edit &amp; verify ↗</button></div></div>{row.missing.length>0&&<p className="br-missing">Missing: {row.missing.join(' · ')}</p>}{row.ready&&isDraft&&<label className="br-approve"><input type="checkbox" checked={!!approved[key]} onChange={e=>setApproved(prev=>({...prev,[key]:e.target.checked}))}/> I reviewed this exact record and approve publication</label>}</article>})}</div>
   </section>
   <section className="br-section br-publish"><div className="br-head"><div><span>06 / CONTROLLED PUBLISHING</span><h3>Publish selected approved records</h3></div><b>{canPublish.length} approved drafts</b></div>
    <p>Only records passing all required content, licensing, gallery and date checks can be bulk-published. Destinations publish first. The live transaction checks for changes since review and blocks experiences or journeys whose destination is still private. New videos are optional; official sources must be checked before adding them.</p>
    <label className="br-consent"><input type="checkbox" checked={rightsAcknowledged} onChange={e=>setRightsAcknowledged(e.target.checked)}/> I reviewed the displayed records, media rights, accuracy of travel information and public presentation. I authorize publication of only the individually selected records.</label>
    <div className="br-actions"><button className="a-btn a-primary" disabled={!canPublishContent(role)||!rightsAcknowledged||!canPublish.length||busy} onClick={publishSelected}>Publish {canPublish.length} reviewed records</button><small>Final typed confirmation required · no unpublish or overwrite of existing published content</small></div>
   </section>
  </>}
  {progress&&<p role="status" className="br-progress">{progress}</p>}{result&&<p role="status" className="a-alert a-success">{result}</p>}{error&&<p role="alert" className="a-alert a-error">{error}</p>}
  <p className="br-foot">V7.8 live acceptance for Dubai and Thailand is tracked separately. A clean source test is not evidence of deployed images, actual videos or received enquiries. Run the live acceptance script before signing off either destination.</p>
 </div>;
}
