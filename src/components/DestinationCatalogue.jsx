import Link from 'next/link';
import {ContentCards} from './ContentCards';
import {destinationSections,normalizeRegionFilter} from '@/lib/destination-region.mjs';
const groups=[
 {key:'international',eyebrow:'01 / BEYOND BORDERS',title:'International',accent:'Journeys.',copy:'Across cultures, coastlines and cities, discover what speaks to you.'},
 {key:'domestic',eyebrow:'02 / CLOSER TO HOME',title:'Discover',accent:'India.',copy:'Stories, experiences and landscapes to explore across India.'},
 {key:'unclassified',eyebrow:'MORE PLACES',title:'Discover',accent:'more.',copy:'These destinations are being organised by our team.'}
];
export default function DestinationCatalogue({items=[],scope='all'}){
 const selection=normalizeRegionFilter(scope),sections=destinationSections(items);
 const links=[{key:'all',label:'All destinations',count:items.length},{key:'international',label:'International',count:sections.international.length},{key:'domestic',label:'Domestic · India',count:sections.domestic.length}];
 return <main className="tb-destination-catalogue">
  <header className="tb-listing-header tb-container"><span className="tb-eyebrow">EXPLORE / DESTINATIONS</span><h1>Every destination.<br/><em>A personal story.</em></h1><p>Travel close to home or further afield. Start with a place and we will create the journey around you.</p></header>
  <div className="tb-container"><nav className="tb-region-tabs" aria-label="Choose destination region">{links.map(({key,label,count})=><Link key={key} className={key===selection?'is-active':''} href={key==='all'?'/destinations':`/destinations?region=${key}`} aria-current={key===selection?'page':undefined}><span>{label}</span><small>{count}</small></Link>)}</nav></div>
  <div className="tb-container tb-destination-groups">{groups.filter(x=>selection==='all'||selection===x.key).map(g=>{
   const list=sections[g.key];if(!list?.length)return null;
   return <section key={g.key} className="tb-region-section" id={`${g.key}-destinations`} aria-labelledby={`tb-region-heading-${g.key}`}><div className="tb-region-heading"><div><span className="tb-eyebrow">{g.eyebrow}</span><h2 id={`tb-region-heading-${g.key}`}>{g.title} <em>{g.accent}</em></h2></div><p>{g.copy}</p></div><ContentCards items={list} type="destinations"/></section>;
  })}{!items.length&&<ContentCards items={[]} type="destinations"/>}{selection!=='all'&&!sections[selection]?.length&&<div className="tb-region-no-results" role="status">No published {selection==='domestic'?'domestic':'international'} destinations are currently available. <Link href="/destinations">Explore all destinations</Link></div>}</div>
  <div className="tb-container tb-destination-closing"><p>Don't see the destination you have in mind?</p><Link href="/create">CREATE a journey around you <span aria-hidden="true">↗</span></Link></div>
 </main>;
}
