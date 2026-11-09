/** Use after publishing records locally, without Firebase service credentials:
 * npm run check:singapore -- --base http://localhost:3000
 * This checks real HTTP responses and the published page, not just templates.
 */
const urls=[
 ['Gardens by the Bay','gardens-by-the-bay'],
 ['Marina Bay Waterfront','marina-bay-waterfront'],
 ['Universal Studios Singapore','universal-studios-singapore'],
 ['Singapore Zoo','singapore-zoo']
];
const flag=process.argv.indexOf('--base');
const base=flag===-1?'http://localhost:3000':process.argv[flag+1];
let failures=0;
for(const [title,slug] of urls){
 try{
  const res=await fetch(new URL('/experiences/'+slug,base),{signal:AbortSignal.timeout(15000),cache:'no-store'});
  const html=await res.text();
  const checks=[res.status===200,html.includes('id="experienceTitle"'),html.includes(title),html.includes('id="gallery"'),html.includes('id="practical"'),html.includes('id="experience-enquiry"'),html.includes('experienceSlug='+slug)];
  const success=checks.every(Boolean);
  if(!success)failures++;
  console.log(`${success?'PASS':'FAIL'} ${res.status} ${title}: ${checks.filter(Boolean).length}/${checks.length} checks`);
 }catch(error){failures++;console.error(`FAIL ${title}: ${error.message}`);}
}
if(failures){console.error(`${failures} Experience Details page(s) are not verified. Check publication status, Firestore access and image URLs.`);process.exitCode=1;}
else console.log('4/4 published Experience Details routes passed the live HTTP smoke test.');
