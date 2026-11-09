import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {publishedOne,publishedList} from '@/lib/content-server';
import {renderV51Journey} from '@/lib/v51-details.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(_request,{params}){
 const {slug}=await params;
 const item=await publishedOne('journeys',slug);
 if(!item)return new Response('Journey not found or not published.',{status:404});
 const [experiences,site,template]=await Promise.all([publishedList('experiences'),publishedOne('pages','site-settings'),readFile(join(process.cwd(),'src','templates','journey.html'),'utf8')]);
 const html=renderV51Journey(template,{journey:item,relatedExperiences:experiences.filter(x=>x.destinationSlug===item.destinationSlug),site:site||{}});
 return new Response(html,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-trawellbeyond-design':'approved-v5.1-cms'}});
}
