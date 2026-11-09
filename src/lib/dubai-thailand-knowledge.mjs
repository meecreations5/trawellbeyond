/** TrawellBeyond V7.8. Destination guidance is editorial, not an immigration
 * or ticketing guarantee. Review nationality/date-sensitive requirements.
 * Web references checked 9 Nov 2026. Attraction-specific schedules from the
 * source workbook are not certified current and are NOT marked verified.
 */
const googleMaps=query=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
export const EXPANSION_TRAVEL_GUIDES={
 dubai:{
  travelLanguages:'Arabic is the official language; English is commonly used in visitor areas, hotels, malls and transport. Hindi and Urdu are also widely heard.',
  travelCurrency:'UAE dirham (AED). Cards are widely accepted; keep some local currency for smaller purchases, markets or transport as needed.',
  travelTimeZone:'Gulf Standard Time (UTC+4), 1 hour 30 minutes behind India Standard Time.',
  travelWeather:'Dubai has very hot summers and milder winter months. Outdoor sightseeing and desert activities are generally more comfortable in the cooler season. Carry water and sun protection, and check the forecast before outdoor excursions.',
  travelTransport:'Dubai Metro, tram, buses, taxis and marine transport connect major areas. The RTA nol card works across many services, including metro, buses and trams; check routes, card eligibility and current fares with RTA. Several distant attractions require a taxi or booked transfer.',
  travelFood:'From Deira souks and old-city neighbourhoods to waterfront dining and Downtown restaurants, Dubai has a wide range of Indian, Arabic and international food. Vegetarian, Jain-friendly, halal and allergy needs should be confirmed with the restaurant before ordering.',
  travelStay:'Downtown Dubai is convenient for Burj Khalifa and Dubai Mall; Deira and Bur Dubai offer older-city connections; Dubai Marina/JBR suit waterfront stays; Palm Jumeirah is resort-focused. Choose accommodation around the actual itinerary and transfer needs.',
  travelEntry:'UAE visa and entry eligibility depends on passport, residency status and circumstances. Verify requirements through the official UAE government or Dubai immigration channels, including any passport-validity and visa conditions, before travel.',
  travelEssentials:'Respect local customs and dress requirements at religious sites. Use sun protection, plan for air-conditioned indoor spaces and carry an appropriate Type G power adaptor. Emergency numbers and rules should be verified on official UAE guidance before departure.',
  travelGuideUrl:'https://www.visitdubai.com/en/plan-your-trip',
  travelTransportUrl:'https://www.rta.ae/wps/portal/rta/ae/public-transport',
  travelEntryUrl:'https://u.ae/en/information-and-services/visa-and-emirates-id/visa-information/do-you-need-an-entry-permit-or-a-visa-to-enter-the-uae',
  travelVerifiedOn:'2026-11-09',
  videoUrl:'https://www.youtube.com/watch?v=fr6nbZoi9uU',
  videoTitle:'Discover Dubai in a Day',
  videoCredit:'Visit Dubai (official tourism channel)'
 },
 thailand:{
  travelLanguages:'Thai is the official language. English is commonly used in major tourist areas, but it is helpful to know a few polite Thai greetings and have your hotel/address saved in Thai.',
  travelCurrency:'Thai baht (THB). Cards are accepted at many hotels and larger businesses; local markets and smaller vendors may need cash or a supported local payment method.',
  travelTimeZone:'Indochina Time (UTC+7), 1 hour 30 minutes ahead of India Standard Time.',
  travelWeather:'Conditions differ between Bangkok, Chiang Mai, Phuket and Krabi. Northern Thailand has seasonal heat and a potential haze period; the Andaman coast can have rougher sea conditions during its wetter months. Check area-specific forecasts and marine advisories.',
  travelTransport:'Bangkok offers BTS Skytrain, MRT, river boats and taxis; intercity journeys use flights, trains or road transport. Phuket, Krabi, Pattaya and Chiang Mai require different local transport plans. Island boat services depend on weather and sea conditions.',
  travelFood:'Thai cuisine includes street markets, regional dishes and fresh seafood. Vegan, vegetarian, Jain-friendly, halal and allergy needs require ingredient checks: fish sauce, shrimp paste and shared cooking equipment are common considerations.',
  travelStay:'Bangkok: riverside, Sukhumvit or Siam depending on sightseeing and transport. Phuket: choose between Patong nightlife, quieter beaches or Old Town. Krabi: Ao Nang is a common boat-trip base. Chiang Mai: Old City/Nimman. Select areas around the exact trip.',
  travelEntry:'Check passport-based visa eligibility and permitted duration with an official Thai mission or immigration source. Thailand Digital Arrival Card (TDAC) is separate from a visa and is generally required for non-Thai nationals arriving through immigration; submit via the official free portal within the permitted pre-arrival window.',
  travelEssentials:'Dress modestly at temples and remove shoes where requested. Carry weather-appropriate clothing, sun protection and a power adaptor compatible with local outlets. Use licensed activity providers and check weather/marine advisories before boat tours.',
  travelGuideUrl:'https://www.tourismthailand.org/',
  travelTransportUrl:'https://www.tourismthailand.org/',
  travelEntryUrl:'https://tdac.immigration.go.th/arrival-card/',
  travelVerifiedOn:'2026-11-09',
  videoUrl:'https://www.youtube.com/watch?v=wDMv1KujSGc',
  videoTitle:'Feel All The Feelings — Amazing Thailand',
  videoCredit:'Tourism Authority of Thailand / Amazing Thailand (official campaign)'
 }
};
const g=(place,area,transit,how,tip,source,access='')=>({
 locationAddress:area,
 nearestTransit:transit,
 gettingThere:how,
 visitorTips:tip,
 accessibilityNotes:access,
 mapUrl:googleMaps(place),
 visitSourceUrl:source
});
/** Useful place-specific instructions; do not represent these as confirmed
 * ticket or operating-hour data. Official URLs are retained per experience. */
