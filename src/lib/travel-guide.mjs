/** V7.5 public travel knowledge + privacy-respecting YouTube previews.
 * This module is independent of Firebase and has no browser dependencies.
 */
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function httpsUrl(value){
 if(typeof value!=='string'||value.length>1700)return '';
 try{const u=new URL(value.trim());return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}
}
export function youtubeVideoId(value){
 const url=httpsUrl(value);
 if(!url)return '';
 try{
  const u=new URL(url),host=u.hostname.toLowerCase().replace(/^www\./,'');
  let id='';
  if(host==='youtu.be')id=u.pathname.slice(1).split('/')[0];
  else if(['youtube.com','m.youtube.com','youtube-nocookie.com'].includes(host)){
   if(u.pathname==='/watch')id=u.searchParams.get('v')||'';
   else if(/^\/(embed|shorts|live)\/[A-Za-z0-9_-]{11}\/?$/.test(u.pathname))id=u.pathname.split('/')[2];
  }
  return /^[A-Za-z0-9_-]{11}$/.test(id)?id:'';
 }catch{return '';}
}
function link(label,url){
 const safe=httpsUrl(url);return safe?`<a href="${esc(safe)}" target="_blank" rel="noopener noreferrer">${esc(label)} &nearr;</a>`:'';
}
function guideCard(label,text){
 return text?`<article class="tb-guide-card"><span class="tb-guide-label">${esc(label)}</span><p>${esc(text)}</p></article>`:'';
}
function dateText(value){return /^\d{4}-\d{2}-\d{2}$/.test(String(value||''))?`<small>Content reviewed: ${esc(value)}. Recheck before travel.</small>`:'';}
export function renderTravelEssentials(record={}){
 const items=[
  ['Language',record.travelLanguages],['Currency',record.travelCurrency],['Time zone',record.travelTimeZone],
  ['Weather & packing',record.travelWeather],['Getting around',record.travelTransport],['Food & dining',record.travelFood],
  ['Areas to stay',record.travelStay],['Entry & arrival',record.travelEntry],['Everyday essentials',record.travelEssentials]
 ].filter(([,text])=>String(text||'').trim());
 if(!items.length)return '';
 const sources=[link('Official travel information',record.travelGuideUrl),link('Official public transport',record.travelTransportUrl),link('Official entry requirements',record.travelEntryUrl)].filter(Boolean);
 return `<section class="tb-guide page-width" id="travel-essentials" aria-labelledby="travelEssentialsTitle"><header class="tb-guide-header"><div><span class="tb-guide-eyebrow">BEFORE YOU GO / TRAVEL ESSENTIALS</span><h2 id="travelEssentialsTitle">Feel ready for<br/><em>what comes next.</em></h2></div><p>Practical guidance for planning your journey. Schedules, entry requirements and local services can change; always check the linked official sources close to departure.</p></header><div class="tb-guide-grid">${items.map(([label,value])=>guideCard(label,value)).join('')}</div><div class="tb-guide-sources">${sources.join('')}${dateText(record.travelVerifiedOn)}</div></section>`;
}
export function renderVisitGuide(record={}){
 const items=[
  ['Where to go',record.locationAddress],['Nearest transport',record.nearestTransit],['Getting there',record.gettingThere],
  ['Accessibility & comfort',record.accessibilityNotes],['Visitor tips',record.visitorTips]
 ].filter(([,text])=>String(text||'').trim());
 if(!items.length)return '';
 const sources=[link('Operator visitor guidance',record.visitSourceUrl),link('Open directions',record.mapUrl)].filter(Boolean);
 return `<section class="tb-visit page-width" id="plan-your-visit" aria-labelledby="planVisitTitle"><header class="tb-guide-header"><div><span class="tb-guide-eyebrow">PLAN YOUR VISIT</span><h2 id="planVisitTitle">The details that<br/><em>make it easier.</em></h2></div><p>Find your way, understand the setting and plan the pace of your visit. Check the operator's latest information for your chosen date.</p></header><div class="tb-guide-grid">${items.map(([label,value])=>guideCard(label,value)).join('')}</div><div class="tb-guide-sources">${sources.join('')}${dateText(record.visitVerifiedOn)}</div></section>`;
}
export function renderVideoPreview(record={},options={}){
 const id=youtubeVideoId(record.videoUrl);if(!id)return '';
 const videoUrl=`https://www.youtube.com/watch?v=${id}`;
 const title=String(record.videoTitle||`${record.title||'Destination'} video`).slice(0,200);
 const image=httpsUrl(options.image||record.heroImage);
 const backdrop=image?`<img src="${esc(image)}" alt="" loading="lazy" decoding="async"/>`:'';
 return `<section class="tb-video page-width" aria-label="Video preview"><div class="tb-video-poster">${backdrop}<button type="button" class="tb-video-play" data-tb-play-video data-video-id="${esc(id)}" data-video-title="${esc(title)}" aria-label="Play ${esc(title)}">PLAY &rarr;</button></div><div class="tb-video-copy"><span class="tb-guide-eyebrow">${esc(options.eyebrow||'WATCH & DISCOVER')}</span><h2>${esc(options.heading||'Discover it in motion.')}</h2><p>${esc(title)}${record.videoCredit?` / ${esc(record.videoCredit)}`:''}</p><p>Video loads only when you select Play. This video is a reference, not a promise of currently available activities.</p>${link('Watch video on YouTube',videoUrl)}</div></section>`;
}
