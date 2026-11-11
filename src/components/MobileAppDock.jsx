'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

const icons = {
 home:<><path d="M3.5 10 12 3.5 20.5 10V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z"/></>,
 discover:<><circle cx="12" cy="12" r="9"/><path d="m15.9 8.1-2.6 5.2-5.2 2.6 2.6-5.2z"/></>,
 saved:<><path d="M5.5 4.5h13v16l-6.5-4-6.5 4z"/></>,
 ask:<><path d="M20.5 11.4a7.8 7.8 0 0 1-8.2 7.6 9.2 9.2 0 0 1-3-.5l-4.7 2 1.2-4a7.8 7.8 0 0 1-2.3-5.5A8.3 8.3 0 0 1 12 3a8.3 8.3 0 0 1 8.5 8.4z"/><path d="M8.5 11.5h7"/></>
};
function Glyph({name}){return <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>;}
function currentTab(path){
 if(path==='/')return 'home';
 if(path?.startsWith('/create')||path?.startsWith('/customize'))return 'create';
 if(path?.startsWith('/my-journey')||path?.startsWith('/my-enquiries'))return 'saved';
 if(/^\/(destinations|experiences|journeys|offers|journey-match|insider)(\/|$)/.test(path||''))return 'discover';
 return '';
}
export default function MobileAppDock(){
 const path=usePathname();const active=currentTab(path);
 const tabs=[{id:'home',label:'Home',url:'/',icon:'home'},{id:'discover',label:'Explore',url:'/destinations',icon:'discover'},{id:'create',label:'CREATE',url:'/create',icon:'create'},{id:'saved',label:'Saved',url:'/my-journey',icon:'saved'}];
 return <nav className="tb-app-dock" aria-label="Mobile app navigation" data-tb-mobile-app="v8.3">
  <div className="tb-app-dock-items">
   {tabs.map(({id,label,url,icon})=><Link key={id} href={url} className={`tb-app-tab ${id==='create'?'tb-app-tab-create':''}${active===id?' is-current':''}`} aria-current={active===id?'page':undefined}>
    <span className="tb-app-tab-icon">{icon==='create'?<img src="/assets/trawellbeyond-accent-motif.svg" alt=""/>:<Glyph name={icon}/>}</span><span className="tb-app-tab-label">{label}</span>
   </Link>)}
   <a href="/enquire" className="tb-app-tab tb-app-tab-guide" data-tb-assistant-trigger="true" aria-label="Open Journey Companion"><span className="tb-app-tab-icon"><Glyph name="ask"/></span><span className="tb-app-tab-label">Guide</span></a>
  </div>
 </nav>;
}
