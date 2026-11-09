'use client';
import {MAX_SOURCE_BYTES,MAX_VARIANT_BYTES,normalizeCrop,cropRect,variantSizes,IMAGE_PRESETS,normalizeColorCorrection,colorCorrectionFilter} from './image-presets.mjs';

function toBlob(canvas,type,quality){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Browser could not encode this image.')),type,quality));}
async function decodeFile(file){
 if(typeof createImageBitmap==='function'){
  try{
   const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
   return {width:bitmap.width,height:bitmap.height,draw:bitmap,close:()=>bitmap.close?.()};
  }catch{ /* Use an HTML image on browsers without ImageBitmap options. */ }
 }
 const url=URL.createObjectURL(file),image=new Image();
 try{
  await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('Could not read the selected photograph.'));image.src=url;});
  return {width:image.naturalWidth,height:image.naturalHeight,draw:image,close:()=>URL.revokeObjectURL(url)};
 }catch(err){URL.revokeObjectURL(url);throw err;}
}
async function encodeCanvas(canvas,quality){
 let blob=await toBlob(canvas,'image/webp',quality);
 if(blob.type!=='image/webp')blob=await toBlob(canvas,'image/jpeg',quality);
 for(const q of [0.72,0.62,0.5]){
  if(blob.size<=MAX_VARIANT_BYTES)break;
  blob=await toBlob(canvas,blob.type,q);
 }
 if(blob.size>MAX_VARIANT_BYTES)throw new Error('The optimized image remains too large. Try a smaller photo.');
 return blob;
}
/** Performs the actual crop and outputs 3 responsive browser-encoded images. */
export async function optimizeImageFile(file,options={}){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size<100||file.size>MAX_SOURCE_BYTES){
  throw new Error('Select a valid JPG, PNG or WebP photo up to 20 MB.');
 }
 const opts=normalizeCrop(options),tone=normalizeColorCorrection(options),decoded=await decodeFile(file);
 try{
  const rect=cropRect(decoded.width,decoded.height,opts);
  const dimensions=variantSizes(decoded.width,decoded.height,opts);
  const output=[];
  for(const item of dimensions){
   const canvas=document.createElement('canvas');canvas.width=item.width;canvas.height=item.height;
   const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('This browser does not support image optimization.');
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.fillStyle='#ffffff';ctx.fillRect(0,0,item.width,item.height);
   ctx.filter=colorCorrectionFilter(tone);
   ctx.drawImage(decoded.draw,rect.x,rect.y,rect.width,rect.height,0,0,item.width,item.height);
   const blob=await encodeCanvas(canvas,IMAGE_PRESETS[opts.preset].quality);
   output.push({...item,blob,bytes:blob.size,contentType:blob.type});
   canvas.width=0;canvas.height=0;
  }
  return {sourceBytes:file.size,sourceWidth:decoded.width,sourceHeight:decoded.height,crop:{...opts,...tone},variants:output};
 }finally{decoded.close();}
}
