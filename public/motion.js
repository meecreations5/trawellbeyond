/* TrawellBeyond V4.2 Motion: progressive enhancement; all original interactions remain in app.js. */
(()=>{
'use strict';
const mq=window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced=()=>mq.matches;
const story=document.getElementById('moments');
const scenes=Array.from(story.querySelectorAll('.motion-scene'));
const dots=Array.from(story.querySelectorAll('[data-story-dot]'));
const storyFill=document.getElementById('motionStoryBar');
const currentNum=document.getElementById('motionSceneNum');
const hero=document.querySelector('.hero');
let lastScene=-1;
let ticking=false;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));

// When reduced motion is requested, present all three chapters in reading order.
function updateMotion(){
 if(reduced()){
  hero.style.removeProperty('--hero-shift');hero.style.removeProperty('--hero-content-shift');
  // All chapters are visually stacked in reduced-motion mode; keep them
  // available to assistive technology as well as sighted readers.
  scenes.forEach(s=>s.setAttribute('aria-hidden','false'));
  return;
 }
 const y=window.scrollY||window.pageYOffset;
 const heroProgress=clamp(y/Math.max(1,hero.offsetHeight));
 hero.style.setProperty('--hero-shift',String(Math.round(heroProgress*95)));
 hero.style.setProperty('--hero-content-shift',String(Math.round(heroProgress*-45)));
 const r=story.getBoundingClientRect();
 const travel=Math.max(1,story.offsetHeight-window.innerHeight);
 const p=clamp(-r.top/travel);
 const next=Math.min(2,Math.floor(p*3));
 if(lastScene!==next){
  lastScene=next;
  scenes.forEach((s,i)=>{
   const active=i===next;
   s.classList.toggle('is-current',active);
   s.setAttribute('aria-hidden',String(!active));
  });
  dots.forEach((d,i)=>{const active=i===next;d.classList.toggle('is-current',active);if(active)d.setAttribute('aria-current','true');else d.removeAttribute('aria-current')});
  currentNum.textContent=String(next+1).padStart(2,'0');
 }
 const activeScene=scenes[next];
 if(activeScene){const local=(p*3)-next;activeScene.style.setProperty('--scene-y',`${Math.round((local-.5)*45)}px`)}
 storyFill.style.transform=`scaleX(${p.toFixed(4)})`;
}
function frame(){ticking=false;updateMotion()}
function onScroll(){if(ticking)return;ticking=true;window.requestAnimationFrame(frame)}
window.addEventListener('scroll',onScroll,{passive:true});
window.addEventListener('resize',onScroll,{passive:true});
if(typeof mq.addEventListener==='function')mq.addEventListener('change',()=>{lastScene=-1;onScroll()});
requestAnimationFrame(updateMotion);

dots.forEach((dot,i)=>dot.addEventListener('click',()=>{
 const top=story.getBoundingClientRect().top+window.scrollY;
 const dist=Math.max(1,story.offsetHeight-window.innerHeight);
 window.scrollTo({top:top+dist*((i+.18)/3),behavior:reduced()?'instant':'smooth'});
}));

// Scroll-triggered reveals: semantic content is visible by default until enhancement is enabled.
const groups=[
 ['.entry-intro .eyebrow,.entry-intro h2,.entry-intro p',90],
 ['.entry-tile',90],['.entry-response',0],
 ['.manifesto-kicker,.manifesto-body h2,.manifesto-aside p,.signature',95],
 ['.destinations-section .section-header>div,.destinations-section .destination-foot',100],
 ['.journeys-section .section-header>div',110],['.journey-card',100],
 ['.purpose-left>*,.purpose-list button,.purpose-result',80],
 ['.create-content>*,.create-photo',105],
 ['.worlds-heading>*,.worlds-list button',75],
 ['.closing .eyebrow,.closing h2,.closing p,.closing button',100]
];
const reveal=[];
groups.forEach(([selector,step])=>{
 document.querySelectorAll(selector).forEach((el,i)=>{
  el.classList.add('m-reveal');
  el.style.setProperty('--reveal-delay',`${Math.min(i*step,450)}ms`);
  reveal.push(el);
 });
});
const masks=Array.from(document.querySelectorAll('.destination-big,.destination-small,.journey-img'));
masks.forEach((el,i)=>{el.classList.add('m-mask');el.style.setProperty('--reveal-delay',`${(i%3)*110}ms`)});
if(!reduced()&&'IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target)}
 }),{rootMargin:'0px 0px -35px 0px',threshold:.08});
 reveal.forEach(el=>observer.observe(el));
 // A fully clipped mask has zero intersection area. Observe its unclipped section,
 // then reveal the masked child images in sequence as the section enters view.
 const imageGroups=[
  [document.querySelector('.destination-editorial'),Array.from(document.querySelectorAll('.destination-editorial .m-mask'))],
  [document.querySelector('.journey-rail'),Array.from(document.querySelectorAll('.journey-rail .m-mask'))]
 ];
 const maskObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){
   const group=imageGroups.find(g=>g[0]===entry.target);
   if(group)group[1].forEach(item=>item.classList.add('in-view'));
   maskObserver.unobserve(entry.target);
  }
 }),{rootMargin:'0px 0px -80px 0px',threshold:0});
 imageGroups.forEach(([container])=>{if(container)maskObserver.observe(container)});
 document.documentElement.classList.add('motion-ready');
}else{[...reveal,...masks].forEach(el=>el.classList.add('in-view'))}

