import {publishedList} from '@/lib/content-server';
import JourneyCatalogue from '@/components/JourneyCatalogue';
import {normalizeRegionFilter} from '@/lib/destination-region.mjs';
export const metadata={title:'Journeys | International & Domestic'};
export const dynamic='force-dynamic';
export default async function Journeys({searchParams}){
 const query=await searchParams;
 const scope=normalizeRegionFilter(String(query?.region||'').toLowerCase());
 const [items,destinations]=await Promise.all([publishedList('journeys',200),publishedList('destinations',200)]);
 return <JourneyCatalogue items={items} destinations={destinations} scope={scope}/>;
}
