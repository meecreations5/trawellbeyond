/* Gallery viewer for V5.1 destination, experience and journey pages. */
(()=>{'use strict';
 const triggers=[...document.querySelectorAll('[data-gallery-src]')].filter(node=>{
  try{return new URL(node.dataset.gallerySrc).protocol==='https:';}catch{return false;}
 });
 if(!triggers.length)return;
 const box=document.createElement('div');
 box.className='tb-lightbox';
 box.setAttribute('role','dialog');
 box.setAttribute('aria-modal','true');
 box.setAttribute('aria-label','Photo gallery');
 box.hidden=true;
 box.innerHTML=`
  <button class="tb-lightbox__close" aria-label="Close gallery" type="button">×</button>
  <div class="tb-lightbox__stage">
   <button class="tb-lightbox__prev" aria-label="Previous photograph" type="button">‹</button>
   <img class="tb-lightbox__image" alt="" decoding="async"/>
   <button class="tb-lightbox__next" aria-label="Next photograph" type="button">›</button>
  </div>
  <div class="tb-lightbox__details">
   <p class="tb-lightbox__caption"></p>
   <span class="tb-lightbox__number" aria-live="polite"></span>
  </div>`;
 document.body.append(box);
 const image=box.querySelector('.tb-lightbox__image');
 const caption=box.querySelector('.tb-lightbox__caption');
 const number=box.querySelector('.tb-lightbox__number');
 const closeButton=box.querySelector('.tb-lightbox__close');
 const prevButton=box.querySelector('.tb-lightbox__prev');
 const nextButton=box.querySelector('.tb-lightbox__next');
 const multiple=triggers.length>1;
 prevButton.hidden=!multiple;nextButton.hidden=!multiple;
 let index=0,lastFocus=null,swipeX=null;
 const show=i=>{
  index=(i+triggers.length)%triggers.length;
  const item=triggers[index];
  const label=item.dataset.galleryCaption||'Travel photograph';
  image.alt=label;
  image.onerror=()=>{image.onerror=null;image.src='/assets/hero-fallback.svg';caption.textContent='This photograph is currently unavailable.';};
  image.src=item.dataset.gallerySrc;
  caption.textContent=label;
  number.textContent=`${String(index+1).padStart(2,'0')} / ${String(triggers.length).padStart(2,'0')}`;
  box.setAttribute('aria-label',`Travel gallery, photograph ${index+1} of ${triggers.length}`);
 };
 const open=i=>{
  lastFocus=document.activeElement;
  show(i);
  box.hidden=false;
  document.documentElement.classList.add('tb-gallery-open');
  document.body.classList.add('tb-gallery-open');
  closeButton.focus();
 };
 const close=()=>{
  box.hidden=true;
  image.onerror=null;
  image.removeAttribute('src');
  document.documentElement.classList.remove('tb-gallery-open');
  document.body.classList.remove('tb-gallery-open');
  if(lastFocus&&typeof lastFocus.focus==='function')lastFocus.focus();
 };
 triggers.forEach((node,i)=>node.addEventListener('click',()=>open(i)));
 closeButton.addEventListener('click',close);
 prevButton.addEventListener('click',()=>show(index-1));
 nextButton.addEventListener('click',()=>show(index+1));
 box.addEventListener('click',e=>{if(e.target===box)close();});
 document.addEventListener('keydown',e=>{
  if(box.hidden)return;
  if(e.key==='Escape'){e.preventDefault();close();return;}
  if(e.key==='ArrowRight'&&multiple){e.preventDefault();show(index+1);return;}
  if(e.key==='ArrowLeft'&&multiple){e.preventDefault();show(index-1);return;}
  if(e.key==='Tab'){
   const controls=[...box.querySelectorAll('button')].filter(el=>!el.hidden);
   const first=controls[0],last=controls[controls.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
 });
 box.addEventListener('touchstart',e=>{swipeX=e.touches[0]?.clientX??null;},{passive:true});
 box.addEventListener('touchend',e=>{
  if(swipeX===null||!multiple)return;
  const x=e.changedTouches[0]?.clientX??swipeX;
  if(Math.abs(x-swipeX)>65)show(index+(x<swipeX?1:-1));
  swipeX=null;
 },{passive:true});
})();
