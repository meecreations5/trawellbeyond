import {notFound} from 'next/navigation';
import {publishedOne} from '@/lib/content-server';
import DetailPage from '@/components/DetailPage';
export const dynamic='force-dynamic';
export default async function Offer({params}){const {slug}=await params;const item=await publishedOne('offers',slug);if(!item)notFound();return <DetailPage item={item} type="offers"/>;}
