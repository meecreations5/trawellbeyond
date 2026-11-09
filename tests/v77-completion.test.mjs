import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildCompletionReport,auditRecord,auditMediaAsset,proposeCompletion,blankOnlyChanges,collectImageHealthTargets} from '../src/lib/completion-engine.mjs';
import {withMediaAsset,resolveImageVariant,normalizeImageVariants,getAssetByUrl,attachExistingMediaVariants} from '../src/lib/media-variants.mjs';
import {validateContent} from '../src/lib/content.mjs';
import {galleryButton} from '../src/lib/photo-credits.mjs';
import {renderDestinationCards} from '../src/lib/v51-home.mjs';

const url=n=>`https://assets.example.org/${n}.webp`;
const asset={id:'2f63bdcc-0a34-4e08-89d2-24ec98d5a2ab',name:'Gardens by the Bay.jpg',url:url('display'),
 variants:{display:{url:url('display'),width:1920},medium:{url:url('medium'),width:960},thumb:{url:url('thumb'),width:480}},
 altText:'Supertrees at Gardens by the Bay',credit:'Alex Photographer',license:'CC BY 4.0',sourcePage:'https://commons.wikimedia.org/wiki/File:gardens.jpg',rightsConfirmed:true,optimized:true};
const minimum={title:'Singapore',slug:'singapore',summary:'Singapore for every traveller',status:'published',heroImage:url('display')};

