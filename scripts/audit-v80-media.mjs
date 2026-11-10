/** Read-only local audit of exported CMS JSON: {destinations:[],experiences:[],journeys:[]}. */
import {readFileSync} from 'node:fs';
import {auditMediaCatalogue} from '../src/lib/media-acceptance.mjs';
const file=process.argv[2];
if(!file){console.error('Usage: npm run audit:media:v80 -- path/to/your-cms-export.json');process.exit(2);}
try{
 const data=JSON.parse(readFileSync(file,'utf8'));
 const result=auditMediaCatalogue(data,{includeDrafts:process.argv.includes('--include-drafts')});
 for(const row of result.rows.filter(r=>!r.pass))console.log(`CHECK ${row.type}/${row.slug||row.title} (${row.status}): ${row.missing.join(' | ')}`);
 console.log(`Media QA: ${result.passed}/${result.checked} records pass structural image coverage; ${result.needsAttention} need attention.`);
 console.log('Only structural checks. Human visual, rights and destination-accuracy acceptance must be completed in Admin.');
 process.exitCode=result.needsAttention?1:0;
}catch(error){console.error(error.message);process.exitCode=2;}
