/* V7.5: A YouTube iframe is created only after a user clicks Play. */
(()=>{
 document.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-tb-play-video]');
  if(!button)return;
  const id=button.dataset.videoId||'';
  if(!/^[A-Za-z0-9_-]{11}$/.test(id))return;
  const slot=button.closest('.tb-video-poster');
  if(!slot)return;
  const frame=document.createElement('iframe');
  frame.className='tb-video-frame';
  frame.title=button.dataset.videoTitle||'Travel video';
  frame.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&rel=0';
  frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  frame.allowFullscreen=true;
  frame.referrerPolicy='strict-origin-when-cross-origin';
  slot.replaceChildren(frame);
 });
})();
