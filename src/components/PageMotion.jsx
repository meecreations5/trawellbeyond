'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {POSTCARD_SESSION_KEY,postcardDestination} from '@/lib/motion-policy.mjs';
/** Opt-in scroll effects for React interior pages; the approved HTML home/detail pages have their own motion engine. */
export default function PageMotion(){
 const path=usePathname();
 useEffect(()=>{
  if(path?.startsWith('/admin'))return;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=window.matchMedia('(max-width: 800px)');
  const nodes=[...document.querySelectorAll('.tb-page-content .tb-reveal')];
  if(reduce.matches||!('IntersectionObserver' in window)){return;}
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.add('tb-is-visible');observer.unobserve(entry.target);}
  }),{rootMargin:'0px 0px -28px 0px',threshold:0.06});
  for(const node of nodes){if(node.getBoundingClientRect().top<window.innerHeight*0.94){node.classList.add('tb-is-visible');continue;}node.classList.add('tb-motion-enabled');observer.observe(node);}
  const panels=[...document.querySelectorAll('.tb-parallax-media[data-parallax]')];
  let raf=0;
  const frame=()=>{raf=0;if(reduce.matches||mobile.matches){panels.forEach(el=>el.style.removeProperty('--tb-parallax-offset'));return;}
   for(const el of panels){const bounds=el.getBoundingClientRect();if(bounds.bottom<0||bounds.top>innerHeight)continue;const fraction=Math.max(-1,Math.min(1,(innerHeight/2-(bounds.top+bounds.height/2))/Math.max(1,innerHeight/2+bounds.height/2)));const strength=Math.min(35,Math.max(0,Number(el.dataset.parallax)||24));el.style.setProperty('--tb-parallax-offset',`${Math.round(fraction*strength)}px`);}
  };
  const request=()=>{if(!raf)raf=requestAnimationFrame(frame);};
  window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request,{passive:true});frame();
  const onMotion=()=>{if(reduce.matches){nodes.forEach(el=>{el.classList.add('tb-is-visible');el.classList.remove('tb-motion-enabled');});}frame();};
  reduce.addEventListener?.('change',onMotion);mobile.addEventListener?.('change',onMotion);
  return ()=>{observer.disconnect();window.removeEventListener('scroll',request);window.removeEventListener('resize',request);reduce.removeEventListener?.('change',onMotion);mobile.removeEventListener?.('change',onMotion);if(raf)cancelAnimationFrame(raf);for(const el of panels)el.style.removeProperty('--tb-parallax-offset');for(const el of nodes)el.classList.remove('tb-motion-enabled');};
 },[path]);
 useEffect(()=>{
  if(path?.startsWith('/admin'))return;
  const remember=event=>{
   if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;
   const link=event.target.closest?.('a.tb-card[href]');
   if(!link)return;
   const target=postcardDestination(link.getAttribute('href'));
   if(target)try{sessionStorage.setItem(POSTCARD_SESSION_KEY,JSON.stringify(target));}catch{}
  };
  document.addEventListener('pointerdown',remember,{passive:true});
  document.addEventListener('keydown',remember);
  return ()=>{document.removeEventListener('pointerdown',remember);document.removeEventListener('keydown',remember);};
 },[path]);
 return null;
}
