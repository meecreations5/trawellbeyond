'use client';
import {useEffect,useState} from 'react';
import JourneyLine from './JourneyLine';
const chapters=[
 ['story-top','The beginning'],['our-beginning','Our origin'],['what-we-believe','Our belief'],
 ['our-philosophy','Our philosophy'],['the-people','Our people'],['your-chapter','Your chapter']
];
/** Small optional orientation rail, never a scroll-lock or automatically moving focus. */
export default function ChapterProgress(){
 const [active,setActive]=useState(0);
 useEffect(()=>{
  let raf=0;
  const update=()=>{
   raf=0;
   const index=chapters.reduce((result,[id],i)=>{
    const el=document.getElementById(id);
    return el&&el.getBoundingClientRect().top<=innerHeight*.47?i:result;
   },0);
   setActive(index);
  };
  const onScroll=()=>{if(!raf)raf=requestAnimationFrame(update);};
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll,{passive:true});
  return ()=>{window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);if(raf)cancelAnimationFrame(raf);};
 },[]);
 return <nav className="bs-v81-chapter-rail" aria-label="Our Story chapters">
  <span className="bs-v81-chapter-label"><img src="/assets/trawellbeyond-accent-motif.svg" alt="" aria-hidden="true"/><span>STORY / {String(active+1).padStart(2,'0')}</span></span>
  <JourneyLine progress={(active+1)/chapters.length} count={chapters.length}/>
  <div className="bs-v81-chapter-links">{chapters.map(([id,title],i)=><a key={id} href={`#${id}`} title={title} aria-label={`Jump to ${title}`} aria-current={active===i?'location':undefined} className={active===i?'is-current':''}>{String(i+1).padStart(2,'0')}</a>)}</div>
 </nav>;
}
