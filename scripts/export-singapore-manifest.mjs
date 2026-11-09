import {mkdir,writeFile} from 'node:fs/promises';
import {LAUNCH_STARTERS} from '../src/lib/launch-starters.mjs';
const records=LAUNCH_STARTERS.filter(r=>r.type==='experiences'&&r.destinationSlug==='singapore');
const esc=value=>'"'+String(value??'').replaceAll('"','""')+'"';
const headings=['Slug','Attraction','Suggested photo source','Suggested licence','Credit','Official operator reference','Photo readiness','Publication instructions'];
const rows=records.map(item=>[
 item.slug,item.title,item.photoSourceUrl||'',item.photoLicense||'',item.photoCredit||'',item.officialUrl||'',
 item.photoSourceUrl?'Source candidate; Firebase import not verified':'No candidate',
 'Open CMS > Experiences > '+item.title+'; review photo source/licence; import to Storage; Save/Publish'
]);
await mkdir('docs',{recursive:true});
await writeFile('docs/SINGAPORE_PHOTO_AND_CONTENT_MANIFEST.csv',[headings,...rows].map(row=>row.map(esc).join(',')).join('\n')+'\n');
console.log(`Wrote Singapore manifest for ${rows.length} experience records; no live uploads were performed.`);
