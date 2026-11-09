import Link from 'next/link';
export default function NotFound(){return <main className="tb-notfound tb-container"><span className="tb-eyebrow">A DIFFERENT WAY</span><h1>This path isn't<br/><em>available just yet.</em></h1><p>The destination or journey may still be in draft.</p><Link href="/destinations" className="tb-primary-button">Explore destinations ↗</Link></main>;}
