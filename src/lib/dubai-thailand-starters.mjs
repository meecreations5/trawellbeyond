/** Dubai + Thailand expansion for the Singapore V7.7 master CMS.
 * Every imported record is a private Draft. Hero photos require licence
 * verification and Storage import, no ticket / price is guaranteed.
 */
import {EXPANSION_MASTER} from './dubai-thailand-master.mjs';
import {EXPANSION_TRAVEL_GUIDES,EXPANSION_VISITOR_GUIDES} from './dubai-thailand-knowledge.mjs';
const lines=(...items)=>items.join('\n');
const standard=region=>({
 currency:region==='dubai'?'AED':'THB',
 pickup:'Attraction meeting point unless a hotel/private/SIC transfer is explicitly confirmed in the quotation.',
 dropoff:'End at the attraction or operator meeting point; return transfer only if confirmed in the quotation.',
 inclusions:'Only admissions and services clearly confirmed in the personalized quotation.',
 exclusions:'Unlisted transport, meals, express options, experiences and personal expenses.',
 seasonalNotes:'Availability, admission conditions, weather and operating arrangements can change. Reconfirm with the official operator for the travel date.'
});
const guides=(slug)=>EXPANSION_VISITOR_GUIDES[slug]||{};
const starterFromMaster=row=>({
 type:'experiences',slug:row.slug,title:row.title,destinationSlug:row.destinationSlug,
 summary:row.summary,description:row.description,
 highlights:String(row.highlights||'').split(' • ').join('\n'),
 duration:`Suggested ${row.suggestedMinutes>=60?`${Math.round(row.suggestedMinutes/60*10)/10} hours`:`${row.suggestedMinutes} minutes`}; final duration depends on the chosen visit`,
 openingHours:row.openingHoursReference||'Refer to official operator schedule before travel',
 ticketNotes:[row.ticketReference,row.operationalNotes,'Ticket category, date-specific price and admission must be confirmed before quotation.'].filter(Boolean).join(' '),
 bestFor:row.tags||row.category,
 officialUrl:row.officialUrl,
 ...standard(row.destinationSlug),
 ...guides(row.slug),
 ...(row.slug==='burj-khalifa-observation-deck'?{videoUrl:'https://www.youtube.com/watch?v=enVn-8GKu6c',videoTitle:"Burj Khalifa: A Day Inside the World’s Tallest Building",videoCredit:'Visit Dubai (official channel)'}:{}),
 ...(row.slug==='dubai-miracle-garden'?{
  openingHours:'Season 15: 8 Oct 2026–31 May 2027. 9:00 AM–9:00 PM daily; last entry 8:30 PM. Recheck before visiting.',
  seasonalNotes:'Seasonal floral garden; closed each summer. Holiday/event hours and displays may vary; confirm official calendar for travel dates.',
  visitSourceUrl:'https://dubaimiraclegarden.com/faq',visitVerifiedOn:'2026-11-09'
 }:{}),
 ...(row.slug==='global-village-dubai'?{
  openingHours:'Season 31: 14 Oct 2026–May 2027. Sun–Wed 4 PM–12 AM; Thu–Sat/holidays 4 PM–1 AM. Recheck dates.',
  seasonalNotes:'Tuesdays are generally for families, couples and ladies except public holidays; some rides/shows charge separately.',
  visitSourceUrl:'https://www.globalvillage.ae/en/plan-your-visit',visitVerifiedOn:'2026-11-09'
 }:{}),
 featured:false
 });
