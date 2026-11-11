/** Normalize CMS regions without changing existing records or making unknown places international by default. */
const DOMESTIC_SLUGS=new Set(['kerala','himachal','himachal-pradesh','kashmir','rajasthan','goa','sikkim','mysore','mysuru','ooty','delhi','agra','varanasi','ayodhya']);
const INTERNATIONAL_SLUGS=new Set(['dubai','singapore','thailand','malaysia','bali','vietnam','sri-lanka','turkey']);
const key=value=>String(value||'').trim().toLowerCase().replace(/[_\s]+/g,'-').replace(/[^a-z-]/g,'').replace(/-+/g,'-');
export function destinationRegion(record={}){
 const value=key(record.region), place=key(record.slug||record.id||record.title);
 if(['india','domestic','indian','india-domestic','within-india'].includes(value))return 'domestic';
 if(['international','overseas','abroad','outside-india'].includes(value))return 'international';
 // Legacy destination imports can predate the Region field.
 if(DOMESTIC_SLUGS.has(place))return 'domestic';
 if(INTERNATIONAL_SLUGS.has(place))return 'international';
 return 'unclassified';
}
export function destinationSections(items=[]){
 return {international:items.filter(x=>destinationRegion(x)==='international'),domestic:items.filter(x=>destinationRegion(x)==='domestic'),unclassified:items.filter(x=>destinationRegion(x)==='unclassified')};
}
export function normalizeRegionFilter(value){return value==='international'||value==='domestic'?value:'all';}
