import {clampMotionProgress} from '@/lib/motion-policy.mjs';
/** A supplementary orange line; the brand logo SVG itself is never edited. */
export default function JourneyLine({progress=0,count=0,className='',label=''}){
 const safe=clampMotionProgress(progress);
 return <div className={`tb-v81-line ${className}`.trim()} style={{"--tb-v81-progress":safe}}
  role={label?'progressbar':undefined} aria-label={label||undefined}
  aria-valuemin={label?0:undefined} aria-valuemax={label?100:undefined}
  aria-valuenow={label?Math.round(safe*100):undefined} aria-hidden={label?undefined:'true'}>
  <span className="tb-v81-line-track"><span className="tb-v81-line-fill" style={{transform:`scaleX(${safe})`}}/></span>
  {count>1&&<span className="tb-v81-line-nodes" aria-hidden="true">
   {Array.from({length:Math.min(10,count)},(_,i)=><span key={i} className={safe+0.001>=(i+1)/count?'is-complete':''}/>)}
  </span>}
 </div>;
}
