/** Untrusted CMS photo-credit text, safely escaped into small disclosure UI. */
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export function photoCreditEntries(value){
 return String(value||'').split(/\r?\n/).slice(0,35).map(row=>{
  const [caption='',credit='',license='',url='']=row.split('|').map(x=>x.trim());
  let source='';try{const parsed=new URL(url);if(parsed.protocol==='https:')source=parsed.toString();}catch{}
  return {caption,credit,license,source};
 }).filter(x=>x.caption&&x.credit);
}
export function renderPhotoCredits(value){
 const rows=photoCreditEntries(value);
 if(!rows.length)return '';
 return `<details class="tb-photo-credits"><summary>Photography &amp; licences <span>+</span></summary><ul>${rows.map(p=>`<li><strong>${esc(p.caption)}</strong> — ${esc(p.credit)} · ${esc(p.license)} ${p.source?`<a href="${esc(p.source)}" rel="noopener noreferrer" target="_blank">Original file &amp; licence ↗</a>`:''}</li>`).join('')}</ul><p>Photographs may be cropped, resized and compressed for website display. Original file and licence links are provided. Some scenes may be historical. Attraction access, events and offerings are confirmed separately.</p></details>`;
}
export function galleryButton(url,caption,index,{className='',figure=false,thumbUrl=''}={}){
 const safe=String(url||'').startsWith('https://')?url:'';
 if(!safe)return '';
 return `<button type="button" class="tb-gallery-trigger ${esc(className)}" data-gallery-index="${index}" data-gallery-src="${esc(safe)}" data-gallery-caption="${esc(caption)}" aria-label="Open photo ${index+1}: ${esc(caption)}"><img src="${esc(thumbUrl&&String(thumbUrl).startsWith('https://')?thumbUrl:safe)}" loading="lazy" decoding="async" alt="${esc(caption)}" onerror="this.onerror=null;this.src='/assets/hero-fallback.svg'"/></button>`;
}
