/** Restricted Wikimedia image downloader to accommodate Wikimedia CORS limits.
 * Only the official upload and thumbnail Wikimedia hosts are allowed. This route NEVER uploads to Storage.
 */
export const runtime='nodejs';
export async function GET(request){
 try{
  const raw=new URL(request.url).searchParams.get('url')||'';
  if(raw.length>1600)return Response.json({error:'Image address too long.'},{status:400});
  const target=new URL(raw);
  if(target.protocol!=='https:'||!['upload.wikimedia.org','thumb.wikimedia.org'].includes(target.hostname)||target.port||target.username||target.password)
   return Response.json({error:'Only Wikimedia original image URLs are allowed.'},{status:400});
  const response=await fetch(target.toString(),{redirect:'error',signal:AbortSignal.timeout(15000)});
  const mime=(response.headers.get('content-type')||'').split(';')[0].trim();
  const length=Number(response.headers.get('content-length')||0);
  if(!response.ok||!['image/jpeg','image/png','image/webp'].includes(mime)||length>6*1024*1024)
   return Response.json({error:'Image is unavailable or exceeds the 6 MB limit.'},{status:400});
  if(!response.body)return Response.json({error:'Image was empty.'},{status:400});
  const reader=response.body.getReader(),parts=[];let total=0;
  while(true){const {value,done}=await reader.read();if(done)break;total+=value.byteLength;
   if(total>6*1024*1024){await reader.cancel().catch(()=>{});return Response.json({error:'Image exceeds 6 MB.'},{status:413});}
   parts.push(value);
  }
  if(total<100)return Response.json({error:'Image size is invalid.'},{status:400});
  const body=new Uint8Array(total);let offset=0;for(const chunk of parts){body.set(chunk,offset);offset+=chunk.byteLength;}
  return new Response(body,{headers:{'content-type':mime,'cache-control':'private, max-age=60','X-Content-Type-Options':'nosniff'}});
 }catch{return Response.json({error:'Could not download that Wikimedia image.'},{status:502});}
}
