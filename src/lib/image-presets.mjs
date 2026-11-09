/** Editorial image output sizes.  Never upscale the source. */
export const IMAGE_PRESETS=Object.freeze({
 original:{label:'Keep original framing',width:1920,ratio:null,quality:0.8},
 hero:{label:'Cinematic hero · 16:9',width:1920,ratio:16/9,quality:0.79},
 editorial:{label:'Story / portrait · 4:5',width:1000,ratio:4/5,quality:0.8},
 gallery:{label:'Experience gallery · 3:2',width:1440,ratio:3/2,quality:0.8},
 card:{label:'Destination card · 4:5',width:960,ratio:4/5,quality:0.8},
 square:{label:'Square tile · 1:1',width:900,ratio:1,quality:0.8}
});
/** Subtle, reversible colour correction. 100 = original. Never oversaturate. */
export function normalizeColorCorrection(options={}){
 return {brightness:clamp(options.brightness??100,90,115),contrast:clamp(options.contrast??100,90,120),saturation:clamp(options.saturation??100,85,120)};
}
export function colorCorrectionFilter(options={}){
 const t=normalizeColorCorrection(options);
 return `brightness(${t.brightness}%) contrast(${t.contrast}%) saturate(${t.saturation}%)`;
}
export const MAX_SOURCE_BYTES=20*1024*1024;
export const MAX_VARIANT_BYTES=6*1024*1024;
export function clamp(value,min,max){return Math.max(min,Math.min(max,Number(value)||0));}
export function normalizeCrop(options={}){
 const preset=IMAGE_PRESETS[options.preset]?options.preset:'original';
 return {preset,focusX:clamp(options.focusX??50,0,100),focusY:clamp(options.focusY??50,0,100),zoom:clamp(options.zoom??1,1,2)};
}
export function cropRect(sourceWidth,sourceHeight,options={}){
 if(!(sourceWidth>0&&sourceHeight>0))throw new Error('Image dimensions are not valid.');
 const opts=normalizeCrop(options),ratio=IMAGE_PRESETS[opts.preset].ratio||sourceWidth/sourceHeight;
 const baseWidth=Math.min(sourceWidth,sourceHeight*ratio);
 const baseHeight=baseWidth/ratio;
 const width=baseWidth/opts.zoom,height=baseHeight/opts.zoom;
 return {x:(sourceWidth-width)*opts.focusX/100,y:(sourceHeight-height)*opts.focusY/100,width,height,ratio};
}
export function variantSizes(sourceWidth,sourceHeight,options={}){
 const opts=normalizeCrop(options),spec=IMAGE_PRESETS[opts.preset];
 const crop=cropRect(sourceWidth,sourceHeight,opts);
 const displayWidth=Math.max(1,Math.min(Math.round(crop.width),spec.width));
 return [
  ['display',displayWidth],
  ['medium',Math.min(displayWidth,960)],
  ['thumb',Math.min(displayWidth,480)]
 ].map(([name,width])=>({name,width,height:Math.max(1,Math.round(width/crop.ratio))}));
}
export function formatBytes(bytes){return bytes>=1048576?`${(bytes/1048576).toFixed(2)} MB`:`${Math.round(bytes/1024)} KB`;}
