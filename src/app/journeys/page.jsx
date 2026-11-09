import {publishedList} from '@/lib/content-server';
import ListingPage from '@/components/ListingPage';
export const metadata={title:'Journeys'};
export const dynamic='force-dynamic';
export default async function Journeys(){const items=await publishedList('journeys');return <ListingPage type="journeys" items={items} eyebrow="EXPLORE / JOURNEYS" title="Made for life." accent="Created for you." description="Our journeys are starting points, never fixed scripts. Every detail can be shaped around you."/>;}
