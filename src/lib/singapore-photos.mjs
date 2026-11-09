/** Research-backed Singapore editorial photo suggestions.
 * IMPORTANT: These are externally hosted Wikimedia Commons images, NOT copies
 * uploaded to Firebase Storage. Review the precise file licences and import
 * the chosen photos through Admin > Media Library for reliable hosting.
 * Source and attribution data remain available for every photograph.
 */
const image=(filename,credit,license='CC BY-SA 4.0',caption='')=>({
 filename,credit,license,caption,
 source:`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename).replace(/%20/g,'_')}`,
 url:`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=1500`
});
export const SG_PHOTOS={
 marinaWaterfront:image('Singapore Marina Bay from Merlion.JPG','Ypsilon from Finland','CC0 1.0','Marina Bay Sands viewed across the bay'),
 marinaWaterfrontAlt:image('Merlion and Marina Bay Sands.jpg','Chandu7299','CC BY-SA 4.0','Marina Bay waterfront landmarks'),
 riverWonders:image('River Safari Singapore Amazon Flooded Forest.JPG','ProjectManhattan','CC BY-SA 4.0','Amazon Flooded Forest habitat at River Wonders (historic photo)'),
 cableCar:image('Singapore Cable Car - Sentosa Line.jpg','Maksym Kozlenko','CC BY-SA 4.0','Singapore Cable Car Sentosa Line'),
 wingsOfTime:image('Wings of Time Fireworks Symphony.jpg','ScribblingGeek','CC BY-SA 4.0','Wings of Time Fireworks Symphony performance'),
 rainVortex2026:image('Rain Vortex Jewel Changi Airport.jpg','kallerna','CC BY-SA 4.0','Rain Vortex at Jewel Changi'),
 canopyPark:image('Canopy Park at Jewel Changi Airport, Singapore.jpg','cattan2011','CC BY 2.0','Canopy Park at Jewel Changi (historic photo)'),
 canopyParkAlt:image('Canopy Park at Jewel Changi Airport.jpg','cattan2011','CC BY 2.0','Canopy Park at Jewel Changi (historic photo)'),
 nationalGallery:image('National Gallery Singapore - Joy of Museums - External.jpg','GordonMakryllos','CC BY-SA 4.0','National Gallery Singapore exterior'),
 nationalGalleryAlt:image('National gallery Singapore, Singapore.jpg','cattan2011','CC BY 2.0','National Gallery Singapore exterior'),
 skyline:image('Singapore Gardens by the Bay viewed from Marina Bay Sands 02.jpg','Zairon','CC BY-SA 4.0','Gardens by the Bay and Marina Bay'),
 skylineAlt:image('Singapore Gardens by the Bay viewed from Marina Bay Sands 09.jpg','Zairon','CC BY-SA 4.0','Singapore skyline from Marina Bay Sands'),
 gardens:image('Singapore - Supertree Grove, Gardens by the Bay.jpg','DINS-COM','CC BY-SA 4.0','Supertree Grove'),
 gardensNight:image('Supertree Grove, Gardens by the Bay, Singapore.jpg','Ralff Nestor Nacor','CC BY-SA 4.0','Supertrees in the evening'),
 gardensPanorama:image('Singapore Gardens by the Bay viewed from Marina Bay Sands 08.jpg','Zairon','CC BY-SA 4.0','Gardens from above'),
 littleIndia:image('Singapore Little India.jpg','Nachoman-au','CC BY-SA 3.0','Little India neighbourhood'),
 beach:image('Palawan Beach, Singapore.jpg','Ken Eckert','CC BY-SA 4.0','Palawan Beach on Sentosa'),
 beachAlt:image('Singapore Palawan Beach 05.jpg','Zairon','CC BY-SA 4.0','Sentosa island beach'),
 vortex:image('At Jewel Changi, Singapore 2023 04.jpg','Mike Peel (www.mikepeel.net)','CC BY-SA 4.0','Jewel Changi Rain Vortex'),
 vortexAlt:image('At Jewel Changi, Singapore 2023 44.jpg','Mike Peel (www.mikepeel.net)','CC BY-SA 4.0','Rain Vortex with Skytrain'),
 botanical:image('Singapore Botanic Gardens.jpg','Songpyeon','CC BY-SA 4.0','Singapore Botanic Gardens'),
 wildlife:image('Entrance - Singapore Zoo (01).jpg','Dan arndt','CC BY-SA 4.0','Singapore Zoo entrance'),
 nightSafari:image('Night Safari entrance 2016.jpg','Orderinchaos','CC BY-SA 4.0','Night Safari entrance'),
 birdParadise:image('Bird Paradise at Mandai Zoo in Singapore - Ypphotography.jpg','Phuan Yan Penh','CC BY-SA 4.0','Bird Paradise at Mandai'),
 universal:image('Universal studios singapore.jpg','Abhi018','CC BY-SA 4.0','Universal Studios Singapore'),
 universalCoaster:image('Roller coaster at Universal Studios Singapore, 20240206 1306 6440.jpg','Jakub Hałun','CC BY 4.0','Universal Studios Singapore roller coaster'),
 birdFlamingos:image('Flamingos at Bird Paradise.jpg','TravellerMya','CC0 1.0','Bird Paradise flamingos'),
 flyerView:image('View of Singapore flyer.JPG','Nadia Khattab','CC BY-SA 4.0','Singapore Flyer from the ground'),
 nightSafariEntry:image('Night Safari entry lanes at night.jpg','Orderinchaos','CC BY-SA 4.0','Night Safari entrance'),
 flyer:image('Singapore Singapore Flyer 1.jpg','Zairon','CC BY-SA 4.0','Singapore Flyer')
};
export const uniquePhotos=(keys)=>[...new Set(keys)].map(key=>SG_PHOTOS[key]).filter(Boolean);
export const imageList=keys=>uniquePhotos(keys).map(photo=>photo.url).join('\n');
export const imageCredits=keys=>uniquePhotos(keys).map(p=>`${p.caption||p.filename} | ${p.credit} | ${p.license} | ${p.source}`).join('\n');
export const SINGAPORE_VISUAL_FIELDS={
 destinations:{
  heroImage:SG_PHOTOS.skyline.url,storyImage1:SG_PHOTOS.gardens.url,
  storyImage2:SG_PHOTOS.littleIndia.url,storyImage3:SG_PHOTOS.beach.url,
  galleryImages:imageList(['skylineAlt','gardensNight','vortex','beachAlt','botanical','flyer']),
  imageCredits:imageCredits(['skyline','gardens','littleIndia','beach','skylineAlt','gardensNight','vortex','beachAlt','botanical','flyer']),
  photoCredit:SG_PHOTOS.skyline.credit,photoLicense:SG_PHOTOS.skyline.license,photoSourceUrl:SG_PHOTOS.skyline.source
 },
 journeys:{
  heroImage:SG_PHOTOS.skylineAlt.url,
  dayImages:imageList(['skyline','gardens','beachAlt','vortex']),
  galleryImages:imageList(['gardensNight','littleIndia','beach']),
  imageCredits:imageCredits(['skylineAlt','skyline','gardens','beachAlt','vortex','gardensNight','littleIndia','beach']),
  photoCredit:SG_PHOTOS.skylineAlt.credit,photoLicense:SG_PHOTOS.skylineAlt.license,photoSourceUrl:SG_PHOTOS.skylineAlt.source
 }
};
export const SINGAPORE_EXPERIENCE_PHOTOS={
 'marina-bay-waterfront':['marinaWaterfront','marinaWaterfrontAlt','flyer'],
 'gardens-by-the-bay':['gardens','gardensNight','gardensPanorama'],
 'sentosa-island':['beach','beachAlt','skyline'],
 'universal-studios-singapore':['universal','universalCoaster'],
 'singapore-zoo':['wildlife'],
 'night-safari-singapore':['nightSafari','nightSafariEntry'],
 'bird-paradise':['birdParadise','birdFlamingos'],
 'jewel-changi-airport':['vortex','vortexAlt','skyline'],
 'little-india-walk':['littleIndia'],
 'singapore-flyer':['flyer','flyerView','skylineAlt'],
 'river-wonders':['riverWonders'],
 'sentosa-cable-car':['cableCar'],
 'wings-of-time':['wingsOfTime'],
 'jewel-changi-rain-vortex':['rainVortex2026','vortexAlt'],
 'canopy-park-at-jewel':['canopyPark','canopyParkAlt'],
 'national-gallery-singapore':['nationalGallery','nationalGalleryAlt']
};
export function singaporeExperienceVisuals(slug){
 const keys=SINGAPORE_EXPERIENCE_PHOTOS[slug];if(!keys)return {};
 const photos=uniquePhotos(keys);
 return {heroImage:photos[0].url,galleryImages:photos.slice(1).map(p=>p.url).join('\n'),
 imageCredits:imageCredits(keys),photoCredit:photos[0].credit,photoLicense:photos[0].license,photoSourceUrl:photos[0].source};
}