test('image selection attaches optimized references and real licence credits, never destroys unrelated editor fields',()=>{
 const out=withMediaAsset({...minimum,description:'Own content'},'heroImage',asset);
 assert.equal(out.heroImage,url('display'));
 assert.equal(out.photoCredit,'Alex Photographer');
 assert.equal(out.photoLicense,'CC BY 4.0');
 assert.ok(out.imageCredits.includes('https://commons.wikimedia.org'));
 assert.equal(out.imageVariants[asset.id].medium,url('medium'));
 assert.equal(out.description,'Own content');
});
test('public media resolution chooses WebP variants and keeps old external image URLs untouched',()=>{
 const updated=withMediaAsset(minimum,'heroImage',asset);
 assert.equal(resolveImageVariant(updated,url('display'),'thumb'),url('thumb'));
 assert.equal(resolveImageVariant(updated,url('display'),'medium'),url('medium'));
 assert.equal(resolveImageVariant(updated,'https://elsewhere.example.org/old.jpg','thumb'),'https://elsewhere.example.org/old.jpg');
 const html=renderDestinationCards([{id:'singapore',name:'Singapore',region:'International',photo:url('display'),imageVariants:updated.imageVariants}]);
 assert.ok(html.includes('medium.webp'));
 assert.ok(!html.includes('thumb.webp'));
});
test('gallery thumbnails use thumb, while the gallery opens its high resolution display URL',()=>{
 const html=galleryButton(url('display'),'Singapore Gardens',0,{thumbUrl:url('thumb')});
 assert.ok(html.includes(`src="${url('thumb')}"`));
 assert.ok(html.includes(`data-gallery-src="${url('display')}"`));
});
test('CMS validation preserves sanitized media reference mapping and rejects unsafe destinations',()=>{
 const updated=withMediaAsset(minimum,'heroImage',asset);
 const validated=validateContent('destinations',updated,'published',{previouslyPublished:true});
 assert.equal(validated.imageVariants[asset.id].thumb,url('thumb'));
 assert.throws(()=>normalizeImageVariants({[asset.id]:{display:'javascript:evil',medium:url('medium'),thumb:url('thumb')}}));
 assert.throws(()=>normalizeImageVariants({invalid:{display:url('a'),medium:url('b'),thumb:url('c')}}));
});
test('gallery photos are appended without duplicates and with a strict maximum',()=>{
 const first=withMediaAsset({title:'Gardens',galleryImages:'',imageVariants:{}},'galleryImages',asset);
 const again=withMediaAsset(first,'galleryImages',asset);
 assert.equal(again.galleryImages,url('display'));
 assert.throws(()=>withMediaAsset({...first,galleryImages:Array.from({length:8},(_,i)=>url(i)).join('\n')},'galleryImages',asset));
});
test('global audit scans content and media, keeps missing video as optional recommendation',()=>{
 const record={...minimum,heroImage:'',travelTransport:'',videoUrl:''};
 const report=buildCompletionReport({destinations:[record],experiences:[{title:'Zoo',slug:'singapore-zoo',status:'draft',summary:''}]},[asset]);
 assert.equal(report.recordCount,2);
 assert.ok(report.issues.some(i=>i.type==='destinations'&&i.field==='heroImage'&&i.severity==='critical'));
 assert.ok(report.issues.some(i=>i.type==='destinations'&&i.field==='videoUrl'&&i.severity==='recommended'));
 assert.ok(report.issues.some(i=>i.type==='media'&&i.field==='fileSize')===false);
 assert.equal(report.issues.length,Object.values(report.byCategory).reduce((a,b)=>a+b,0));
});
test('completed page chrome does not require photos on privacy / terms pages',()=>{
 const list=auditRecord('pages',{title:'Privacy',slug:'privacy',summary:'Policy',description:'Reviewed privacy information',status:'published'},[]);
 assert.ok(!list.some(i=>i.field==='heroImage'));
});
test('editorial suggestions come from already curated content, not speculative media/photo matches',()=>{
 const input={title:'Gardens by the Bay',slug:'gardens-by-the-bay',destinationSlug:'singapore',status:'published',summary:'Our custom description',duration:''};
 const p=proposeCompletion('experiences',input,[]);
 assert.ok(p.some(x=>x.field==='duration'));
 assert.ok(!p.some(x=>x.field==='summary'));
 assert.ok(!p.some(x=>x.field==='heroImage'||x.field==='galleryImages'));
 assert.ok(p.some(x=>x.source.includes('Singapore')));
});
test('destination official guidance and video are only fill suggestions requiring review',()=>{
 const p=proposeCompletion('destinations',{title:'Singapore',slug:'singapore',summary:'Custom',status:'published'},[]);
 assert.ok(p.some(x=>x.field==='travelLanguages'));
 assert.ok(p.some(x=>x.field==='videoUrl'&&x.kind==='video'));
 assert.ok(!p.some(x=>x.field==='travelVerifiedOn'));
});
test('existing journey images can safely fill its missing gallery, without adding imaginary photos',()=>{
 const p=proposeCompletion('journeys',{title:'Journey',slug:'journey',dayImages:`${url('day1')}\n${url('day2')}`,galleryImages:''},[]);
 const gallery=p.find(x=>x.field==='galleryImages');
 assert.equal(gallery?.value,`${url('day1')}\n${url('day2')}`);
});
test('photo credit and responsive variants are suggested only for exact approved media URL matches',()=>{
 const p=proposeCompletion('destinations',{title:'Singapore',slug:'singapore',heroImage:url('display'),summary:'Here'},[asset]);
 assert.equal(p.find(x=>x.field==='photoCredit')?.value,'Alex Photographer');
 assert.ok(p.some(x=>x.field==='imageVariants'));
 const mismatch=proposeCompletion('destinations',{title:'Singapore',slug:'singapore',heroImage:'https://other.example.org/a.jpg'},[asset]);
 assert.ok(!mismatch.some(x=>x.field==='imageVariants'));
});
test('completion save is blank-only even if record changes between scan and save',()=>{
 const changed={summary:'Another editor filled this',description:'',status:'published',title:'Zoo',slug:'zoo'};
 const applied=blankOnlyChanges('experiences',changed,{summary:'Suggested summary',description:'Existing verified text'});
 assert.deepEqual(applied.applied,{description:'Existing verified text'});
 assert.ok(applied.skipped.includes('summary'));
 assert.throws(()=>blankOnlyChanges('experiences',changed,{status:'draft'}));
});
test('pre-existing responsive variants are never replaced when linking another asset',()=>{
 const ref1={oldid12345:{display:url('display'),medium:url('medium'),thumb:url('thumb')}};
 const changed=blankOnlyChanges('destinations',{imageVariants:ref1},{imageVariants:{oldid12345:{display:url('other'),medium:url('other'),thumb:url('other')},newid12345:{display:url('new'),medium:url('new'),thumb:url('new')}}});
 assert.equal(changed.applied.imageVariants.oldid12345.display,url('display'));
 assert.equal(changed.applied.imageVariants.newid12345.display,url('new'));
});
test('media issues flag licensing gaps and missing alt text for review',()=>{
 const issues=auditMediaAsset({id:'abc',name:'Image',rightsConfirmed:false,variants:{}});
 assert.ok(issues.some(x=>x.field==='rightsConfirmed'&&x.severity==='critical'));
 assert.ok(issues.some(x=>x.field==='altText'));
});
test('image health targets dedupe URL references',()=>{
 const targets=collectImageHealthTargets({destinations:[{slug:'singapore',heroImage:url('display'),galleryImages:`${url('display')}\n${url('second')}`}],experiences:[{slug:'test',heroImage:url('display')}]},100);
 assert.deepEqual(targets.map(x=>x.url),[url('display'),url('second')]);
});

test('global Admin uses paginated scanning and transactions for blank-only writes, never Firebase Admin SDK',async()=>{
 const {readFile}=await import('node:fs/promises');
 const cms=await readFile('src/lib/cms-web.js','utf8');
 const consoleUi=await readFile('src/components/admin/AdminConsole.jsx','utf8');
 const rules=await readFile('firestore.rules','utf8');
 assert.match(cms,/listAllDocs\(/);
 assert.match(cms,/startAfter\(last\)/);
 assert.match(cms,/parts\[3\]==='fill'/);
 assert.match(cms,/runTransaction\(clientDb\(\)/);
 assert.match(cms,/blankOnlyChanges\(/);
 assert.doesNotMatch(cms,/firebase-admin/);
 assert.match(consoleUi,/Content Completion/);
 assert.match(consoleUi,/withMediaAsset/);
 assert.match(rules,/imageVariants/);
 assert.match(rules,/teamUsers/);
});
test('Media Library includes editable image credits and alt text',async()=>{
 const {readFile}=await import('node:fs/promises');
 const ui=await readFile('src/components/admin/ImageLibrary.jsx','utf8');
 const cms=await readFile('src/lib/cms-web.js','utf8');
 assert.match(ui,/Descriptive image alt text/);
 assert.match(ui,/Save photo metadata/);
 assert.match(cms,/metadataUpdatedBy/);
});
