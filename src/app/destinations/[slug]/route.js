import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {publishedOne,publishedList} from '@/lib/content-server';
import {renderV51Destination} from '@/lib/v51-details.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(_request,{params}){
 const {slug}=await params;
 const item=await publishedOne('destinations',slug);
 if(!item)return new Response('Destination not found or not published.',{status:404});
 const [experiences,journeys,site,template]=await Promise.all([publishedList('experiences'),publishedList('journeys'),publishedOne('pages','site-settings'),readFile(join(process.cwd(),'src','templates','destination.html'),'utf8')]);
 const matching=record=>String(record.destinationSlug||'')===String(item.slug||item.id);
 const html=renderV51Destination(template,{destination:item,experiences:experiences.filter(matching),journeys:journeys.filter(matching),site:site||{}});
 return new Response(html,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-trawellbeyond-design':'approved-v5.1-cms'}});
}
