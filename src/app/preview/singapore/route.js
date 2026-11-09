/** Development-only visual preview of the approved Singapore templates.
 * Does not read Firestore, publish drafts, or expose unapproved content in production.
 */
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {LAUNCH_STARTERS} from '@/lib/launch-starters.mjs';
import {renderV51Destination,renderV51Journey} from '@/lib/v51-details.mjs';
import {renderV51Experience} from '@/lib/v51-experience.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request){
 if(process.env.NODE_ENV==='production')return new Response('Not found',{status:404});
 const view=new URL(request.url).searchParams.get('view')||'destination';
 const site=LAUNCH_STARTERS.find(x=>x.type==='pages'&&x.slug==='site-settings');
 const destination=LAUNCH_STARTERS.find(x=>x.type==='destinations'&&x.slug==='singapore');
 const journey=LAUNCH_STARTERS.find(x=>x.type==='journeys'&&x.slug==='singapore-at-your-pace');
 const experiences=LAUNCH_STARTERS.filter(x=>x.type==='experiences'&&x.destinationSlug==='singapore');
 let html;
 if(view==='destination')html=renderV51Destination(await readFile(join(process.cwd(),'src/templates/destination.html'),'utf8'),{destination,experiences,journeys:[journey],site});
 else if(view==='experience')html=renderV51Experience(await readFile(join(process.cwd(),'src/templates/experience.html'),'utf8'),{experience:experiences.find(x=>x.slug==='gardens-by-the-bay'),destination,relatedExperiences:experiences,site});
 else if(view==='journey')html=renderV51Journey(await readFile(join(process.cwd(),'src/templates/journey.html'),'utf8'),{journey,relatedExperiences:experiences,site});
 else return new Response('Unknown preview',{status:404});
 return new Response(html,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex, nofollow'}});
}
