import test from 'node:test';
import assert from 'node:assert/strict';
import {cropRect,variantSizes,normalizeCrop,IMAGE_PRESETS,formatBytes} from '../src/lib/image-presets.mjs';
const approx=(value,expected)=>assert.ok(Math.abs(value-expected)<0.03,`${value} not close to ${expected}`);
test('hero crop is 16:9 and stays inside source at extreme focus and zoom',()=>{
 for(const x of [0,50,100])for(const y of [0,50,100])for(const zoom of [1,1.5,2]){
  const crop=cropRect(4000,3000,{preset:'hero',focusX:x,focusY:y,zoom});
  approx(crop.ratio,16/9);assert.ok(crop.x>=0&&crop.y>=0);assert.ok(crop.x+crop.width<=4000.001);assert.ok(crop.y+crop.height<=3000.001);
 }
});
test('portrait and original presets never upscale a small source image',()=>{
 for(const preset of Object.keys(IMAGE_PRESETS)){
  const list=variantSizes(650,450,{preset,zoom:1});
  assert.deepEqual(list.map(x=>x.name),['display','medium','thumb']);
  assert.ok(list.every(x=>x.width<=650&&x.height<=450));
  assert.ok(list[2].width<=list[1].width&&list[1].width<=list[0].width);
 }
});
test('crop inputs sanitize invalid size, focus and zoom, with readable output',()=>{
 const options=normalizeCrop({preset:'unknown',focusX:800,focusY:-50,zoom:100});
 assert.deepEqual(options,{preset:'original',focusX:100,focusY:0,zoom:2});
 assert.equal(formatBytes(1048576),'1.00 MB');
 assert.throws(()=>cropRect(0,500),/dimensions/);
});
test('Admin upload and Wikimedia import use browser-based image optimization with variants',()=>{
 const {readFileSync}=requireFromModule();
 const content=readFileSync(new URL('../src/lib/cms-web.js',import.meta.url),'utf8');
 const optimizer=readFileSync(new URL('../src/lib/image-optimizer.js',import.meta.url),'utf8');
 assert.match(content,/optimizeImageFile\(file/);
 assert.match(content,/variants\.display/);
 assert.match(optimizer,/ctx\.drawImage/);
 assert.match(optimizer,/canvas\.toBlob/);
});
function requireFromModule(){return {readFileSync:(...args)=>readFileSync_(...args)};}
import {readFileSync as readFileSync_} from 'node:fs';
