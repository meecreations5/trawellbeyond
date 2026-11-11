/** No contact details, dates or other private visitor information in shared links. */
import {normalizeSlug} from './journey-assistant.mjs';
const onlySlugs=(items,max)=>Array.from(new Set((Array.isArray(items)?items:[]).map(x=>normalizeSlug(typeof x==='string'?x:x?.slug)).filter(Boolean))).slice(0,max);
export function buildJourneySharePath(data={}){
 const params=new URLSearchParams();
 const d=onlySlugs(data.destinations,6),e=onlySlugs(data.experiences,12),j=onlySlugs(data.journeys,3);
 if(d.length)params.set('d',d.join(','));if(e.length)params.set('e',e.join(','));if(j.length)params.set('j',j.join(','));
 const query=params.toString();return `/my-journey${query?'?'+query:''}`;
}
export function readJourneyShare(search=''){
 const query=new URLSearchParams(String(search).replace(/^\?/,''));
 const split=(key,max)=>onlySlugs((query.get(key)||'').slice(0,600).split(','),max);
 return {destinations:split('d',6),experiences:split('e',12),journeys:split('j',3)};
}
