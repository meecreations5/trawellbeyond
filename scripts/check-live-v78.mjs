/** V7.8 HTTP acceptance against a real, already-running Firebase-connected site.
 * Run: npm run check:v78 -- --base http://localhost:3000
 * This does not sign in, publish, write Firestore or fabricate enquiry success.
 */
const index=process.argv.indexOf('--base');
const base=index<0?'http://localhost:3000':process.argv[index+1];
if(!base||!/^https?:\/\//.test(base))throw new Error('Pass an HTTP(S) base URL after --base');
const routes=[
 {kind:'Destination',title:'Dubai',path:'/destinations/dubai',markers:['id="destinationTitle"','id="experiences"','id="stories"','id="journeys"','id="travel-essentials"']},
 {kind:'Destination',title:'Thailand',path:'/destinations/thailand',markers:['id="destinationTitle"','id="experiences"','id="stories"','id="journeys"','id="travel-essentials"']},
 {kind:'Experience',title:'Burj Khalifa',path:'/experiences/burj-khalifa-observation-deck',markers:['id="experienceTitle"','id="practical"','id="experience-enquiry"']},
 {kind:'Experience',title:'Dubai Frame',path:'/experiences/dubai-frame',markers:['id="experienceTitle"','id="practical"','id="experience-enquiry"']},
 {kind:'Experience',title:'The Grand Palace',path:'/experiences/the-grand-palace-wat-phra-kaew',markers:['id="experienceTitle"','id="practical"','id="experience-enquiry"']},
 {kind:'Experience',title:'Phi Phi',path:'/experiences/phi-phi-islands-boat-excursion',markers:['id="experienceTitle"','id="practical"','id="experience-enquiry"']},
 {kind:'Journey',title:'Dubai, Beyond the Skyline',path:'/journeys/dubai-beyond-the-skyline',markers:['id="itinerary"','id="personalize"','id="leadName"','id="leadConsent"']},
 {kind:'Journey',title:'Bangkok & Pattaya',path:'/journeys/bangkok-and-pattaya-your-way',markers:['id="itinerary"','id="personalize"','id="leadName"','id="leadConsent"']}
];
const normalized=html=>html.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'\"').replace(/\s+/g,' ');
const results=[];let failed=0;
for(const entry of routes){
 const url=new URL(entry.path,base);
 try{
  const res=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(13000)});
  const html=await res.text();
  const checks={http200:res.status===200,title:normalized(html).toLowerCase().includes(entry.title.toLowerCase()),structure:entry.markers.filter(x=>html.includes(x)).length===entry.markers.length,hasBrand:html.includes('TrawellBeyond'),unresolvedTokens:!/__TB_[A-Z_0-9]+__/.test(html)};
  const pass=Object.values(checks).every(Boolean);
  results.push({title:entry.title,url:url.href,status:res.status,kind:entry.kind,checks,passed:pass});
  console.log(`${pass?'PASS':'FAIL'} ${res.status} ${entry.kind}: ${entry.title} ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length}`);
  if(!pass)failed++;
 }catch(err){results.push({title:entry.title,url:url.href,kind:entry.kind,passed:false,error:err.message});console.log(`FAIL ${entry.kind}: ${entry.title} — ${err.message}`);failed++;}
}
console.log(`\nV7.8 HTTP checks: ${results.length-failed}/${results.length} passed.`);
console.log('MANUAL ACCEPTANCE STILL REQUIRED: real photo correctness & licences, mobile gallery, official video playback, CREATE selection and a customer enquiry visible in Admin.');
if(failed){console.log('If a route returns 404, check its Firestore Published status; do not bypass draft permissions.');process.exitCode=1;}
const pathIndex=process.argv.indexOf('--out');
if(pathIndex>=0){
 const {writeFile}=await import('node:fs/promises');
 const output=process.argv[pathIndex+1];if(!output)throw new Error('Missing --out path');
 await writeFile(output,JSON.stringify({base,checkedAt:new Date().toISOString(),passed:results.length-failed,total:results.length,results,manualRequired:['Images and rights','Mobile layouts','Videos','CREATE and enquiry in Admin']},null,2));
}
