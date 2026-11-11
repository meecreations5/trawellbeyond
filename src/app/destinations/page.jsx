import {publishedList} from '@/lib/content-server';
import DestinationCatalogue from '@/components/DestinationCatalogue';
import {normalizeRegionFilter} from '@/lib/destination-region.mjs';
export const metadata={title:'Destinations | International & Domestic'};
export const dynamic='force-dynamic';
export default async function Destinations({searchParams}){
 const query=await searchParams;
 const scope=normalizeRegionFilter(String(query?.region||'').toLowerCase());
 const items=await publishedList('destinations',200);
 return <DestinationCatalogue items={items} scope={scope}/>;
}
