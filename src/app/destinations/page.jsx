import {publishedList} from '@/lib/content-server';
import ListingPage from '@/components/ListingPage';
export const metadata={title:'Destinations'};
export const dynamic='force-dynamic';
export default async function Destinations(){const items=await publishedList('destinations');return <ListingPage type="destinations" items={items} eyebrow="EXPLORE / THE WORLD" title="Every destination." accent="A personal story." description="From familiar favourites to places you have yet to imagine, explore where your story might take you."/>;}
