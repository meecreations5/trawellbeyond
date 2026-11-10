'use client';
import {useEffect,useState} from 'react';
import {INTRO_SESSION_KEY,MOTION_DURATION_MS} from '@/lib/motion-policy.mjs';
/** Motion is separate from the approved original SVG bytes; never morph or modify the logo. */
export default function BrandReveal(){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  // Optional QA replay makes the once-per-session design verifiable without clearing storage.
  const preview=new URLSearchParams(window.location.search).get('previewLogo')==='1';
  try{if(!preview&&sessionStorage.getItem(INTRO_SESSION_KEY))return;}catch{if(!preview)return;}
  let timer=0;
  const start=requestAnimationFrame(()=>{
   setVisible(true);
   if(!preview)try{sessionStorage.setItem(INTRO_SESSION_KEY,'1');}catch{}
   timer=window.setTimeout(()=>setVisible(false),MOTION_DURATION_MS.welcome);
  });
  return ()=>{cancelAnimationFrame(start);window.clearTimeout(timer);};
 },[]);
 if(!visible)return null;
 return <div className="tb-v81-brand-reveal" aria-hidden="true" data-tb-motion="v8.1.2">
  <div className="tb-v81-reveal-inner">
   <img className="tb-v81-reveal-logo" src="/assets/trawellbeyond-display.svg" alt="" decoding="async"/>
   <span className="tb-v81-welcome-line"/>
   <span className="tb-v81-brand-caption">YOUR JOURNEY, CREATED AROUND YOU.</span>
  </div>
 </div>;
}
