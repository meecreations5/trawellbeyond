import './globals.css';
import './mobile-app.css';
import PublicShell from '@/components/PublicShell';
import {publishedOne} from '@/lib/content-server';
export const dynamic='force-dynamic';
export const metadata={title:{default:'TrawellBeyond | Created Around You',template:'%s | TrawellBeyond'},description:'People first. Destination second. Discover personal journeys, experiences and destinations created around you.',robots:{index:true,follow:true}};
export default async function RootLayout({children}){const settings=await publishedOne('pages','site-settings')||{};return <html lang="en"><head><link rel="stylesheet" href="/global-footer.css" /><link rel="stylesheet" href="/journey-tray.css" /><link rel="stylesheet" href="/v81-motion.css" /><link rel="stylesheet" href="/v82-companion.css" /></head><body id="top"><PublicShell site={settings}>{children}</PublicShell></body></html>;}
