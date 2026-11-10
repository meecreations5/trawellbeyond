import {STORY_DEFAULTS} from './brand-story.mjs';
/** Reviewable launch content. No Firestore operations occur when importing this module.
 * The Admin explicitly installs these as DRAFTS; publication is a separate action.
 * No commercial prices, attraction operating hours or confirmed inclusions are assumed.
 */
import {SINGAPORE_VISUAL_FIELDS,singaporeExperienceVisuals} from './singapore-photos.mjs';
import {fillSingaporeExperienceGaps} from './singapore-editorial.mjs';
import {SINGAPORE_TRAVEL_GUIDE,SINGAPORE_VISITOR_GUIDES} from './singapore-knowledge.mjs';
import {EXPANSION_STARTERS,EXPANSION_COUNTS} from './dubai-thailand-starters.mjs';
const entries=lines=>lines.join('\n');
const page=(slug,title,summary,other={})=>({type:'pages',slug,title,summary,...other});
export const STARTER_PUBLISH_PAGES=[
 'site-settings','homepage','our-story','services','faq','contact','create','enquire','journal'
];
export const STARTER_REVIEW_REQUIRED=['privacy','terms'];
export const LAUNCH_STARTERS=[
 page('site-settings','Website Header & Footer','Global navigation and brand footer used throughout TrawellBeyond.',{
  siteTopLeft:'Travel \u2022 Journeys \u2022 Experiences',
  siteTopRight:'A DreamTrawell Destination Venture',
  siteNavLinks:entries(['Destinations | /destinations','Experiences | /experiences','Journeys | /journeys','Our Story | /our-story','Contact | /contact']),
  siteHeaderCta:'CREATE a journey',
  siteFooterLine1:'Travel \u2022 Journeys \u2022 Experiences',
  siteFooterLine2:'Your journey, created around you.',
  siteFooterCompany:'A DreamTrawell Destination Venture',
  siteFooterBottom:'Enquiry-led travel. No online payments.',
  siteFooterCta:'CREATE your journey',
  siteFooterLinks:entries(['Destinations | /destinations','Experiences | /experiences','Journeys | /journeys','Offers | /offers','Our Story | /our-story','Services | /services','FAQs | /faq','Contact | /contact','Privacy | /privacy','Terms | /terms'])
 }),
 page('homepage','TrawellBeyond | Created Around You','Wherever life takes you, we help create a journey that feels like your own.',{
  homeHeroLine1:'The world is wide.',homeHeroAccent:'Your journey',homeHeroLine3:'is personal.',
  homeEntryTitle:'Every journey\nbegins *differently.*',
  homeEntryLead:'Some begin with a place. Others, with a feeling. Tell us what matters and discover a way to make it yours.',
  homeManifestoTitle:"It's not simply *where*\nyou go. It's *what the journey becomes.*",
  homeManifestoLead:'Travel can mean a first glimpse of snow, a long-awaited family reunion, a quiet escape or simply getting somewhere you need to be.',
  homeDestinationsTitle:'Places that\n*open possibilities.*',
  homeDestinationsLead:"Across India and around the world, the places you know and the ones you've yet to discover.",
  homeJourneysTitle:'Journeys, *thoughtfully*\nput together.',
  homeJourneysLead:'Explore a starting point, then adjust the details to make it your own. No two journeys need to feel the same.',
  homePurposeTitle:'What do you want\nthis journey to *do*\nfor you?',
  homePurposeLead:"There isn't just one way to travel. Choose what matters most and we'll help you explore where it might lead.",
  homeCreateTitle:"If the right journey\ndoesn't exist,\n*we create it.*",
  homeCreateLead:"Have a destination in mind, a half-formed idea or something entirely different? Start shaping it yourself, or tell us what you're imagining.",
  homeMomentTitle1:'Sometimes it starts\nwith *a feeling.*',
  homeMomentLead1:'More time together. A long-overdue escape. A moment worth remembering.',
  homeMomentTitle2:'Sometimes, a place\n*calls you.*',
  homeMomentLead2:'A new horizon, a familiar street, a story you have been waiting to live.',
  homeMomentTitle3:'And every journey\nbegins *with you.*',
  homeMomentLead3:'We listen to what matters, then thoughtfully create the way forward.',
  homeWorldsTitle:'From everyday movement\nto *extraordinary moments.*',
  homeWorldsLead:'One travel relationship, created around different needs.',
  homeClosingTitle:'Where shall\n*we begin?*',
  homeClosingLead:'Some journeys are planned. Some begin with a conversation.'
 }),
 page('our-story','A new way to journey.','TrawellBeyond begins with a belief: every meaningful journey starts with understanding people.',{
  ...STORY_DEFAULTS,
  description:entries([
   'We are TrawellBeyond, a travel, journeys and experiences venture created by the people behind DreamTrawell Destination.',
   'Travel is rarely just about where we go. It is about who we travel with, why it matters and the memories we hope to make. Our work begins with listening to those details, then designing the journey around them.',
   'People first. Destination second. If the right journey does not exist, we create it.'
  ])
 }),
 page('services','Every need. Every kind of journey.','From a simple trip to a significant occasion, we start with what your travel needs to achieve.',{
  highlights:entries([
   'MOVE | Transport and travel movement planned around your route, dates and needs.',
   'STAY | Accommodation recommendations based on comfort, location and purpose.',
   'EXPLORE | Attractions, sightseeing and local experiences chosen around your interests.',
   'JOURNEY | Destination-led holidays and personally created itineraries.',
   'BELIEVE | Faith, heritage and wellness journeys with thoughtful pacing.',
   'CELEBRATE | Family occasions, milestones and journeys that mark meaningful moments.',
   'LEARN | Educational trips and experiences beyond familiar places.',
   'WORK | Group and business travel requests designed around practical needs.',
   'CREATE | A personal journey built from your ideas, even when no ready package exists.'
  ])
 }),
 page('faq','Questions worth asking.','Helpful answers before we start creating a journey around you.',{
  highlights:entries([
   'Can I change a listed journey? | Yes. All listed journeys are starting points. We can discuss dates, hotels, experiences and the pace that works for you.',
   'Does submitting an enquiry confirm a booking? | No. An enquiry begins a conversation with our team. It does not reserve travel services.',
   'Can I request a destination not shown on the website? | Yes. Tell us where you would like to go, or what you want to experience, and we will review the possibilities.',
   'Do I need to pay on the website? | No. TrawellBeyond is enquiry-led and does not accept website payments.',
   'Are prices or attraction schedules fixed? | Unless explicitly confirmed in a written quote, availability, timings, prices and services may change.',
   'Can you create a family or group journey? | Yes. Share group size, ages, interests and important requirements, and we will prepare a suitable proposal.',
   'What happens after I submit a request? | Our travel team reviews the information and contacts you to clarify details before preparing recommendations.'
  ])
 }),
 page('contact','A journey starts with a conversation.','Share where you want to go, who is coming and what matters most. Our team will respond to your enquiry.'),
 page('create','No two stories. No two journeys.','Tell us your people, purpose, dates and ideas. CREATE helps us begin with you, not with a fixed itinerary.'),
 page('enquire','Your next chapter starts here.','Have a destination, experience or celebration in mind? Tell us what you are imagining and we will be in touch.'),
 page('journal','Where ideas begin to move.','A space for destination inspiration, travel perspectives and stories that help people imagine a journey.',{
  description:entries(['## Created around curiosity','Every journey begins with a question. What have you always wanted to see? Which moment would you like to share with someone?','Explore destinations and experiences with TrawellBeyond. Our editorial stories will grow as we discover and share more.'])
 }),
 // These are intentionally drafts only. Business/legal review is mandatory.
 page('privacy','Privacy Notice','How TrawellBeyond uses information submitted through travel enquiry forms.',{
  description:entries(['## Review required before publication','This is an editorial outline, not final legal policy. Confirm the legal entity, contact email, processors, retention practices, rights request process and applicable law before publishing.','## Enquiry information','Our forms ask for details that help us understand and respond to travel requests, such as contact information, preferred dates, destinations and travel preferences.','## Contact','Add the verified data-protection or general business contact address here before going live.'])
 }),
 page('terms','Terms of Use','Important information about using the TrawellBeyond website and submitting enquiries.',{
  description:entries(['## Review required before publication','Confirm the legal entity, jurisdiction, applicable travel-service terms and customer support channels before publishing.','## Enquiries are not bookings','Submitting a travel enquiry does not confirm a booking, price, itinerary or availability.','## Quotations','Any itinerary, dates, services and pricing will be confirmed separately by the TrawellBeyond team.'])
 }),
 {type:'destinations',slug:'singapore',title:'Singapore',region:'International',featured:true,...SINGAPORE_VISUAL_FIELDS.destinations,
  goodFor:'First-time visitors, families and curious travellers',journeyStyle:'City icons, neighbourhoods, wildlife and island time',
  storyTitle1:'A city with a *sense of wonder.*',storyBody1:'Discover Singapore through its waterfront skyline, extraordinary gardens and moments that stay with you.',
  storyTitle2:'Every street, a *different story.*',storyBody2:'From Little India to Kampong Gelam, food, culture and local life create their own memorable rhythm.',
  storyTitle3:'Make space for *your moments.*',storyBody3:'Choose nature, wildlife, Sentosa or a gentler pace. Your journey should feel like your own.',
  purposeFirst:'See the iconic sights, then take time for the local stories in between. | Marina Bay, Gardens, neighbourhoods',
  purposeFamily:'Balance wildlife, time outdoors and relaxed family discoveries. | Sentosa, Mandai, Gardens',
  purposeCouple:'Share waterfront moments, culture and evenings worth lingering in. | River, skyline, food',
  purposeExplorer:'Go beyond the skyline with culture, trails and immersive wildlife experiences. | Neighbourhoods, nature, wildlife',
  featuredExperienceSlugs:'marina-bay-waterfront\ngardens-by-the-bay\nsentosa-island\nnight-safari-singapore',
  featuredJourneySlug:'singapore-at-your-pace',
  summary:'A city of vibrant contrasts, from Marina Bay icons and neighbourhood stories to green spaces, wildlife and island experiences.',
  description:entries([
   'Singapore brings together different worlds in one easy-to-explore city. Begin with the waterfront energy of Marina Bay, striking architecture and the gardens that have become symbols of a city always reinventing itself.',
   'Walk through Little India, Chinatown or Kampong Gelam to discover streets shaped by food, culture, colour and everyday life. Spend time at the Singapore River, discover local favourites or simply slow down over a meal.',
   'For families and curious travellers, Sentosa, the Mandai wildlife parks and Jewel Changi add another side to the journey. We help combine these possibilities into the right pace for your people and preferences.'
  ]),
  highlights:entries(['City icons and waterfront walks','Families, couples and first-time visitors','Food, culture and lively neighbourhoods','Gardens, wildlife and island time','Flexible duration and personalized planning']),
  faqs:entries([
   'Can we customize a Singapore itinerary? | Yes. We design around your travel days, family requirements and preferred experiences.',
   'Are attraction tickets included automatically? | No. Inclusions and current availability are confirmed separately in your quotation.',
   'Is Singapore suitable for a family journey? | Yes. Our team can propose a balanced pace with child-friendly experiences and breaks.',
   'When should we plan activities? | Operating days and timed admission rules vary by attraction. We confirm them for your travel dates before finalizing plans.'
  ])
 },
 {type:'journeys',slug:'singapore-at-your-pace',title:'Singapore, at Your Pace',destinationSlug:'singapore',days:'4',nights:'3',featured:true,...SINGAPORE_VISUAL_FIELDS.journeys,
  journeyStoryTitle:'Four days, countless\n*possibilities.*',journeyGoodFor:'Families, couples and travellers who enjoy flexibility',
  journeyInterests:entries(['Marina Bay','Gardens by the Bay','Sentosa Island','Night Safari','Neighbourhood walks','Local food discoveries']),
  includedNotes:entries(['Suggested daily itinerary','Personal experience recommendations','Trip planning consultation']),
  toConfirmNotes:entries(['Travel dates and availability','Hotel category and transport','Attraction tickets and schedules','Final inclusions and quotation']),
  summary:'A flexible four-day Singapore starting point with Marina Bay, neighbourhood discoveries, Sentosa and room for personal choices.',
  description:entries(['Four days can feel wonderfully full without feeling rushed. This is an outline to shape around your arrival, interests and travel companions.','Mix a city evening with garden time, discover the energy of different neighbourhoods and choose a family attraction, island day or a more relaxed pace.']),
  highlights:entries(['Suggested 4 days / 3 nights','Marina Bay and garden experiences','Neighbourhood and food discoveries','One flexible Sentosa or wildlife day','Personalized inclusions and quotations on request']),
  itinerary:entries([
   'Day 1: Arrival & Marina Bay | Arrive, settle in and explore the waterfront at a comfortable pace. | Arrival, City views',
   'Day 2: Gardens & Neighbourhoods | Explore Gardens by the Bay, then discover local streets, food and cultural corners. | Gardens, Culture',
   'Day 3: Your Day, Your Way | Choose Sentosa, a wildlife park or another experience matched to your interests. | Flexible, Experiences',
   'Day 4: Easy Departure | Enjoy a relaxed morning or a short stop depending on flight timing, then transfer for departure. | Departure'
  ])
 },
];

