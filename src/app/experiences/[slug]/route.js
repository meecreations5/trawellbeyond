import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {publishedOne,publishedList} from '@/lib/content-server';
import {renderV51Experience} from '@/lib/v51-experience.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(_request,{params}){
 const {slug}=await params;
 const item=await publishedOne('experiences',slug);
 if(!item)return new Response('Experience not found or not published.',{status:404});
 const [destination,other,site,template]=await Promise.all([
  publishedOne('destinations',item.destinationSlug),publishedList('experiences'),publishedOne('pages','site-settings'),readFile(join(process.cwd(),'src','templates','experience.html'),'utf8')
 ]);
 const html=renderV51Experience(template,{experience:item,destination,relatedExperiences:other.filter(x=>x.destinationSlug===item.destinationSlug),site:site||{}});
 return new Response(html,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-trawellbeyond-design':'v5.1-experience-cms'}});
}
