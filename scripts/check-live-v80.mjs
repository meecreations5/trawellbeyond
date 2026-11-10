/**
 * Read-only live smoke check after deployment. Does not sign in, submit forms,
 * upload images, or claim acceptance of artwork / licenses / content accuracy.
 * Usage: node scripts/check-live-v80.mjs https://your-live-domain.com
 */
const base=String(process.argv[2]||process.env.TB_LIVE_URL||'').trim().replace(/\/$/,'');
if(!/^https?:\/\/[^\s]+$/.test(base)){console.error('Usage: npm run check:live:v80 -- https://your-domain.example');process.exit(2);}
const routes=[
 {path:'/',expect:['TrawellBeyond','CREATED AROUND YOU']},
 {path:'/our-story',expect:['bs-philosophy','THE JOURNEY OF UNDERSTANDING','story-top']},
 {path:'/create',expect:['create-studio','cr-v812-meter','cr-lead']},
 {path:'/experiences',expect:['ex-discovery']},
 {path:'/destinations',expect:['tb-listing-header']},
 {path:'/journeys',expect:['tb-listing-header']}
];
let fails=0;
for(const route of routes){try{
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),14000);
 let response;try{response=await fetch(base+route.path,{signal:controller.signal,headers:{accept:'text/html'}});}finally{clearTimeout(timeout);}
 const html=await response.text();const absent=route.expect.filter(str=>!html.includes(str));
 const leftover=/__TB_[A-Z_]+__/.test(html);
 if(!response.ok||absent.length||leftover){fails++;console.error('FAIL',route.path,response.status,absent.length?`missing markers: ${absent.join(', ')}`:'',leftover?'unresolved template marker':'');}
 else console.log('PASS',route.path,response.status);
}catch(error){fails++;console.error('FAIL',route.path,error.message);}}
console.log(`Live smoke: ${routes.length-fails}/${routes.length} routes passed initial checks (check failed details above).`);
console.log('Still required: actual CMS image audit, photo licence/identity review, mobile browser tests, Firebase team permissions and enquiry submission.');
process.exitCode=fails?1:0;