const extra=(slug,title,destinationSlug,summary,description,highlights,options={})=>({
 type:'experiences',slug,title,destinationSlug,summary,description,
 highlights:lines(...highlights), ...standard(destinationSlug), ...guides(slug),
 duration:options.duration||'Suggested 2–3 hours; confirm with operator',
 openingHours:options.openingHours||'Verify official schedule and availability for your dates',
 bestFor:options.bestFor||'Families, couples and curious travellers',
 ticketNotes:options.ticketNotes||'Admission, sessions and any activity charges are subject to date and operator confirmation.',
 officialUrl:options.officialUrl||guides(slug).visitSourceUrl||'',featured:false
});
const extraExperiences=[
 extra('museum-of-the-future','Museum of the Future','dubai',
  'Step into a landmark building dedicated to imagining the future of science, culture and society.',
  'Dubai’s Museum of the Future is as memorable for its striking architecture as for the experiences inside. Explore thought-provoking displays around technology, human possibility and the ways our world may change. Choose a timed entry that allows space to enjoy the experience without rushing.',
  ['Iconic torus-shaped architecture','Immersive future-focused exhibits','Thought-provoking design and storytelling','Timed entry'],
  {duration:'Suggested 2–3 hours once reopened',openingHours:'TEMPORARILY CLOSED since September 2026; reopening planned Q1 2027. See official updates.',ticketNotes:'Do not sell or promise admission while closed. Reopening is expected Q1 2027; confirm actual opening and ticket releases with the operator.',bestFor:'Design lovers, families, curious explorers',officialUrl:'https://museumofthefuture.ae/'}),
 extra('dubai-city-highlights','Dubai City Highlights','dubai',
  'Discover contrasting sides of Dubai, from historic creekside neighbourhoods to modern landmarks.',
  'No single sightseeing route tells Dubai’s whole story. A well-planned introduction can connect traditional souks, waterfront neighbourhoods and distinctive modern architecture, with stops selected around your interests and available time. Share what matters most and we will tailor the route.',
  ['Historic Dubai and Creek districts','Modern skyline and landmark photo stops','Optional cultural market discoveries','Customisable half- or full-day tour'],
  {duration:'Suggested 4–6 hours',bestFor:'First-time visitors, families, culture',officialUrl:'https://www.visitdubai.com/en/places-to-visit'}),
 extra('dubai-dolphinarium','Dubai Dolphinarium','dubai',
  'Enjoy a family-oriented indoor marine-animal presentation at Dubai Dolphinarium, subject to its current performance calendar.',
  'Dubai Dolphinarium hosts scheduled indoor presentations and family entertainment. The precise performance, duration, seating and additional experiences depend on the ticket selected. Review the operator’s current calendar and animal-welfare considerations before choosing this experience for your family.',
  ['Scheduled indoor presentations','Family-focused entertainment','Ticket categories and seat options','Optional add-on experiences'],
  {duration:'Suggested 1.5–2 hours including arrival',bestFor:'Families with children',officialUrl:'https://www.dubaidolphinarium.ae/'}),
 extra('lost-chambers-aquarium','The Lost Chambers Aquarium','dubai',
  'Explore atmospheric aquarium displays inside the Atlantis resort on Palm Jumeirah.',
  'The Lost Chambers Aquarium combines immersive undersea displays with a distinctive Atlantis setting. Allow time to explore the exhibits and enjoy the resort atmosphere. Ticketed experiences and animal interactions, where offered, must be selected and confirmed separately.',
  ['Aquarium exhibits and marine habitats','Atlantis The Palm setting','Family-friendly indoor discovery','Optional operator-led experiences'],
  {duration:'Suggested 1–2 hours',bestFor:'Families, marine life enthusiasts',officialUrl:'https://www.atlantis.com/dubai/atlantis-the-palm/experiences/lost-chambers-aquarium'}),
 extra('sanctuary-of-truth-pattaya','Sanctuary of Truth, Pattaya','thailand',
  'Explore a monumental wood-carved sanctuary where traditional craftsmanship tells stories through architecture.',
  'On Pattaya’s northern coast, Sanctuary of Truth brings intricate timber carving and craftsmanship into one extraordinary setting. A guided visitor route adds context to the sculpture and ongoing construction. Plan for outdoor conditions, stairs and the site’s safety rules.',
  ['Intricate hand-carved timber architecture','Cultural and philosophical themes','Guided visitor route','Coastal setting'],
  {duration:'Suggested 1.5–2 hours',bestFor:'Architecture, culture, couples',officialUrl:'https://sanctuaryoftruthmuseum.com/'}),
 extra('coral-island-koh-larn-pattaya','Coral Island (Koh Larn), Pattaya','thailand',
  'Trade Pattaya’s city energy for beach time on Koh Larn, reached by a short sea journey.',
  'Koh Larn is a popular island day out with sandy beaches and clear-water views when conditions cooperate. Choose the beach and boat service to suit your group, then keep the day as relaxed or active as you wish. Water activities are optional and require individual safety checks.',
  ['Island beaches and coastal scenery','Boat journey from Pattaya','Optional water activities','Relaxed seaside afternoon'],
  {duration:'Suggested 5–7 hours including transfers',bestFor:'Families, couples, beach time',officialUrl:'https://www.tourismthailand.org/'}),
 extra('james-bond-island-phang-nga','James Bond Island & Phang Nga Bay','thailand',
  'Discover dramatic limestone rock formations on a boat journey through Phang Nga Bay.',
  'The scenery of Phang Nga Bay makes the journey as memorable as the destination: towering limestone islands, sheltered waters and photographic viewpoints. Tour routes differ by operator and weather, so confirm the pier, included stops and protected-area rules before travelling.',
  ['Phang Nga Bay limestone landscapes','Signature island viewpoints','Scenic boat excursion','Weather-dependent route'],
  {duration:'Suggested 6–8 hours depending on departure point',bestFor:'Nature, photographers, couples',officialUrl:'https://www.tourismthailand.org/'}),
 extra('ayutthaya-heritage-day-trip','Ayutthaya Heritage Day Trip','thailand',
  'Step into the heritage of Thailand’s former royal capital on a journey through remarkable temple ruins.',
  'Ayutthaya offers a thoughtful contrast to contemporary Bangkok. Explore selected historical temples and riverside heritage sites, with enough time to appreciate their architecture and atmosphere. A day trip can be built around a few key stops instead of rushing between every monument.',
  ['Historic temple ruins','Former royal-capital heritage','Cultural photography and local stories','Flexible day trip from Bangkok'],
  {duration:'Suggested 7–10 hours including travel',bestFor:'Heritage, culture, history',officialUrl:'https://www.tourismthailand.org/'}),
];
const destinations=[
 {type:'destinations',slug:'dubai',title:'Dubai',region:'International',featured:false,
  summary:'A city of bold imagination, desert horizons and neighbourhood stories, made personal around the way you like to explore.',
  description:lines(
   'Dubai draws together a remarkable variety of experiences, from winding lanes by the Creek to an extraordinary modern skyline. The exciting part is not simply how much there is to see, but how many different journeys can begin here.',
   'Discover architecture and art, share a desert sunset, slow down by the water, explore family attractions or pair the city with a day in Abu Dhabi. We shape the pace and details around your people.'),
  goodFor:'Families, first-time visitors, couples, architecture and desert explorers',
  journeyStyle:'Landmarks, food, heritage, sea and desert',
  storyTitle1:'Beyond the skyline,\n*a city of stories.*',
  storyBody1:'Follow the Creek into older neighbourhoods, markets and heritage lanes. The contrast between traditional trade and contemporary city life creates a different perspective on Dubai.',
  storyTitle2:'A horizon that\n*changes everything.*',
  storyBody2:'Leave the city behind for wide desert landscapes, afternoon light and an experience chosen around your comfort, interests and preferred pace.',
  storyTitle3:'Make time for\n*your kind of Dubai.*',
  storyBody3:'Spend an afternoon on the waterfront, choose a cultural discovery, or create a family day around the attractions that matter to you.',
  purposeFirst:'Begin with signature city landmarks, neighbourhoods and a desert experience | Burj Khalifa, Dubai Frame, Old Dubai, desert safari',
  purposeFamily:'Easy city highlights and family attractions at a comfortable pace | Dubai Aquarium, Aquaventure, Dubai Frame, Global Village',
  purposeCouple:'Shared sunsets, waterfront evenings and memorable dining | Dubai Marina, desert sunset, skyline',
  purposeExplorer:'Explore deeper into design, heritage and neighbouring emirates | Dubai Frame, Gold Souk, Abu Dhabi',
  featuredExperienceSlugs:lines('burj-khalifa-observation-deck','dubai-desert-safari','dubai-gold-souk','dubai-frame','dubai-marina-dhow-cruise','abu-dhabi-city-discovery'),
  featuredJourneySlug:'dubai-beyond-the-skyline',
  highlights:lines('Spectacular city icons and design','Old Dubai, Creek and traditional markets','Desert experiences chosen around your comfort','Family adventures and waterfront evenings','Customisable Abu Dhabi extensions'),
  faqs:lines(
   'Can we combine city sightseeing and the desert? | Yes. We recommend a comfortable pace and verify your safari operator and hotel transfers.',
   'Do Dubai attractions operate year-round? | Some do, but Global Village and Miracle Garden are seasonal. We confirm dates before proposing them.',
   'Are attraction tickets automatically included? | No. Admission and transfers will be specified in your personalised quotation.',
   'Can Abu Dhabi be included? | Yes. A day trip or extension can be planned around drive time, dress requirements and preferred stops.',
   'Is the Museum of the Future open? | The museum has been temporarily closed since September 2026, with reopening expected Q1 2027. Confirm its official reopening before selecting it.'),
  ...EXPANSION_TRAVEL_GUIDES.dubai},
 {type:'destinations',slug:'thailand',title:'Thailand',region:'International',featured:false,
  summary:'Temple spires, bustling streets, northern culture and island horizons, brought together in a journey made around you.',
  description:lines(
   'Thailand is many journeys in one: Bangkok’s neighbourhoods and temples, the craft and culture of Chiang Mai, the island scenery of Phuket and Krabi, and moments of discovery around Pattaya.',
   'There is no single perfect Thailand itinerary. Whether you want your first taste of the country, a family escape or a more thoughtful journey through its regions, we create the route around your pace and priorities.'),
  goodFor:'First-timers, families, couples, food lovers and explorers',
  journeyStyle:'Culture, rivers, temples, beaches, nature and food',
  storyTitle1:'A place of\n*living traditions.*',
  storyBody1:'From Bangkok’s temple architecture to Chiang Mai’s cultural heart, take time to understand the stories that make each region distinctive.',
  storyTitle2:'Find the coastline\n*that calls you.*',
  storyBody2:'Phuket, Krabi and the Andaman Sea offer different rhythms of island time. We select suitable boat routes and beach stays around the weather and your comfort.',
  storyTitle3:'So many ways to\n*feel connected.*',
  storyBody3:'Discover food markets, local streets, family days and moments of calm. Your journey can connect familiar highlights with the experiences that matter most to you.',
  purposeFirst:'A balanced introduction to Bangkok and a nearby seaside escape | Grand Palace, Wat Arun, Pattaya, river',
  purposeFamily:'Comfortable hotels, city discovery and family-friendly leisure | markets, beaches, heritage, gentle activities',
  purposeCouple:'Slow days, island scenery and memorable shared evenings | Phuket, Krabi, sunset, heritage',
  purposeExplorer:'Travel beyond the familiar into northern Thailand and heritage towns | Chiang Mai, Ayutthaya, culture, nature',
  featuredExperienceSlugs:lines('the-grand-palace-wat-phra-kaew','wat-arun-temple-of-dawn','phi-phi-islands-boat-excursion','chiang-mai-old-city-temples','sanctuary-of-truth-pattaya','krabi-island-hopping-experience'),
  featuredJourneySlug:'bangkok-and-pattaya-your-way',
  highlights:lines('Bangkok temples and river life','Northern heritage and Chiang Mai culture','Phuket and Krabi island horizons','Market streets, local food and easygoing exploration','Weather-conscious itineraries and responsible experiences'),
  faqs:lines(
   'Can we combine Bangkok with Phuket or Chiang Mai? | Yes. We account for domestic transfers and the number of nights available.',
   'Are island trips available every day? | Boat routes are subject to weather, national-park restrictions and operator schedules.',
   'What should we wear at temples? | Modest clothing is generally expected. Specific requirements vary by temple and date.',
   'Is Thailand one destination or several different regions? | It offers multiple regions with distinct travel times. We help choose the combination that suits your trip.'),
  ...EXPANSION_TRAVEL_GUIDES.thailand}
];
const journey=(slug,title,destinationSlug,days,nights,summary,description,interests,itinerary,highlights,goodFor)=>({
 type:'journeys',slug,title,destinationSlug,days:String(days),nights:String(nights),featured:false,
 summary,description,
 journeyStoryTitle:'The journey is yours.\n*We make room for it.*',journeyGoodFor:goodFor,
 journeyInterests:lines(...interests),highlights:lines(...highlights),
 itinerary:lines(...itinerary),
 includedNotes:lines('Custom day-wise travel planning','Personalized attraction suggestions','Enquiry and quotation consultation'),
 toConfirmNotes:lines('Travel dates, regional transfers and hotel selections','Attraction entry, weather and operating calendars','All meals and services explicitly listed in the final quote','Final pricing, availability and booking terms')
});
const journeys=[
 journey('dubai-beyond-the-skyline','Dubai, Beyond the Skyline','dubai',5,4,
  'Five days of Dubai city discoveries, modern icons and the desert, with space to make the experience your own.',
  'Start with an easy city arrival, take in the memorable Downtown landmarks and leave room for an Old Dubai walk, a desert experience and an evening by the water. Choose your preferred attractions rather than squeezing them all into one day.',
  ['Burj Khalifa','Dubai Frame','Desert Safari','Dubai Marina','Gold Souk','Architecture'],[
   'Day 1: Welcome to Dubai | Arrive, settle in and enjoy an easy evening close to your chosen hotel. | Arrival, Settle in',
   'Day 2: City Icons & Downtown | Explore Burj Khalifa and optional Dubai Mall attractions; time slots and tickets to be confirmed. | Skyline, Architecture',
   'Day 3: Old Dubai & Design | Combine a Creek or souk experience with Dubai Frame or a currently operating landmark. Museum of the Future is temporarily closed pending reopening. | Heritage, Culture',
   'Day 4: Desert & Evening Glow | Choose a licensed safari operator and preferred desert programme, subject to suitability and weather. | Nature, Sunset',
   'Day 5: Departure at Your Pace | Enjoy a relaxed morning before your confirmed airport transfer and onward travel. | Departure'
  ],['5 days / 4 nights suggested','Downtown, heritage and desert balance','Hotel and inclusions customized','All admissions subject to quotation'],'First-time visitors, families and couples'),
 journey('dubai-and-abu-dhabi-discovery','Dubai & Abu Dhabi Discovery','dubai',6,5,
  'A six-day starting point combining Dubai highlights with a thoughtful day in Abu Dhabi.',
  'Experience the contrast of modern Dubai, the desert and the architecture of Abu Dhabi while allowing enough time for road travel and rest. Add family attractions or cultural visits as you prefer.',
  ['Downtown Dubai','Dubai Desert','Abu Dhabi','Sheikh Zayed Grand Mosque','Marina','Old Dubai'],[
   'Day 1: Arrival in Dubai | Hotel check-in and time to unwind after travel. | Arrival',
   'Day 2: The Dubai Skyline | Choose Burj Khalifa, Dubai Frame or a design-led city visit at your own pace. | Landmarks',
   'Day 3: Abu Dhabi Discovery | Set out early for the capital; include selected cultural and mosque visits with time for the road journey. | Culture, Architecture',
   'Day 4: Desert Experience | Relax in the morning, then choose an operator-led desert programme suited to your group. | Nature',
   'Day 5: Water & Neighbourhoods | Explore Dubai Marina or Creek districts, with optional attractions confirmed separately. | Waterfront, Food',
   'Day 6: Departure | A flexible final morning followed by your scheduled airport transfer. | Departure'
  ],['Dubai and Abu Dhabi combined','Designed around road-transfer time','Religious site guidelines considered','Optional family attractions'],'Families and travellers wanting a fuller UAE introduction'),
 journey('bangkok-and-pattaya-your-way','Bangkok & Pattaya, Your Way','thailand',5,4,
  'A five-day Thailand introduction balancing Bangkok’s iconic sights with Pattaya’s coastline and cultural discoveries.',
  'Discover the energy of Bangkok, travel to Pattaya with time to settle in, then select a coastal day or a cultural landmark. The final balance depends on arrival and departure airports.',
  ['Grand Palace','Wat Arun','Bangkok Markets','Sanctuary of Truth','Koh Larn'],[
   'Day 1: Arrive in Bangkok | Settle into your hotel; enjoy an optional riverside evening if timings allow. | Arrival',
   'Day 2: Temples & River | Explore selected Bangkok heritage stops with modest dress and realistic traffic time. | Culture',
   'Day 3: Travel to Pattaya | Road transfer to Pattaya with a relaxed afternoon or a selected cultural visit. | Transfer, Coast',
   'Day 4: Your Coastal Day | Choose Koh Larn beach time or a quieter local day, subject to weather and boat availability. | Beach, Choice',
   'Day 5: Departure | Transfer to the appropriate airport based on confirmed flights and traffic. | Departure'
  ],['5 days / 4 nights suggested','Bangkok heritage with Pattaya coastal time','Road transfers planned','Activities customized'],'First-timers, friends and family groups'),
 journey('phuket-and-krabi-island-moments','Phuket & Krabi Island Moments','thailand',6,5,
  'Six days of warm sea horizons, local streets and carefully chosen island adventures.',
  'Split your time between Phuket and Krabi, making space for coastal viewpoints, local food and a weather-appropriate boat excursion. Sea conditions determine the final route and day order.',
  ['Phuket Old Town','Phi Phi Islands','Krabi','Island hopping','Beach time'],[
   'Day 1: Arrive in Phuket | Hotel check-in and an unhurried evening near your chosen beach. | Arrival',
   'Day 2: Phuket at Your Pace | Explore colourful Old Town or a relaxed coastal day, according to your interests. | Heritage, Coast',
   'Day 3: Island Excursion | Choose a suitable licensed Phi Phi or other boat route, subject to weather and marine advisories. | Sea, Nature',
   'Day 4: Transfer to Krabi | Travel to Krabi using a pre-agreed road/boat route with enough time for check-in. | Transfer',
   'Day 5: Krabi Coastlines | Select island hopping, Railay area exploration or a slower beach day. | Sea, Choice',
   'Day 6: Departure | Airport transfer according to your confirmed departure point. | Departure'
  ],['6 days / 5 nights suggested','Two Andaman-coast destinations','Weather-aware marine excursions','Flexible resort and room selection'],'Couples, families and sea-loving travellers'),
 journey('bangkok-and-chiang-mai-culture','Bangkok & Chiang Mai Culture Trail','thailand',6,5,
  'A more cultural six-day journey connecting Bangkok’s river and temples with northern Thailand’s heritage.',
  'Take a balanced route through Bangkok’s grand landmarks, then fly to Chiang Mai for historic temples and a gentler rhythm. Add wildlife learning or a craft experience only where suitable and responsibly operated.',
  ['Grand Palace','Wat Arun','Chiang Mai Old City','Doi Suthep','Northern culture'],[
   'Day 1: Welcome to Bangkok | Settle into the capital and choose an easy evening activity. | Arrival',
   'Day 2: Historic Bangkok | Explore Wat Phra Kaew or Grand Palace and selected river landmarks. | Temples',
   'Day 3: Market & Flight North | Enjoy a market or relaxed morning before the scheduled domestic flight to Chiang Mai. | Market, Transfer',
   'Day 4: Chiang Mai Old City | Discover northern temple architecture, neighbourhoods and local food. | Heritage',
   'Day 5: Mountain Temple & Choice | Visit Doi Suthep or select a suitable conservation/craft programme. | Nature, Culture',
   'Day 6: Return / Departure | Transfer to your departing airport as planned, allowing for any flight connection. | Departure'
  ],['Bangkok and Chiang Mai contrast','Flight connection accounted for','Balanced cultural itinerary','Optional responsible wildlife learning'],'Culture, learning and families')
];
export const EXPANSION_STARTERS=[...destinations,...EXPANSION_MASTER.map(starterFromMaster),...extraExperiences,...journeys];
export const EXPANSION_COUNTS={destinations:destinations.length,experiences:EXPANSION_MASTER.length+extraExperiences.length,journeys:journeys.length,total:EXPANSION_STARTERS.length};
