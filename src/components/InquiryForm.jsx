'use client';
import {useState} from 'react';
import {submitEnquiry} from '@/lib/enquiries-web';
const initial={name:'',email:'',phone:'',destination:'',dates:'',travelers:'',purpose:'',notes:'',consent:false,website:''};
export default function InquiryForm({source='enquiry',initialDestination='',initialPurpose='',initialNotes='',isCreate=false}){
 const [form,setForm]=useState({...initial,destination:initialDestination,purpose:initialPurpose,notes:initialNotes}),[status,setStatus]=useState(''),[sending,setSending]=useState(false),[step,setStep]=useState(0),[error,setError]=useState('');
 const update=(key,value)=>setForm(prev=>({...prev,[key]:value}));
 async function send(e){e.preventDefault();setError('');setSending(true);
  try{await submitEnquiry({...form,source});setStatus('Your enquiry has been received. Our travel team will contact you.');setForm({...initial,destination:initialDestination,purpose:initialPurpose,notes:initialNotes});}
  catch(err){setError(err.message);}finally{setSending(false);}
 }
 const field=(name,label,placeholder,type='text')=><label key={name}>{label}<input type={type} value={form[name]} placeholder={placeholder} onChange={e=>update(name,e.target.value)}/></label>;
 return <div className="tb-inquiry">{status?<div className="tb-success"><span>✓</span><h2>Thank you for reaching out.</h2><p>{status}</p><button onClick={()=>{setStatus('');setStep(0);}}>Send another enquiry ↗</button></div>:<form onSubmit={send}>
  {isCreate&&<div className="tb-step-crumb">CREATE YOUR JOURNEY / STEP {step+1} OF 3</div>}
  {(!isCreate||step===0)&&<div className="tb-form-grid">{field('destination','Where would you like to go?','Destination or open to suggestions')}{field('purpose','What is this journey for?','Family, celebration, discovery, escape…')}{field('dates','When are you thinking of travelling?','Dates or flexible')}{field('travelers','Who is travelling?','2 adults, 1 child…')}</div>}
  {(!isCreate||step===1)&&<label>Tell us more about the journey you imagine<textarea rows="6" value={form.notes} onChange={e=>update('notes',e.target.value)} placeholder="Your interests, preferred pace, stay preferences, special moments or anything else that matters"/></label>}
  {(!isCreate||step===2)&&<><div className="tb-form-grid">{field('name','Your name *','Full name')}{field('phone','Contact number *','Phone including country code','tel')}{field('email','Email address','you@example.com','email')}</div><label className="tb-consent"><input type="checkbox" required checked={form.consent} onChange={e=>update('consent',e.target.checked)}/> I agree that TrawellBeyond may contact me about this enquiry.</label></>}
  <label className="tb-hidden-field" aria-hidden="true">Website<input tabIndex="-1" autoComplete="off" value={form.website} onChange={e=>update('website',e.target.value)}/></label>
  {error&&<div className="tb-inline-error" role="alert">{error}</div>}
  <div className="tb-form-actions">{isCreate&&step>0&&<button type="button" className="tb-secondary-button" onClick={()=>setStep(s=>s-1)}>← Back</button>}{isCreate&&step<2?<button type="button" className="tb-primary-button" onClick={()=>setStep(s=>s+1)}>Continue ↗</button>:<button type="submit" disabled={sending||!form.consent||!form.name||!form.phone} className="tb-primary-button">{sending?'Sending…':'Send my enquiry ↗'}</button>}</div>
  <p className="tb-form-note">No payment is taken online. Our team will help shape a journey around your needs.</p>
 </form>}</div>;
}