// Responsive rail: native mobile swiping; precise-pointer dragging on desktop.
const rail=document.getElementById('journeyRail');
if(rail){
 const progress=document.createElement('div');progress.className='journey-progress';progress.setAttribute('aria-hidden','true');progress.innerHTML='<div class="journey-progress__fill"></div>';
 rail.after(progress);
 const fill=progress.firstElementChild;
 const updateRail=()=>{
  const max=rail.scrollWidth-rail.clientWidth;
  const visible=rail.clientWidth/Math.max(1,rail.scrollWidth);
  const p=max>0?visible+(rail.scrollLeft/max)*(1-visible):1;
  fill.style.transform=`scaleX(${clamp(p)})`;
 };
 rail.addEventListener('scroll',updateRail,{passive:true});
 window.addEventListener('resize',updateRail,{passive:true});
 requestAnimationFrame(updateRail);
 let startX=0,startScroll=0,dragging=false,moved=false,blockClick=false;
 rail.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='mouse'||e.button!==0)return;
  startX=e.clientX;startScroll=rail.scrollLeft;dragging=true;moved=false;
 });
 window.addEventListener('pointermove',e=>{
  if(!dragging)return;
  const d=e.clientX-startX;
  if(Math.abs(d)>7){moved=true;rail.classList.add('is-dragging');rail.scrollLeft=startScroll-d}
 },{passive:true});
 window.addEventListener('pointerup',()=>{
  if(!dragging)return;dragging=false;rail.classList.remove('is-dragging');
  if(moved){blockClick=true;setTimeout(()=>blockClick=false,100)}
 });
 rail.addEventListener('click',e=>{if(blockClick){e.preventDefault();e.stopImmediatePropagation();blockClick=false}},true);
}

// Travel cards and destinations: responsive cursor preview on fine-pointer screens.
const customCursor=document.getElementById('motionCursor');
if(customCursor&&window.matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduced()){
 document.querySelectorAll('.destination-big,.destination-small,.journey-img').forEach(item=>{
  item.addEventListener('pointerenter',()=>customCursor.classList.add('active'));
  item.addEventListener('pointermove',e=>{
   customCursor.style.transform=`translate3d(${e.clientX-50}px,${e.clientY-50}px,0)`;
  },{passive:true});
  item.addEventListener('pointerleave',()=>customCursor.classList.remove('active'));
  item.addEventListener('focus',()=>customCursor.classList.remove('active'));
 });
 document.addEventListener('pointerdown',()=>customCursor.classList.remove('active'),{passive:true});
}

// Change-of-content animations without delaying underlying functionality.
document.querySelectorAll('[data-region]').forEach(button=>button.addEventListener('click',()=>{
 if(reduced())return;
 const grid=document.querySelector('#destinationGrid');
 grid.animate([{opacity:.66,filter:'blur(3px)',transform:'translateY(9px)'},{opacity:1,filter:'blur(0)',transform:'translateY(0)'}],{duration:630,easing:'cubic-bezier(.22,1,.36,1)'});
}));
document.querySelectorAll('[data-purpose]').forEach(button=>button.addEventListener('click',()=>{
 if(reduced())return;
 document.querySelector('.purpose-result').animate([{opacity:.5,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:490,easing:'cubic-bezier(.22,1,.36,1)'});
}));
})();
