import {permittedCommonsLicense} from '@/lib/commons-license.mjs';
/** Public, read-only Wikimedia metadata search. No privileged Firebase access. */
export const runtime='nodejs';
const stripHtml=text=>String(text||'').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').slice(0,280);
export async function GET(request){
 try{
  const q=new URL(request.url).searchParams.get('q')?.trim().slice(0,90)||'';
  if(q.length<3)return Response.json({ok:true,items:[]});
  const url=new URL('https://commons.wikimedia.org/w/api.php');
  Object.entries({action:'query',format:'json',generator:'search',gsrsearch:q,gsrnamespace:'6',gsrlimit:'15',prop:'imageinfo',iiprop:'url|mime|extmetadata',iiurlwidth:'1280'}).forEach(([k,v])=>url.searchParams.set(k,v));
  const response=await fetch(url,{headers:{'User-Agent':'TrawellBeyondCMS/3.0 (travel content images)'},signal:AbortSignal.timeout(10000),next:{revalidate:60}});
  if(!response.ok)return Response.json({ok:false,error:'Wikimedia is unavailable.'},{status:502});
  const payload=await response.json();
  const items=Object.values(payload.query?.pages||{}).flatMap(page=>{
   const info=page.imageinfo?.[0];if(!info?.url||!info?.thumburl||!['image/jpeg','image/png','image/webp'].includes(info.mime))return [];
   const meta=info.extmetadata||{};
   const license=stripHtml(meta.LicenseShortName?.value||meta.License?.value||'');if(!permittedCommonsLicense(license))return [];
   return [{title:page.title.replace(/^File:/,''),preview:info.thumburl,url:info.thumburl||info.url,sourcePage:info.descriptionurl,credit:stripHtml(meta.Artist?.value||'Unknown author'),license,licenseUrl:meta.LicenseUrl?.value||''}];
  });
  return Response.json({ok:true,items},{headers:{'Cache-Control':'public, max-age=60'}});
 }catch{return Response.json({ok:false,error:'Wikimedia image search failed. Retry shortly.'},{status:502});}
}