export const EXPANSION_VISITOR_GUIDES={
 'burj-khalifa-observation-deck':g('Burj Khalifa At the Top Dubai','Burj Khalifa, Downtown Dubai, UAE','Burj Khalifa / Dubai Mall Metro (Red Line).','Follow the signed walking connection through Dubai Mall to the At the Top ticket entrance; allow enough time for security and the queue.','Reserve a timed observation-deck ticket and confirm the floor, entry slot and sunset pricing before travel.','https://www.visitdubai.com/en/places-to-visit/burj-khalifa','Lifts and access facilities depend on the ticketed level; ask the operator about individual mobility needs.'),
 'dubai-aquarium-underwater-zoo':g('Dubai Aquarium Underwater Zoo','The Dubai Mall, Downtown Dubai, UAE','Burj Khalifa / Dubai Mall Metro.','Reach Dubai Mall by metro or taxi; follow the attraction signs inside the mall.','Different packages include different exhibits and animal encounters; confirm what is included.','https://www.thedubaiaquarium.com/'),
 'dubai-frame':g('Dubai Frame','Zabeel Park, Dubai, UAE','Use RTA journey planner or a taxi for the nearest practical entrance.','Follow the designated ticketed entry to Dubai Frame at Zabeel Park.','Allow time for the gallery and elevated glass walkway; check special opening notices.','https://www.dubaiframe.ae/en/plan-your-visit'),
 'dubai-desert-safari':g('Dubai desert safari','Dubai desert, operator-selected conservation or safari area','Hotel/private operator transfer, where specifically included.','Your tour operator confirms the actual desert reserve, pickup location and driving plan.','Dune driving, dinner, shows and camel activities vary greatly by supplier. Ask about motion-sickness, pregnancy, mobility and child restrictions before booking.','https://www.visitdubai.com/en/articles/dubai-desert-safari-guide','Off-road dune activities may not be suitable for all guests; check conditions with your licensed provider.'),
 'dubai-marina-dhow-cruise':g('Dubai Marina','Dubai Marina, Dubai, UAE','DMCC or Sobha Realty Metro; Dubai Marina tram connections (depending on pier).','Confirm the operator and exact boarding pier. Arrive ahead of the issued departure time.','Cruise vessel, dining menu, shared/private seating and entertainment are operator-specific.','https://www.visitdubai.com/en/places-to-visit/dubai-marina'),
 'dubai-gold-souk':g('Dubai Gold Souk','Deira Gold Souk, Dubai, UAE','Al Ras Metro / Gold Souq Metro depending on approach.','Combine the market with Deira lanes or an abra crossing if convenient.','Market exploration is independent; individual shops open at their own times. Check quality/certification when making purchases.','https://www.visitdubai.com/en/places-to-visit/the-gold-souk'),
 'dubai-miracle-garden':g('Dubai Miracle Garden','Al Barsha South, Dubai, UAE','Seasonal bus/taxi options; confirm with RTA.','Plan a direct transfer or confirm the seasonal public bus route before travelling.','A seasonal outdoor attraction. Confirm operating season, dates and weather conditions.','https://www.dubaimiraclegarden.com/'),
 'global-village-dubai':g('Global Village Dubai','Global Village, Dubai, UAE','Seasonal RTA bus routes or taxi.','Confirm your date and transport options; allow enough time for evening entry and the return journey.','Seasonal opening; some rides and experiences are separately paid. Check any restricted-entry days.','https://www.globalvillage.ae/'),
 'abu-dhabi-city-discovery':g('Sheikh Zayed Grand Mosque Abu Dhabi','Abu Dhabi, UAE (multiple stops by itinerary)','Intercity/private road transfer from Dubai; route arranged by operator.','This full-day tour is across emirates; expect significant road time and confirm each planned stop.','Mosque dress and access rules are mandatory. Timings, transfers and attractions depend on the chosen itinerary.','https://visitabudhabi.ae/'),
 'aquaventure-waterpark':g('Aquaventure Atlantis Dubai','Atlantis The Palm, Palm Jumeirah, Dubai, UAE','Taxi or Palm Monorail to Atlantis area.','Choose a route to Atlantis The Palm and allow time for entry and lockers.','Review ride-height restrictions, locker policies and closure notices for the visit date.','https://www.atlantis.com/dubai/atlantis-aquaventure/aquaventure-waterpark'),
 'museum-of-the-future':g('Museum of the Future Dubai','Sheikh Zayed Road, Dubai, UAE','Emirates Towers Metro (Red Line).','Follow the pedestrian connection from Emirates Towers Metro or take a taxi to the museum entrance.','Entry is timed and popular sessions sell out; confirm available tickets before promising a visit.','https://museumofthefuture.ae/'),
 'dubai-city-highlights':g('Dubai city tour','Dubai, UAE (multiple landmarks by selected tour)','Private or shared sightseeing transport if quoted.','Select Downtown, Old Dubai, Jumeirah or other stops according to travel time and group interests.','A city tour is customizable, not one fixed attraction; photo stops and entry admissions must be specified.','https://www.visitdubai.com/'),
 'dubai-dolphinarium':g('Dubai Dolphinarium','Creek Park Gate 1, Dubai, UAE','Check current route to Creek Park by RTA or taxi.','Confirm the show venue, ticket category and scheduled performance before setting out.','Show calendars, reservations and venue entry requirements can change.','https://www.dubaidolphinarium.ae/'),
 'lost-chambers-aquarium':g('The Lost Chambers Aquarium Dubai','Atlantis The Palm, Dubai, UAE','Taxi or Palm Monorail to Atlantis area.','Reach the Atlantis resort and follow signs for the aquarium entrance.','Confirm admission product and any separately paid encounters.','https://www.atlantis.com/dubai/atlantis-the-palm/experiences/lost-chambers-aquarium'),
 'the-grand-palace-wat-phra-kaew':g('Grand Palace Bangkok','Na Phra Lan Road, Phra Nakhon, Bangkok, Thailand','Bangkok riverside ferry access or taxi; check the nearest open pier.','Allow time for local traffic, ticket checks and security at the designated entrance.','Dress modestly; religious ceremonies may change visiting access. Only buy valid admission through authorized channels.','https://www.royalgrandpalace.th/en/schedules'),
 'chao-phraya-river-experience':g('Chao Phraya River Bangkok','Chao Phraya River, Bangkok, Thailand','Riverside public piers; rail connections depend on chosen boarding point.','Choose the exact public boat, sightseeing boat or dinner cruise before planning transport.','Boarding piers, routes, food and departure schedules are operator-specific.','https://www.tourismthailand.org/'),
 'chatuchak-market-discovery':g('Chatuchak Weekend Market Bangkok','Chatuchak Market, Bangkok, Thailand','Mo Chit BTS / Chatuchak Park MRT / Kamphaeng Phet MRT.','Follow signs to the relevant market entrance; give your group a meeting point.','Weekend trading is busiest; shops and stalls vary by day and season.','https://www.tourismthailand.org/'),
 'chiang-mai-old-city-temples':g('Chiang Mai Old City','Chiang Mai Old City, Thailand','Walk or locally arranged transport within the Old City.','Plan temple stops near the old city walls and leave room for quiet wandering.','Dress modestly and follow each temple’s admission and photography rules.','https://www.tourismthailand.org/'),
 'elephant-nature-park-visit-chiang-mai':g('Elephant Nature Park Chiang Mai','Chiang Mai province, Thailand (operator sets meeting details)','Operator-arranged transport as booked.','Choose the conservation programme through the named operator; follow confirmed pickup instructions.','Avoid assuming elephant riding or handling is included. Follow the operator’s animal-welfare policies.','https://www.elephantnaturepark.org/'),
 'phi-phi-islands-boat-excursion':g('Phi Phi Islands Thailand','Phi Phi Islands, Krabi province, Thailand','Boat from authorized pier in Phuket or Krabi; depends on booked route.','Meet at the confirmed pier or use a booked transfer; travel times depend on sea conditions.','Check national-park closures, weather, lifejackets and permitted shore stops.','https://www.tourismthailand.org/'),
 'krabi-island-hopping-experience':g('Krabi islands Thailand','Krabi, Thailand (island stops vary)','Boat from designated Krabi / Ao Nang pier.','Meet at the booked pier and follow weather-dependent itinerary instructions.','Protected-area rules, seasonal sea conditions and operator safety equipment matter.','https://www.tourismthailand.org/'),
 'phuket-old-town-heritage-walk':g('Phuket Old Town','Phuket Old Town, Phuket, Thailand','Local taxi/bus plus walking.','Choose a walkable starting point among the heritage streets; confirm individual venue hours.','Wear comfortable shoes, be respectful when photographing residents and shops, and plan for heat or rain.','https://www.tourismthailand.org/'),
 'wat-arun-temple-of-dawn':g('Wat Arun Bangkok','Wat Arun Ratchawararam, Bangkok, Thailand','Chao Phraya river crossing, depending on starting point.','Use the appropriate river pier or taxi and follow the temple entrance signs.','Modest dress and respectful temple conduct are expected.','https://www.tourismthailand.org/'),
 'wat-phra-that-doi-suthep-chiang-mai':g('Wat Phra That Doi Suthep','Doi Suthep, Chiang Mai, Thailand','Mountain road transfer; local shared red truck or taxi by arrangement.','Allow for the winding uphill road, temple access steps and return transport.','Check access options if guests have reduced mobility and follow temple dress rules.','https://www.tourismthailand.org/'),
 'sanctuary-of-truth-pattaya':g('Sanctuary of Truth Pattaya','Sanctuary of Truth, North Pattaya, Thailand','Taxi or booked road transfer from Pattaya hotels.','Confirm entry slots and the guided visitor process for the wooden structure.','The site has ongoing construction/maintenance; follow hard-hat and safety instructions when applicable.','https://sanctuaryoftruthmuseum.com/'),
 'coral-island-koh-larn-pattaya':g('Koh Larn Pattaya','Koh Larn (Coral Island), off Pattaya, Thailand','Boat from Bali Hai Pier or operator-selected pier.','Confirm boat type, jetty, weather and transfer to your chosen beach.','Lifejackets, sea conditions and optional water activities are important; activities are not automatically included.','https://www.tourismthailand.org/'),
 'james-bond-island-phang-nga':g('James Bond Island Phang Nga Bay','Khao Phing Kan, Phang Nga Bay, Thailand','Licensed boat excursion from Phuket/Krabi/Phang Nga, depending on package.','Confirm the route, departure pier and national-park permissions.','Weather and protected-area access can change; do not promise all advertised stops.','https://www.tourismthailand.org/'),
 'ayutthaya-heritage-day-trip':g('Ayutthaya Historical Park Thailand','Ayutthaya, Thailand','Train or road journey from Bangkok; arrange local stops.','Combine selected temple ruins with a realistic travel and walking schedule.','Heritage sites have individual tickets, dress codes and sun-exposure considerations.','https://www.tourismthailand.org/')
};