const experiences=[
 ['Marina Bay Waterfront','Marina Bay city lights, waterfront views and some of Singapore\'s best-known architecture.','Waterfront strolls\nCity photographs\nEvening views'],
 ['Gardens by the Bay','A garden landscape where striking Supertrees, open spaces and conservatories offer very different ways to discover nature.','Supertree Grove\nGarden walks\nOptional conservatories'],
 ['Sentosa Island','An island escape with beaches, entertainment and family experiences that can be tailored to the day you want.','Beach time\nFamily activities\nOptional attractions'],
 ['Universal Studios Singapore','A theme-park day on Sentosa with immersive themed zones and rides, subject to current operating schedules.','Themed attractions\nFamily entertainment\nTimed admission where required'],
 ['Singapore Zoo','Explore wildlife habitats and family-friendly discoveries at the Mandai wildlife reserve.','Wildlife habitats\nFamily discovery\nPark exploration'],
 ['Night Safari Singapore','An evening wildlife experience that reveals a different side of the animal world at Mandai.','Nocturnal wildlife\nEvening visit\nPark pathways'],
 ['Bird Paradise','A walk-through bird park with immersive habitats, colourful species and opportunities to learn about birdlife.','Aviaries\nBird presentations\nWildlife learning'],
 ['Jewel Changi Airport','A landscaped airport destination with the Rain Vortex and attractions that can fit around your arrival or departure plans.','Rain Vortex\nIndoor gardens\nOptional attractions'],
 ['Little India Walk','Discover colourful streets, markets, heritage and food traditions in one of Singapore\'s best-loved neighbourhoods.','Cultural neighbourhood\nLocal food\nSelf-guided exploration'],
 ['Singapore Flyer','An observation-wheel experience with panoramic views across the city, subject to current admission and schedules.','City panoramas\nSkyline experience\nOptional Time Capsule']
];
for(const [title,summary,highlights] of experiences){
 const slug=title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 LAUNCH_STARTERS.push({type:'experiences',slug,title,summary,description:summary,destinationSlug:'singapore',highlights,featured:false,...singaporeExperienceVisuals(slug),bestFor:'Travellers who enjoy memorable local experiences',ticketNotes:'Ticket availability, operating times and inclusions will be confirmed before travel.'});
}

