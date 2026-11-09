/** Validate selected Commons media against Wikimedia itself before copying it
 * into Firebase Storage. Browser-supplied licence or author is not trusted. */
import {permittedCommonsLicense} from '@/lib/commons-license.mjs';
export const runtime='nodejs';
const clean=value=>String(value||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').trim().slice(0,300);
function fileFromSource(value){
 const u=new URL(value);
 if(u.protocol!=='https:'||u.hostname!=='commons.wikimedia.org'||u.port||u.username||u.password||!u.pathname.startsWith('/wiki/File:'))throw new Error('Select an exact Wikimedia Commons file page.');
 const filename=decodeURIComponent(u.pathname.slice('/wiki/File:'.length)).replace(/_/g,' ');
 if(!filename||filename.length>250||/[\u0000-\u001f]/.test(filename)||filename.includes('/'))throw new Error('Invalid Wikimedia file name.');
 return filename;
}
export async function GET(request){
 try{
  const file=fileFromSource(new URL(request.url).searchParams.get('sourcePage')||'');
  const url=new URL('https://commons.wikimedia.org/w/api.php');
  Object.entries({action:'query',format:'json',titles:`File:${file}`,prop:'imageinfo',iiprop:'url|mime|extmetadata',iiurlwidth:'1280'}).forEach(([k,v])=>url.searchParams.set(k,v));
  const response=await fetch(url,{headers:{'User-Agent':'TrawellBeyondCMS/7.9.2 (reviewed travel content photos)'},signal:AbortSignal.timeout(14000),cache:'no-store'});
  if(!response.ok)throw new Error('Wikimedia verification is temporarily unavailable.');
  const data=await response.json();
  const page=Object.values(data.query?.pages||{})[0];
  const info=page?.imageinfo?.[0];
  if(!info||!['image/jpeg','image/png','image/webp'].includes(info.mime))throw new Error('Image is missing or unsupported on Wikimedia Commons.');
  const meta=info.extmetadata||{};
  const license=clean(meta.LicenseShortName?.value||meta.License?.value);
  const credit=clean(meta.Artist?.value);
  if(!permittedCommonsLicense(license)||!credit||/^(unknown|anonymous|not listed)/i.test(credit))throw new Error('Author or commercially reusable image licence could not be verified.');
  const imageUrl=new URL(info.thumburl||info.url),sourcePage=info.descriptionurl;
  if(imageUrl.protocol!=='https:'||!['upload.wikimedia.org','thumb.wikimedia.org'].includes(imageUrl.hostname)||!sourcePage||fileFromSource(sourcePage)!==file)throw new Error('Untrusted photo source.');
  return Response.json({ok:true,item:{title:page.title.replace(/^File:/,''),url:imageUrl.toString(),sourcePage,credit,license,licenseUrl:clean(meta.LicenseUrl?.value),mime:info.mime}},{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){return Response.json({ok:false,error:error.message||'Commons verification failed.'},{status:422});}
}
