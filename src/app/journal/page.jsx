import Link from 'next/link';
import {publishedOne} from '@/lib/content-server';
import {EditorialCopy} from '@/components/EditorialCopy';
export const metadata={title:'Journal'};export const dynamic='force-dynamic';
export default async function Journal(){const page=await publishedOne('pages','journal')||{};return <main><header className="tb-listing-header tb-container"><span className="tb-eyebrow">JOURNAL / STORIES AND INSPIRATION</span><h1>{page.title||<>Where ideas<br/><em>begin to move.</em></>}</h1><p>{page.summary||'Stories, insights and observations from the world of purposeful travel.'}</p></header><section className="tb-container tb-listing-body">{page.description?<EditorialCopy text={page.description}/>:<div className="tb-empty-public"><h3>Our travel journal is taking shape.</h3><p>Tell us what destination or experience is on your mind.</p><Link className="tb-text-link" href="/create">CREATE a journey ↗</Link></div>}</section></main>;}
