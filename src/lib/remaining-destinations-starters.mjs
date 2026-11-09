/** V7.9: 17 destinations, 102 experiences, 34 journeys. All are private draft
 * suggestions. Images/videos/rates/schedules are deliberately NOT invented.
 */
import {REMAINING_DESTINATIONS_DATA} from './remaining-destinations-data.mjs';
import {slugify} from './content.mjs';

const lines=a=>a.join('\n');
const suitable={Skyline:'City lovers and architecture enthusiasts',Culture:'Cultural explorers and families',History:'Heritage and architecture enthusiasts',Heritage:'Culture lovers and curious travellers',Nature:'Nature seekers and families',Coast:'Couples, families and coastal explorers',Wildlife:'Nature and wildlife enthusiasts',Adventure:'Active travellers, subject to suitability',Food:'Food and culture lovers',City:'First-time visitors and urban explorers'};
const storyHeadlines=['The stories that\n*shape a place.*','Find moments\n*worth slowing for.*','A journey\n*made around you.*'];
const commonTripNotes=['Every hotel and intercity transfer is customized to your final plan.','Schedules, accessibility, admission, road and weather conditions must be reconfirmed before quotation.','All selected arrangements and prices are confirmed only in your written proposal.'];
export const REMAINING_DESTINATION_SLUGS=REMAINING_DESTINATIONS_DATA.map(d=>d.slug);

