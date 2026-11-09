'use client';
import {useEffect,useState} from 'react';
import {IMAGE_PRESETS,normalizeCrop,cropRect,variantSizes,formatBytes,normalizeColorCorrection,colorCorrectionFilter} from '@/lib/image-presets.mjs';
import {MAX_SOURCE_BYTES} from '@/lib/image-presets.mjs';
export default function CropControls({src,options,onChange,sourceFile=null}){
 const [dims,setDims]=useState(null);
 useEffect(()=>setDims(null),[src]);
 const value=normalizeCrop(options),tone=normalizeColorCorrection(options);
 const update=change=>onChange({...value,...tone,...change});
 const box=dims?cropRect(dims.width,dims.height,value):null;
 const variants=dims?variantSizes(dims.width,dims.height,value):[];
 const ratio=IMAGE_PRESETS[value.preset].ratio||dims?.width/dims?.height||3/2;
 const previewStyle=box?{
  position:'absolute',left:`${-box.x/box.width*100}%`,top:`${-box.y/box.height*100}%`,
  width:`${dims.width/box.width*100}%`,height:`${dims.height/box.height*100}%`,maxWidth:'none',maxHeight:'none',filter:colorCorrectionFilter(tone)
 }:{};
 return <div className="a-crop">
  <div className="a-crop-grid"><div className="a-crop-preview" style={{aspectRatio:ratio}}>
   {src?<img src={src} alt="Image crop preview" style={previewStyle} onLoad={event=>setDims({width:event.currentTarget.naturalWidth,height:event.currentTarget.naturalHeight})}/>:<p>Select a photograph to preview its crop.</p>}
  </div><div className="a-crop-settings"><h4>Crop &amp; image size</h4>
  <label>Photo placement<select value={value.preset} onChange={e=>update({preset:e.target.value})}>{Object.entries(IMAGE_PRESETS).map(([key,p])=><option key={key} value={key}>{p.label}</option>)}</select></label>
  <label>Horizontal focus · {value.focusX}%<input type="range" min="0" max="100" value={value.focusX} onChange={e=>update({focusX:+e.target.value})}/></label>
  <label>Vertical focus · {value.focusY}%<input type="range" min="0" max="100" value={value.focusY} onChange={e=>update({focusY:+e.target.value})}/></label>
  <label>Zoom · {value.zoom.toFixed(2)}×<input type="range" min="1" max="2" step="0.05" value={value.zoom} onChange={e=>update({zoom:+e.target.value})}/></label>
  <details className="a-color-panel"><summary>Optional colour correction (CC)</summary>
   <p>Subtle colour adjustments for improved clarity. They are baked into the new WebP files, not applied to the original photograph.</p>
   <label>Brightness · {tone.brightness}%<input type="range" min="90" max="115" step="1" value={tone.brightness} onChange={e=>update({brightness:+e.target.value})}/></label>
   <label>Contrast · {tone.contrast}%<input type="range" min="90" max="120" step="1" value={tone.contrast} onChange={e=>update({contrast:+e.target.value})}/></label>
   <label>Colour saturation · {tone.saturation}%<input type="range" min="85" max="120" step="1" value={tone.saturation} onChange={e=>update({saturation:+e.target.value})}/></label>
   <div className="a-tone-actions"><button type="button" className="a-btn a-outline" onClick={()=>update({brightness:103,contrast:106,saturation:105})}>Subtle enhance</button><button type="button" className="a-btn a-outline" onClick={()=>update({brightness:100,contrast:100,saturation:100})}>Reset colour</button></div>
  </details>
  <p>Actual image files are cropped and converted to WebP (JPEG fallback) before upload. Images are never enlarged above their original resolution.</p>
  {sourceFile&&<p>Original file: {formatBytes(sourceFile.size)} {sourceFile.size>MAX_SOURCE_BYTES?'· Too large':''}</p>}
  {dims&&<p>Source: {dims.width} × {dims.height}px</p>}
  </div></div>
  {variants.length>0&&<div className="a-crop-outputs">{variants.map(v=><span key={v.name}><b>{v.name}</b> · {v.width} × {v.height}px</span>)}</div>}
  <small>Output file size depends on detail and compression. The actual KB sizes are saved in your Media Library after upload. Drag the focus sliders to protect the landmark from cropping.</small>
 </div>;
}
