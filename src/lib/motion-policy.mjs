/** V8.1 motion policy: no external animation runtime, no new Firebase schema. */
export const MOTION_VERSION='8.1';
export const INTRO_SESSION_KEY='tb_intro_seen_v812';
export const POSTCARD_SESSION_KEY='tb_postcard_v81';
export const MOTION_DURATION_MS=Object.freeze({instant:100,quick:180,standard:320,editorial:540,welcome:1750});
export const clampMotionProgress=value=>Math.min(1,Math.max(0,Number.isFinite(Number(value))?Number(value):0));
export function postcardDestination(href){
 if(typeof href!=='string')return null;
 let path=href;
 try{path=new URL(href,'https://trawellbeyond.local').pathname;}catch{return null;}
 const match=/^\/(destinations|journeys|experiences)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/.exec(path);
 return match?{kind:match[1],slug:match[2]}:null;
}
export function samePostcard(a,b){return Boolean(a&&b&&a.kind===b.kind&&a.slug===b.slug);}
