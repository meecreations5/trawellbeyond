import {notFound} from 'next/navigation';
import {publishedOne} from '@/lib/content-server';
import InsiderGuide from '@/components/v82/InsiderGuide';
export const dynamic='force-dynamic';
export async function generateMetadata({params}){const {slug}=await params;const place=await publishedOne('destinations',slug);return {title:place?`${place.title} Insider Guide`:'Destination Insider'};}
export default async function Page({params}){const {slug}=await params;const place=await publishedOne('destinations',slug);if(!place)notFound();return <InsiderGuide destination={place}/>;}