function destinationRecord(d){
 const [storyBody1,storyBody2,storyBody3]=d.story;
 const [first,second,third]=d.places;
 const slugs=d.places.map(x=>slugify(x.title));
 return {
  type:'destinations',slug:d.slug,title:d.title,region:d.region,featured:false,
  summary:d.summary,
  description:`${d.summary}\n\n${storyBody1}. ${storyBody2}. ${storyBody3}. We begin with the people travelling, the purpose behind their journey and the moments they want to experience. Our specialists then create a route that suits their time and priorities.`,
  goodFor:'First-time visitors, couples, families and curious explorers',
  journeyStyle:lines(d.places.slice(0,4).map(x=>x.theme)),
  storyTitle1:storyHeadlines[0],storyBody1,
  storyTitle2:storyHeadlines[1],storyBody2,
  storyTitle3:storyHeadlines[2],storyBody3,
  purposeFirst:`Start with ${first.title} and thoughtfully chosen local highlights | ${first.theme}, ${second.theme}`,
  purposeFamily:`Enjoy ${second.title} and a flexible family-friendly pace | Family, Comfort`,
  purposeCouple:`Make time for ${third.title} and shared moments | Couple, Relaxed`,
  purposeExplorer:`Discover local traditions and less hurried corners of ${d.title} | Explorer, Culture, Discovery`,
  featuredExperienceSlugs:lines(slugs),
  featuredJourneySlug:slugify(d.routes[0].title),
  highlights:lines(d.places.map(x=>x.title)),
  faqs:lines([
   `Can the journey be customized? | Yes. Every itinerary is an enquiry-led starting point and is adapted around your group, dates and interests.`,
   `Are operating hours and admissions included? | Not automatically. We confirm exactly what is included in your individual quote.`,
   `Can we choose hotels, meals and transfers? | Yes. Share your preferences and we will design a suitable plan.`,
   `Is travel information current? | Treat destination guidance as a planning reference. Entry rules, access and schedules need reconfirmation before travel.`]),
  travelLanguages:d.guide.languages,travelCurrency:d.guide.currency,travelTimeZone:d.guide.time,
  travelWeather:d.guide.weather,travelTransport:d.guide.transport,travelFood:d.guide.food,
  travelStay:d.guide.stay,travelEntry:d.guide.entry,travelEssentials:d.guide.essentials,
  travelGuideUrl:d.source,
  // travelVerifiedOn remains blank until an editor checks current official data.
 };
}
function experienceRecord(d,place){
 const slug=slugify(place.title);
 const noteByTheme={
  Culture:'Respect local customs and any active place-of-worship rules.',History:'Allow time to appreciate historical context, walking routes and site conservation rules.',Heritage:'Explore at a comfortable pace and respect residents and local community spaces.',Nature:'Choose a weather-appropriate route and follow local safety guidance.',Coast:'Sea and beach conditions change; use approved operators for paid activities.',Wildlife:'Use regulated nature operators; animal sightings are never guaranteed.',Adventure:'Check weather, accessibility, age and operator safety requirements before selecting.',Food:'Check food hygiene and dietary suitability for your group.',Skyline:'Observation areas and timed-entry tickets may require advance booking.',City:'Consider traffic, transfers and realistic walking distances.'};
 const context=noteByTheme[place.theme]||'Confirm the local route and activity conditions.';
 return {
  type:'experiences',slug,title:place.title,destinationSlug:d.slug,featured:false,
  summary:place.summary,
  description:`${place.summary}\n\nWe can help shape this visit around your interests, preferred pace and who is travelling with you. ${context} The exact route, admission arrangements and any transfers are selected with you before confirmation.`,
  highlights:lines([place.theme+' discovery',place.title,`A flexible visit around your group's pace`,'Local context and practical planning']),
  bestFor:suitable[place.theme]||'Families, couples and cultural explorers',
  duration:'Suggested visit length varies by route; confirm in your itinerary',
  openingHours:'Check the current operator or monument calendar for your travel date.',
  ticketNotes:'Admission, ticket type and availability are NOT included unless specified in your personal quotation. The source link is a destination-tourism reference, not necessarily a ticketing provider.',
  pickup:'No hotel pickup is assumed. Only confirmed transfers appear in the final quotation.',
  dropoff:'Return transfer is not included unless stated in the final quotation.',
  inclusions:'Custom planning consultation; confirmed admissions and services will be itemized in your quote.',
  exclusions:'Any unconfirmed entry fee, meal, transfer, optional activity or personal expenditure.',
  seasonalNotes:`${context} Confirm operator access and weather for the actual date.`,
  officialUrl:d.source,visitSourceUrl:d.source,
  gettingThere:'Local transfer, public transport or guided access to be confirmed once the exact route and hotel are selected.',
  visitorTips:context,
  // Exact address, video, maps and verification date intentionally left for expert review.
 };
}
function journeyRecord(d,r,idx){
 const days=r.days,nights=days-1;
 const linesOfItinerary=r.plan.map((text,i)=>`Day ${i+1}: ${text.split(' ').slice(0,5).join(' ').replace(/[.,;:]$/,'')} | ${text} | ${i===0?'Arrival, Orientation':i===days-1?'Departure, Flexibility':'Explore, Personalize'}`);
 const interests=d.places.slice(idx?2:0,idx?6:4).map(x=>x.title);
 const best=d.places.slice(0,4).map(x=>x.title);
 return {
  type:'journeys',slug:slugify(r.title),title:r.title,destinationSlug:d.slug,days:String(days),nights:String(nights),featured:false,
  summary:r.intro,
  description:`${r.intro}\n\n${d.summary} This journey is a flexible starting point, not a fixed-price tour. The actual schedule and regional transfers are created around your confirmed travel dates, group and preferences.`,
  journeyStoryTitle:'A different way\n*to make it yours.*',journeyGoodFor:r.goodfor,
  journeyInterests:lines(interests),highlights:lines(best),itinerary:lines(linesOfItinerary),
  includedNotes:lines(['Personally curated day-wise itinerary','Experience and accommodation suggestions','Enquiry and quotation consultation']),
  toConfirmNotes:lines(commonTripNotes),
  // Day N photos stay blank until licensed real photos for each day are available.
 };
}
export const REMAINING_STARTERS=REMAINING_DESTINATIONS_DATA.flatMap(d=>[
 destinationRecord(d),
 ...d.places.map(p=>experienceRecord(d,p)),
 ...d.routes.map((r,i)=>journeyRecord(d,r,i))
]);
export const REMAINING_COUNTS={destinations:REMAINING_DESTINATIONS_DATA.length,experiences:REMAINING_DESTINATIONS_DATA.reduce((n,d)=>n+d.places.length,0),journeys:REMAINING_DESTINATIONS_DATA.reduce((n,d)=>n+d.routes.length,0),total:REMAINING_STARTERS.length};
export const MEDIA_SEARCH_PLAN=REMAINING_DESTINATIONS_DATA.map(d=>({destinationSlug:d.slug,coverSearch:`${d.places[0].title} ${d.title} Wikimedia Commons`,storySearches:d.places.slice(1,4).map(p=>`${p.title} ${d.title} Wikimedia Commons`),gallerySearches:d.places.slice(4).map(p=>`${p.title} ${d.title} Wikimedia Commons`)}));
