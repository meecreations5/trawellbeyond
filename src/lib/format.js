export function excerpt(value,n=150){const text=String(value||'');return text.length>n?text.slice(0,n).trimEnd()+'…':text;}
export function lines(value){return String(value||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);}
export function currency(value,code='INR'){
 const number=Number(value);
 if(!Number.isFinite(number)||number<=0)return '';
 try{return new Intl.NumberFormat('en-IN',{style:'currency',currency:code||'INR',maximumFractionDigits:0}).format(number);}
 catch{return `${number.toLocaleString('en-IN')} ${code}`;}
}
