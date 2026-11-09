'use client';
import {useState,useEffect,useCallback} from 'react';
import CropControls from './CropControls';
import {normalizeCrop,formatBytes} from '@/lib/image-presets.mjs';

export default function ImageLibrary({request,onSelect,embedded=false,initialQuery='',preset='original'}){
 const [assets,setAssets]=useState([]),[searchResults,setSearchResults]=useState([]);
 const [q,setQ]=useState(initialQuery),[credit,setCredit]=useState(''),[altText,setAltText]=useState('');
 const [metadata,setMetadata]=useState({credit:'',altText:'',license:'',sourcePage:'',licenseUrl:''});
 const [manualAccepted,setManualAccepted]=useState(false),[commonsAccepted,setCommonsAccepted]=useState(false);
 const [file,setFile]=useState(null),[localPreview,setLocalPreview]=useState('');
 const [selectedCommons,setSelectedCommons]=useState(null),[selectedExisting,setSelectedExisting]=useState(null),[crop,setCrop]=useState(normalizeCrop({preset}));
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
 const load=useCallback(async()=>{try{const result=await request('/api/admin/media');setAssets(result.items||[]);}catch(err){setError(err.message);}},[request]);
 useEffect(()=>{load();},[load]);
 useEffect(()=>{if(!file){setLocalPreview('');return;}const url=URL.createObjectURL(file);setLocalPreview(url);return ()=>URL.revokeObjectURL(url);},[file]);
 useEffect(()=>{if(!initialQuery||initialQuery.trim().length<3)return;let active=true;request(`/api/admin/media/search?q=${encodeURIComponent(initialQuery)}`).then(result=>{if(active)setSearchResults(result.items||[]);}).catch(err=>{if(active)setError(err.message);});return ()=>{active=false;};},[initialQuery,request]);
 useEffect(()=>{if(selectedExisting)setMetadata({credit:selectedExisting.credit||'',altText:selectedExisting.altText||'',license:selectedExisting.license||'',sourcePage:selectedExisting.sourcePage||'',licenseUrl:selectedExisting.licenseUrl||''});},[selectedExisting]);
 const currentPreview=selectedCommons?.preview||selectedExisting?.url||localPreview;
 async function upload(event){
  event.preventDefault();if(!file)return setError('Choose a photograph before uploading.');
  if(!manualAccepted)return setError('Confirm commercial usage rights.');
  setBusy(true);setError('');setSuccess('Optimizing your photograph…');
  try{
   const data=new FormData();data.append('file',file);data.append('credit',credit);data.append('altText',altText);data.append('rights','true');
   Object.entries(crop).forEach(([key,value])=>data.append(key,String(value)));
   const response=await request('/api/admin/media',{method:'POST',formData:data});
   setAssets(prev=>[response.item,...prev]);setFile(null);setManualAccepted(false);setCredit('');setAltText('');
   setSuccess(`Optimized and uploaded: ${response.item.width} × ${response.item.height}px · ${formatBytes(response.item.bytes)} (original ${formatBytes(response.item.originalBytes)}).`);
   if(onSelect)onSelect(response.item);
  }catch(err){setSuccess('');setError(err.message);}finally{setBusy(false);}
 }
 async function search(event){
  event.preventDefault();setBusy(true);setError('');setSuccess('');setSearchResults([]);setSelectedCommons(null);
  try{const result=await request(`/api/admin/media/search?q=${encodeURIComponent(q)}`);setSearchResults(result.items||[]);if(!result.items?.length)setSuccess('No suitable licensed photos found. Try a different attraction name.');}
  catch(err){setError(err.message);}finally{setBusy(false);}
 }
 async function reoptimizeExisting(){
  if(!selectedExisting)return;
  setBusy(true);setError('');setSuccess('Cropping your saved image and creating optimized versions…');
  try{
   const response=await request('/api/admin/media/reprocess',{method:'POST',body:{id:selectedExisting.id,crop}});
   setAssets(prev=>[response.item,...prev]);setSelectedExisting(null);
   setSuccess(`New optimized version: ${response.item.width} × ${response.item.height}px · ${formatBytes(response.item.bytes)}. Original media remains unchanged.`);
   if(onSelect)onSelect(response.item);
  }catch(err){setSuccess('');setError(err.message);}finally{setBusy(false);}
 }
 async function saveMetadata(){
  if(!selectedExisting)return;
  setBusy(true);setError('');setSuccess('');
  try{
   const result=await request('/api/admin/media',{method:'PATCH',body:{id:selectedExisting.id,...metadata}});
   setAssets(prev=>prev.map(a=>a.id===result.item.id?result.item:a));setSelectedExisting(result.item);
   setSuccess('Photo metadata saved. Existing website captions are not overwritten; use Content Completion to fill blank credits.');
  }catch(err){setError(err.message);}finally{setBusy(false);}
 }
 async function importImage(){
  if(!selectedCommons)return setError('Select a Wikimedia image first.');
  if(!commonsAccepted)return setError('Review the exact source and licence, then confirm commercial reuse.');
  setBusy(true);setError('');setSuccess('Optimizing and importing your selected Wikimedia photograph…');
  try{
   const result=await request('/api/admin/media/import',{method:'POST',body:{url:selectedCommons.url,sourcePage:selectedCommons.sourcePage,
    credit:selectedCommons.credit,license:selectedCommons.license,licenseUrl:selectedCommons.licenseUrl,altText:altText||selectedCommons.title,rightsAccepted:true,crop}});
   setAssets(prev=>[result.item,...prev]);setSuccess(`Wikimedia photo optimized and stored: ${result.item.width} × ${result.item.height}px · ${formatBytes(result.item.bytes)}.`);
   setSelectedCommons(null);setCommonsAccepted(false);if(onSelect)onSelect(result.item);
  }catch(err){setSuccess('');setError(err.message);}finally{setBusy(false);}
 }
 return <div className="a-media">
  <div className="a-media-inputs">
   <div className="a-media-box"><h3>1. Upload your photograph</h3>
    <form onSubmit={upload}><label>JPG / PNG / WebP, original file up to 20 MB
     <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{setFile(e.target.files?.[0]||null);setSelectedCommons(null);setSelectedExisting(null);}}/></label>
     <label>Photographer / source credit<input placeholder="Photo credit or your own team" value={credit} onChange={e=>setCredit(e.target.value)}/></label><label>Descriptive image alt text<input placeholder="Describe what is actually visible in the photograph" value={altText} onChange={e=>setAltText(e.target.value)}/></label>
     <label className="a-checkbox"><input type="checkbox" checked={manualAccepted} onChange={e=>setManualAccepted(e.target.checked)}/> I have permission to use this photo commercially.</label>
     <button className="a-btn a-primary" type="submit" disabled={busy||!file||!manualAccepted}>{busy?'Processing…':'Crop, optimize & upload ↗'}</button>
    </form></div>
   <div className="a-media-box"><h3>2. Find an authentic attraction photo</h3>
    <form onSubmit={search}><label>Search Wikimedia Commons<input placeholder="e.g. Singapore Gardens by the Bay Supertree" value={q} onChange={e=>setQ(e.target.value)}/></label>
     <button disabled={busy||q.trim().length<3} className="a-btn a-outline">Search photos</button></form>
    <p className="a-media-disclaimer">Photos of real attractions must depict the correct place. Check the original file, commercial licence, attribution and any share-alike terms before importing.</p>
   </div>
  </div>
  {(file||selectedCommons||selectedExisting)&&<section className="a-media-box a-crop-card"><h3>3. Crop &amp; optimize for the website</h3>
   {selectedExisting&&<p><strong>Saved image:</strong> {selectedExisting.name}. This creates a new cropped copy. Existing page images will not be replaced unless you choose the new photo in the editor.</p>}
   {selectedCommons&&<p><strong>{selectedCommons.title}</strong> · {selectedCommons.credit} · {selectedCommons.license} — <a href={selectedCommons.sourcePage} target="_blank" rel="noreferrer">Review original file &amp; licence ↗</a></p>}
   <CropControls src={currentPreview} options={crop} onChange={setCrop} sourceFile={file}/>
   {selectedExisting&&<div className="a-media-metadata"><h4>Review photo metadata</h4><p>Use accurate credit and licences. Do not assign a location without checking the photograph.</p>{[['altText','Alt text / visual description'],['credit','Photographer / credit'],['license','Copyright or Creative Commons licence'],['sourcePage','Original source URL'],['licenseUrl','Licence terms URL']].map(([key,label])=><label key={key}>{label}<input value={metadata[key]||''} onChange={e=>setMetadata(prev=>({...prev,[key]:e.target.value}))}/></label>)}<button type="button" className="a-btn a-outline" onClick={saveMetadata} disabled={busy}>Save photo metadata</button></div>}
   {selectedExisting&&<button type="button" className="a-btn a-primary" disabled={busy} onClick={reoptimizeExisting}>{busy?'Processing…':'Create optimized copy from Storage ↗'}</button>}
   {selectedCommons&&<label className="a-commons-alt">Image alt text (review accuracy)<input value={altText} onChange={e=>setAltText(e.target.value)} placeholder={selectedCommons.title}/></label>}
   {selectedCommons&&<div className="a-crop-action"><label className="a-checkbox"><input type="checkbox" checked={commonsAccepted} onChange={e=>setCommonsAccepted(e.target.checked)}/> I verified that this exact photo may be reused commercially and I will retain its attribution.</label>
    <button type="button" className="a-btn a-primary" disabled={busy||!commonsAccepted} onClick={importImage}>{busy?'Processing…':'Import cropped photo to Storage ↗'}</button></div>}
  </section>}
  {error&&<div role="alert" className="a-alert a-error">{error}</div>}{success&&<div role="status" className="a-alert a-success">{success}</div>}
  {searchResults.length>0&&<section className="a-media-results"><h3>Photo search results — choose an image to crop</h3><div className="a-photo-grid">{searchResults.map((item,i)=><div key={`${item.url}-${i}`} className="a-photo">
   <img src={item.preview} alt={item.title} loading="lazy"/><div><strong>{item.title}</strong><small>{item.license} · {item.credit||'Author not listed'}</small>
    <a href={item.sourcePage} target="_blank" rel="noreferrer">Review exact source ↗</a>
    <button type="button" className="a-btn a-outline" disabled={busy} onClick={()=>{setFile(null);setSelectedExisting(null);setSelectedCommons(item);setCommonsAccepted(false);}}>Choose &amp; crop this image</button></div></div>)}</div></section>}
  <section className="a-media-results"><div className="a-media-heading"><h3>Your Media Library</h3><span>{assets.length} photo(s)</span></div>
   {!assets.length?<div className="a-empty a-small-empty"><p>No stored photographs yet. Upload one or import an approved Wikimedia photo.</p></div>:
    <div className="a-photo-grid">{assets.map(asset=><div key={asset.id} className="a-photo">
     <img src={asset.variants?.thumb?.url||asset.url} alt={asset.name} loading="lazy"/><div><strong>{asset.name}</strong>
      <small>{asset.credit||'No photographer credit'} · {asset.altText||'Alt text needed'}</small>
      {asset.optimized&&<small>{asset.width} × {asset.height}px · {formatBytes(asset.bytes)} · Optimized</small>}
      <button type="button" className="a-btn a-outline" onClick={()=>{setFile(null);setSelectedCommons(null);setSelectedExisting(asset);}}>Crop / optimize copy</button>
      {onSelect&&<button type="button" className="a-btn a-primary" onClick={()=>onSelect(asset)}>Use this photo ↗</button>}
     </div></div>)}</div>}
  </section>
 </div>;
}
