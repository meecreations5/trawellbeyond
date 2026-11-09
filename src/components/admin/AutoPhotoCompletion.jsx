'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {plannedMissingPhotoSlots,rankPhotoCandidate,summarizePhotoCoverage,imageHealthTargets} from '@/lib/global-photo-completion.mjs';
import {photoSearchQueries,reviewableCommonsCandidate} from '@/lib/bulk-photography.mjs';
import './auto-photo-completion.css';
const titleCase=s=>String(s||'').split('-').map(x=>x[0]?.toUpperCase()+x.slice(1)).join(' ');
const sourceKey=value=>{try{return decodeURIComponent(new URL(value).pathname).toLowerCase();}catch{return '';}};
const types={destinations:'Destination',experiences:'Experience',journeys:'Journey'};
const safeResponse=async response=>{const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||`Image search failed: HTTP ${response.status}`);return data;};
/** Runs in a signed-in staff browser: no server credentials, no background job,
 * no blind publishing. Strong Commons filename matches are attached to DRAFTS
 * with mediaReviewStatus=pending. Resume is safe after a new Firestore scan. */
export default function AutoPhotoCompletion({request,snapshot,onRefresh,onOpenEditor}){
 const destinations=useMemo(()=>[...new Set(['destinations','experiences','journeys'].flatMap(type=>(snapshot?.content?.[type]||[]).map(x=>type==='destinations'?x.slug:x.destinationSlug)).filter(Boolean))].sort(),[snapshot]);
 const [destination,setDestination]=useState('all'),[type,setType]=useState('all');
 const [running,setRunning]=useState(false),[progress,setProgress]=useState(''),[result,setResult]=useState(''),[error,setError]=useState('');
 const [log,setLog]=useState([]),[reviewAcknowledged,setReviewAcknowledged]=useState(false);
 const [checking,setChecking]=useState(false),[health,setHealth]=useState(null);
 const cancelRef=useRef(false);
 useEffect(()=>()=>{cancelRef.current=true;},[]);
 const selected=destination==='all'?destinations:[destination];
 const coverage=useMemo(()=>summarizePhotoCoverage(snapshot,destinations),[snapshot,destinations]);
 const missing=useMemo(()=>plannedMissingPhotoSlots(snapshot,{destinations:selected,group:type}),[snapshot,destination,type,destinations]);
 const pending=useMemo(()=>coverage.needsReview.filter(r=>destination==='all'||r.destination===destination),[coverage,destination]);
 function loadImage(url){
  return new Promise(resolve=>{
   const img=new Image();let settled=false;
   const done=valid=>{if(settled)return;settled=true;clearTimeout(timer);img.onload=null;img.onerror=null;resolve(valid);};
   const timer=setTimeout(()=>done(false),9000);
   img.onload=()=>done(img.naturalWidth>0&&img.naturalHeight>0);
   img.onerror=()=>done(false);
   img.src=url;
  });
 }
 async function checkImageLinks(){
  if(checking||running)return;
  setChecking(true);setHealth(null);setError('');setProgress('Testing public image URLs in your browser…');
  try{
   const fresh=await request('/api/admin/completion/snapshot');
   if(fresh.truncated?.length)throw new Error(`Firestore scan incomplete: ${fresh.truncated.join(', ')}`);
   const links=imageHealthTargets(fresh,selected);
   const unique=[...new Map(links.map(row=>[row.url,row])).values()];
   const selectedUrls=unique.slice(0,destination==='all'?300:2000);
   const failures=new Set();let tested=0;
   const tasks=[...selectedUrls];
   async function worker(){
    while(tasks.length){
     const row=tasks.shift();if(!row)break;
     if(!/^https:\/\//.test(row.url)||!await loadImage(row.url))failures.add(row.url);
     tested++;if(tested%5===0||tested===selectedUrls.length)setProgress(`Live image check ${tested}/${selectedUrls.length} · ${failures.size} inaccessible image URLs`);
    }
   }
   await Promise.all(Array.from({length:Math.min(5,tasks.length)},()=>worker()));
   const bad=links.filter(x=>failures.has(x.url));
   setHealth({tested,of:unique.length,failures:bad});
  }catch(e){setError(`Image link check failed: ${e.message}`);}
  finally{setChecking(false);setProgress('');}
 }
 async function start(){
  if(running||!missing.length||!reviewAcknowledged)return;
  if(!window.confirm(`Find licensed Wikimedia photos and automatically fill empty images on ${missing.length} DRAFT placements? Strong filename matches only. Existing images remain unchanged. All imported photos will be marked PENDING publisher review and cannot be published until visually approved.`))return;
  cancelRef.current=false;setRunning(true);setError('');setResult('');setLog([]);
  const metrics={searched:0,proposed:0,uploaded:0,reused:0,attached:0,skipped:0,failures:[]};
  try{
   setProgress('Refreshing live Firestore records and Media Library…');
   const fresh=await request('/api/admin/completion/snapshot');
   if(fresh.truncated?.length)throw new Error(`Scan incomplete (${fresh.truncated.join(', ')}). Do not run bulk changes until pagination is complete.`);
   const targets=plannedMissingPhotoSlots(fresh,{destinations:selected,group:type});
   const recordMap=new Map(['destinations','experiences','journeys'].flatMap(t=>(fresh.content?.[t]||[]).map(r=>[`${t}:${r.slug}`,r])));
   const assetCache=new Map((fresh.assets||[]).filter(a=>a.rightsConfirmed&&a.source==='wikimedia'&&a.sourcePage&&a.variants?.display?.url&&a.variants?.medium?.url&&a.variants?.thumb?.url).map(a=>[sourceKey(a.sourcePage),a]));
   const searchCache=new Map();
   const byRecord=new Map();
   for(const slot of targets){const key=`${slot.type}:${slot.slug}`;if(!byRecord.has(key))byRecord.set(key,[]);byRecord.get(key).push(slot);}
   let slotNumber=0;
   for(const [recordKey,recordSlots] of byRecord){
    if(cancelRef.current)break;
    const record=recordMap.get(recordKey);if(!record||record.status!=='draft')continue;
    const used=new Set(),assignments=[];
    for(const slot of recordSlots){
     if(cancelRef.current)break;
     slotNumber++;setProgress(`${slotNumber}/${targets.length} · Finding ${types[slot.type]} photo for ${slot.recordTitle} (${slot.field}${slot.field==='dayImages'?` ${slot.index+1}`:''})`);
     let best=null;
     for(const q of photoSearchQueries(slot.query)){
      if(cancelRef.current)break;
      try{
       let promise=searchCache.get(q);
       if(!promise){promise=fetch(`/api/commons/search?q=${encodeURIComponent(q)}`,{cache:'no-store'}).then(safeResponse);searchCache.set(q,promise);}
       const data=await promise;
       metrics.searched++;
       const scored=(data.items||[]).filter(reviewableCommonsCandidate).map(photo=>({photo,...rankPhotoCandidate(slot,photo)})).filter(x=>x.confidence==='strong').sort((a,b)=>b.score-a.score);
       best=scored.find(x=>!used.has(sourceKey(x.photo.sourcePage)))||null;
       if(best)break;
      }catch(e){searchCache.delete(q);metrics.failures.push(`${slot.recordTitle} image search: ${e.message}`);}
     }
     if(!best){metrics.skipped++;continue;}
     const photo=best.photo,key=sourceKey(photo.sourcePage);
     used.add(key);metrics.proposed++;
     try{
      let asset=assetCache.get(key);
      if(!asset){
       setProgress(`${slotNumber}/${targets.length} · Optimizing photo as WebP for ${slot.recordTitle}`);
       const saved=await request('/api/admin/media/import',{method:'POST',body:{url:photo.url,sourcePage:photo.sourcePage,credit:photo.credit,license:photo.license,licenseUrl:photo.licenseUrl,altText:photo.title,rightsAccepted:true,crop:{preset:slot.field==='heroImage'?'hero':slot.field.startsWith('storyImage')?'editorial':'gallery'}}});
       asset=saved.item;assetCache.set(key,asset);metrics.uploaded++;
      }else metrics.reused++;
      if(!asset?.id)throw new Error('Image import returned no Media Library ID.');
      assignments.push({field:slot.field,index:slot.index,mediaId:asset.id});
     }catch(e){metrics.failures.push(`${slot.recordTitle} · ${slot.field}: ${e.message}`);}
    }
    if(assignments.length){
     setProgress(`Saving ${assignments.length} new photos to Draft ${record.title}…`);
     try{
      const response=await request('/api/admin/bulk/auto-photography',{method:'POST',body:{type:recordSlots[0].type,id:record.slug,expectedUpdatedAt:record.updatedAt,assignments}});
      metrics.attached+=(response.added||[]).length;
      metrics.skipped+=(response.skipped||[]).length;
     }catch(e){metrics.failures.push(`${record.title} could not attach images: ${e.message}`);}
    }
    setLog(current=>[...current.slice(-40),`${record.title}: ${assignments.length} strong source match(es), queued for review`]);
   }
   setResult(`${cancelRef.current?'Stopped safely. ':'Batch finished. '}${metrics.attached} missing image slots filled, ${metrics.uploaded} new optimized photographs, ${metrics.reused} reused photographs, ${metrics.skipped} uncertain or unavailable slots skipped, ${metrics.failures.length} technical issues. All automated photos remain DRAFTS and require Publisher review.`);
   if(metrics.failures.length)setError(metrics.failures.slice(0,7).join(' | '));
  }catch(e){setError(`Automatic completion stopped: ${e.message}. Already stored photos are preserved and can be reused after rescanning.`);}
  finally{setRunning(false);setProgress('');setReviewAcknowledged(false);try{await onRefresh();}catch{/* Main error already visible */}}
 }
 return <section className="ap-root">
  <div className="ap-head"><div><span>03 / AUTOMATIC IMAGE COMPLETION · ALL DESTINATIONS</span><h3>Complete the missing photos without hundreds of manual uploads.</h3><p>Strong Wikimedia Commons filename matches are downloaded, optimized into responsive WebP variants, saved in Firebase Storage and linked to empty Draft slots. Uncertain matches are skipped for your team to review. Published images are never overwritten.</p></div></div>
  <div className="ap-stats"><div><b>{coverage.missingDraft}</b><span>Empty Draft photo slots</span></div><div><b>{coverage.missingPublished}</b><span>Empty Published slots · manual repair</span></div><div><b>{coverage.needsReview.length}</b><span>Drafts awaiting photo approval</span></div><div><b>{destinations.length}</b><span>Destinations in Firebase</span></div></div>
  <div className="ap-controls"><label>Work on<select disabled={running} value={destination} onChange={e=>setDestination(e.target.value)}><option value="all">All {destinations.length} destinations</option>{destinations.map(d=><option key={d} value={d}>{titleCase(d)}</option>)}</select></label><label>Photo sections<select value={type} disabled={running} onChange={e=>setType(e.target.value)}><option value="all">Destinations + experiences + journeys</option><option value="destinations">Destination covers + stories</option><option value="experiences">Experience images</option><option value="journeys">Journeys + day photos</option></select></label><div className="ap-count"><strong>{missing.length}</strong><small>empty Draft slots in selection</small></div></div>
  <label className="ap-consent"><input type="checkbox" checked={reviewAcknowledged} disabled={running} onChange={e=>setReviewAcknowledged(e.target.checked)}/> I understand auto-selected images are only suggestions, may be incorrect, and must be visually checked with their licence/credits by a Publisher before publication.</label>
  <div className="ap-actions"><button className="a-btn a-primary" disabled={!missing.length||running||!reviewAcknowledged} onClick={start}>{running?'Processing images…':`Auto-complete ${missing.length} empty Draft placements`}</button>{running&&<button className="a-btn a-outline" onClick={()=>{cancelRef.current=true;setProgress('Stopping after the current download or record…');}}>Stop safely</button>}<small>Keep this Admin tab open. Safe to stop, rescan and resume later. No automatic publication.</small></div>
  <div className="ap-health"><div><h4>Check images that are already saved</h4><p>Not every missing image is an empty field. This browser check loads existing image URLs and identifies broken or inaccessible covers, galleries and responsive variants. Choose a destination for a full check, or all destinations for the first 300 unique URLs.</p></div><button disabled={running||checking} className="a-btn a-outline" onClick={checkImageLinks}>{checking?'Testing public images…':'Test saved image links'}</button></div>
  {health&&<div className="ap-health-results"><strong>{health.tested} of {health.of} unique image URLs tested · {new Set(health.failures.map(x=>x.url)).size} inaccessible URLs</strong>{health.tested<health.of&&<p>Only the first {health.tested} URLs were tested. Select one destination at a time to check the remainder.</p>}{health.failures.length>0&&<div className="ap-review-grid">{health.failures.slice(0,60).map((entry,i)=><div key={`${entry.slug}-${entry.field}-${i}`} className="ap-review-row"><span>{entry.status} · {entry.field}</span><strong>{entry.title}</strong><small className="ap-bad-url">{entry.url}</small><button className="a-btn a-outline" onClick={()=>onOpenEditor(entry.type,{slug:entry.slug})}>Repair image ↗</button></div>)}</div>}</div>}
  {progress&&<p role="status" className="ap-progress">{progress}</p>}
  {result&&<p role="status" className="ap-result">{result}</p>}
  {error&&<p role="alert" className="ap-error">{error}</p>}
  {!!pending.length&&<div className="ap-review"><h4>Photo review queue ({pending.length})</h4><p>A Publisher must open each Draft, check the exact attraction and credits, then approve its photographs before publication.</p><div className="ap-review-grid">{pending.slice(0,100).map(x=><div className="ap-review-row" key={`${x.type}:${x.slug}`}><span>{types[x.type]} · {titleCase(x.destination)}</span><strong>{x.title}</strong><button type="button" className="a-btn a-outline" onClick={()=>onOpenEditor(x.type,{slug:x.slug})}>Open photo review ↗</button></div>)}</div></div>}
  <div className="ap-coverage"><h4>Destination image coverage</h4><div className="ap-coverage-grid">{coverage.byDestination.map(row=><button key={row.destination} type="button" className="ap-destination" onClick={()=>setDestination(row.destination)} disabled={running}><strong>{titleCase(row.destination)}</strong><small>{row.draftMissing} missing Draft · {row.publishedMissing} missing Published · {row.needsReview} review pending</small></button>)}</div></div>
  {!!log.length&&<details><summary>Show last {log.length} processed records</summary><div className="ap-log">{log.map((line,i)=><p key={i}>{line}</p>)}</div></details>}
 </section>;
}
