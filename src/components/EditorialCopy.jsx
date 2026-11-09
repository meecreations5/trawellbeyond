/** Safe plain-text editorial copy from the Website Pages CMS. */
export function EditorialCopy({text='',className='tb-long-copy'}){
 const blocks=String(text||'').split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
 if(!blocks.length)return null;
 return <div className={className}>{blocks.map((block,i)=>block.startsWith('## ')?<h2 key={i}>{block.slice(3)}</h2>:<p key={i}>{block}</p>)}</div>;
}
export function pairs(text=''){
 return String(text).split('\n').map(line=>line.trim()).filter(Boolean).map(line=>{
  const [title,...more]=line.split('|');return [title.trim(),more.join('|').trim()];
 }).filter(([q,a])=>q&&a);
}
