import Link from 'next/link';
import {ContentCards} from './ContentCards';
export default function ListingPage({title,accent,eyebrow,description,items,type}){return <main><header className="tb-listing-header tb-container"><span className="tb-eyebrow">{eyebrow}</span><h1>{title}<br/><em>{accent}</em></h1><p>{description}</p></header><section className="tb-container tb-listing-body"><div className="tb-listing-count"><span>{items.length} published {type}</span><Link href="/create">Need something different? CREATE it ↗</Link></div><ContentCards items={items} type={type}/></section></main>;}
