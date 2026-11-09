/** Browser-only visitor preferences. Never store contact details in localStorage. */
export const JOURNEY_TRAY_KEY='tb_journey_v73';
export const JOURNEY_DRAFT_KEY='tb_create_draft_v73';
const clean=(value,max=160)=>String(value??'').trim().slice(0,max);
const slug=value=>clean(value,120).toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-|-$/g,'');
const unique=(values,key)=>values.filter((item,index,all)=>all.findIndex(other=>other[key]===item[key])===index);
export function normalizeTray(input={}){
 const value=input && typeof input==='object'&&!Array.isArray(input)?input:{};
 const destinations=unique((Array.isArray(value.destinations)?value.destinations:[]).slice(0,12).map(x=>({slug:slug(x?.slug||x?.title),title:clean(x?.title)})).filter(x=>x.slug&&x.title),'slug').slice(0,6);
 const experiences=unique((Array.isArray(value.experiences)?value.experiences:[]).slice(0,40).map(x=>({slug:slug(x?.slug||x?.title),title:clean(x?.title),destinationSlug:slug(x?.destinationSlug)})).filter(x=>x.slug&&x.title),'slug').slice(0,25);
 return {version:1,destinations,experiences,purpose:clean(value.purpose,100)};
}
export function addToTray(input,type,item){
 const tray=normalizeTray(input);
 if(type==='purpose')return {...tray,purpose:clean(item,100)};
 if(!['destinations','experiences'].includes(type))return tray;
 return normalizeTray({...tray,[type]:[...tray[type],item]});
}
export function removeFromTray(input,type,itemSlug){
 const tray=normalizeTray(input);
 if(!['destinations','experiences'].includes(type))return tray;
 return {...tray,[type]:tray[type].filter(x=>x.slug!==slug(itemSlug))};
}
export function normalizePlan(plan,selected=[],days=4){
 const names=new Set(selected.map(x=>clean(x)));
 const max=Math.max(1,Math.min(31,Number(days)||4));
 const entries=Array.isArray(plan)?plan:[];
 const result=Array.from({length:max},()=>[]);
 for(const [index,day] of entries.entries()){
  if(index>=max||!Array.isArray(day))break;
  for(const item of day){const name=clean(item);if(names.has(name)&&!result.some(d=>d.includes(name)))result[index].push(name);}
 }
 return result;
}
export function assignPlanDay(plan,selected,days,title,dayIndex){
 const result=normalizePlan(plan,selected,days).map(day=>day.filter(x=>x!==title));
 if(Number.isInteger(dayIndex)&&dayIndex>=0&&dayIndex<result.length&&selected.includes(title))result[dayIndex].push(title);
 return result;
}
export function movePlanItem(plan,selected,days,dayIndex,itemIndex,change){
 const output=normalizePlan(plan,selected,days);
 const day=output[dayIndex];if(!day||!day[itemIndex]||![-1,1].includes(change))return output;
 const next=itemIndex+change;
 if(next<0||next>=day.length)return output;
 [day[itemIndex],day[next]]=[day[next],day[itemIndex]];
 return output;
}
export function itineraryNotes(plan){
 return (Array.isArray(plan)?plan:[]).map((day,i)=>`Day ${i+1}: ${Array.isArray(day)&&day.length?day.join(' → '):'Flexible / to be planned'}`).join('\n');
}
export const PURPOSE_OPTIONS=[
 {id:'together',label:'Togetherness',terms:['family','together','child','wildlife','zoo','sentosa','garden']},
 {id:'discover',label:'Discovery',terms:['heritage','culture','explor','museum','gallery','walking','neighbourhood','little india']},
 {id:'celebrate',label:'Celebration',terms:['couple','romantic','view','skyline','waterfront','dining','evening']},
 {id:'recharge',label:'Rest and renewal',terms:['nature','beach','garden','wellness','relax','slow','island']},
 {id:'meaning',label:'Meaningful journeys',terms:['heritage','culture','temple','faith','history','reflect','art']}
];
export function canonicalPurpose(input){
 const raw=clean(input,100).toLowerCase().replace(/[^a-z\s]/g,'').trim();
 if(!raw)return '';
 const p=PURPOSE_OPTIONS.find(x=>x.id===raw||x.label.toLowerCase()===raw);
 if(p)return p.label;
 if(/spend time together|family/.test(raw))return 'Togetherness';
 if(/discover|something new|explor/.test(raw))return 'Discovery';
 if(/celebrat|occasion/.test(raw))return 'Celebration';
 if(/recharg|relax|rest/.test(raw))return 'Rest and renewal';
 if(/meaning|faith|spiritual/.test(raw))return 'Meaningful journeys';
 return clean(input,100);
}
export function matchesPurpose(record,purpose){
 if(!purpose)return true;
 const item=PURPOSE_OPTIONS.find(x=>x.label===canonicalPurpose(purpose));
 if(!item)return true;
 const searchable=['title','summary','description','highlights','bestFor'].map(k=>String(record?.[k]||'')).join(' ').toLowerCase();
 return item.terms.some(term=>searchable.includes(term));
}
