import Link from 'next/link';
/** Explicit state language. Never equate a submission attempt with confirmation. */
export default function BrandedState({kind='empty',title,description,actionLabel='',actionHref=''}){
 const copy={
  loading:['Your next chapter is taking shape.','We are preparing the details.'],
  empty:['A new journey is taking shape.','Explore another destination or share what you have in mind.'],
  error:['This part of the journey needs another try.','The request could not be completed. Please try again.'],
  success:['Your enquiry has reached us.','Our team will connect with you to understand your journey.']
 };
 const [defaultTitle,defaultDescription]=copy[kind]||copy.empty;
 return <div className={`tb-v81-state tb-v81-state-${kind}`} role={kind==='error'?'alert':'status'} aria-live="polite">
  <span className="tb-v81-state-symbol" aria-hidden="true">{kind==='success'?'✓':kind==='error'?'!':<img src="/assets/trawellbeyond-accent-motif.svg" alt=""/>}</span>
  <div><h3>{title||defaultTitle}</h3><p>{description||defaultDescription}</p></div>
  {actionLabel&&actionHref&&<Link href={actionHref}>{actionLabel} <span aria-hidden="true">↗</span></Link>}
 </div>;
}
