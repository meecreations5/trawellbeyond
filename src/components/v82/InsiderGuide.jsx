import Link from 'next/link';
import {publishedList} from '@/lib/content-server';
import './v82.css';
const groups=[
 ['LOCAL LANGUAGE','travelLanguages'],['CURRENCY','travelCurrency'],['TIME & SEASONS','travelWeather'],
 ['GETTING AROUND','travelTransport'],['FOOD & DINING','travelFood'],['WHERE TO STAY','travelStay'],
 ['ENTRY & ARRIVAL','travelEntry'],['TRAVEL ESSENTIALS','travelEssentials']
];
const safeLink=url=>{try{const u=new URL(url);return u.protocol==='https:'?u.href:'';}catch{return '';}};
export default async function InsiderGuide({destination}){
 const experiences=(await publishedList('experiences',300)).filter(x=>x.destinationSlug===destination.slug).slice(0,6);
 const available=groups.map(([label,field])=>({label,text:String(destination[field]||'').trim()})).filter(x=>x.text);
 return <main className="v82-page v82-wrap v82-insider"><header className="v82-hero v82-hero-plain"><span className="v82-kicker">DESTINATION INSIDER / VERIFIED CMS NOTES</span><h1>Know a little more.<br/><em>Feel a lot more ready.</em></h1><p>{destination.title} · Practical guidance created to help you plan with confidence. Information may change; review official sources before travel.</p><Link href={`/destinations/${destination.slug}`} className="v82-textlink">← Explore {destination.title}</Link></header>
 <section className="v82-section-head"><span className="v82-kicker">BEFORE YOU GO</span><h2>{destination.title},<br/><em>the details that matter.</em></h2></section>
 {available.length?<div className="v82-insider-grid">{available.map(x=><article key={x.label}><span>{x.label}</span><p>{x.text}</p></article>)}</div>:<div className="v82-empty">Detailed local guidance is being reviewed by our team. <Link href="/enquire">Ask us a question ↗</Link></div>}
 <div className="v82-source-info"><p>{destination.travelVerifiedOn?`Last content review: ${destination.travelVerifiedOn}. Recheck before departure.`:'The last review date has not been published. Confirm current travel conditions with official sources.'}</p>{[['Official visitor information',destination.travelGuideUrl],['Official transport information',destination.travelTransportUrl],['Official entry guidance',destination.travelEntryUrl]].map(([label,url])=>safeLink(url)?<a key={label} href={safeLink(url)} target="_blank" rel="noopener noreferrer">{label} ↗</a>:null)}</div>
 {experiences.length>0&&<section className="v82-collection"><span className="v82-kicker">EXPLORE EXPERIENCES</span><h2>Possible moments in {destination.title}.</h2><div className="v82-insider-experiences">{experiences.map(x=><Link key={x.id} href={`/experiences/${x.slug}`}><strong>{x.title}</strong><span>{x.summary||'Discover more about this experience.'} ↗</span></Link>)}</div></section>}
 <section className="v82-final-cta"><span>READY TO CREATE?</span><h2>A journey based<br/><em>on your needs.</em></h2><div><Link href={`/create?destination=${encodeURIComponent(destination.title)}`} className="v82-primary">CREATE your journey ↗</Link><Link href="/journey-match" className="v82-outline">Explore another possibility</Link></div></section></main>;
}
