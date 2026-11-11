'use client';
import {useEffect,useState,useCallback,useRef} from 'react';
import Link from 'next/link';
import {clientAuth,isClientConfigured,loginMicrosoft,loginMicrosoftRedirect,finishMicrosoftRedirect,signOut,onAuthStateChanged} from '@/lib/firebase-client';
import {CONTENT_LABELS,CONTENT_FIELDS,slugify} from '@/lib/content.mjs';
import {STORY_EDITOR_GROUPS,STORY_FIELDS,STORY_IMAGE_FIELDS,STORY_DEFAULTS} from '@/lib/brand-story.mjs';
import {cmsRequest,verifyTeamUser} from '@/lib/cms-web';
import ImageLibrary from './ImageLibrary';
import CompletionCenter from './CompletionCenter';
import BulkRollout from './BulkRollout';
import TeamManagement from './TeamManagement';
import EnquiryInbox from './EnquiryInbox';
import {TEAM_ROLES,ROLE_LABELS,canManageTeam,canPublishContent,canCreateContent,canEditRecord,canReadEnquiries,canDeleteContent,MEDIA_EDIT_FIELDS} from '@/lib/team-access.mjs';
import {withMediaAsset} from '@/lib/media-variants.mjs';
import {LAUNCH_STARTERS,STARTER_PUBLISH_PAGES} from '@/lib/launch-starters.mjs';
import {EXPANSION_STARTERS,EXPANSION_COUNTS} from '@/lib/dubai-thailand-starters.mjs';
import {EXPANSION_PHOTO_LIST} from '@/lib/dubai-thailand-photos.mjs';
import {expansionPhotoKeysFor,attachExpansionPhotos} from '@/lib/dubai-thailand-media.mjs';
import {attachSingaporeStoredPhotos} from '@/lib/singapore-draft-merge.mjs';
import {SG_PHOTOS} from '@/lib/singapore-photos.mjs';
import {singaporePhotoPlan,restoreSingaporeRecordPhotos} from '@/lib/singapore-photo-recovery.mjs';
import {permittedCommonsLicense} from '@/lib/commons-license.mjs';
import {fillSingaporeExperienceGaps,SINGAPORE_PHOTO_SEARCH} from '@/lib/singapore-editorial.mjs';
import {SINGAPORE_TRAVEL_GUIDE,SINGAPORE_VISITOR_GUIDES,fillMissingKnowledge} from '@/lib/singapore-knowledge.mjs';
import {youtubeVideoId} from '@/lib/travel-guide.mjs';
import {journeyGalleryPhotos,journeyPhotoReadiness} from '@/lib/journey-photos.mjs';
import './admin.css';
const groups=['destinations','experiences','journeys','offers','pages'];
const pagePresets=[['site-settings','Header & Footer'],['homepage','Homepage'],['our-story','Our Story'],['services','Services'],['faq','FAQ'],['contact','Contact'],['create','CREATE'],['enquire','Enquiry Page'],['journal','Journal'],['privacy','Privacy Notice'],['terms','Terms of Use']];
const menu=[['dashboard','LayoutDashboard','Overview'],...groups.map(g=>[g,'FileText',CONTENT_LABELS[g]]),['media','Image','Media Library'],['completion','FileText','Content Completion'],['bulk','Layers','Image Completion & Rollout'],['enquiries','Inbox','Journey Companion Inbox'],['team','FileText','Team & Access']];
const textareas=new Set(['description','highlights','itinerary','summary','galleryImages','dayImages','imageCredits','faqs','storyBody1','storyBody2','storyBody3','purposeFirst','purposeFamily','purposeCouple','purposeExplorer','featuredExperienceSlugs','journeyInterests','includedNotes','toConfirmNotes','ticketNotes','inclusions','exclusions','seasonalNotes',...['homeEntryTitle','homeEntryLead','homeManifestoTitle','homeManifestoLead','homeDestinationsTitle','homeDestinationsLead','homeJourneysTitle','homeJourneysLead','homePurposeTitle','homePurposeLead','homeCreateTitle','homeCreateLead','homeClosingTitle','homeClosingLead','homeMomentTitle1','homeMomentLead1','homeMomentTitle2','homeMomentLead2','homeMomentTitle3','homeMomentLead3','homeWorldsTitle','homeWorldsLead','siteNavLinks','siteFooterLinks']]);
const storyFieldSet=new Set(STORY_FIELDS);
const destinationKnowledgeFields=['travelLanguages','travelCurrency','travelTimeZone','travelWeather','travelTransport','travelFood','travelStay','travelEntry','travelEssentials','travelGuideUrl','travelTransportUrl','travelEntryUrl','travelVerifiedOn'];
const experienceVisitFields=['locationAddress','nearestTransit','gettingThere','accessibilityNotes','visitorTips','mapUrl','visitSourceUrl','visitVerifiedOn'];
const videoFields=['videoUrl','videoTitle','videoCredit'];
const knowledgeFields=new Set([...destinationKnowledgeFields,...experienceVisitFields,...videoFields]);
const knowledgeTextareas=new Set(['travelWeather','travelTransport','travelFood','travelStay','travelEntry','travelEssentials','gettingThere','accessibilityNotes','visitorTips']);
const fields={

 goodFor:['Who is this for?','text','e.g. Families, couples, curious explorers'],
 journeyStyle:['Destination travel style','text','e.g. Culture, food, city and nature'],
 storyTitle1:['Story chapter 1 - headline','textarea','The moments that matter.'],
 storyBody1:['Story chapter 1 - copy','textarea','Write the first destination story'],
 storyImage1:['Story chapter 1 - photo','image','Choose a distinct licensed image'],
 storyTitle2:['Story chapter 2 - headline','textarea','Discover a different perspective.'],
 storyBody2:['Story chapter 2 - copy','textarea','Write the second destination story'],
 storyImage2:['Story chapter 2 - photo','image','Choose a distinct licensed image'],
 storyTitle3:['Story chapter 3 - headline','textarea','Made around your people.'],
 storyBody3:['Story chapter 3 - copy','textarea','Write the third destination story'],
 storyImage3:['Story chapter 3 - photo','image','Choose a distinct licensed image'],
 purposeFirst:['First visit - description | keywords','textarea','An easy introduction | Icons, culture, local life'],
 purposeFamily:['Family - description | keywords','textarea','Time together | Wildlife, family discoveries'],
 purposeCouple:['For two - description | keywords','textarea','Shared memories | Views, food, experiences'],
 purposeExplorer:['Explorer - description | keywords','textarea','Go beyond the obvious | Culture, nature'],
 featuredExperienceSlugs:['Featured experiences in display order','textarea','One experience URL slug per line, e.g. gardens-by-the-bay'],
 featuredJourneySlug:['Featured journey slug','text','e.g. singapore-at-your-pace'],
 dropoff:['Drop-off and return','text','e.g. hotel drop-off included / not included'],
 ticketNotes:['Ticket / admission notes','textarea','What needs booking or confirmation?'],
 bestFor:['Best for','text','e.g. First-time visitors, families'],
 inclusions:['What may be included','textarea','One confirmed or proposed item per line'],
 exclusions:['What is not included','textarea','One item per line'],
 seasonalNotes:['Seasonal / accessibility notes','textarea','Schedules or availability may change'],
 officialUrl:['Official attraction website','text','HTTPS link to the attraction operator'],
 dayImages:['Itinerary photos, one per day','textarea','One HTTPS URL per line, matching Day 1, Day 2, etc.'],
 journeyStoryTitle:['Journey editorial headline','textarea','A city to explore\n*your way.*'],
 journeyGoodFor:['Journey best for','text','Families, couples, first-time visitors'],
 journeyInterests:['Personalizer interest choices','textarea','One interest per line, e.g. Gardens by the Bay'],
 includedNotes:['Proposed inclusions','textarea','One item per line; confirmed in quote'],
 toConfirmNotes:['Items to confirm','textarea','One item per line; final availability in quote'],
 title:['Title','text','e.g. Singapore Night Safari'],
 slug:['Page URL','text','Leave empty to generate automatically'],
 summary:['Short description','textarea','A short introduction shown on cards and pages'],
 description:['Full description','textarea','Tell the story and describe the experience'],
 region:['Region','select',['International','India']],
 destinationSlug:['Destination URL slug','text','e.g. singapore'],
 duration:['Activity duration','text','e.g. 2 hours'],
 openingHours:['Operating hours','text','e.g. 9 AM – 6 PM'],
 pickup:['Pickup information','text','e.g. SIC pickup around 8 AM (verify)'],
 priceFrom:['Indicative starting price','text','Optional, numerical e.g. 6500'],
 currency:['Currency','select',['INR','SGD','AED','USD','THB','MYR','VND','IDR','LKR','TRY']],
 days:['Days','text','e.g. 5'],
 nights:['Nights','text','e.g. 4'],
 validUntil:['Offer validity','text','e.g. 2026-12-31'],
 highlights:['Highlights','textarea','One highlight per line'],
 galleryImages:['Additional photos','textarea','One secure (HTTPS) image URL per line; up to 8'],
 imageCredits:['Photography credits and source licences','textarea','Each line: Image caption | Photographer | Licence | https://source-page'],
 faqs:['Destination FAQs','textarea','One question and answer per line: Question | Answer'],
 itinerary:['Day-wise itinerary','textarea','Day 1: Arrival\nDay 2: Explore'],
 heroImage:['Cover image URL','image','Choose an image from Media Library'],
 photoCredit:['Photo credit','text','Photographer or source name'],
 photoLicense:['Photo licence','text','e.g. CC BY-SA 4.0'],
 photoSourceUrl:['Photo source page URL','text','e.g. Wikimedia Commons source page'],
 homeHeroLine1:['Hero headline — line 1','text','The world is wide.'],
 homeHeroAccent:['Hero headline — emphasized line','text','Your journey'],
 homeHeroLine3:['Hero headline — line 3','text','is personal.'],
 homeEntryTitle:['Ways to begin — heading','textarea','Newline creates a new line; *words* adds emphasis'],
 homeEntryLead:['Ways to begin — description','textarea',''],
 homeManifestoTitle:['Brand manifesto — heading','textarea',''],
 homeManifestoLead:['Brand manifesto — description','textarea',''],
 homeDestinationsTitle:['Featured destinations — heading','textarea',''],
 homeDestinationsLead:['Featured destinations — description','textarea',''],
 homeJourneysTitle:['Featured journeys — heading','textarea',''],
 homeJourneysLead:['Featured journeys — description','textarea',''],
 homePurposeTitle:['Travel by purpose — heading','textarea',''],
 homePurposeLead:['Travel by purpose — description','textarea',''],
 homeCreateTitle:['CREATE section — heading','textarea',''],
 homeCreateLead:['CREATE section — description','textarea',''],
 homeCreateImage:['CREATE section — photo URL','text','Choose a licensed HTTPS photo'],
 homeClosingTitle:['Final call-to-action — heading','textarea',''],
 homeClosingLead:['Final call-to-action — description','textarea',''],
 homeMomentTitle1:['Motion chapter 1 - heading','textarea','Use *asterisks* for emphasis'],
 homeMomentLead1:['Motion chapter 1 - description','textarea',''],
 homeMomentImage1:['Motion chapter 1 - photo','text','Use Media Library'],
 homeMomentTitle2:['Motion chapter 2 - heading','textarea',''],
 homeMomentLead2:['Motion chapter 2 - description','textarea',''],
 homeMomentImage2:['Motion chapter 2 - photo','text','Use Media Library'],
 homeMomentTitle3:['Motion chapter 3 - heading','textarea',''],
 homeMomentLead3:['Motion chapter 3 - description','textarea',''],
 homeMomentImage3:['Motion chapter 3 - photo','text','Use Media Library'],
 homeWorldsTitle:['Ways to travel - heading','textarea',''],
 homeWorldsLead:['Ways to travel - description','textarea',''],

 siteTopLeft:['Top strip - left text','text','Travel | Journeys | Experiences'],
 siteTopRight:['Top strip - right text','text','A DreamTrawell Destination Venture'],
 siteNavLinks:['Header navigation links','textarea','One per line: Destinations | /destinations'],
 siteHeaderCta:['Header CREATE button label','text','CREATE a journey'],
 siteFooterLine1:['Footer descriptor','text','Travel | Journeys | Experiences'],
 siteFooterLine2:['Footer brand statement','text','Your journey, created around you.'],
 siteFooterCompany:['Footer venture name','text','A DreamTrawell Destination Venture'],
 siteFooterBottom:['Footer final note','text','Enquiry-led travel. No online payments.'],
 siteFooterEmail:['Footer email (optional)','text','Use a real, approved contact address'],
 siteFooterPhone:['Footer phone (optional)','text','Use a real, approved number'],
 siteFooterLinks:['Footer navigation links','textarea','One per line: Contact | /contact'],
 siteFooterCta:['Footer CREATE link label','text','CREATE your journey'],

 storyEyebrow:['Story opening label','text','THE STORY BEHIND TRAWELLBEYOND'],
 storyHeroLead:['Story opening editorial line','textarea','Before we ask where, we want to understand why.'],
 storyOriginTitle:['Origin chapter heading','text','Built on destination knowledge. Created for people.'],
 storyOriginBody:['Origin chapter copy','textarea','Explain the DreamTrawell Destination connection accurately.'],
 storyHeroImage:['Story hero photograph','image','Upload a licensed human-centred photograph'],
 storyOriginImage:['Origin chapter photograph','image','Upload a licensed planning/team photograph'],
 storyBeliefTitle:['Belief headline','text','People first. Destination second.'],
 storyBeliefBody:['Belief narrative','textarea','What travel means to your customers'],
 storyPeopleTitle:['How we work headline','text','Thoughtful work. Human conversations.'],
 storyPeopleBody:['How we work narrative','textarea','Your actual planning process; do not invent claims'],
 storyPeopleImage:['People / team photograph','image','Choose a verified team or editorial photograph'],
 storyClosingTitle:['Closing chapter heading','text','Every journey deserves to feel like yours.'],
 storyClosingBody:['Closing narrative','textarea','Invite travellers to CREATE or contact the team'],
 storyPromise:['Brand signature promise','text','If the right journey doesn’t exist, we create it.'],
 philosophyPeople:['People — stage explanation','textarea','Who is travelling and what matters to them?'],
 philosophyPurpose:['Purpose — stage explanation','textarea','Why is the journey meaningful?'],
 philosophyRequirement:['Requirement — stage explanation','textarea','Comfort, pace, budget and other needs.'],
 philosophyJourney:['Journey — stage explanation','textarea','Turn the details into a personally shaped plan.'],
 philosophyExperience:['Experience — stage explanation','textarea','Choose relevant discoveries and moments.'],
 philosophyMoments:['Moments — stage explanation','textarea','What people remember and carry home.'],

 travelLanguages:['Local languages','text','English, Malay, Mandarin, Tamil'],
 travelCurrency:['Local currency & payments','text','Singapore dollar (SGD), payment tips'],
 travelTimeZone:['Time zone','text','UTC+8'],
 travelWeather:['Weather & packing','textarea','Weather, shoes, rain protection and essentials'],
 travelTransport:['Public transport / getting around','textarea','MRT, buses, airport transfers, cards and taxi guidance'],
 travelFood:['Food & dietary guidance','textarea','Neighbourhoods, hawker dining and dietary confirmations'],
 travelStay:['Suggested areas to stay','textarea','Neighbourhood guidance, not hotel bookings'],
 travelEntry:['Visa / arrival guidance','textarea','Official resources. Avoid nationality-specific promises'],
 travelEssentials:['Local practical essentials','textarea','Power plugs, drinking water, emergency services'],
 travelGuideUrl:['Official destination source URL','text','https://www.visitsingapore.com/...'],
 travelTransportUrl:['Official transport source URL','text','https://www.lta.gov.sg/...'],
 travelEntryUrl:['Official entry requirements URL','text','https://www.ica.gov.sg/...'],
 travelVerifiedOn:['Guide last reviewed on','date','YYYY-MM-DD'],
 locationAddress:['Experience location / area','text','Attraction address or district'],
 nearestTransit:['Nearest MRT / bus / transfer','text','Nearest transit, with exit if known'],
 gettingThere:['How to reach this attraction','textarea','Practical directions from official operator'],
 accessibilityNotes:['Accessibility & comfort','textarea','Age restrictions, walking, accessibility and family facilities'],
 visitorTips:['Visitor tips','textarea','Booking, timing, weather or queues'],
 mapUrl:['Map / directions URL','text','https://www.google.com/maps/...'],
 visitSourceUrl:['Official visit information URL','text','https://operator.example/...'],
 visitVerifiedOn:['Visit info last reviewed on','date','YYYY-MM-DD'],
 videoUrl:['Official / authorized YouTube video URL','text','https://www.youtube.com/watch?v=...'],
 videoTitle:['Video title','text','Optional video headline'],
 videoCredit:['Video creator / source','text','Official attraction or authorized creator'],
 featured:['Feature on homepage','checkbox','']
};
function blankFor(type){return {...Object.fromEntries((CONTENT_FIELDS[type]||[]).map(k=>[k,k==='featured'?false:k==='currency'?'INR':''])),imageVariants:{}};}
function Icon({name}){const shapes={LayoutDashboard:'▦',FileText:'▤',Image:'▧',Inbox:'✉',Layers:'▦'};return <span aria-hidden="true" className="a-icon">{shapes[name]||'◦'}</span>;}
export default function AdminConsole(){
 const [user,setUser]=useState(null),[staff,setStaff]=useState(null),[authBusy,setAuthBusy]=useState(true),[authError,setAuthError]=useState('');
 const completionTarget=useRef(null);
 const [section,setSection]=useState('dashboard'),[items,setItems]=useState([]),[editing,setEditing]=useState(null),[form,setForm]=useState(blankFor('destinations'));
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState(null),[mediaOpen,setMediaOpen]=useState(false),[imageTarget,setImageTarget]=useState('heroImage'),[confirmDelete,setConfirmDelete]=useState(false);
 const [dashboard,setDashboard]=useState({}),[health,setHealth]=useState(''),[search,setSearch]=useState(''),[filter,setFilter]=useState('all');
 const [enquiries,setEnquiries]=useState([]),[refresh,setRefresh]=useState(0),[mobileNav,setMobileNav]=useState(false);
 const [setupChecks,setSetupChecks]=useState(null);
 const [destinationOptions,setDestinationOptions]=useState([]);
 const [launchProgress,setLaunchProgress]=useState('');
 const [photoRightsReviewed,setPhotoRightsReviewed]=useState(false);
 const [expansionRightsReviewed,setExpansionRightsReviewed]=useState(false);
 const [expansionApprovedKeys,setExpansionApprovedKeys]=useState([]);
 useEffect(()=>{fetch('/api/admin/setup',{cache:'no-store'}).then(r=>r.json()).then(x=>setSetupChecks(x.checks)).catch(()=>{});},[]);
 const request=useCallback((path,opts)=>cmsRequest(path,opts),[]);
 useEffect(()=>{
  if(!isClientConfigured){setAuthBusy(false);setAuthError('Firebase web settings are missing. Add the values in .env.local as shown in the launch guide.');return;}
  let active=true, unsubscribe;
  const timer=setTimeout(()=>{
    if(active){setAuthBusy(false);setAuthError(previous=>previous||'Authentication took too long. Check the Microsoft provider, Firebase authorized domains, and network access, then retry.');}
  },12000);
  try{
   finishMicrosoftRedirect().catch(error=>{if(active){setAuthBusy(false);setAuthError(`Microsoft redirect: ${error.message}`);}});
   unsubscribe=onAuthStateChanged(clientAuth(),async(next)=>{
    if(!active)return;
    if(!next){setUser(null);setStaff(null);setAuthBusy(false);return;}
    setAuthBusy(true);
    try{
     const data=await verifyTeamUser(next);
     if(active){setUser(next);setStaff(data);setHealth(`${ROLE_LABELS[data.role]||data.role} · ${data.email||next.email}`);setAuthError('');if(data.role==='media')setSection('bulk');}
    }catch(err){if(active){setAuthError(err.message);setUser(null);setStaff(null);}}
    finally{if(active)setAuthBusy(false);}
   },error=>{if(active){setAuthBusy(false);setAuthError(error.message);}});
  }catch(err){setAuthError(err.message);setAuthBusy(false);}
  return ()=>{active=false;clearTimeout(timer);unsubscribe?.();};
 },[]);
 const load=useCallback(async()=>{
  if(!user)return;
  setBusy(true);
  try{
   if(groups.includes(section)){
    const data=await request(`/api/admin/content/${section}`);
    setItems(data.items);setEditing(null);setForm(blankFor(section));setSearch('');setFilter('all');
    const target=completionTarget.current;
    if(target?.type===section){const record=(data.items||[]).find(x=>x.slug===target.slug||x.id===target.slug);
     if(record){setEditing(record.id);setForm({...blankFor(section),...record});}
     completionTarget.current=null;
    }
    if(['experiences','journeys','offers'].includes(section)){const destinations=await request('/api/admin/content/destinations');setDestinationOptions(destinations.items||[]);}
   }else if(section==='dashboard'){
    const records=await Promise.all(groups.map(async(type)=>{const d=await request(`/api/admin/content/${type}`);return [type,d.items]}));
    setDashboard(Object.fromEntries(records));
   }
  }catch(err){setNotice({kind:'error',text:err.message});}
  finally{setBusy(false);}
 },[user,section,request]);
 useEffect(()=>{load();},[load,refresh]);
 async function login(){setAuthBusy(true);setAuthError('');try{await Promise.race([loginMicrosoft(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Microsoft sign-in did not complete. Check the popup, then try redirect sign-in.')),20000))]);}catch(err){const hint=err.code==='auth/unauthorized-domain'?'Add localhost and your live website domain under Firebase Authentication → Settings → Authorized domains.':err.code==='auth/operation-not-allowed'?'Enable the Microsoft provider in Firebase Authentication.':err.code==='auth/popup-blocked'||err.code==='auth/popup-closed-by-user'?'The popup was blocked or closed. Try redirect sign-in below.':'';setAuthError(`Microsoft sign-in failed (${err.code||'unknown'}): ${hint||err.message}`);setAuthBusy(false);}}
 async function loginRedirect(){setAuthBusy(true);setAuthError('');try{await loginMicrosoftRedirect();}catch(err){setAuthError(err.message);setAuthBusy(false);}}
 async function logout(){await signOut(clientAuth());setUser(null);setStaff(null);setSection('dashboard');}
 function switchSection(next){if(next==='team'&&!canManageTeam(staff?.role))return;if(next==='enquiries'&&!canReadEnquiries(staff?.role))return;completionTarget.current=null;setSection(next);setEditing(null);setNotice(null);setConfirmDelete(false);setMediaOpen(false);setMobileNav(false);setPhotoRightsReviewed(false);}
 function openFromCompletion(type,record){
  if(!record||!groups.includes(type))return;
  const slug=record.slug||record.id;
  if(section===type){startEdit({...record,id:slug});return;}
  switchSection(type);
  completionTarget.current={type,slug};
 }
 function startNew(){if(!canCreateContent(staff?.role))return;setEditing('new');setForm(blankFor(section));setNotice(null);setConfirmDelete(false);setPhotoRightsReviewed(false);}
 function selectPagePreset(slug,title){const found=items.find(item=>item.slug===slug);if(found){startEdit(found);}else{const seed=LAUNCH_STARTERS.find(x=>x.type==='pages'&&x.slug===slug);setEditing('new');setForm({...blankFor('pages'),...seed,title,slug,summary:seed?.summary||`${title} at TrawellBeyond.`});setNotice(null);} }
 function startEdit(item){setEditing(item.id);setForm({...blankFor(section),...item});setNotice(null);setConfirmDelete(false);setPhotoRightsReviewed(false);}
 function patch(field,val){setForm(prev=>({...prev,[field]:val,...(STORY_IMAGE_FIELDS.includes(field)&&prev.status==='draft'&&!canPublishContent(staff?.role)?{mediaReviewStatus:'pending',mediaReviewedAt:'',mediaReviewedBy:''}:{})}));}
 function updateImageList(field,callback){
  setForm(prev=>{const images=String(prev[field]||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);return {...prev,[field]:callback(images).join('\n')};});
 }
 const photoSearchQuery=(target)=>{
  const base=section==='destinations'?form.title||'Singapore':`${form.title||'Singapore'} ${form.destinationSlug||''}`;
  if(section==='experiences'&&SINGAPORE_PHOTO_SEARCH[form.slug])return SINGAPORE_PHOTO_SEARCH[form.slug];
  const terms={storyHeroImage:'meaningful journeys human connection travel',storyOriginImage:'travel planning map notebook',storyPeopleImage:'travel consultant genuine team',storyImage1:'Gardens by the Bay Supertree Grove Singapore',storyImage2:'Little India Singapore street',storyImage3:'Sentosa Palawan Beach Singapore',heroImage:base,homeCreateImage:'Singapore travel',galleryImages:`${base} attractions`,dayImages:'Singapore Marina Bay Gardens Sentosa'};
  return terms[target]||base;
 };
 function fillSingaporeKnowledge(){
  const defaults=section==='destinations'&&form.slug==='singapore'?SINGAPORE_TRAVEL_GUIDE:
   section==='experiences'&&form.destinationSlug==='singapore'?SINGAPORE_VISITOR_GUIDES[form.slug]:null;
  if(!defaults){setNotice({kind:'error',text:'No reviewed Singapore travel guide is available for this record. Add verified guidance manually.'});return;}
  const result=fillMissingKnowledge(form,defaults);
  if(!result.added.length){setNotice({kind:'success',text:'Available travel and video guidance is already present. Your edits were preserved.'});return;}
  if(!window.confirm(`Fill ${result.added.length} empty Singapore travel / video field(s) from reviewed official references? Existing values and publication status will not change. Review before saving.`))return;
  setForm(result.record);
  setNotice({kind:'success',text:`Prepared ${result.added.length} additional field(s). Click Save Published Changes or Save Draft to commit them. Nothing is published automatically.`});
 }
 function fillExperienceEditorial(){
  if(section!=='experiences'||form.destinationSlug!=='singapore')return;
  const result=fillSingaporeExperienceGaps(form);
  if(!result.added.length){setNotice({kind:'success',text:'All available Singapore editorial fields are already filled. Existing custom text was preserved.'});return;}
  if(!window.confirm(`Fill ${result.added.length} missing or untouched starter field(s) from the Singapore editorial master? Your custom copy, selected photos and publication status will stay unchanged. Review before saving.`))return;
  setForm(result.record);
  setNotice({kind:'success',text:`Filled ${result.added.length} fields: ${result.added.join(', ')}. Review the copy and select Save Published Changes or Save Draft to commit.`});
 }
 async function save(status){
  if(busy||!staff||(!canPublishContent(staff.role)&&status==='published')||(editing==='new'&&!canCreateContent(staff.role))||(editing!=='new'&&!canEditRecord(staff.role,form)))return;
  setBusy(true);setNotice(null);
  try{
   const draft={...form,status};
   if(editing==='new')draft.slug=slugify(draft.slug||draft.title);
   const method=editing==='new'?'POST':'PUT';
   const path=`/api/admin/content/${section}${editing==='new'?'':`/${editing}`}`;
   const data=await request(path,{method,body:draft});
   setEditing(data.item.id);setForm(data.item);
   setNotice({kind:'success',text:status==='published'?'Publication saved in Firestore. Open View Live to verify it displays correctly.':'Draft saved successfully.'});
   const fresh=await request(`/api/admin/content/${section}`);setItems(fresh.items);
  }catch(err){setNotice({kind:'error',text:err.message});}
  finally{setBusy(false);}
 }
 async function approveAutomatedMedia(){
  if(!staff||!canPublishContent(staff.role)||editing==='new'||!editing||form.status!=='draft'||form.mediaReviewStatus!=='pending')return;
  const answer=window.prompt('Review the actual photos on this Draft, including gallery/day pictures, subjects and photo credits. Type APPROVE PHOTOS to mark these particular images reviewed.');
  if(answer!=='APPROVE PHOTOS')return;
  setBusy(true);setNotice(null);
  try{
   const data=await request('/api/admin/bulk/review-photography',{method:'POST',body:{type:section,id:editing,expectedUpdatedAt:form.updatedAt,reviewed:true}});
   setForm(data.item);setItems(prev=>prev.map(x=>x.id===data.item.id?data.item:x));
   setNotice({kind:'success',text:'Photos marked reviewed. Recheck text and travel details before publishing; publication is still a separate action.'});
  }catch(e){setNotice({kind:'error',text:e.message});}
  finally{setBusy(false);}
 }
 async function deleteItem(){
  if(!canDeleteContent(staff?.role)||!editing||editing==='new'||busy)return;
  setBusy(true);
  try{
   await request(`/api/admin/content/${section}/${editing}`,{method:'DELETE'});
   setEditing(null);setConfirmDelete(false);setForm(blankFor(section));
   const fresh=await request(`/api/admin/content/${section}`);setItems(fresh.items);
   setNotice({kind:'success',text:'Record deleted.'});
  }catch(err){setNotice({kind:'error',text:err.message});}
  finally{setBusy(false);}
 }
 async function installLaunchPack(){
  if(busy||!canCreateContent(staff?.role))return;
  if(!window.confirm('Install the starter records as private Drafts? Existing records will not be overwritten.'))return;
  setBusy(true);setNotice(null);
  const result={created:0,skipped:0,failed:[]};
  try{
   const existing={};
   for(const group of groups){const response=await request(`/api/admin/content/${group}`);existing[group]=new Set((response.items||[]).map(x=>x.slug||x.id));}
   const initialStarters=LAUNCH_STARTERS.filter(entry=>!EXPANSION_STARTERS.some(expanded=>expanded.type===entry.type&&expanded.slug===entry.slug));
   for(const entry of initialStarters){
    if(existing[entry.type].has(entry.slug)){result.skipped++;continue;}
    setLaunchProgress(`Creating ${result.created+result.skipped+1} / ${initialStarters.length}: ${entry.title}`);
    try{await request(`/api/admin/content/${entry.type}`,{method:'POST',body:{...entry,status:'draft'}});existing[entry.type].add(entry.slug);result.created++;}
    catch(err){result.failed.push(`${entry.slug}: ${err.message}`);}
   }
   setNotice({kind:result.failed.length?'error':'success',text:`Starter installation: ${result.created} drafts created, ${result.skipped} already existed, ${result.failed.length} failed.${result.failed.length?' First error: '+result.failed[0]:''} Nothing was published.`});
   setRefresh(x=>x+1);
  }catch(err){setNotice({kind:'error',text:err.message});}
  finally{setLaunchProgress('');setBusy(false);}
 }
 async function installExpansionPack(){
  if(busy)return;
  if(!window.confirm('Create Dubai and Thailand destination, experience and journey DRAFTS? Existing content and Singapore records will not be changed. Nothing is published automatically.'))return;
  setBusy(true);setNotice(null);
  const outcome={created:0,skipped:0,failures:[]};
  try{
   const existing={};
   for(const type of ['destinations','experiences','journeys']){
    const response=await request(`/api/admin/content/${type}`);
    existing[type]=new Set((response.items||[]).map(x=>x.slug||x.id));
   }
   for(const item of EXPANSION_STARTERS){
    if(existing[item.type].has(item.slug)){outcome.skipped++;continue;}
    setLaunchProgress(`Dubai + Thailand drafts: ${outcome.created+outcome.skipped+1} / ${EXPANSION_STARTERS.length} — ${item.title}`);
    try{
     await request(`/api/admin/content/${item.type}`,{method:'POST',body:{...item,status:'draft'}});
     existing[item.type].add(item.slug);outcome.created++;
    }catch(error){outcome.failures.push(`${item.slug}: ${error.message}`);}
   }
   setNotice({kind:outcome.failures.length?'error':'success',text:`Dubai + Thailand: ${outcome.created} drafts created; ${outcome.skipped} existing records preserved; ${outcome.failures.length} errors.${outcome.failures.length?' First issue: '+outcome.failures[0]:''} Nothing was published.`});
   setRefresh(x=>x+1);
  }catch(error){setNotice({kind:'error',text:error.message});}
  finally{setLaunchProgress('');setBusy(false);}
 }
 async function importExpansionMedia(){
  if(busy||!expansionRightsReviewed||!expansionApprovedKeys.length)return;
  if(!window.confirm('Import only the reviewed Dubai + Thailand Wikimedia files? The API will verify each selected image licence and source again. Missing photos are filled safely; existing images and published status will not be changed. Some candidates may fail and need individual review.'))return;
  setBusy(true);setNotice(null);
  const outcome={imported:0,reused:0,updated:0,skipped:0,failures:[]};
  const imports={};
  try{
   const mediaResult=await request('/api/admin/media');
   const stored=mediaResult.items||[];
   const content={};const neededKeys=new Set();
   for(const type of ['destinations','experiences','journeys']){
    const response=await request(`/api/admin/content/${type}`);
    content[type]=(response.items||[]).filter(r=>r.slug==='dubai'||r.slug==='thailand'||['dubai','thailand'].includes(r.destinationSlug));
    for(const record of content[type])for(const key of expansionPhotoKeysFor(type,record.slug))neededKeys.add(key);
   }
   const selected=EXPANSION_PHOTO_LIST.filter(photo=>neededKeys.has(photo.key)&&expansionApprovedKeys.includes(photo.key));
   const canonical=url=>{try{return decodeURIComponent(new URL(url).pathname).replace(/_/g,' ').toLowerCase();}catch{return '';}};
   for(let i=0;i<selected.length;i++){
    const photo=selected[i];
    setLaunchProgress(`Dubai + Thailand photography: ${i+1} / ${selected.length} — ${photo.caption}`);
    try{
     const already=stored.find(asset=>asset.rightsConfirmed===true&&canonical(asset.sourcePage)===canonical(photo.source));
     if(already){imports[photo.key]=already;outcome.reused++;continue;}
     const response=await fetch(`/api/commons/resolve?file=${encodeURIComponent(photo.filename)}`,{cache:'no-store'});
     const result=await response.json();
     if(!response.ok||!result.item)throw new Error(result.error||'File or licence not verified.');
     const item=result.item;
     if(!permittedCommonsLicense(item.license))throw new Error('Current Commons licence is not verified for commercial reuse.');
     const imported=await request('/api/admin/media/import',{method:'POST',body:{url:item.url,sourcePage:item.sourcePage,credit:item.credit,license:item.license,licenseUrl:item.licenseUrl,altText:photo.caption,rightsAccepted:true}});
     imports[photo.key]=imported.item;stored.push(imported.item);outcome.imported++;
    }catch(error){outcome.failures.push(`${photo.filename}: ${error.message}`);}
   }
   for(const type of ['destinations','experiences','journeys'])for(const record of content[type]){
    const result=attachExpansionPhotos(type,record,imports);
    if(!result){outcome.skipped++;continue;}
    const fields={};
    // Transaction-based missing-only CMS completion: publication and user copy
    // cannot be overwritten, even if another editor has changed a record.
    for(const key of ['heroImage','storyImage1','storyImage2','storyImage3','galleryImages','dayImages','photoCredit','photoLicense','photoSourceUrl','imageCredits','imageVariants']){
     if(JSON.stringify(result.record[key]??'')!==JSON.stringify(record[key]??''))fields[key]=result.record[key];
    }
    if(!Object.keys(fields).length){outcome.skipped++;continue;}
    setLaunchProgress(`Connecting verified photographs — ${record.title}`);
    try{
     const result=await request('/api/admin/completion/fill',{method:'POST',body:{type,id:record.slug,fields}});
     if((result.applied||[]).length)outcome.updated++;else outcome.skipped++;
    }catch(error){outcome.failures.push(`${record.slug}: ${error.message}`);}
   }
   setNotice({kind:outcome.failures.length?'error':'success',text:`Dubai + Thailand media: ${outcome.imported} imported as optimized images, ${outcome.reused} reused, ${outcome.updated} records updated, ${outcome.skipped} unchanged, ${outcome.failures.length} issues.${outcome.failures.length?' First issue: '+outcome.failures[0]:''} No content was published. Run Content Completion to see remaining gaps.`});
   setRefresh(x=>x+1);
  }catch(error){setNotice({kind:'error',text:error.message});}
  finally{setLaunchProgress('');setBusy(false);}
 }
 async function importSingaporeMedia(){
  if(busy)return;
  if(!window.confirm('Please verify each source and licence in the Singapore photo manifest before continuing. Import the shortlisted Singapore Commons photos into Firebase Storage and link them to existing CMS records? Custom images remain unchanged. Missing photos on both Draft and Published Singapore records will be filled when their verified sources import successfully. This may import only a portion if Wikimedia is unavailable.'))return;
  setBusy(true);setNotice(null);
  const outcome={imported:0,reused:0,updated:0,skipped:0,failures:[]};
  const imports={};
  try{
   const media=await request('/api/admin/media');
   const existing=media.items||[];
   const photos=Object.values(SG_PHOTOS);
   for(let index=0;index<photos.length;index++){
    const photo=photos[index];
    setLaunchProgress(`Importing Singapore photograph ${index+1} of ${photos.length}: ${photo.caption}`);
    try{
     const canonicalSource=url=>{try{return decodeURIComponent(new URL(url).pathname).replace(/_/g,' ').toLowerCase();}catch{return '';}};
     const already=existing.find(asset=>canonicalSource(asset.sourcePage)===canonicalSource(photo.source)&&asset.rightsConfirmed===true);
     if(already){imports[photo.url]=already;outcome.reused++;continue;}
     const response=await fetch(`/api/commons/resolve?file=${encodeURIComponent(photo.filename)}`,{cache:'no-store'});
     const resolved=await response.json();
     if(!response.ok||!resolved.item)throw new Error(resolved.error||'Photo source could not be verified.');
     const item=resolved.item;
     if(!permittedCommonsLicense(item.license))throw new Error('The source does not have a verified commercially reusable licence.');
     const asset=await request('/api/admin/media/import',{method:'POST',body:{url:item.url,sourcePage:item.sourcePage,credit:item.credit,license:item.license,licenseUrl:item.licenseUrl,rightsAccepted:true}});
     imports[photo.url]=asset.item;existing.push(asset.item);outcome.imported++;
    }catch(error){outcome.failures.push(`${photo.filename}: ${error.message}`);}
   }
   for(const type of ['destinations','experiences','journeys']){
    const response=await request(`/api/admin/content/${type}`);
    const records=new Map((response.items||[]).map(item=>[item.slug,item]));
    for(const starter of LAUNCH_STARTERS.filter(x=>x.type===type&&(x.destinationSlug==='singapore'||x.slug==='singapore'))){
     const current=records.get(starter.slug);if(!current){outcome.skipped++;continue;}
     const replacement=attachSingaporeStoredPhotos(type,current,starter,imports);
     if(!replacement){outcome.skipped++;continue;}
     setLaunchProgress(`Connecting photographs: ${current.title}`);
     try{await request(`/api/admin/content/${type}/${current.slug}`,{method:'PUT',body:replacement});outcome.updated++;}
     catch(error){outcome.failures.push(`${current.slug}: ${error.message}`);}
    }
   }
   setNotice({kind:outcome.failures.length?'error':'success',text:`Singapore media: ${outcome.imported} imported to Storage, ${outcome.reused} reused, ${outcome.updated} CMS records updated, ${outcome.skipped} unchanged or absent, ${outcome.failures.length} issues.${outcome.failures.length?' First issue: '+outcome.failures[0]:''} Retry safely if needed.`});
   setRefresh(x=>x+1);
  }catch(error){setNotice({kind:'error',text:error.message});}
  finally{setLaunchProgress('');setBusy(false);}
 }
 // Repair the record the editor is looking at. This works for Published records,
 // changes only missing/shortlisted photos and keeps all editorial content intact.
 async function restoreCurrentSingaporePhotos(){
  if(busy||!photoRightsReviewed||!editing||editing==='new'||!photoStarter)return;
  if(form.status==='published'&&!window.confirm('This will update the photos on the already published Singapore page. Continue?'))return;
  setBusy(true);setNotice(null);
  const outcome={imported:0,reused:0,failed:[]},imports={};
  try{
   const response=await request('/api/admin/media');
   const existing=response.items||[];
   const sourceKey=url=>{try{return decodeURIComponent(new URL(url).pathname).replace(/_/g,' ').toLowerCase();}catch{return '';}};
   const required=singaporePhotoPlan(section,form,photoStarter);
   for(let index=0;index<required.length;index++){
    const photo=required[index];
    setLaunchProgress(`Verifying & importing photo ${index+1}/${required.length}: ${photo.caption||photo.filename}`);
    try{
     const reused=existing.find(asset=>sourceKey(asset.sourcePage)===sourceKey(photo.source)&&asset.rightsConfirmed===true);
     if(reused){imports[photo.url]=reused;outcome.reused++;continue;}
     const metadataResponse=await fetch(`/api/commons/resolve?file=${encodeURIComponent(photo.filename)}`,{cache:'no-store'});
     const metadata=await metadataResponse.json().catch(()=>({}));
     if(!metadataResponse.ok||!metadata.item)throw new Error(metadata.error||'Could not verify file details');
     const item=metadata.item;
     if(!permittedCommonsLicense(item.license))throw new Error('Commercial image licence is not verified.');
     const assetResponse=await request('/api/admin/media/import',{method:'POST',body:{url:item.url,sourcePage:item.sourcePage,credit:item.credit,license:item.license,licenseUrl:item.licenseUrl,rightsAccepted:true}});
     if(!assetResponse.item?.url)throw new Error('Image was not saved in Firebase Storage.');
     imports[photo.url]=assetResponse.item;
     existing.push(assetResponse.item);
     outcome.imported++;
    }catch(error){outcome.failed.push(`${photo.filename}: ${error.message}`);}
   }
   const recovery=restoreSingaporeRecordPhotos(section,form,photoStarter,imports);
   if(!recovery){
    setNotice({kind:'error',text:`No new photos could be attached. ${outcome.failed.length} import issue(s). ${outcome.failed.slice(0,2).join(' | ')||'All photo fields may already be complete.'}`});
    return;
   }
   setLaunchProgress('Saving the repaired Singapore page in Firestore...');
   const saved=await request(`/api/admin/content/${section}/${editing}`,{method:'PUT',body:recovery.record});
   setForm(saved.item);
   setItems(prev=>prev.map(item=>item.slug===saved.item.slug?saved.item:item));
   setPhotoRightsReviewed(false);
   const summary=`Images saved: ${recovery.added.length} previously empty field(s) filled, ${recovery.replaced.length} existing Commons field(s) moved to Storage. ${outcome.imported} new photos imported, ${outcome.reused} reused. ${outcome.failed.length} source issue(s). ${recovery.stillMissing.length?'Still missing: '+recovery.stillMissing.join(', ')+'. ':''}${outcome.failed.length?'First issue: '+outcome.failed[0]:''}`;
   setNotice({kind:outcome.failed.length||recovery.stillMissing.length?'error':'success',text:summary});
  }catch(error){setNotice({kind:'error',text:`Photo recovery failed: ${error.message}. Your existing content has not been reset.`});}
  finally{setBusy(false);setLaunchProgress('');}
 }
 async function publishCorePages(){
  if(busy||!canPublishContent(staff?.role))return;
  if(!window.confirm('Publish the 9 ready-to-review Website Pages (header/footer, homepage, story, services, FAQs, contact, CREATE, enquiry and journal)? Privacy and Terms remain private Drafts.'))return;
  setBusy(true);setNotice(null);
  const results={published:0,skipped:0,failed:[]};
  try{
   const data=await request('/api/admin/content/pages');
   const found=new Map(data.items.map(x=>[x.slug,x]));
   for(const slug of STARTER_PUBLISH_PAGES){
    const item=found.get(slug);
    if(!item){results.failed.push(`${slug}: install starter content first`);continue;}
    if(item.status==='published'){results.skipped++;continue;}
    setLaunchProgress(`Publishing ${slug}...`);
    try{await request(`/api/admin/content/pages/${slug}`,{method:'PUT',body:{...item,status:'published'}});results.published++;}
    catch(error){results.failed.push(`${slug}: ${error.message}`);}
   }
   setNotice({kind:results.failed.length?'error':'success',text:`Core pages: ${results.published} published, ${results.skipped} already published, ${results.failed.length} failed.${results.failed.length?' First error: '+results.failed[0]:''} Privacy and Terms require separate review.`});
   setRefresh(x=>x+1);
  }catch(error){setNotice({kind:'error',text:error.message});}
  finally{setLaunchProgress('');setBusy(false);}
 }
 async function changeEnquiry(id,status){
  setBusy(true);setNotice(null);
  try{await request('/api/admin/enquiries',{method:'PATCH',body:{id,status}});setRefresh(x=>x+1);}
  catch(err){setNotice({kind:'error',text:err.message});}finally{setBusy(false);}
 }
 const journeyMediaStatus=section==='journeys'&&editing?journeyPhotoReadiness(form):null;
 const photoStarter=groups.includes(section)&&editing&&editing!=='new'?LAUNCH_STARTERS.find(record=>record.type===section&&record.slug===form.slug&&(record.slug==='singapore'||record.destinationSlug==='singapore')):null;
 const photoPlan=photoStarter?singaporePhotoPlan(section,form,photoStarter):[];
 const publicationChecks=groups.includes(section)&&editing?[
  ['Cover photograph',!!form.heroImage],
  ['Short summary',!!form.summary],
  ...(section==='destinations'?[['Three destination stories',!!form.storyTitle1&&!!form.storyTitle2&&!!form.storyTitle3],['Story photographs',!!form.storyImage1&&!!form.storyImage2&&!!form.storyImage3]]:[]),
  ...(section==='experiences'?[['Practical information',!!form.duration||!!form.openingHours],['Experience gallery',!!form.galleryImages]]:[]),
  ...(section==='journeys'?[['Daily itinerary',!!form.itinerary],['Individual day photos',!!form.dayImages]]:[])
 ]:[];
 const canPublish=canPublishContent(staff?.role);
 const canDelete=canDeleteContent(staff?.role);
 const canEdit=editing==='new'?canCreateContent(staff?.role):canEditRecord(staff?.role,form);
 const visibleMenu=menu.filter(([id])=>(id!=='team'||canManageTeam(staff?.role))&&(id!=='enquiries'||canReadEnquiries(staff?.role))&&(staff?.role!=='media'||['bulk','media','destinations','experiences','journeys','completion'].includes(id)));
 const showing=items.filter(it=>(filter==='all'||it.status===filter) && [it.title,it.slug,it.destinationSlug].join(' ').toLowerCase().includes(search.toLowerCase()));
 const publicRoute={destinations:'/destinations',experiences:'/experiences',journeys:'/journeys',offers:'/offers',pages:'/'};
 const liveLink=section==='pages'?(editing==='homepage'||editing==='site-settings'?'/':`/${editing}`):`${publicRoute[section]}/${editing}`;
 if(authBusy)return <div className="a-auth-page"><div className="a-auth-panel"><img src="/trawellbeyond-logo.svg" alt="TrawellBeyond"/><p>Checking your Microsoft session…</p><button className="a-btn a-outline" onClick={()=>{setAuthBusy(false);setAuthError('Session check was cancelled. Sign in again to continue.');}}>Show sign-in options</button></div></div>;
 if(!user)return <div className="a-auth-page"><div className="a-auth-panel"><img src="/trawellbeyond-logo.svg" alt="TrawellBeyond"/><small>TRAWELLBEYOND / PRIVATE CONTENT STUDIO</small><h1>A simpler way to publish.</h1><p>Sign in with Microsoft. Access is verified using your existing teamUsers membership in Firestore; no Firebase Admin SDK or service-account key is required.</p>{authError&&<div className="a-alert a-error" role="alert">{authError}</div>}<button onClick={login} disabled={!isClientConfigured} className="a-btn a-primary">Sign in with Microsoft ↗</button><button onClick={loginRedirect} disabled={!isClientConfigured} className="a-btn a-outline">Popup not working? Try redirect sign-in</button><button onClick={async()=>{try{await signOut(clientAuth());setAuthError('Signed out. Select the correct Microsoft account.');}catch(err){setAuthError(err.message);}}} className="a-btn a-text">Clear previous sign-in</button>{setupChecks&&<details className="a-setup"><summary>Check Firebase setup</summary><p>These are presence checks only; credentials are never displayed.</p>{Object.entries(setupChecks).map(([key,val])=><div key={key}>{val?'✓':'✕'} {key}</div>)}<p>No server credentials required. Keep your teamUsers record with your Firebase UID, active: true and role: super_admin or admin.</p></details>}<Link href="/">← Return to website</Link></div></div>;
 return <div className="a-app">
  <aside className={`a-sidebar ${mobileNav?'a-open':''}`}>
   <div className="a-brand"><img src="/trawellbeyond-logo.svg" alt="TrawellBeyond"/><span>CONTENT STUDIO</span></div>
   <nav aria-label="Admin Navigation">{visibleMenu.map(([id,icon,title])=><button type="button" key={id} onClick={()=>switchSection(id)} className={`a-nav-item ${section===id?'active':''}`}><Icon name={icon}/>{title}</button>)}</nav>
   <div className="a-side-bottom"><small>{user.email}</small><button type="button" onClick={logout}>Sign out ↗</button><Link href="/" target="_blank">View Website ↗</Link></div>
  </aside>
  <main className="a-main">
   <header className="a-topbar"><button className="a-menu-toggle" onClick={()=>setMobileNav(v=>!v)}>☰</button><span>TRAWELLBEYOND / CONTENT STUDIO</span><div className="a-topbar-right"><span className="a-online-dot"/> {health || 'Session authenticated'}</div></header>
   <div className="a-page">
   <div className="a-heading"><div><span className="a-eyebrow">MANAGE YOUR WEBSITE</span><h1>{section==='dashboard'?'Your website, simplified.':section==='media'?'Your media library.':section==='enquiries'?'Customer enquiries.':section==='team'?'Team & Access.':section==='completion'?'Content Completion Center.':section==='bulk'?'Bulk Content Rollout.':CONTENT_LABELS[section]}</h1><p>{section==='dashboard'?'Everything you need to get your content live, without complicated approvals.':section==='media'?'Upload your own images or import appropriately licensed photos from Wikimedia Commons.':section==='enquiries'?'Every new enquiry received from the website.':section==='team'?'Invite teammates with the right content roles without sharing admin credentials.':section==='completion'?'Scan and safely complete missing content and image data across the website.':section==='bulk'?'Install reviewed destination drafts, complete media and publish only approved content.':'Create, edit, save and publish from one place.'}</p></div>{groups.includes(section)&&!editing&&canCreateContent(staff?.role)&&<button className="a-btn a-primary" onClick={startNew}>+ Add {section==='pages'?'Page':section.slice(0,-1)}</button>}{groups.includes(section)&&editing&&<button className="a-btn a-outline" onClick={()=>{setEditing(null);setNotice(null);}}>← All {CONTENT_LABELS[section]}</button>}</div>
   {notice&&<div className={`a-alert ${notice.kind==='error'?'a-error':'a-success'}`} role="status">{notice.text}</div>}
   {section==='dashboard'&&<><section className="a-launch-panel"><span>LAUNCH SETUP / CONTENT</span><h2>Prepare the website for publishing.</h2><p>Install the core website pages and prepared destination starters as private Drafts. For Dubai and Thailand, the dedicated section below makes importing simpler. Nothing goes live during import.</p><div className="a-launch-actions"><button disabled={busy} className="a-btn a-primary" onClick={installLaunchPack}>1. Install starter drafts</button><button disabled={busy} className="a-btn a-outline" onClick={importSingaporeMedia}>2. Import & attach Singapore photos</button><button disabled={busy} className="a-btn a-outline" onClick={publishCorePages}>3. Publish core website pages</button><button disabled={busy} className="a-btn a-outline" onClick={()=>switchSection('destinations')}>4. Review Singapore</button></div><small>Legal pages (Privacy and Terms), attraction schedules, media licences and journey inclusions require your review before publication.</small>{launchProgress&&<p role="status" className="a-progress">{launchProgress}</p>}</section><section className="a-launch-panel"><span>V7.8 / TWO DESTINATIONS</span><h2>Dubai + Thailand, together.</h2><p>Install {EXPANSION_COUNTS.destinations} cinematic destination drafts, {EXPANSION_COUNTS.experiences} attraction drafts and {EXPANSION_COUNTS.journeys} suggested journeys. They reuse the Singapore master design. Existing records stay as they are, and new content is private until you publish.</p><div className="a-launch-actions"><button disabled={busy} className="a-btn a-primary" onClick={installExpansionPack}>1. Install Dubai + Thailand drafts</button><button disabled={busy||!expansionRightsReviewed||!expansionApprovedKeys.length} className="a-btn a-outline" onClick={importExpansionMedia}>2. Import {expansionApprovedKeys.length} reviewed WebP photos</button><button disabled={busy} className="a-btn a-outline" onClick={()=>switchSection('completion')}>3. Scan content and media</button><button disabled={busy} className="a-btn a-outline" onClick={()=>switchSection('destinations')}>4. Review before publishing</button></div><details><summary>Review {EXPANSION_PHOTO_LIST.length} Wikimedia photo candidates and licences</summary><div className="a-recovery-grid">{EXPANSION_PHOTO_LIST.map(photo=><div className="a-recovery-photo" key={photo.key}><img src={photo.url} alt={photo.caption} loading="lazy"/><div><strong>{photo.caption}</strong><small>{photo.destinationSlug.toUpperCase()} · Licence and photographer must be reverified</small><a href={photo.source} target="_blank" rel="noopener noreferrer">Verify original source ↗</a><label className="a-checkbox"><input type="checkbox" checked={expansionApprovedKeys.includes(photo.key)} onChange={e=>{setExpansionRightsReviewed(false);setExpansionApprovedKeys(prev=>e.target.checked?[...prev,photo.key]:prev.filter(key=>key!==photo.key));}}/> Approve this photograph for import</label></div></div>)}</div></details><label className="a-checkbox"><input type="checkbox" checked={expansionRightsReviewed} onChange={e=>setExpansionRightsReviewed(e.target.checked)}/> I reviewed the selected {expansionApprovedKeys.length} photographs and their Commons source/licence terms; import only those accepted.</label><small>Files missing a valid licence, source, photographer or download are skipped and reported. Images are converted to WebP where supported. There is no auto-publication and no Firebase reset.</small></section><section className="a-launch-panel"><span>V7.9 / ALL REMAINING DESTINATIONS</span><h2>17 destinations. One publishing workflow.</h2><p>Install 153 curated private drafts, complete real licensed photography, review factual guidance and publish approved pages in controlled batches.</p><button className="a-btn a-primary" onClick={()=>switchSection('bulk')}>Open Bulk Rollout ↗</button></section><div className="a-stats">{groups.slice(0,4).map(type=>{const entries=dashboard[type]||[];return <button key={type} onClick={()=>switchSection(type)} className="a-stat"><span>{CONTENT_LABELS[type]}</span><strong>{entries.length}</strong><small>{entries.filter(x=>x.status==='published').length} published · {entries.filter(x=>x.status==='draft').length} drafts</small></button>})}</div><div className="a-dashboard-guides"><section><span>START HERE / 01</span><h2>Publish your first destination.</h2><p>Start with one destination. Save it as a draft, choose a photo, then publish. View it on the public website to confirm everything works.</p><button className="a-btn a-primary" onClick={()=>switchSection('destinations')}>Open Destinations ↗</button></section><section><span>HOW IT WORKS / 02</span><h2>Just two states.</h2><p><b>Draft</b> is private. <b>Published</b> appears on the website immediately. You can switch back to Draft anytime and keep editing your content.</p><button className="a-btn a-outline" onClick={()=>switchSection('completion')}>Scan missing content ↗</button></section></div><p className="a-note">No old content is imported automatically. The database stays clean until you add and publish records.</p></>}
   {groups.includes(section)&&!editing&&<>{section==='pages'&&<div className="a-page-presets"><p>Header & Footer controls global navigation and contact links. Homepage controls hero and section copy. Featured destinations and journeys appear after their separate records are published.</p><div>{pagePresets.map(([slug,name])=><button key={slug} className="a-btn a-outline" onClick={()=>selectPagePreset(slug,name)}>{items.some(item=>item.slug===slug)?'Edit':'Prepare'} {name} ↗</button>)}</div></div>}<div className="a-tools"><input aria-label="Search" placeholder="Search by title, destination or URL…" value={search} onChange={e=>setSearch(e.target.value)}/><select aria-label="Filter status" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All records</option><option value="draft">Drafts</option><option value="published">Published</option></select><button className="a-btn a-outline" onClick={()=>setRefresh(x=>x+1)}>Refresh</button></div>{busy&&<p>Loading content…</p>}{!busy&&showing.length===0&&<div className="a-empty"><span>✳</span><h2>Nothing here yet.</h2><p>Add your first record. You can save it privately before publishing.</p><button className="a-btn a-primary" onClick={startNew}>Create first {section==='pages'?'page':'record'} ↗</button></div>}<div className="a-table">{showing.map(item=><button key={item.id} className="a-table-row" onClick={()=>startEdit(item)}><span className="a-row-thumb" style={item.heroImage?{backgroundImage:`url(${item.heroImage})`}:undefined}>{!item.heroImage?'◻':null}</span><span className="a-table-info"><b>{item.title}</b><small>/{item.slug} · Updated {item.updatedAt?new Date(item.updatedAt).toLocaleDateString('en-IN'):'—'}</small></span><span className={`a-status ${item.status==='published'?'published':'draft'}`}>{item.status}</span><span>↗</span></button>)}</div></>}
   {groups.includes(section)&&editing&&<div className="a-editor-shell"><div className="a-editor"><div className="a-editor-top"><h2>{editing==='new'?'Create new content':'Edit content'}</h2><span className={`a-status ${form.status==='published'?'published':'draft'}`}>{form.status||'draft'}</span></div>{section==='experiences'&&form.destinationSlug==='singapore'&&editing!=='new'&&<section className="a-photo-recovery"><div className="a-photo-recovery-heading"><div><span>SINGAPORE EXPERIENCE CONTENT</span><h3>Complete missing attraction details</h3><p>Fill missing descriptions, practical information and official links from the editorial master. Custom edits, photos and publication status are preserved. Review before saving.</p></div></div><button type="button" className="a-btn a-outline" onClick={fillExperienceEditorial}>Fill missing Singapore details ↗</button></section>}{((section==='destinations'&&form.slug==='singapore')||(section==='experiences'&&form.destinationSlug==='singapore'))&&<section className="a-knowledge-quick"><span>V7.5 / TRAVEL GUIDANCE + VIDEO</span><div><h3>{section==='destinations'?'Singapore Travel Essentials':'Plan Your Visit + Video'}</h3><p>Fill only empty fields using reviewed official references. Existing content and Published status are preserved. Check sources and save before displaying changes live.</p></div><button type="button" className="a-btn a-outline" onClick={fillSingaporeKnowledge}>Fill missing travel / video guidance</button></section>}{photoStarter&&<section className="a-photo-recovery"><div className="a-photo-recovery-heading"><div><span>SINGAPORE PHOTO RECOVERY</span><h3>Complete missing photographs without pasting URLs.</h3><p>This uses checked Wikimedia Commons sources and stores photos in your Firebase Storage. Published pages stay published; your own photos and all written content are preserved.</p></div><span className="a-photo-count">{photoPlan.length} source{photoPlan.length===1?'':'s'} to check</span></div>{photoPlan.length>0?<><div className="a-recovery-grid">{photoPlan.map(photo=><div className="a-recovery-photo" key={photo.filename}><img src={photo.url} alt={photo.caption||photo.filename} loading="lazy"/><div><strong>{photo.caption||photo.filename}</strong><small>{photo.license} · {photo.credit}</small><a href={photo.source} target="_blank" rel="noopener noreferrer">Check source &amp; licence ↗</a></div></div>)}</div><label className="a-checkbox"><input type="checkbox" checked={photoRightsReviewed} onChange={e=>setPhotoRightsReviewed(e.target.checked)}/> I have checked the source photos and their reuse/attribution requirements.</label><button type="button" className="a-btn a-primary" disabled={busy||!photoRightsReviewed} onClick={restoreCurrentSingaporePhotos}>{busy?'Importing photos…':'Import photos and fill missing sections ↗'}</button><small>Imports only verified, supported images; any failed item is reported and can be retried. No manual URL entry required.</small>{launchProgress&&<p role="status" className="a-recovery-progress">{launchProgress}</p>}</>:<p className="a-recovery-done">No missing or shortlisted Commons photographs detected. You can still replace individual photos through the Media Library.</p>}</section>}{journeyMediaStatus&&<section className="a-journey-media-audit">
  <h3>Journey images &amp; photo gallery</h3>
  <p>One photograph per itinerary day, plus an optional 3-photo gallery. If the gallery is empty, the website now displays your existing day photos automatically. Missing day photos still need accurate licensed photographs.</p>
  <div className="a-journey-media-counts"><span>{journeyMediaStatus.explicitDayCount} / {journeyMediaStatus.days} individual day photos</span><span>{journeyMediaStatus.galleryCount} gallery photos</span><span>{journeyMediaStatus.availableGalleryCount} usable images on this journey</span></div>
  <button className="a-btn a-outline" type="button" onClick={()=>setForm(prev=>({...prev,galleryImages:journeyGalleryPhotos(prev).join('\n')}))}>Use existing day photos to complete the gallery ↗</button>
  <p>To convert and colour-correct your photos, choose a photo in the Media Library → Crop / optimize copy → optionally adjust brightness, contrast and saturation → Use this photo → Save Published Changes. New uploads create WebP display, medium and thumbnail variants.</p>
 </section>}<div className="a-form-grid">{CONTENT_FIELDS[section].map(field=>{
    if(knowledgeFields.has(field)||(staff?.role==='media'&&!MEDIA_EDIT_FIELDS.includes(field)))return null;
    const def=fields[field];if(!def)return null;
    if(section==='pages'&&storyFieldSet.has(field))return null;
    if(field.startsWith('home') && !(section==='pages'&&form.slug==='homepage'))return null;
    if(field.startsWith('site') && !(section==='pages'&&form.slug==='site-settings'))return null;
    if(field==='heroImage'||field==='homeCreateImage'||field.startsWith('homeMomentImage')||field.startsWith('storyImage'))return <div className="a-form-full" key={field}><label>{field==='heroImage'?'Cover Photo':def[0]}</label><div className="a-image-field"><div className="a-image-preview" style={form[field]?{backgroundImage:`url(${form[field]})`}:undefined}>{!form[field]&&'No photo selected'}</div><div><button type="button" className="a-btn a-outline" onClick={()=>{setImageTarget(field);setMediaOpen(true);}}>Find / Choose photo</button><input value={form[field]||''} placeholder="Or paste a secure image URL" onChange={e=>patch(field,e.target.value)}/><small>Upload into your library rather than relying on temporary external links.</small></div></div></div>;
    if(field==='galleryImages'||field==='dayImages'){
     const pictures=String(form[field]||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
     return <div key={field} className="a-form-full a-gallery-field"><label htmlFor={`gallery-${field}`}>{def[0]}</label><div className="a-gallery-thumbs">{pictures.length?pictures.map((url,i)=><div className="a-gallery-thumb" key={`${url}-${i}`}><img src={url} alt={`${def[0]} photo ${i+1}`} loading="lazy"/><div><span>Photo {i+1}</span><button type="button" aria-label={`Move photo ${i+1} earlier`} disabled={i===0} onClick={()=>updateImageList(field,items=>{[items[i-1],items[i]]=[items[i],items[i-1]];return items;})}>←</button><button type="button" aria-label={`Move photo ${i+1} later`} disabled={i===pictures.length-1} onClick={()=>updateImageList(field,items=>{[items[i],items[i+1]]=[items[i+1],items[i]];return items;})}>→</button><button type="button" aria-label={`Remove photo ${i+1}`} onClick={()=>updateImageList(field,items=>items.filter((_,index)=>index!==i))}>Remove</button></div></div>):<p>No gallery photos added yet.</p>}</div><button type="button" className="a-btn a-outline" onClick={()=>{setImageTarget(field);setMediaOpen(true);}}>+ Find / add gallery photos</button><details><summary>Advanced: edit photo URLs</summary><textarea id={`gallery-${field}`} rows={4} value={form[field]||''} placeholder={def[2]} onChange={e=>patch(field,e.target.value)}/></details></div>;
    }
    if(field==='featured')return <label key={field} className="a-checkbox a-form-full"><input type="checkbox" checked={!!form.featured} onChange={e=>patch(field,e.target.checked)}/> Show in featured sections</label>;
    if(field==='destinationSlug')return <label key={field}><span>Destination *</span><select value={form.destinationSlug||''} onChange={e=>patch('destinationSlug',e.target.value)}><option value="">Select a destination</option>{destinationOptions.map(dest=><option key={dest.id} value={dest.slug}>{dest.title} · {dest.status}</option>)}</select><small>First create and save a destination. It can remain Draft while you prepare related content.</small></label>;
    return <label key={field} className={`${textareas.has(field)?'a-form-full':''}`}><span>{def[0]} {field==='title'?'*':''}</span>{def[1]==='textarea'?<textarea rows={field==='description'||field==='itinerary'?6:3} value={form[field]||''} placeholder={def[2]} onChange={e=>patch(field,e.target.value)}/>:def[1]==='select'?<select value={form[field]||def[2][0]} onChange={e=>patch(field,e.target.value)}>{def[2].map(s=><option key={s}>{s}</option>)}</select>:<input value={form[field]||''} placeholder={def[2]} readOnly={field==='slug'&&editing!=='new'} onChange={e=>patch(field,e.target.value)}/>}</label>;
   })}</div>
   {section==='pages'&&form.slug==='our-story'&&staff?.role!=='media'&&<section className="a-story-editor" aria-label="Our Story and Philosophy editor"><div className="a-story-editor-head"><span>V8.0 / BRAND EXPERIENCE</span><h3>Our Story &amp; Philosophy</h3><p>Edit each chapter and the six philosophy explanations. Empty fields use the approved brand defaults. Save as Draft first; nothing changes on the live website until a Publisher saves the published record.</p><a href="/our-story" target="_blank" rel="noreferrer">Preview currently published story ↗</a></div>{STORY_EDITOR_GROUPS.map((group,i)=><details className="a-knowledge-panel" key={group.title} open={i===0?true:undefined}><summary>{String(i+1).padStart(2,'0')} / {group.title}<span>{group.fields.length} fields</span></summary><div className="a-knowledge-grid">{group.fields.map(field=>{const def=fields[field];const value=form[field]||'';return STORY_IMAGE_FIELDS.includes(field)?<div className="a-story-image-input" key={field}><span>{def[0]}</span>{value?<img src={value} alt="Selected story photograph" loading="lazy"/>:<div className="a-story-image-empty">No photo selected. The page uses branded abstract artwork.</div>}<button type="button" className="a-btn a-outline" onClick={()=>{setImageTarget(field);setMediaOpen(true);}}>Choose from Media Library ↗</button><input type="url" aria-label={`${def[0]} URL`} value={value} placeholder="Secure HTTPS image URL" onChange={e=>patch(field,e.target.value)}/></div>:<label key={field}><span>{def[0]}</span><textarea rows={field.startsWith('philosophy')?3:4} value={value} onChange={e=>patch(field,e.target.value)} placeholder={def[2]||STORY_DEFAULTS[field]||''}/></label>;})}</div></details>)}</section>}
   {staff?.role!=='media'&&section==='destinations'&&<details className="a-knowledge-panel"><summary>Travel Essentials: language, transport, food, entry and local guide <span>13 fields</span></summary><p>Destination-level information is managed once and reused as a useful guide. Avoid adding old or unverified admission rules.</p><div className="a-knowledge-grid">{destinationKnowledgeFields.map(field=><label key={field}><span>{fields[field][0]}</span>{knowledgeTextareas.has(field)?<textarea rows={3} value={form[field]||''} onChange={e=>patch(field,e.target.value)} placeholder={fields[field][2]}/>:<input type={field.endsWith('Url')?'url':field.endsWith('On')?'date':'text'} value={form[field]||''} onChange={e=>patch(field,e.target.value)} placeholder={fields[field][2]}/>}</label>)}</div></details>}
   {staff?.role!=='media'&&section==='experiences'&&<details className="a-knowledge-panel"><summary>Plan Your Visit: location, transport, access and tips <span>8 fields</span></summary><p>Only attraction-specific details belong here. Language, currency, visas and city transport belong to the destination guide.</p><div className="a-knowledge-grid">{experienceVisitFields.map(field=><label key={field}><span>{fields[field][0]}</span>{knowledgeTextareas.has(field)?<textarea rows={3} value={form[field]||''} onChange={e=>patch(field,e.target.value)} placeholder={fields[field][2]}/>:<input type={field.endsWith('Url')?'url':field.endsWith('On')?'date':'text'} value={form[field]||''} onChange={e=>patch(field,e.target.value)} placeholder={fields[field][2]}/>}</label>)}</div></details>}
   {staff?.role!=='media'&&['destinations','experiences'].includes(section)&&<details className="a-knowledge-panel"><summary>Video Preview: official / authorized YouTube <span>3 fields</span></summary><p>Optional. The public video loads only after Play is clicked. Use a verified attraction or tourism-board source and ensure the video represents the right place.</p><div className="a-knowledge-grid">{videoFields.map(field=><label key={field}><span>{fields[field][0]}</span><input type={field==='videoUrl'?'url':'text'} value={form[field]||''} onChange={e=>patch(field,e.target.value)} placeholder={fields[field][2]}/></label>)}</div>{youtubeVideoId(form.videoUrl)?<a className="a-video-review" href={`https://www.youtube.com/watch?v=${youtubeVideoId(form.videoUrl)}`} target="_blank" rel="noopener noreferrer">Review video on YouTube ↗</a>:form.videoUrl?<p role="alert" className="a-video-invalid">Enter a valid HTTPS YouTube video URL.</p>:null}</details>}
   {form.mediaReviewStatus==='pending'&&<section className="a-photo-pending"><strong>Photos require visual approval before publishing</strong><p>Automatically selected photos are only strong search matches, not verified attraction identities. Check every cover, story, gallery and day photo plus licence/credit. Only a Publisher can approve.</p>{canPublish&&form.status==='draft'&&<button className="a-btn a-outline" disabled={busy} onClick={approveAutomatedMedia}>I reviewed these photos · Approve</button>}</section>}
   {!canEdit&&<p className="a-alert a-error">This record is read-only for your role. Published content can only be edited by a Publisher or Admin.</p>}
   {section!=='pages'&&<div className="a-readiness"><strong>Before you publish</strong><p>Drafts can be saved without photos. A cover photograph and short summary are required for new publications. Other missing items should be reviewed before launch.</p><div>{publicationChecks.map(([label,ok])=><span key={label} className={ok?'ready':'missing'}>{ok?'✓':'○'} {label}</span>)}</div></div>}<div className="a-actionbar">{form.status==='published'?<><button disabled={busy||!canEdit||!canPublish} className="a-btn a-primary" onClick={()=>save('published')}>{busy?'Saving…':'Save Published Changes'}</button><button disabled={busy||!canEdit||!canPublish} className="a-btn a-outline" onClick={()=>{if(window.confirm('Unpublish this page? Visitors will no longer see it until you publish again.'))save('draft');}}>Unpublish</button></>:<><button disabled={busy||!canEdit} className="a-btn a-outline" onClick={()=>save('draft')}>{busy?'Saving…':'Save Draft'}</button><button disabled={busy||!canEdit||!canPublish||form.mediaReviewStatus==='pending'} className="a-btn a-primary" onClick={()=>save('published')}>{busy?'Publishing…':'Publish to Website ↗'}</button></>}{editing!=='new'&&form.status==='published'&&<a className="a-btn a-text" target="_blank" rel="noreferrer" href={liveLink}>View Live ↗</a>}</div>{editing!=='new'&&canDelete&&<div className="a-danger-zone">{confirmDelete?<div>Delete this content permanently? <button onClick={deleteItem} disabled={busy} className="a-danger">Yes, delete</button> <button onClick={()=>setConfirmDelete(false)}>Cancel</button></div>:<button onClick={()=>setConfirmDelete(true)}>Delete record</button>}</div>}</div><aside className="a-help"><span>QUICK GUIDE</span><h3>One record. One source of truth.</h3><p>Write your content, choose a licensed photo, then publish. The public site reads this same record. Automatic photographs require a separate visual review before publication. No manual sync is required.</p><p><b>Tip:</b> A short description and cover photograph are required for new publications. Existing published pages can be updated without accidentally unpublishing. Save Draft remains available for incomplete content.</p>{section==='pages'&&<p><b>Header & Footer:</b> use the <code>site-settings</code> page. Its changes apply to the whole public website after publication.<br/><b>Our Story:</b> select <code>our-story</code> from Website Pages, edit the dedicated Story &amp; Philosophy chapters, then save or publish. Images require licence review.<br/><b>Homepage:</b> create a page with the URL slug <code>homepage</code>. Its title, summary, image, and special Homepage fields control the hero and section copy. Featured destination and journey cards come from their own records.</p>}</aside></div>}
   {section==='media'&&<ImageLibrary request={request} embedded onSelect={null}/>}
   {section==='completion'&&<CompletionCenter request={request} onOpenEditor={openFromCompletion} onOpenMedia={()=>switchSection('media')}/>}
   {section==='bulk'&&<BulkRollout request={request} role={staff?.role} onOpenEditor={openFromCompletion} onOpenMedia={()=>switchSection('media')}/>}
   {section==='team'&&canManageTeam(staff?.role)&&<TeamManagement request={request} currentUid={user.uid}/>}
   {section==='enquiries'&&<EnquiryInbox request={request} role={staff?.role}/>}
   </div>
  </main>
  {mediaOpen&&<div className="a-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setMediaOpen(false);}}><div className="a-modal"><header><h2>Choose a licensed photograph</h2><button onClick={()=>setMediaOpen(false)} aria-label="Close">✕</button></header><ImageLibrary request={request} initialQuery={photoSearchQuery(imageTarget)} preset={imageTarget==='heroImage'?'hero':STORY_IMAGE_FIELDS.includes(imageTarget)||imageTarget==='storyImage1'||imageTarget==='storyImage2'||imageTarget==='storyImage3'?'editorial':imageTarget==='galleryImages'||imageTarget==='dayImages'?'gallery':'original'} onSelect={asset=>{try{setForm(prev=>{const updated=withMediaAsset(prev,imageTarget,asset);return STORY_IMAGE_FIELDS.includes(imageTarget)&&prev.status==='draft'&&!canPublishContent(staff?.role)?{...updated,mediaReviewStatus:'pending',mediaReviewedBy:'',mediaReviewedAt:''}:updated;});setMediaOpen(false);setNotice({kind:'success',text:'Optimized photo selected and its responsive variants and available credits attached. Save the record to publish this selection.'});}catch(err){setNotice({kind:'error',text:err.message});}}}/></div></div>}
 </div>;
}
