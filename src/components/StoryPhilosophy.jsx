'use client';
import {useRef,useState} from 'react';
import JourneyLine from './motion/JourneyLine';

/** Accessible, non-automated philosophy explorer; no auto-advance or scroll hijack. */
export default function StoryPhilosophy({steps}){
 const [active,setActive]=useState(0);
 const buttons=useRef([]);
 const choose=(index,focus=false)=>{const target=(index+steps.length)%steps.length;setActive(target);if(focus)buttons.current[target]?.focus();};
 const keyMove=(event,index)=>{
  const keys={ArrowRight:index+1,ArrowDown:index+1,ArrowLeft:index-1,ArrowUp:index-1,Home:0,End:steps.length-1};
  if(Object.prototype.hasOwnProperty.call(keys,event.key)){event.preventDefault();choose(keys[event.key],true);}
 };
 const step=steps[active];
 return <section className="bs-philosophy" id="our-philosophy" aria-labelledby="bs-philosophy-heading">
  <div className="bs-wide bs-philosophy-grid">
   <div className="bs-philosophy-intro tb-reveal">
    <span className="bs-kicker bs-kicker-light">04 / OUR PHILOSOPHY</span>
    <h2 id="bs-philosophy-heading">It always<br/>begins <em>with you.</em></h2>
    <p>Our philosophy is more than a line. It is how a personal journey comes to life, one thoughtful decision at a time.</p>
    <JourneyLine className="bs-v81-philosophy-line" progress={(active+1)/steps.length} count={steps.length}/>
    <div className="bs-philosophy-counter" aria-hidden="true"><strong>{String(active+1).padStart(2,'0')}</strong><span>/ {String(steps.length).padStart(2,'0')} &nbsp; THE JOURNEY OF UNDERSTANDING</span></div>
   </div>
   <div className="bs-philosophy-interactive tb-reveal">
    <div className="bs-philosophy-tabs" role="tablist" aria-label="Six stages of the TrawellBeyond philosophy">
     {steps.map((s,i)=><button key={s.key} ref={el=>{buttons.current[i]=el;}} type="button" id={`bs-stage-${i}`} role="tab" aria-controls="bs-stage-panel" aria-selected={active===i} tabIndex={active===i?0:-1} className={active===i?'is-active':''} onClick={()=>choose(i)} onKeyDown={e=>keyMove(e,i)}><span>{String(i+1).padStart(2,'0')}</span><strong>{s.key}</strong></button>)}
    </div>
    <div id="bs-stage-panel" className="bs-philosophy-card" role="tabpanel" aria-labelledby={`bs-stage-${active}`} tabIndex={0} key={active}>
     <div className="bs-philosophy-card-top"><span>{step.cue}</span><span aria-hidden="true">0{active+1} / 06</span></div>
     <h3>{step.title}</h3>
     <p>{step.copy}</p>
     <div className="bs-example"><span>IMAGINE THIS</span><p>{step.example}</p></div>
     <div className="bs-philosophy-controls"><button type="button" onClick={()=>choose(active-1,true)} aria-label="Previous philosophy stage">← <span>Previous</span></button><button type="button" onClick={()=>choose(active+1,true)} aria-label="Next philosophy stage"><span>{active===steps.length-1?'Back to the beginning':'Next chapter'}</span> →</button></div>
    </div>
   </div>
  </div>
 </section>;
}
