'use client';
import {useEffect,useMemo,useState} from 'react';
import {REMAINING_DESTINATIONS_DATA} from '@/lib/remaining-destinations-data.mjs';
import {missingPhotoSlots,reviewableCommonsCandidate,photoSearchQueries,PHOTO_SLOT_TOTAL} from '@/lib/bulk-photography.mjs';
import './photo-completion.css';

const typeNames={destinations:'Destination page',experiences:'Experiences',journeys:'Journeys'};
const fieldName=slot=>slot.field==='heroImage'?'Hero photograph':slot.field.startsWith('storyImage')?`Story photograph ${slot.field.slice(-1)}`:slot.field==='dayImages'?`Itinerary day ${slot.index+1}`:`Gallery photograph ${slot.index+1}`;
const sourceKey=url=>{try{return new URL(url).pathname;}catch{return String(url||'');}};
const safeResponse=async response=>{
 const data=await response.json().catch(()=>({}));
 if(!response.ok||data.ok===false)throw new Error(data.error||`Wikimedia search returned HTTP ${response.status}.`);
 return data;
};
/** A reviewed batch, not an automatic publication robot: Commons search ->
 * visible exact-file review -> opt-in -> WebP Storage import -> blank-only
 * transactional assignment. Never alters Singapore, Dubai or Thailand.
 */
