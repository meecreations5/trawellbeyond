'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {siteConfig} from '@/lib/site-chrome.mjs';
import {renderGlobalFooter} from '@/lib/global-footer.mjs';
import PageMotion from './PageMotion';
import BrandReveal from './motion/BrandReveal';
import MobileAppDock from './MobileAppDock';

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
 useEffect(()=>{const onKey=e=>{if(e.key==='Escape')setMobile(false);};window.addEventListener('keydown',onKey);return ()=>window.removeEventListener('keydown',onKey);},[]);
 useEffect(()=>{
  // Next.js route transitions do not reliably execute scripts emitted by JSX.
  // Load the public tray once on the client, then reuse it across React pages.
  if(pathname?.startsWith('/admin')||document.getElementById('tb-journey-tray'))return;
  if(document.querySelector('script[data-tb-journey-script]'))return;
  const script=document.createElement('script');
  script.src='/journey-tray.js';script.defer=true;script.dataset.tbJourneyScript='true';
  document.body.append(script);
 },[pathname]);
 useEffect(()=>{
  if(pathname?.startsWith('/admin')||document.getElementById('tb-v82-companion'))return;
  const loadAssistant=()=>{
   if(document.querySelector('script[data-tb-v82-script]'))return;
   const script=document.createElement('script');script.src='/v82-companion.js';script.defer=true;script.dataset.tbV82Script='true';document.body.append(script);
  };
  if(window.TrawellBeyondCatalog){loadAssistant();return;}
  const existing=document.querySelector('script[data-tb-v82-bridge]');
  if(existing){existing.addEventListener('load',loadAssistant,{once:true});return;}
  const script=document.createElement('script');script.src='/enquiry-bridge.bundle.js';script.dataset.tbV82Bridge='true';script.onload=loadAssistant;document.body.append(script);
 },[pathname]);
 if(pathname?.startsWith('/admin'))return <>{children}</>;
 return <div className="tb-site"><BrandReveal/><a href="#main-content" className="tb-skip-link">Skip to content</a>
  <div className="tb-top-note"><span>{cfg.topLeft}</span><span>{cfg.topRight}</span></div>
  <header className={`tb-header ${scrolled?'tb-header-scrolled':''}`}>
   <Link className="tb-logo" href="/" aria-label="TrawellBeyond homepage" onClick={()=>setMobile(false)}><img src="/trawellbeyond-logo.svg" alt="TrawellBeyond"/></Link>
   <nav id="tb-primary-nav" className={`tb-nav ${mobile?'tb-nav-open':''}`} aria-label="Main navigation">
    {cfg.nav.map(([label,url])=><Link onClick={()=>setMobile(false)} href={url} key={`${label}:${url}`}>{label}</Link>)}
    <Link className="tb-nav-mobile-extra" onClick={()=>setMobile(false)} href="/create">CREATE your journey</Link>
   </nav>
   <Link href="/create" className="tb-nav-cta">{cfg.headerCta} <span aria-hidden="true">&#8599;</span></Link>
   <button type="button" className="tb-mobile-toggle" aria-controls="tb-primary-nav" aria-label={mobile?'Close menu':'Open menu'} aria-expanded={mobile} onClick={()=>setMobile(x=>!x)}>{mobile?'X':'Menu'}</button>
  </header>
  <div className="tb-page-content" id="main-content" tabIndex={-1}>{children}</div><PageMotion/>
  <div className="tb-global-footer-host" dangerouslySetInnerHTML={{__html:renderGlobalFooter(cfg)}} />
  <MobileAppDock/>
  <a className="tb-concierge" href="/enquire" data-tb-assistant-trigger="true" aria-label="Open TrawellBeyond Journey Companion, or visit enquiry page if the assistant is unavailable">Ask TrawellBeyond &#8599;</a>
 </div>;
}
