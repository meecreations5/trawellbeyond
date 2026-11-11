import {publishedList} from '@/lib/content-server';
import ExperienceDiscovery from '@/components/ExperienceDiscovery';
export const metadata={title:'Experiences'};
export const dynamic='force-dynamic';
export default async function Experiences({searchParams}){
 const query=await searchParams;
 const destination=String(query?.destination||'').slice(0,120);
 const purpose=String(query?.purpose||'').slice(0,100);
 const [all,destinationsMeta]=await Promise.all([publishedList('experiences',500),publishedList('destinations',200)]);
 return <main><header className="tb-listing-header tb-container"><span className="tb-eyebrow">EXPLORE / EXPERIENCES</span><h1>Moments worth<br/><em>travelling for.</em></h1><p>Explore experiences that bring a destination to life. Discover what speaks to you, then make it yours.</p></header><section className="tb-container tb-listing-body"><ExperienceDiscovery items={all} destinationsMeta={destinationsMeta} initialDestination={destination} initialPurpose={purpose}/></section></main>;
}