export default function PhotoCompletion({request,snapshot,selected,onRefresh}){
 const [destination,setDestination]=useState(selected?.[0]||'malaysia');
 const [group,setGroup]=useState('destinations');
 const [candidates,setCandidates]=useState({});
 const [chosen,setChosen]=useState({});
 const [approved,setApproved]=useState({});
 const [busy,setBusy]=useState(false),[progress,setProgress]=useState(''),[error,setError]=useState(''),[outcome,setOutcome]=useState('');
 const destinations=useMemo(()=>REMAINING_DESTINATIONS_DATA.filter(x=>selected.includes(x.slug)),[selected]);
 const currentDestination=destinations.some(x=>x.slug===destination)?destination:(destinations[0]?.slug||'');
 const slots=useMemo(()=>missingPhotoSlots(snapshot,currentDestination,group),[snapshot,currentDestination,group]);
 const approvedSlots=slots.filter(slot=>approved[slot.id]&&candidates[slot.id]?.[chosen[slot.id]||0]);
 useEffect(()=>{setCandidates({});setChosen({});setApproved({});setError('');},[currentDestination,group,snapshot]);
 useEffect(()=>{setOutcome('');},[currentDestination,group]);

 async function searchAll(){
  if(!slots.length||busy)return;
  setBusy(true);setError('');setOutcome('');setProgress(`Searching for ${slots.length} missing photo placements…`);
  const found={},usedByRecord=new Map(),cache=new Map();let errors=0,completed=0;
  // A moderate concurrency protects Wikimedia from bursts and avoids crashing
  // older mobiles while loading many image candidates.
  const tasks=[...slots];
  async function worker(){
   while(tasks.length){
    const slot=tasks.shift();
    try{
     let available=[];
     for(const query of photoSearchQueries(slot.query)){
      let pending=cache.get(query);
      if(!pending){
       pending=fetch(`/api/commons/search?q=${encodeURIComponent(query)}`,{cache:'no-store'}).then(safeResponse);
       cache.set(query,pending);
      }
      try{
       const result=await pending;
       available=(result.items||[]).filter(reviewableCommonsCandidate);
       if(available.length)break;
      }catch{cache.delete(query);}
     }
     const key=`${slot.type}:${slot.slug}`;
     const used=usedByRecord.get(key)||new Set();
     const ordered=[...available.filter(a=>!used.has(sourceKey(a.sourcePage))),...available.filter(a=>used.has(sourceKey(a.sourcePage)))];
     found[slot.id]=ordered.slice(0,4);
     if(ordered.length){used.add(sourceKey(ordered[0].sourcePage));usedByRecord.set(key,used);}
    }catch{found[slot.id]=[];errors++;}
    completed++;setProgress(`Photo discovery ${completed}/${slots.length} · ${errors} search errors`);
   }
  }
  await Promise.all(Array.from({length:Math.min(3,tasks.length)},()=>worker()));
  setCandidates(found);setChosen({});setApproved({});setBusy(false);setProgress('');
  const hits=slots.filter(s=>found[s.id]?.length).length;
  setOutcome(`${hits} of ${slots.length} image placements have candidate photographs. Review each thumbnail, exact source and licence before approving. ${errors?`${errors} queries failed; retry or open the Media Library manually.`:''}`);
 }
 async function importApproved(){
  if(busy||!approvedSlots.length)return;
  if(!window.confirm(`You selected ${approvedSlots.length} personally reviewed photographs. Import into Firebase Storage and attach ONLY to blank fields in existing Draft records? No records will be published.`))return;
  setBusy(true);setError('');setOutcome('');setProgress('Reading Media Library and checking for reused imports…');
  const errors=[],grouped=new Map(),importCache=new Map();let imported=0,reused=0,attached=0;
  try{
   const current=await request('/api/admin/media');
   for(const asset of current.items||[]){
    if(asset.rightsConfirmed&&asset.source==='wikimedia'&&asset.sourcePage){
     importCache.set(sourceKey(asset.sourcePage),asset);
    }
   }
   // Upload one approved Commons photo at a time. Failure on one photo does
   // not silently prevent the others from being imported or attached.
   for(let i=0;i<approvedSlots.length;i++){
    const slot=approvedSlots[i];const photo=candidates[slot.id][chosen[slot.id]||0];
    setProgress(`Preparing ${i+1}/${approvedSlots.length}: ${slot.recordTitle} · ${fieldName(slot)}`);
    try{
     if(!reviewableCommonsCandidate(photo))throw new Error('Licence, source or photographer still needs review.');
     const key=sourceKey(photo.sourcePage);
     let asset=importCache.get(key);
     if(!asset){
      const result=await request('/api/admin/media/import',{method:'POST',body:{url:photo.url,sourcePage:photo.sourcePage,
       credit:photo.credit,license:photo.license,licenseUrl:photo.licenseUrl,altText:photo.title,rightsAccepted:true,
       crop:{preset:slot.field==='heroImage'?'hero':slot.field.startsWith('storyImage')?'editorial':'gallery'}}});
      asset=result.item;importCache.set(key,asset);imported++;
     }else reused++;
     const recordKey=`${slot.type}:${slot.slug}`;
     if(!grouped.has(recordKey))grouped.set(recordKey,{type:slot.type,id:slot.slug,expectedUpdatedAt:slot.recordUpdatedAt,assignments:[]});
     grouped.get(recordKey).assignments.push({field:slot.field,index:slot.index,mediaId:asset.id});
    }catch(e){errors.push(`${slot.recordTitle} · ${fieldName(slot)}: ${e.message}`);}
   }
   const groups=[...grouped.values()];
   for(let i=0;i<groups.length;i++){
    const item=groups[i];setProgress(`Saving reviewed photos in Firestore ${i+1}/${groups.length}: ${item.id}`);
    try{
     const result=await request('/api/admin/bulk/photography',{method:'POST',body:item});
     attached+=result.added?.length||0;
     if(result.skipped?.length)errors.push(`${item.id}: ${result.skipped.join('; ')}`);
    }catch(e){errors.push(`${item.id}: ${e.message}`);}
   }
   setOutcome(`Finished: ${imported} new WebP photographs stored, ${reused} source files reused, ${attached} missing image placements attached. ${errors.length} unavailable, duplicate or changed placements. Drafts remain private. ${errors.length?'See issues below.':''}`);
   if(errors.length)setError(errors.slice(0,10).join(' | '));
   await onRefresh();
  }catch(e){setError(`Photo completion interrupted: ${e.message}. Already uploaded files remain in your Media Library. Scan and retry to safely reuse them.`);}
  finally{setBusy(false);setProgress('');}
 }
 return <div className="pc-root">
  <div className="pc-intro"><div><span>03 / GUIDED PHOTO COMPLETION</span><h3>Find missing photos, review them, save to Firebase.</h3><p>Uses the existing {PHOTO_SLOT_TOTAL}-slot editorial queue. Nothing is downloaded, approved or published automatically. Select an accurate Commons photo, verify its attribution and licence, then import it into Firebase as optimized WebP.</p></div><b>Existing photos preserved</b></div>
  <div className="pc-controls"><label>Destination<select disabled={busy||!destinations.length} value={currentDestination} onChange={e=>setDestination(e.target.value)}>{destinations.map(x=><option value={x.slug} key={x.slug}>{x.title}</option>)}</select></label>
   <label>Page type<select disabled={busy} value={group} onChange={e=>setGroup(e.target.value)}><option value="destinations">Destination page</option><option value="experiences">Experiences</option><option value="journeys">Journeys</option><option value="all">All records (more searches)</option></select></label>
   <div><strong>{slots.length}</strong><small>empty photo slots</small></div>
   <button type="button" className="a-btn a-primary" onClick={searchAll} disabled={busy||!slots.length}>{busy?'Working…':'Find photo candidates'}</button></div>
  {!slots.length?<p className="pc-explanation">No empty Draft image slots for this selection. If images are missing on the public website, check the relevant records are published and their image URLs are accessible.</p>:<p className="pc-explanation">Photos are proposed by search relevance, not verified landmark identity. Do not approve an unrelated photo. Exact source, attribution, CC licence conditions and any privacy/property restrictions remain your responsibility to check.</p>}
  {slots.some(s=>Object.hasOwn(candidates,s.id))&&<><div className="pc-reviewed-bar"><strong>{approvedSlots.length} reviewed &amp; selected</strong><button type="button" className="a-btn a-primary" disabled={busy||!approvedSlots.length} onClick={importApproved}>Import {approvedSlots.length} reviewed photos &amp; fill missing fields</button></div>
   <div className="pc-slot-list">{slots.map(slot=>{const items=candidates[slot.id]||[];const selectedIndex=chosen[slot.id]||0,photo=items[selectedIndex];return <article className="pc-slot" key={slot.id}>
    <div className="pc-slot-heading"><div><small>{typeNames[slot.type]} · {slot.recordTitle}</small><h4>{fieldName(slot)}</h4><span>Search: {slot.query}</span></div><span>{items.length?`${items.length} candidate${items.length>1?'s':''}`:'None found'}</span></div>
    {items.length?<><div className="pc-candidates">{items.map((item,i)=><button type="button" className={`pc-candidate ${selectedIndex===i?'is-picked':''}`} key={`${slot.id}-${i}`} onClick={()=>{setChosen(p=>({...p,[slot.id]:i}));setApproved(p=>({...p,[slot.id]:false}));}} disabled={busy} aria-label={`Choose photo ${i+1} for ${slot.recordTitle}`}><img src={item.preview} alt={item.title} loading="lazy"/><span>{i+1}</span></button>)}</div>
    {photo&&<div className="pc-license"><strong>{photo.title}</strong><span>{photo.credit} · {photo.license}</span><a href={photo.sourcePage} target="_blank" rel="noopener noreferrer">Inspect exact Wikimedia file, author and licence ↗</a></div>}
    <label className="pc-approve"><input type="checkbox" disabled={busy} checked={!!approved[slot.id]} onChange={e=>setApproved(p=>({...p,[slot.id]:e.target.checked}))}/> I checked the exact photo, landmark, commercial licence, author and attribution.</label></>:<p className="pc-none">No approved-use candidate returned by this search. Try the individual Media Library search with fewer keywords; this slot will be skipped.</p>}
   </article>;})}</div>
   <div className="pc-reviewed-bar"><strong>{approvedSlots.length} photos ready</strong><button type="button" className="a-btn a-primary" disabled={busy||!approvedSlots.length} onClick={importApproved}>Import {approvedSlots.length} reviewed photos &amp; fill missing fields</button></div>
  </>}
  {progress&&<div className="br-progress" role="status">{progress}</div>}{outcome&&<div className="a-alert a-success" role="status">{outcome}</div>}{error&&<div className="a-alert a-error" role="alert">{error}</div>}
 </div>;
}
