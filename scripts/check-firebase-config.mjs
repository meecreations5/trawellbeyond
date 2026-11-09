import {existsSync,readFileSync} from 'node:fs';
if(!existsSync('.env.local')){console.log('MISSING: .env.local. Run Copy-Item .env.example .env.local');process.exit(0);}
const env=Object.fromEntries(readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const keys=['NEXT_PUBLIC_FIREBASE_API_KEY','NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN','NEXT_PUBLIC_FIREBASE_PROJECT_ID','NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET','NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID','NEXT_PUBLIC_FIREBASE_APP_ID'];
console.log('Web SDK configuration (secrets/values never displayed):');
for(const key of keys)console.log(`${env[key]?'SET':'MISSING'}: ${key}`);
console.log('No Firebase Admin SDK or service account required.');
console.log('Verify Microsoft and Anonymous Auth methods enabled and teamUsers/<your UID> is active with super_admin or admin role.');
