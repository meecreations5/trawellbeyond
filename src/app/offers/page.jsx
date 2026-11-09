import {publishedList} from '@/lib/content-server';
import ListingPage from '@/components/ListingPage';
export const metadata={title:'Offers'};
export const dynamic='force-dynamic';
export default async function Offers(){const items=await publishedList('offers');return <ListingPage type="offers" items={items} eyebrow="EXPLORE / OFFERS" title="More ways to" accent="make it yours." description="Thoughtfully selected opportunities for meaningful travel."/>;}
