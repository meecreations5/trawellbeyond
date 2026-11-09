'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {siteConfig} from '@/lib/site-chrome.mjs';
import {renderGlobalFooter} from '@/lib/global-footer.mjs';

export default function PublicShell({children,site={}}){
 const [mobile,setMobile]=useState(false),[scrolled,setScrolled]=useState(false);
 const pathname=usePathname();
 const cfg=siteConfig(site);
 useEffect(()=>{
  const listener=()=>setScrolled(window.scrollY>35);
  listener();window.addEventListener('scroll',listener,{passive:true});
  return ()=>window.removeEventListener('scroll',listener);
 },[]);
 useEffect(()=>setMobile(false),[pathname]);
 useEffect(()=>{
  // Next.js route transitions do not reliably execute scripts emitted by JSX.
  // Load the public tray once on the client, then reuse it across React pages.
  if(pathname?.startsWith('/admin')||document.getElementById('tb-journey-tray'))return;
  if(document.querySelector('script[data-tb-journey-script]'))return;
  const script=document.createElement('script');
  script.src='/journey-tray.js';script.defer=true;script.dataset.tbJourneyScript='true';
  document.body.append(script);
 },[pathname]);
 if(pathname?.startsWith('/admin'))return <>{children}</>;
 return <div className="tb-site">
  <div className="tb-top-note"><span>{cfg.topLeft}</span><span>{cfg.topRight}</span></div>
  <header className={`tb-header ${scrolled?'tb-header-scrolled':''}`}>
   <Link className="tb-logo" href="/" aria-label="TrawellBeyond homepage" onClick={()=>setMobile(false)}><img src="/trawellbeyond-logo.svg" alt="TrawellBeyond"/></Link>
   <nav className={`tb-nav ${mobile?'tb-nav-open':''}`} aria-label="Main navigation">
    {cfg.nav.map(([label,url])=><Link onClick={()=>setMobile(false)} href={url} key={`${label}:${url}`}>{label}</Link>)}
    <Link className="tb-nav-mobile-extra" onClick={()=>setMobile(false)} href="/create">CREATE your journey</Link>
   </nav>
   <Link href="/create" className="tb-nav-cta">{cfg.headerCta} <span aria-hidden="true">&#8599;</span></Link>
   <button type="button" className="tb-mobile-toggle" aria-label={mobile?'Close menu':'Open menu'} aria-expanded={mobile} onClick={()=>setMobile(x=>!x)}>{mobile?'X':'Menu'}</button>
  </header>
  <div className="tb-page-content">{children}</div>
  <div className="tb-global-footer-host" dangerouslySetInnerHTML={{__html:renderGlobalFooter(cfg)}} />
  <Link className="tb-concierge" href="/enquire">Ask TrawellBeyond &#8599;</Link>
 </div>;
}
