/** A reference is not a credential. Firebase Auth + rules control reads. */
export const RECEIPTS_KEY='tb_enquiry_receipts_v82';
export function safeReceipts(input){
 return (Array.isArray(input)?input:[]).filter(x=>x&&typeof x.id==='string'&&/^[A-Za-z0-9]{8,40}$/.test(x.id)).slice(-20).map(x=>({id:x.id,createdAt:String(x.createdAt||'').slice(0,32),source:String(x.source||'enquiry').slice(0,30)}));
}
export function rememberReceipt(id,source='enquiry'){
 if(typeof localStorage==='undefined')return;
 try{
  const older=safeReceipts(JSON.parse(localStorage.getItem(RECEIPTS_KEY)||'[]'));
  const next=safeReceipts([...older.filter(item=>item.id!==id),{id,source,createdAt:new Date().toISOString()}]);
  localStorage.setItem(RECEIPTS_KEY,JSON.stringify(next));
  if(typeof window!=='undefined')window.dispatchEvent(new Event('tb:enquiry-received'));
 }catch{/* Storage can be disabled; the submitted enquiry is still valid. */}
}
export function savedReceipts(){if(typeof localStorage==='undefined')return [];try{return safeReceipts(JSON.parse(localStorage.getItem(RECEIPTS_KEY)||'[]'));}catch{return [];}}
