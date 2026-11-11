import Link from 'next/link';
import {ContentCards} from './ContentCards';
import {destinationRegion,normalizeRegionFilter} from '@/lib/destination-region.mjs';
const sections=[
 {key:'international',eyebrow:'01 / JOURNEYS BEYOND BORDERS',title:'The world',accent:'awaits.',copy:'Start with a place abroad, then shape every detail around your people.'},
 {key:'domestic',eyebrow:'02 / JOURNEYS ACROSS INDIA',title:'Closer',accent:'to home.',copy:'Rediscover India through journeys thoughtfully created around you.'},
 {key:'unclassified',eyebrow:'MORE POSSIBILITIES',title:'More to',accent:'discover.',copy:'These published journeys are being organised by our team.'}
];
export default function JourneyCatalogue({items=[],destinations=[],scope='all'}){
 const selection=normalizeRegionFilter(scope),bySlug=new Map(destinations.map(d=>[d.slug||d.id,destinationRegion(d)]));
 const grouped={international:[],domestic:[],unclassified:[]};
 for(const j of items){const group=bySlug.get(j.destinationSlug)||destinationRegion({slug:j.destinationSlug});grouped[group].push(j);}
 const nav=[{key:'all',label:'All journeys',count:items.length},{key:'international',label:'International',count:grouped.international.length},{key:'domestic',label:'Domestic · India',count:grouped.domestic.length}];
 return <main className="tb-journey-catalogue"><header className="tb-listing-header tb-container"><span className="tb-eyebrow">EXPLORE / JOURNEYS</span><h1>Made for life.<br/><em>Created for you.</em></h1><p>Our journeys are starting points, never fixed scripts. Explore international or domestic journeys and make yours personal.</p></header>
 <div className="tb-container"><nav className="tb-region-tabs" aria-label="Choose journey region">{nav.map(x=><Link key={x.key} href={x.key==='all'?'/journeys':`/journeys?region=${x.key}`} aria-current={x.key===selection?'page':undefined} className={x.key===selection?'is-active':''}><span>{x.label}</span><small>{x.count}</small></Link>)}</nav></div>
 <div className="tb-container tb-destination-groups">{sections.filter(s=>selection==='all'||s.key===selection).map(s=>grouped[s.key]?.length?<section key={s.key} className="tb-region-section" aria-labelledby={`journey-region-${s.key}`}><div className="tb-region-heading"><div><span className="tb-eyebrow">{s.eyebrow}</span><h2 id={`journey-region-${s.key}`}>{s.title} <em>{s.accent}</em></h2></div><p>{s.copy}</p></div><ContentCards items={grouped[s.key]} type="journeys"/></section>:null)}
 {!items.length&&<ContentCards items={[]} type="journeys"/>}
 {selection!=='all'&&!grouped[selection]?.length&&<div className="tb-region-no-results" role="status">No published journeys in this region yet. <Link href="/journeys">Explore all journeys</Link></div>}</div>
 <div className="tb-container tb-destination-closing"><p>Have a journey of your own in mind?</p><Link href="/create">CREATE around you <span aria-hidden="true">↗</span></Link></div></main>;
}
