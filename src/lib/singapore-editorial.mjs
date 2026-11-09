/** Singapore editorial facts: reviewed against operators' official sites, 8 November 2026.
 * Suggested durations are planning estimates, not operator guarantees.
 * Ticket prices, inclusions and transport are NEVER assumed.
 * Existing user-authored fields are preserved by fillSingaporeExperienceGaps().
 */
const standard={
 pickup:'Meet at the attraction; private transfers or SIC only when confirmed in your quotation.',
 dropoff:'Finish at the attraction; return transfers only when included in your quotation.',
 inclusions:'Only the admissions and services specifically confirmed in your personalized quotation.',
 exclusions:'Hotel transfers, meals, paid add-ons and express access unless your quotation includes them.',
 seasonalNotes:'Schedules, maintenance closures, weather and availability can change. Reconfirm for your exact travel date.',
 currency:'SGD'
};
const entry=(fields)=>({...standard,...fields});
export const SINGAPORE_EDITORIAL={
 'gardens-by-the-bay':entry({
  summary:'Step into Singapore’s extraordinary gardens, where sculptural Supertrees rise over tropical landscapes and spectacular conservatories invite you to explore nature differently.',
  description:'Gardens by the Bay brings a sense of wonder to Singapore’s waterfront. Begin among the towering Supertrees, wander outdoor garden paths and leave room to appreciate how the city puts nature at the heart of its skyline.\n\nAdd a visit to the Flower Dome or Cloud Forest for contrasting indoor landscapes, or choose the OCBC Skyway for an elevated perspective. These ticketed experiences have separate admission requirements and periodic maintenance closures.',
  highlights:'Supertree Grove and the outdoor gardens\nOptional Flower Dome and Cloud Forest\nOptional OCBC Skyway and Supertree Observatory\nEvening garden atmosphere and seasonal displays',
  duration:'Suggested 2–4 hours; longer with paid conservatories',
  openingHours:'Outdoor gardens: 5:00am–2:00am daily. Cloud Forest and Flower Dome: 9:00am–9:00pm; check closures.',
  bestFor:'Families, couples, first-time visitors, nature and architecture',
  ticketNotes:'Outdoor garden access and individual ticketed attractions differ. Confirm which conservatories, Skyway or Observatory are included before travel.',
  officialUrl:'https://www.gardensbythebay.com.sg/en/plan-your-visit/opening-hours.html'
 }),
 'marina-bay-waterfront':entry({
  summary:'Discover Singapore’s iconic waterfront through skyline panoramas, public promenades and unhurried moments beside Marina Bay.',
  description:'Marina Bay is a natural place to begin discovering Singapore. The waterfront joins bold contemporary architecture with open promenades, city lights and easy opportunities to pause for photographs.\n\nExplore at your own pace, stopping around the bay as the perspective changes. The promenade itself is not a ticketed attraction; optional observation decks, boat rides and nearby attractions may have separate admissions.',
  highlights:'Views across the Marina Bay skyline\nOutdoor waterfront promenade\nEvening city-light photography\nOptional surrounding attractions with separate tickets',
  duration:'Suggested 1–2 hours for a waterfront walk',
  openingHours:'Public outdoor waterfront areas are generally accessible; individual venues have separate schedules.',
  bestFor:'First-time visitors, couples, photographers and relaxed city walks',
  ticketNotes:'The public promenade is generally accessible without a ticket. Optional observation decks, cruises or attractions are quoted separately.',
  officialUrl:'https://www.visitsingapore.com/'
 }),
 'universal-studios-singapore':entry({
  summary:'Explore movie-inspired themed worlds, thrilling rides and family entertainment at Universal Studios Singapore on Sentosa.',
  description:'Make time for a lively theme-park day at Universal Studios Singapore. The park brings film-inspired worlds together through rides, interactive attractions and live entertainment, offering experiences for different age groups.\n\nPrioritize the zones and rides that suit your group. Attraction availability, height restrictions, queues and operating dates vary. Express access is an optional upgrade and should not be assumed part of a standard ticket.',
  highlights:'Immersive film-inspired themed zones\nThrill rides and family attractions\nEntertainment and park photo opportunities\nOptional Universal Express subject to ticket conditions',
  duration:'Suggested half to full day',
  openingHours:'Daily park hours vary by date; check the official calendar before travel.',
  bestFor:'Families, theme-park enthusiasts and groups',
  ticketNotes:'Admission, optional Express passes, special events and timed attractions have separate rules. Confirm the exact ticket category.',
  officialUrl:'https://www.rwsentosa.com/en/play/universal-studios-singapore'
 }),
 'singapore-zoo':entry({
  summary:'Explore rainforest-inspired habitats and open-concept wildlife environments at Singapore Zoo within Mandai Wildlife Reserve.',
  description:'Singapore Zoo invites visitors into a lush setting where wildlife habitats are designed for engaging, respectful viewing. Wander at a comfortable pace through different animal zones and make room for keeper talks or animal presentations where available.\n\nFamilies can spend several hours exploring the park, with rest and refreshment stops along the way. Some encounters, feeds and activities may require advance booking or separate payment.',
  highlights:'Open-concept wildlife habitats\nRainforest surroundings and walking trails\nFamily-friendly learning and wildlife encounters\nOptional talks, presentations and activities',
  duration:'Suggested 3–5 hours',
  openingHours:'Daily 8:30am–6:00pm; last entry 5:00pm.',
  bestFor:'Families, nature and wildlife explorers',
  ticketNotes:'Check timed presentations, feeding sessions and optional experiences. Some activities require separate purchase.',
  officialUrl:'https://www.mandai.com/en/singapore-zoo.html'
 }),
 'sentosa-island':entry({
  summary:'Shape your own Sentosa island day with beaches, coastal walks, entertainment and attractions chosen around your interests.',
  description:'Sentosa can be an easy beach day, an active day of attractions or something in between. Enjoy the coastline and open-air surroundings, then decide how much excitement to add.\n\nUniversal Studios Singapore, the cable car, evening shows and many other experiences are distinct attractions with separate tickets and operating hours. A Sentosa overview is not an all-inclusive attraction pass.',
  highlights:'Beach and coastal time\nChoice of entertainment and activities\nIsland scenery and relaxed moments\nOptional separately ticketed Sentosa attractions',
  duration:'Suggested half to full day',openingHours:'Island public spaces vary; each attraction sets its own opening hours.',
  bestFor:'Families, couples, beachgoers and active travellers',
  ticketNotes:'Sentosa access, island transport and paid attractions may involve separate charges. Specify chosen experiences in your enquiry.',
  officialUrl:'https://www.sentosa.com.sg/'
 }),
 'night-safari-singapore':entry({
  summary:'Discover nocturnal wildlife after sunset with trails and an adventure tram through Night Safari at Mandai.',
  description:'Night Safari reveals a quieter, more mysterious side of wildlife. Explore the park after dark, walking selected trails and taking the Safari Adventure Tram as animals become active in the evening.\n\nThis is a timed night experience. Comfortable shoes, a gentle pace and advance admission planning help make the visit more enjoyable. Tram and walking trail schedules begin later than the park entrance opening time.',
  highlights:'Safari Adventure Tram\nNocturnal walking trails\nWildlife viewing after dark\nOptional timed presentations subject to availability',
  duration:'Suggested 2–3 hours',openingHours:'Daily 6:00pm–12:00am; last entry 11:15pm. Tram and trails begin 7:00pm.',
  bestFor:'Families, wildlife enthusiasts and evening explorers',
  ticketNotes:'Check dated admission, optional seat reservations and presentation availability. Transfers are not automatic.',
  officialUrl:'https://www.mandai.com/en/night-safari.html'
 }),
 'bird-paradise':entry({
  summary:'Move through immersive aviaries and discover colourful birdlife from different habitats at Bird Paradise, Mandai.',
  description:'Bird Paradise brings global bird habitats together in large walk-through aviaries. Visit at a relaxed pace to appreciate tropical landscapes, observe birds up close and discover the diversity of species across different zones.\n\nThe park is especially rewarding for families and nature lovers. Check the latest animal presentation times and in-park shuttle details when planning your visit.',
  highlights:'Large thematic walk-through aviaries\nBirds from diverse regions and ecosystems\nFamily-friendly learning and photography\nPresentations and in-park transport where available',
  duration:'Suggested 3–4 hours',openingHours:'Daily 9:00am–6:00pm; last entry 5:00pm.',
  bestFor:'Families, birdwatchers and nature lovers',
  ticketNotes:'Admission and optional sessions are confirmed separately; some programs may have limited availability.',
  officialUrl:'https://www.mandai.com/en/bird-paradise.html'
 }),
 'jewel-changi-airport':entry({
  summary:'Discover Jewel Changi Airport’s indoor landscapes, dramatic Rain Vortex and optional leisure attractions before or after a flight.',
  description:'Jewel Changi Airport is more than a stop between flights. Its central Rain Vortex and surrounding Forest Valley bring greenery and architecture together, with multiple vantage points and shopping and dining nearby.\n\nBuild a flexible stop around arrival or departure, allowing time for luggage, airport transfers and terminal formalities. Canopy Park and certain leisure activities require separate tickets.',
  highlights:'Rain Vortex and Forest Valley\nIndoor architecture and garden viewpoints\nOptional Canopy Park\nDining and exploration around flight schedules',
  duration:'Suggested 1–3 hours; longer with paid attractions',openingHours:'Rain Vortex: generally 10:00am–10:00pm daily; temporary shutdowns possible.',
  bestFor:'Families, airport stopovers and architecture enthusiasts',
  ticketNotes:'Main public Jewel areas and ticketed attractions differ. Verify flight timing and any Rain Vortex closure advisories.',
  officialUrl:'https://www.jewelchangiairport.com/en/attractions/rain-vortex.html'
 }),
 'little-india-walk':entry({
  summary:'Explore Singapore’s Little India through colourful streets, shops, temples, food and vibrant everyday neighbourhood life.',
  description:'Little India is best discovered on foot. Follow the lively streets past heritage buildings, flower garlands, spice shops, markets and places of worship, noticing how old traditions and contemporary city life meet.\n\nA guided experience can add context, but visitors can also enjoy an independent wander. Respect worship spaces and local customs, and check opening hours if you plan to enter specific museums or venues.',
  highlights:'Serangoon Road and colourful shophouses\nMarkets, spices, flowers and local food\nHeritage and temple exteriors\nOptional guided cultural walk',
  duration:'Suggested 1–2 hours',openingHours:'Public streets are accessible throughout the day; individual shops and temples vary.',
  pickup:'Self-guided neighbourhood visit; optional guide or transfers only if quoted.',
  bestFor:'Culture, local food, architecture and first-time visitors',
  ticketNotes:'Independent public-street exploration requires no attraction ticket; guided experiences, museums and transport are separate.',
  officialUrl:'https://www.visitsingapore.com/neighbourhood/featured-neighbourhood/little-india/'
 }),
 'singapore-flyer':entry({
  summary:'Take in a sweeping city panorama from Singapore Flyer, with views across the bay and surrounding skyline.',
  description:'Singapore Flyer offers a calm way to appreciate Singapore from above. As the observation wheel rises, views stretch across the waterfront and city, helping you understand the scale and setting of the destination.\n\nPlan the visit around the light you enjoy most. Admission categories and premium experiences vary, and the operator may amend schedules or access conditions.',
  highlights:'Elevated city and waterfront views\nObservation wheel capsule ride\nPhotography of Singapore landmarks\nOptional premium experiences subject to ticket category',
  duration:'Suggested 45–75 minutes including arrival',openingHours:'Daily 10:00am–10:00pm; last admission 9:30pm.',
  bestFor:'Couples, families, first-time visitors and photographers',
  ticketNotes:'Standard admission and premium products are separate; confirm chosen ticket type.',
  officialUrl:'https://www.singaporeflyer.com/public/en/plan-your-visit'
 }),
 'river-wonders':entry({
  summary:'Explore river-inspired wildlife habitats and freshwater ecosystems at River Wonders within Mandai Wildlife Reserve.',
  description:'River Wonders follows the world of rivers through immersive wildlife habitats and aquatic displays. Discover fascinating freshwater creatures and animals associated with river systems, with opportunities to learn how waterways sustain life.\n\nThe visit can be combined with another Mandai park when the pace suits your group, but admissions are not automatically bundled.',
  highlights:'River and freshwater wildlife habitats\nGiant panda and other animal encounters\nAquatic life and conservation stories\nFamily-friendly exploration',
  duration:'Suggested 2–3 hours',openingHours:'Daily 9:00am–6:00pm; last entry 5:00pm.',
  bestFor:'Families, wildlife and nature enthusiasts',
  ticketNotes:'Check separate admissions for other Mandai parks and optional experiences.',
  officialUrl:'https://www.mandai.com/en/river-wonders.html'
 }),
 'sentosa-cable-car':entry({
  summary:'Enjoy elevated views along the Singapore Cable Car routes connecting Mount Faber, HarbourFront and Sentosa.',
  description:'The Singapore Cable Car makes the journey part of the experience, with elevated perspectives on the harbour, city and Sentosa greenery. Choose the Mount Faber Line, Sentosa Line or a combined option depending on your route.\n\nDifferent ticket types cover different lines and return journeys. Make sure the chosen product matches the itinerary before booking.',
  highlights:'Panoramic harbour and island views\nMount Faber and Sentosa perspectives\nScenic journey between cable-car stations\nDifferent line and return options',
  duration:'Suggested 45–90 minutes depending on route',openingHours:'Daily 8:45am–10:00pm; last boarding 9:30pm.',
  bestFor:'Couples, families and scenic city explorers',
  ticketNotes:'Mount Faber and Sentosa line products differ. Check the exact number of rides and ticket validity.',
  officialUrl:'https://www.sentosa.com.sg/en/things-to-do/attractions/singapore-cable-car'
 }),
 'wings-of-time':entry({
  summary:'End a Sentosa evening with the open-air Wings of Time fireworks, water and light performance.',
  description:'Wings of Time Fireworks Symphony brings together music, projections and water effects in an outdoor seaside setting. The show is a memorable way to close a Sentosa day, especially for groups wanting an evening highlight.\n\nChoose a suitable performance session and allow time to reach the venue. Weather, seating category and operational conditions may affect the experience.',
  highlights:'Open-air evening performance\nWater, lighting and projection effects\nMusic and seaside setting\nTicketed show with timed sessions',
  duration:'Show approximately 20 minutes; allow extra time for access',openingHours:'Evening sessions advertised around 7:40pm and 8:40pm; verify for your date.',
  bestFor:'Families, couples and celebration journeys',
  ticketNotes:'Show tickets have session and seat categories. Effects may change with weather and operations.',
  officialUrl:'https://www.sentosa.com.sg/en/things-to-do/attractions/wings-of-time/'
 }),
 'jewel-changi-rain-vortex':entry({
  summary:'See Jewel Changi Airport’s dramatic indoor Rain Vortex, framed by tropical planting and soaring architecture.',
  description:'The Rain Vortex is the memorable centrepiece of Jewel Changi. Water cascades into the indoor garden landscape while the surrounding viewpoints offer constantly changing perspectives.\n\nDaylight makes the space feel bright and lush; evening light-and-music presentations offer another atmosphere. Check temporary closures, especially when your stop is tied to a flight.',
  highlights:'Dramatic indoor waterfall\nForest Valley viewpoints\nOptional evening light-and-music show\nConvenient airport-linked visit',
  duration:'Suggested 30–60 minutes',openingHours:'Generally daily 10:00am–10:00pm; check temporary shutdown advisories.',
  bestFor:'Families, architecture, nature and airport stopovers',
  ticketNotes:'Rain Vortex viewing and paid attractions such as Canopy Park have different admission requirements.',
  officialUrl:'https://www.jewelchangiairport.com/en/attractions/rain-vortex.html'
 }),
 'canopy-park-at-jewel':entry({
  summary:'Add playful garden discoveries and leisure time to a visit to Jewel Changi’s top-level Canopy Park.',
  description:'Located on Level 5 at Jewel, Canopy Park combines landscaped gardens with family-friendly play features. Wander through green spaces, take in the atmosphere under the vast glass roof and enjoy the included park features.\n\nSome nearby attractions, such as nets and mazes, may be separately ticketed. Match the option to the ages and interests of your travel group.',
  highlights:'Discovery Slides and Foggy Bowls\nPetal Garden and Topiary Walk\nIndoor greenery and family time\nOptional nearby paid attractions',
  duration:'Suggested 45–90 minutes',openingHours:'Mon–Thu 10:00am–9:00pm; Fri–Sun, public holidays/eves 10:00am–10:00pm.',
  bestFor:'Families, children and short leisure stops',
  ticketNotes:'Canopy Park admission covers defined features; some Jewel attractions require separate tickets.',
  officialUrl:'https://www.jewelchangiairport.com/en/attractions/canopy-park.html'
 }),
 'national-gallery-singapore':entry({
  summary:'Explore Southeast Asian art and Singapore’s civic heritage at National Gallery Singapore.',
  description:'National Gallery Singapore brings together art and architecture in two historic civic buildings. Discover Southeast Asian collections, exhibitions and thoughtful spaces that invite you to see the region through new perspectives.\n\nAllow time to explore at your own pace, and check current gallery closures and exhibitions before planning. The Gallery advises that some exhibition spaces may be temporarily unavailable.',
  highlights:'Southeast Asian art and heritage\nHistoric civic architecture\nPermanent and changing exhibitions\nOptional tours and programmes',
  duration:'Suggested 2–3 hours',openingHours:'Daily 10:00am–7:00pm; last admission 6:30pm.',
  bestFor:'Art lovers, culture seekers and curious travellers',
  ticketNotes:'General admission, special exhibitions and tours may have different requirements. Verify temporary closure notices.',
  officialUrl:'https://www.nationalgallery.sg/sg/en/visit/visitor-information.html'
 })
};
export const SINGAPORE_PHOTO_SEARCH={
 'marina-bay-waterfront':'Singapore Marina Bay waterfront skyline promenade Merlion',
 'gardens-by-the-bay':'Singapore Supertree Grove Gardens by the Bay',
 'universal-studios-singapore':'Universal Studios Singapore Sentosa entrance globe',
 'singapore-zoo':'Singapore Zoo animal habitat Mandai',
 'sentosa-island':'Singapore Sentosa Palawan beach',
 'night-safari-singapore':'Singapore Night Safari entrance Mandai',
 'bird-paradise':'Bird Paradise Mandai Singapore aviary',
 'jewel-changi-airport':'Jewel Changi Rain Vortex',
 'little-india-walk':'Singapore Little India Serangoon Road shophouses',
 'singapore-flyer':'Singapore Flyer observation wheel',
 'river-wonders':'Singapore River Wonders Mandai wildlife park',
 'sentosa-cable-car':'Singapore cable car Mount Faber Sentosa',
 'wings-of-time':'Sentosa Wings of Time performance show',
 'jewel-changi-rain-vortex':'Jewel Changi Rain Vortex waterfall',
 'canopy-park-at-jewel':'Jewel Changi Canopy Park Discovery Slides',
 'national-gallery-singapore':'National Gallery Singapore Supreme Court city hall'
};
const OLD_STUB_HIGHLIGHTS={
 'canopy-park-at-jewel':'Explore the upper-level leisure attractions at Jewel Changi, with garden spaces and selected play features\nSome attractions require separate admissions and have their own access or age conditions.',
 'national-gallery-singapore':'Explore Southeast Asian art and heritage in a major gallery housed across two landmark civic buildings\nExhibitions, guided programmes and admission categories vary by date.'
};
/** Non-destructive: fills only genuinely blank fields, and replaces a description only
 * when it is exactly the existing one-line summary. Never changes status/photos/user copy. */
export function fillSingaporeExperienceGaps(record){
 if(!record||record.destinationSlug!=='singapore'||!SINGAPORE_EDITORIAL[record.slug])return {record,added:[]};
 const enriched=SINGAPORE_EDITORIAL[record.slug],output={...record},added=[];
 for(const [key,value] of Object.entries(enriched)){
  const existing=String(record[key]??'').trim();
  const replaceGenericDescription=key==='description'&&existing===String(record.summary||'').trim();
  const replaceLegacySummary=key==='summary'&&existing&&String(record.description||'').trim()===existing;
  const replaceLegacyHighlights=key==='highlights'&&existing===OLD_STUB_HIGHLIGHTS[record.slug];
  if(!existing||replaceGenericDescription||replaceLegacySummary||replaceLegacyHighlights){output[key]=value;added.push(key);}
 }
 return {record:output,added};
}
