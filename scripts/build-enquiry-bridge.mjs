import {build} from 'esbuild';
import {readFileSync,existsSync} from 'node:fs';
for(const name of ['.env.local','.env']){
 if(!existsSync(name))continue;
 for(const line of readFileSync(name,'utf8').split(/\r?\n/)){
  const match=/^\s*(NEXT_PUBLIC_[A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
  if(!match||process.env[match[1]]!==undefined)continue;
  let value=match[2].trim();
  if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1);
  process.env[match[1]]=value;
 }
}
const keys=['NEXT_PUBLIC_FIREBASE_API_KEY','NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN','NEXT_PUBLIC_FIREBASE_PROJECT_ID','NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET','NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID','NEXT_PUBLIC_FIREBASE_APP_ID'];
const define=Object.fromEntries(keys.map(k=>[`process.env.${k}`,JSON.stringify(process.env[k]||'')]));
define['process.env.NODE_ENV']='"production"';
await build({entryPoints:['src/public-client/enquiry-bridge.js'],bundle:true,platform:'browser',format:'iife',target:'es2022',minify:true,outfile:'public/enquiry-bridge.bundle.js',define});
console.log('V5.1 enquiry bridge bundled (Firebase Web SDK only).');
