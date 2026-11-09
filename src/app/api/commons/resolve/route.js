import {permittedCommonsLicense} from '@/lib/commons-license.mjs';
/** Exact-file resolver for the reviewed Singapore Commons photo shortlist.
 * No Firebase credentials and no write access. Never accepts arbitrary URLs.
 */
import {SG_PHOTOS} from '@/lib/singapore-photos.mjs';
import {EXPANSION_PHOTO_LIST} from '@/lib/dubai-thailand-photos.mjs';
export const runtime='nodejs';
const clean=value=>String(value||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim().slice(0,280);
export async function GET(request){
 try{
  const filename=new URL(request.url).searchParams.get('file')||'';
  const shortlisted=[...Object.values(SG_PHOTOS),...EXPANSION_PHOTO_LIST].find(photo=>photo.filename===filename);
  if(!shortlisted)return Response.json({error:'Photo not present in the reviewed CMS shortlist.'},{status:404});
  const u=new URL('https://commons.wikimedia.org/w/api.php');
  Object.entries({action:'query',format:'json',titles:`File:${filename}`,prop:'imageinfo',iiprop:'url|mime|extmetadata',iiurlwidth:'1280'}).forEach(([k,v])=>u.searchParams.set(k,v));
  const response=await fetch(u,{headers:{'User-Agent':'TrawellBeyondCMS/7.8 (reviewed editorial photo import)'},signal:AbortSignal.timeout(14000),cache:'no-store'});
  if(!response.ok)return Response.json({error:'Wikimedia is unavailable.'},{status:502});
  const data=await response.json();
  const page=Object.values(data.query?.pages||{})[0];
  const info=page?.imageinfo?.[0];
  if(!info||!['image/jpeg','image/png','image/webp'].includes(info.mime))return Response.json({error:'No supported image for this file.'},{status:404});
  const meta=info.extmetadata||{};
  const license=clean(meta.LicenseShortName?.value||meta.License?.value);
  const credit=clean(meta.Artist?.value||'');
  if(!credit)return Response.json({error:'Source photographer could not be verified. Review and import manually.'},{status:409});
  if(!permittedCommonsLicense(license))return Response.json({error:'Photo licence was not verified as commercially reusable.'},{status:409});
  const url=info.thumburl||info.url;
  const parsed=new URL(url);
  if(parsed.protocol!=='https:'||!['upload.wikimedia.org','thumb.wikimedia.org'].includes(parsed.hostname))return Response.json({error:'Untrusted Wikimedia file address.'},{status:502});
  return Response.json({ok:true,item:{url,credit,license,licenseUrl:clean(meta.LicenseUrl?.value),sourcePage:info.descriptionurl||shortlisted.source,caption:shortlisted.caption,filename:shortlisted.filename}},{headers:{'cache-control':'no-store'}});
 }catch{return Response.json({error:'Could not resolve the Wikimedia photo. Retry or import manually.'},{status:502});}
}
