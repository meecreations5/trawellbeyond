/** Read-only deployed-site smoke test for V8.1. No credentials, uploads or form submissions. */
const base=String(process.argv[2]||process.env.TB_LIVE_URL||'').trim().replace(/\/+$/,'');
if(!/^https?:\/\/[^\s]+$/.test(base)){
 console.error('Usage: npm run check:live:v81 -- https://your-domain.example');process.exit(2);
}
let passed=0,failed=0;
async function read(path){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
 try{const res=await fetch(base+path,{signal:controller.signal,headers:{accept:'text/html'}});return {ok:res.ok,status:res.status,text:await res.text()};}
 finally{clearTimeout(timer);}
}
async function verify(path,markers){
 try{const res=await read(path);const missing=markers.filter(marker=>!res.text.includes(marker));
  const unresolved=/__TB_[A-Z_]+__/.test(res.text);
  if(!res.ok||missing.length||unresolved){failed++;console.error('FAIL',path,res.status,missing.length?`missing: ${missing.join(', ')}`:'',unresolved?'unresolved CMS marker':'');return null;}
  passed++;console.log('PASS',path);return res.text;
 }catch(e){failed++;console.error('FAIL',path,e.message);return null;}
}
await verify('/v81-motion.css',['tb-v81-brand-reveal','prefers-reduced-motion:reduce']);
await verify('/v81-motion.js',['tb_intro_seen_v812','tb_postcard_v81']);
await verify('/assets/trawellbeyond-display.svg',['<svg']);
await verify('/', ['TrawellBeyond','/v81-motion.css','/v81-motion.js']);
await verify('/our-story',['bs-philosophy','bs-v81-chapter-rail','our-beginning']);
await verify('/create',['create-studio','cr-v812-meter','v8.1.2']);
for(const type of ['destinations','experiences','journeys']){
 const listing=await verify('/'+type,['tb-listing-header']);
 if(!listing)continue;
 const pattern=new RegExp(`href=["'](/${type}/[a-z0-9-]+)["']`,'i');
 const match=listing.match(pattern);
 if(match)await verify(match[1],['/v81-motion.css','/v81-motion.js']);
 else console.log('SKIP',type,'no published detail path discoverable from public HTML');
}
console.log(`V8.1 read-only smoke: ${passed} passed, ${failed} failed.`);
console.log('Not covered: authenticated Admin, live image correctness/licences, actual enquiries, real-device Web Vitals or Firebase permissions.');
if(failed)process.exitCode=1;