// Restored attraction-level catalogue. New records are DRAFTS with reviewed Commons suggestions; no Firebase upload, tickets or prices are assumed.
 LAUNCH_STARTERS.push({type:'experiences',slug:"river-wonders",title:"River Wonders",destinationSlug:'singapore',summary:"Explore the river-inspired habitats of River Wonders, home to remarkable freshwater life and animals associated with river systems around the world.",description:"Explore the river-inspired habitats of River Wonders, home to remarkable freshwater life and animals associated with river systems around the world. Visitors can combine indoor aquarium areas with outdoor wildlife viewing at Mandai.",highlights:"Freshwater habitats\nAquatic wildlife\nRiver ecosystems\nFamily exploration",bestFor:"Family, Wildlife",ticketNotes:'Draft only. Confirm current admission, operating hours and availability with the official attraction before publication.',featured:false});
 LAUNCH_STARTERS.push({type:'experiences',slug:"sentosa-cable-car",title:"Sentosa Cable Car",destinationSlug:'singapore',summary:"Take in elevated views between Mount Faber, HarbourFront and Sentosa aboard the Singapore Cable Car.",description:"Take in elevated views between Mount Faber, HarbourFront and Sentosa aboard the Singapore Cable Car. The scenic journey offers a gentle way to combine panoramic sightseeing with a Sentosa itinerary.",highlights:"Panoramic views\nSentosa access\nMount Faber\nScenic transport",bestFor:"Family, Scenic",ticketNotes:'Draft only. Confirm current admission, operating hours and availability with the official attraction before publication.',featured:false});
 LAUNCH_STARTERS.push({type:'experiences',slug:"wings-of-time",title:"Wings of Time",destinationSlug:'singapore',summary:"Close your Sentosa day with an open-air evening performance featuring projected imagery, music, water effects and pyrotechnics when conditions permit.",description:"Close your Sentosa day with an open-air evening performance featuring projected imagery, music, water effects and pyrotechnics when conditions permit. Select a suitable session and seating category for your itinerary.",highlights:"Evening show\nProjection and water effects\nMusic\nSentosa beach setting",bestFor:"Family, Celebration",ticketNotes:'Draft only. Confirm current admission, operating hours and availability with the official attraction before publication.',featured:false});
 LAUNCH_STARTERS.push({type:'experiences',slug:"jewel-changi-rain-vortex",title:"Jewel Changi Rain Vortex",destinationSlug:'singapore',summary:"Visit Jewel Changi’s dramatic indoor Rain Vortex, framed by lush planting and multi-level walkways.",description:"Visit Jewel Changi’s dramatic indoor Rain Vortex, framed by lush planting and multi-level walkways. See the cascading waterfall in daylight or plan an evening stop for the light-and-music presentation.",highlights:"Indoor waterfall\nForest Valley scenery\nEvening light show\nAirport-adjacent visit",bestFor:"Family, Nature",ticketNotes:'Draft only. Confirm current admission, operating hours and availability with the official attraction before publication.',featured:false});
 LAUNCH_STARTERS.push({type:'experiences',slug:"canopy-park-at-jewel",title:"Canopy Park at Jewel",destinationSlug:'singapore',summary:"Add playful garden attractions to a visit through Jewel’s upper-level leisure area.",description:"Explore the upper-level leisure attractions at Jewel Changi, with garden spaces and selected play features. Some attractions require separate admissions and have their own access or age conditions.",highlights:"Explore the upper-level leisure attractions at Jewel Changi, with garden spaces and selected play features\nSome attractions require separate admissions and have their own access or age conditions.",bestFor:"Family, Weekend",ticketNotes:'Draft only. Confirm current admission, operating hours and availability with the official attraction before publication.',featured:false});
 LAUNCH_STARTERS.push({type:'experiences',slug:"national-gallery-singapore",title:"National Gallery Singapore",destinationSlug:'singapore',summary:"Discover art and heritage in an impressive historic civic setting.",description:"Explore Southeast Asian art and heritage in a major gallery housed across two landmark civic buildings. Exhibitions, guided programmes and admission categories vary by date.",highlights:"Explore Southeast Asian art and heritage in a major gallery housed across two landmark civic buildings\nExhibitions, guided programmes and admission categories vary by date.",bestFor:"Art, Culture",ticketNotes:'Draft only. Confirm current admission, operating hours and availability with the official attraction before publication.',featured:false});
// Complete new Singapore drafts with sourced editorial fields. Existing Firestore
// content is NEVER overwritten by installing starter drafts.
for(let i=0;i<LAUNCH_STARTERS.length;i++){
 const item=LAUNCH_STARTERS[i];
 if(item.type==='destinations'&&item.slug==='singapore')LAUNCH_STARTERS[i]={...SINGAPORE_TRAVEL_GUIDE,...item};
 if(item.type==='experiences'&&item.destinationSlug==='singapore')LAUNCH_STARTERS[i]={...(SINGAPORE_VISITOR_GUIDES[item.slug]||{}),...fillSingaporeExperienceGaps({...singaporeExperienceVisuals(item.slug),...item}).record};
}
// Expansion records are also private draft suggestions. Existing Firestore
// documents are protected by the Admin's create-if-missing workflow.
LAUNCH_STARTERS.push(...EXPANSION_STARTERS);
export const STARTER_COUNTS={pages:11,destinations:1+EXPANSION_COUNTS.destinations,journeys:1+EXPANSION_COUNTS.journeys,experiences:LAUNCH_STARTERS.filter(x=>x.type==='experiences').length};
