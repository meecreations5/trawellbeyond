// Lightweight structural check that needs no dependencies.
// `npm run build` is still required for full JSX/Next.js validation.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(dir,d.name)):[path.join(dir,d.name)]);}
const entries=walk('src').filter(f=>/\.m?js$/.test(f));
for(const file of entries){execFileSync(process.execPath,['--check',file],{stdio:'pipe'});}
for(const name of ['package.json','firebase.json','jsconfig.json'])JSON.parse(fs.readFileSync(name,'utf8'));
const jsx=walk('src').filter(f=>/\.jsx$/.test(f));
for(const f of jsx){const code=fs.readFileSync(f,'utf8');if(!code.includes('export default')&&!code.includes('export function')&&!code.includes('export const'))throw new Error(`${f}: missing default export`);}
console.log(`Verified ${entries.length} JavaScript modules, ${jsx.length} JSX files and 3 project JSON manifests. (This is not a Next.js build.)`);
