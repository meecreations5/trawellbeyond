/** V8.2 | Deterministic, CMS-grounded journey matching. No unverified prices or AI claims. */
import {PURPOSE_OPTIONS,canonicalPurpose} from './journey-plan.mjs';
export const ASSISTANT_PURPOSES=PURPOSE_OPTIONS.map(p=>p.label);
export const ASSISTANT_PACES=['Relaxed','Balanced','Active','Flexible'];
export const ASSISTANT_BUDGETS=['Need guidance','Value conscious','Comfort','Premium'];
export const ASSISTANT_INTERESTS=['Culture & heritage','Nature & wildlife','Food & local life','Beach & relaxation','Family moments','Adventure','Celebrations','City discoveries'];
const clean=(v,max=120)=>String(v??'').trim().slice(0,max);
const unique=x=>Array.from(new Set(x));
export const normalizeSlug=v=>clean(v,120).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function normalizeJourneyPreferences(input={}){
 const purpose=canonicalPurpose(input.purpose);
 return {
  purpose:ASSISTANT_PURPOSES.includes(purpose)?purpose:'',
  pace:ASSISTANT_PACES.includes(input.pace)?input.pace:'Flexible',
  budgetBand:ASSISTANT_BUDGETS.includes(input.budgetBand)?input.budgetBand:'Need guidance',
  days:Math.max(1,Math.min(30,Math.round(Number(input.days)||5))),
  travelers:clean(input.travelers,80),
  dates:clean(input.dates,80),
  budgetNote:clean(input.budgetNote,80),
  destination:clean(input.destination,100),
  interests:unique((Array.isArray(input.interests)?input.interests:[]).filter(x=>ASSISTANT_INTERESTS.includes(x))).slice(0,6),
  selectedJourneys:unique((Array.isArray(input.selectedJourneys)?input.selectedJourneys:[]).map(normalizeSlug).filter(Boolean)).slice(0,8)
 };
}
const interestTerms={
 'Culture & heritage':['culture','heritage','history','museum','tradition','temple','market'],
 'Nature & wildlife':['nature','wildlife','forest','zoo','garden','hill','safari'],
 'Food & local life':['food','cuisine','local','street','market','dining'],
 'Beach & relaxation':['beach','island','coast','relax','spa','seaside'],
 'Family moments':['family','children','kids','together','theme park','sentosa'],
 'Adventure':['adventure','hike','trek','explore','outdoor','water sport'],
 'Celebrations':['celebration','romance','honeymoon','anniversary','special'],
 'City discoveries':['city','skyline','urban','museum','walking','neighbourhood']
};
const searchable=record=>['title','summary','description','highlights','goodFor','bestFor','journeyGoodFor','journeyInterests','journeyStyle','travelFood','travelTransport'].map(k=>String(record?.[k]||'')).join(' ').toLowerCase();
const published=record=>record&&record.status==='published'&&!!record.title;
export function rankPublished(items=[],input={},type='destinations',max=4){
 const prefs=normalizeJourneyPreferences(input);
 const purpose=PURPOSE_OPTIONS.find(x=>x.label===prefs.purpose);
 return (Array.isArray(items)?items:[]).filter(published).map(item=>{
  const copy=searchable(item);
  let score=0;const reasons=[];
  if(prefs.destination&&normalizeSlug(item.slug||item.title)===normalizeSlug(prefs.destination)){score+=9;reasons.push('Your chosen destination');}
  if(purpose){const matches=purpose.terms.filter(word=>copy.includes(word));if(matches.length){score+=Math.min(6,matches.length*2);reasons.push(`Related to ${prefs.purpose.toLowerCase()}`);}}
  const interests=prefs.interests.filter(tag=>(interestTerms[tag]||[]).some(term=>copy.includes(term)));
  if(interests.length){score+=Math.min(12,interests.length*3);reasons.push(`Interests: ${interests.slice(0,2).join(', ')}`);}
  if(type==='journeys'&&prefs.days&&Number(item.days)>0){const delta=Math.abs(prefs.days-Number(item.days));if(delta<=1){score+=3;reasons.push('Similar to your preferred duration');}else if(delta<=3)score+=1;}
  if(type==='journeys'&&prefs.selectedJourneys.includes(normalizeSlug(item.slug||item.title))){score+=8;reasons.push('Saved to your shortlist');}
  return {item,score,reasons:unique(reasons)};
 }).sort((a,b)=>b.score-a.score||String(a.item.title).localeCompare(String(b.item.title))).slice(0,Math.max(1,Math.min(10,max)));
}
export function createLeadSummary(input={},selection={}){
 const prefs=normalizeJourneyPreferences(input);
 const destinations=(Array.isArray(selection.destinations)?selection.destinations:[]).map(x=>clean(x,100)).slice(0,6);
 const journeys=(Array.isArray(selection.journeys)?selection.journeys:[]).map(x=>clean(x,100)).slice(0,8);
 return [
  `Purpose: ${prefs.purpose||'Discuss with advisor'}`,
  `Destination: ${prefs.destination||destinations.join(', ')||'Open to suggestions'}`,
  `Travellers: ${prefs.travelers||'To be confirmed'}`,
  `Travel dates: ${prefs.dates||'Flexible'}`,
  `Preferred duration: ${prefs.days} days`,
  `Pace: ${prefs.pace}`,
  `Travel style: ${prefs.budgetBand}`,
  `Budget guidance: ${prefs.budgetNote||'Please advise'}`,
  `Interests: ${prefs.interests.join(', ')||'To discuss'}`,
  `Saved journeys: ${journeys.join(', ')||'None selected'}`,
  'Recommendations are planning ideas only. Pricing, availability and itinerary details require advisor confirmation.'
 ].join('\n').slice(0,1800);
}
export function safeDayRequest(value){return clean(value,300);}
export function formatDayRequests(entries=[]){
 return (Array.isArray(entries)?entries:[]).slice(0,20).map((x,i)=>({day:i+1,text:safeDayRequest(x)})).filter(x=>x.text).map(x=>`Day ${x.day}: ${x.text}`).join('\n').slice(0,1900);
}
