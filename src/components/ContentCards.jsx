import Link from 'next/link';
import {excerpt,currency} from '@/lib/format';
import {resolveImageVariant} from '@/lib/media-variants.mjs';
import BrandedState from './motion/BrandedState';
const routes={destinations:'destinations',experiences:'experiences',journeys:'journeys',offers:'offers'};
export function ContentCards({items,type='destinations',limit=0}){
 const showing=limit?items.slice(0,limit):items;
 if(!showing.length)return <div className="tb-empty-public"><BrandedState kind="empty" title="Something meaningful is on its way." description="Our team can CREATE your journey around you, even while our new collection is being prepared." actionLabel="CREATE your journey" actionHref="/create"/></div>;
 return <div className="tb-cards">{showing.map(item=><Link key={item.id||item.slug} href={`/${routes[type]}/${item.slug}`} className="tb-card"><div className="tb-card-visual" style={item.heroImage?{backgroundImage:`linear-gradient(0deg,rgba(4,17,15,.45),transparent 68%),url("${resolveImageVariant(item,item.heroImage,'medium')}")`}:undefined}>{item.photoCredit&&<span className="tb-card-photo-credit">Photo: {item.photoCredit}{item.photoLicense?` · ${item.photoLicense}`:''}</span>}<span className="tb-card-tag">{type==='destinations'?(item.region||'Explore'):type==='journeys'?'PERSONAL JOURNEY':type==='offers'?'SPECIAL OFFER':item.destinationSlug?.replaceAll('-',' ')||'EXPERIENCE'}</span></div><div className="tb-card-content"><h3>{item.title}</h3><p>{excerpt(item.summary,110)}</p><div className="tb-card-bottom"><span>{type==='journeys'&&item.nights?`${item.nights} nights`:'Created around you'}{item.priceFrom?` · From ${currency(item.priceFrom,item.currency)}`:''}</span><strong>Explore ↗</strong></div></div></Link>)}</div>;
}
