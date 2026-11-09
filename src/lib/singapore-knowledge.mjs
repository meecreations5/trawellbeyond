/** Singapore official-source starter guidance, reviewed 2026-11-09.
 * Never overwrite authored content. Review variable details before publishing.
 */
const reviewed='2026-11-09';
const googleMaps=q=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);
export const SINGAPORE_TRAVEL_GUIDE={
 travelLanguages:'English is widely used. Malay, Mandarin and Tamil are also official languages; you may hear Singlish in everyday conversation.',
 travelCurrency:'Singapore dollar (SGD). Cards are widely accepted; some smaller food stalls may prefer local payment methods or cash.',
 travelTimeZone:'Singapore Standard Time (UTC+8), 2 hours 30 minutes ahead of India Standard Time (UTC+5:30).',
 travelWeather:'Tropical and humid throughout the year, with rain possible in any season. Pack light clothing, comfortable shoes, an umbrella and water.',
 travelTransport:'MRT trains and public buses connect most visitor areas. Contactless bank cards and mobile wallets are supported; use the same card or device for tap-in and tap-out. Check applicable foreign-card fees and the LTA journey planner.',
 travelFood:'Explore hawker-centre culture and neighbourhood dining in Little India, Chinatown, Kampong Gelam and Marina Bay. For vegetarian, Jain-friendly, halal or allergy needs, confirm ingredients and preparation with each venue; certification may vary.',
 travelStay:'Consider Marina Bay or the Civic District for central sightseeing, Bugis and Little India for neighbourhood access, Orchard for shopping, or Sentosa for an island-focused stay. Choose a hotel area around your actual itinerary.',
 travelEntry:'Check Singapore ICA for passport and nationality-specific entry rules. The SG Arrival Card is not a visa and is generally submitted within three days (including arrival day) before arrival; exemptions apply. Use the official free service.',
 travelEssentials:'Singapore uses Type G three-square-pin power plugs, 220-240 V. Tap water is generally safe to drink. Local emergencies: Police 999; Fire/Ambulance 995. Recheck official guidance before travelling.',
 travelGuideUrl:'https://www.visitsingapore.com/travel-tips/essential-travel-information/',
 travelTransportUrl:'https://www.lta.gov.sg/content/ltagov/en/getting_around/public_transport/plan_your_journey.html',
 travelEntryUrl:'https://www.ica.gov.sg/enter-transit-depart/entering-singapore/sg-arrival-card',
 travelVerifiedOn:reviewed,
 videoUrl:'https://www.youtube.com/watch?v=Idjvkpp5OlM',
 videoTitle:'Sightseeing. Made in Singapore.',
 videoCredit:'VisitSingapore (official Singapore Tourism Board channel)'
};
const mandaiVisit='https://www.mandai.com/en/plan-your-visit/getting-to-and-around/getting-to-mandai-wildlife-reserve.html';
export const SINGAPORE_VISITOR_GUIDES={
 'gardens-by-the-bay':{
  locationAddress:'Gardens by the Bay, Marina Gardens Drive, Singapore.',
  nearestTransit:'Bayfront MRT (CE1/DT16), Exit B; or Gardens by the Bay MRT (TE22), Exit 1.',
  gettingThere:'From Bayfront, follow the underground linkway and cross Dragonfly Bridge or Meadow Bridge. Alternatively use Gardens by the Bay MRT Exit 1.',
  accessibilityNotes:'Wheelchair rental and an internal shuttle are available under operator conditions. Check the official accessibility and amenities pages for your needs.',
  visitorTips:'Outdoor gardens, paid conservatories and elevated viewpoints have different opening and ticket rules. Check scheduled maintenance and show timings.',
  mapUrl:googleMaps('Gardens by the Bay Singapore'),
  visitSourceUrl:'https://www.gardensbythebay.com.sg/en/plan-your-visit/getting-here.html',
  visitVerifiedOn:reviewed,
  videoUrl:'https://www.youtube.com/watch?v=vNFly4xvAXo',
  videoTitle:'Gardens by the Bay - Singapore in a Minute',
  videoCredit:'VisitSingapore (official Singapore Tourism Board channel)'
 },
 'marina-bay-waterfront':{
  locationAddress:'Marina Bay waterfront promenades, central Singapore (multiple access points).',
  nearestTransit:'Varies by starting point; use the official LTA journey planner to choose the nearest station.',
  gettingThere:'Plan the walk around your preferred viewpoint or nearby attraction. Marina Bay is a broad waterfront area, not a single ticketed entrance.',
  visitorTips:'Outdoor promenade areas generally do not need an attraction ticket. Observation decks, cruises and indoor attractions may have separate admission and schedules.',
  mapUrl:googleMaps('Marina Bay waterfront Singapore'),
  visitSourceUrl:'https://www.visitsingapore.com/',
  visitVerifiedOn:reviewed
 },
 'universal-studios-singapore':{
  locationAddress:'Universal Studios Singapore, 30 Sentosa Gateway, Singapore 098140.',
  nearestTransit:'HarbourFront MRT, then Sentosa Express from VivoCity to Resorts World Station.',
  gettingThere:'From HarbourFront, follow signs to VivoCity Level 3 and take Sentosa Express. Other options include designated buses, taxis or the Sentosa Boardwalk.',
  accessibilityNotes:'Ride height, health and accessibility restrictions differ by attraction. Review the official park advisory and accessibility information before choosing rides.',
  visitorTips:'Park hours, maintenance, special events and Universal Express options can change. Confirm entry dates and which products are included in the quotation.',
  mapUrl:googleMaps('Universal Studios Singapore Sentosa'),
  visitSourceUrl:'https://www.rwsentosa.com/en/about/getting-here',
  visitVerifiedOn:reviewed
 },
 'singapore-zoo':{
  locationAddress:'Singapore Zoo, Mandai Wildlife EAST, 80 Mandai Lake Road, Singapore 729826.',
  nearestTransit:'Khatib MRT then Mandai M2 shuttle; other options include bus 138 or 927 from specified MRT connections.',
  gettingThere:'Follow the official Mandai transport guide for current bus boarding points, shuttle schedules and taxi drop-off arrangements.',
  accessibilityNotes:'Mandai publishes a detailed zoo access guide and offers wheelchairs and suitable tram facilities. Confirm availability directly for your visit.',
  visitorTips:'Allow comfortable walking time, hydration and breaks. Check animal presentation schedules and optional paid encounters.',
  mapUrl:googleMaps('Singapore Zoo Mandai'),
  visitSourceUrl:mandaiVisit,
  visitVerifiedOn:reviewed,
  videoUrl:'https://www.youtube.com/watch?v=xl2R6MvMwjM',
  videoTitle:'Singapore Zoo - Singapore in a Minute',
  videoCredit:'VisitSingapore (official Singapore Tourism Board channel)'
 }
};
export function fillMissingKnowledge(current,defaults){
 const record={...current};const added=[];
 for(const [key,value] of Object.entries(defaults||{})){
  if(value!==undefined&&value!==null&&!String(record[key]??'').trim()){
   record[key]=String(value);added.push(key);
  }
 }
 return {record,added};
}
