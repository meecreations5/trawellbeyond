export const CONTENT_TYPES = ['destinations','experiences','journeys','offers','pages'];
export const CONTENT_LABELS = {destinations:'Destinations',experiences:'Experiences',journeys:'Journeys & Packages',offers:'Offers',pages:'Website Pages'};
export const CONTENT_FIELDS = {
  destinations:['title','slug','summary','description','region','heroImage','photoCredit','photoLicense','photoSourceUrl','galleryImages','imageCredits','highlights','faqs','goodFor','journeyStyle','storyTitle1','storyBody1','storyImage1','storyTitle2','storyBody2','storyImage2','storyTitle3','storyBody3','storyImage3','purposeFirst','purposeFamily','purposeCouple','purposeExplorer','featuredExperienceSlugs','featuredJourneySlug','travelLanguages','travelCurrency','travelTimeZone','travelWeather','travelTransport','travelFood','travelStay','travelEntry','travelEssentials','travelGuideUrl','travelTransportUrl','travelEntryUrl','travelVerifiedOn','videoUrl','videoTitle','videoCredit','featured'],
  experiences:['title','slug','summary','description','destinationSlug','duration','openingHours','pickup','priceFrom','currency','heroImage','photoCredit','photoLicense','photoSourceUrl','galleryImages','imageCredits','highlights','dropoff','ticketNotes','bestFor','inclusions','exclusions','seasonalNotes','officialUrl','locationAddress','nearestTransit','gettingThere','accessibilityNotes','visitorTips','mapUrl','visitSourceUrl','visitVerifiedOn','videoUrl','videoTitle','videoCredit','featured'],
  journeys:['title','slug','summary','description','destinationSlug','days','nights','priceFrom','currency','heroImage','photoCredit','photoLicense','photoSourceUrl','galleryImages','imageCredits','highlights','itinerary','dayImages','journeyStoryTitle','journeyGoodFor','journeyInterests','includedNotes','toConfirmNotes','featured'],
  offers:['title','slug','summary','description','destinationSlug','priceFrom','currency','validUntil','heroImage','photoCredit','photoLicense','photoSourceUrl','featured'],
  pages:['title','slug','summary','description','heroImage','photoCredit','photoLicense','photoSourceUrl','imageCredits','highlights','homeHeroLine1','homeHeroAccent','homeHeroLine3','homeEntryTitle','homeEntryLead','homeManifestoTitle','homeManifestoLead','homeDestinationsTitle','homeDestinationsLead','homeJourneysTitle','homeJourneysLead','homePurposeTitle','homePurposeLead','homeCreateTitle','homeCreateLead','homeCreateImage','homeClosingTitle','homeClosingLead','homeMomentTitle1','homeMomentLead1','homeMomentImage1','homeMomentTitle2','homeMomentLead2','homeMomentImage2','homeMomentTitle3','homeMomentLead3','homeMomentImage3','homeWorldsTitle','homeWorldsLead','siteTopLeft','siteTopRight','siteNavLinks','siteHeaderCta','siteFooterLine1','siteFooterLine2','siteFooterCompany','siteFooterBottom','siteFooterEmail','siteFooterPhone','siteFooterLinks','siteFooterCta','storyEyebrow','storyHeroLead','storyOriginTitle','storyOriginBody','storyHeroImage','storyOriginImage','storyBeliefTitle','storyBeliefBody','storyPeopleTitle','storyPeopleBody','storyPeopleImage','storyClosingTitle','storyClosingBody','storyPromise','philosophyPeople','philosophyPurpose','philosophyRequirement','philosophyJourney','philosophyExperience','philosophyMoments','featured']
};
export const TEXT_LIMITS = {...STORY_TEXT_LIMITS,title:160,slug:120,summary:500,description:10000,region:40,destinationSlug:120,duration:100,openingHours:150,pickup:200,priceFrom:40,currency:10,days:15,nights:15,heroImage:1700,photoCredit:260,photoLicense:140,photoSourceUrl:1700,highlights:5000,itinerary:10000,galleryImages:6000,imageCredits:12000,faqs:6000,validUntil:50,homeHeroLine1:160,homeHeroAccent:160,homeHeroLine3:160,homeEntryTitle:250,homeEntryLead:800,homeManifestoTitle:250,homeManifestoLead:800,homeDestinationsTitle:250,homeDestinationsLead:800,homeJourneysTitle:250,homeJourneysLead:800,homePurposeTitle:250,homePurposeLead:800,homeCreateTitle:250,homeCreateLead:800,homeCreateImage:1700,homeClosingTitle:250,homeClosingLead:800,homeMomentTitle1:250,homeMomentLead1:800,homeMomentImage1:1700,homeMomentTitle2:250,homeMomentLead2:800,homeMomentImage2:1700,homeMomentTitle3:250,homeMomentLead3:800,homeMomentImage3:1700,homeWorldsTitle:250,homeWorldsLead:800,siteTopLeft:160,siteTopRight:160,siteNavLinks:1200,siteHeaderCta:160,siteFooterLine1:200,siteFooterLine2:200,siteFooterCompany:160,siteFooterBottom:160,siteFooterEmail:160,siteFooterPhone:160,siteFooterLinks:1200,siteFooterCta:160,goodFor:160,journeyStyle:160,storyTitle1:250,storyBody1:700,storyImage1:1700,storyTitle2:250,storyBody2:700,storyImage2:1700,storyTitle3:250,storyBody3:700,storyImage3:1700,purposeFirst:500,purposeFamily:500,purposeCouple:500,purposeExplorer:500,featuredExperienceSlugs:1200,featuredJourneySlug:120,dropoff:200,ticketNotes:900,bestFor:180,inclusions:2000,exclusions:2000,seasonalNotes:1000,officialUrl:1700,dayImages:5000,journeyStoryTitle:260,journeyGoodFor:160,journeyInterests:1500,includedNotes:1800,toConfirmNotes:1800,travelLanguages:220,travelCurrency:200,travelTimeZone:120,travelWeather:650,travelTransport:950,travelFood:850,travelStay:650,travelEntry:950,travelEssentials:800,travelGuideUrl:800,travelTransportUrl:800,travelEntryUrl:800,travelVerifiedOn:10,videoUrl:500,videoTitle:200,videoCredit:200,locationAddress:240,nearestTransit:300,gettingThere:850,accessibilityNotes:850,visitorTips:850,mapUrl:800,visitSourceUrl:800,visitVerifiedOn:10};
import {youtubeVideoId} from './travel-guide.mjs';
import {normalizeImageVariants} from './media-variants.mjs';
import {STORY_TEXT_LIMITS,STORY_IMAGE_FIELDS} from './brand-story.mjs';
export function slugify(value){
 return String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100);
}
export function safeImage(value){
 if(typeof value!=='string'||value.length>1700)return '';
 try {const u=new URL(value);return u.protocol==='https:'?u.toString():'';}catch{return '';}
}
export function validateContent(type,raw,status='draft',{previouslyPublished=false}={}){
 if(!CONTENT_TYPES.includes(type))throw new Error('Unsupported content section.');
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Invalid content.');
 if(!['draft','published'].includes(status))throw new Error('Status must be Draft or Published.');
 const result={};
 for(const field of CONTENT_FIELDS[type]){
  if(field==='featured'){result[field]=raw[field]===true;continue;}
  if(typeof raw[field]!=='string' && raw[field]!==undefined && raw[field]!==null)throw new Error(`${field} must be text.`);
  const value=String(raw[field]??'').trim();
  if(value.length>(TEXT_LIMITS[field]||1000))throw new Error(`${field} is too long.`);
  result[field]=value;
 }
 result.imageVariants=normalizeImageVariants(raw.imageVariants);
 result.slug=slugify(result.slug||result.title);
 if(!result.title||result.title.length<2)throw new Error('Add a title of at least 2 characters.');
 if(!result.slug)throw new Error('A valid URL slug is required.');
 if(result.heroImage&&!safeImage(result.heroImage))throw new Error('Use an HTTPS image URL or upload a photo.');
 for(const field of ['homeCreateImage','homeMomentImage1','homeMomentImage2','homeMomentImage3','storyImage1','storyImage2','storyImage3',...STORY_IMAGE_FIELDS]){
  if(result[field]&&!safeImage(result[field]))throw new Error(`${field} must be an HTTPS image URL.`);
 }
 result.heroImage=safeImage(result.heroImage);
 if(result.photoSourceUrl&&!safeImage(result.photoSourceUrl))throw new Error('Photo source URL must be HTTPS.');
 for(const field of ['galleryImages','dayImages']){if(result[field]){const photos=result[field].split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(photos.length>(field==='dayImages'?20:8)||photos.some(x=>!safeImage(x)))throw new Error(`${field==='dayImages'?'Day images':'Gallery'} supports HTTPS image links, one per line (maximum ${field==='dayImages'?20:8}).`);result[field]=photos.join('\n');}}
 result.photoSourceUrl=safeImage(result.photoSourceUrl);
 if(result.officialUrl&&!safeImage(result.officialUrl))throw new Error('Official attraction URL must use HTTPS.');
 for(const field of ['travelGuideUrl','travelTransportUrl','travelEntryUrl','mapUrl','visitSourceUrl']){if(result[field]&&!safeImage(result[field]))throw new Error(`${field} must be an HTTPS URL.`);}
 if(result.videoUrl&&!youtubeVideoId(result.videoUrl))throw new Error('Use an HTTPS YouTube video link (watch, shorts or youtu.be).');
 for(const field of ['travelVerifiedOn','visitVerifiedOn']){if(result[field]&&!/^\d{4}-\d{2}-\d{2}$/.test(result[field]))throw new Error(`${field} must use YYYY-MM-DD.`);}
 if(result.featuredExperienceSlugs){const slugs=result.featuredExperienceSlugs.split(/[\s,]+/).filter(Boolean);if(slugs.length>12||slugs.some(x=>slugify(x)!==x))throw new Error('Enter up to 12 experience URL slugs, one per line.');result.featuredExperienceSlugs=[...new Set(slugs)].join('\n');}
 if(result.featuredJourneySlug&&slugify(result.featuredJourneySlug)!==result.featuredJourneySlug)throw new Error('Featured journey must be a URL slug.');
 for(const field of ['purposeFirst','purposeFamily','purposeCouple','purposeExplorer']){if(result[field]&&result[field].split('|').length<2)throw new Error(`${field}: use Description | Keywords.`);}
 if(status==='published'&&!result.summary.trim())throw new Error('A short description is required to publish.');
 if(type==='experiences'&&status==='published'&&!result.destinationSlug)throw new Error('Choose a destination before publishing this experience.');
 if(status==='published'&&!previouslyPublished&&['destinations','experiences','journeys','offers'].includes(type)&&!result.heroImage)throw new Error('Choose a cover photograph before publishing. You can save your content as a Draft without photos.');
 // Auto-imported image matches must be reviewed before they become public.
 const review=String(raw.mediaReviewStatus||'');
 if(!['','pending','approved'].includes(review))throw new Error('Invalid photograph review status.');
 result.mediaReviewStatus=review;
 result.mediaReviewedBy=String(raw.mediaReviewedBy||'').slice(0,200);
 result.mediaReviewedAt=String(raw.mediaReviewedAt||'').slice(0,80);
 if(status==='published'&&review==='pending')throw new Error('Review automatically imported photographs before publishing.');
 return {...result,status};
}
export function typePath(type){
 if(!CONTENT_TYPES.includes(type))throw new Error('Unsupported content section.');
 return `cms/${type}/items`;
}
