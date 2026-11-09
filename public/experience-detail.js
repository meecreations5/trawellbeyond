/* The same Firebase Web SDK enquiry bridge used by the approved V5.1 journey page. */
(()=>{
'use strict';
const form=document.querySelector('#experienceEnquiryForm');
if(!form)return;
let context={};
try{context=JSON.parse(document.querySelector('#tb-page-data')?.textContent||'{}');}catch{}
const status=document.querySelector('#exFormStatus');
const submit=form.querySelector('[type=submit]');
form.addEventListener('submit',async event=>{
 event.preventDefault();
 if(!form.reportValidity())return;
 const data=new FormData(form);
 if(data.get('website'))return;
 const phone=String(data.get('phone')||'').trim();
 if((phone.match(/\d/g)||[]).length<7){status.textContent='Please enter a valid contact number.';status.classList.add('error');return;}
 submit.disabled=true;submit.firstChild.textContent='Sending enquiry ';
 status.classList.remove('error');status.textContent='Sending your enquiry...';
 try{
  if(!window.TrawellBeyondEnquiries)throw new Error('Enquiry service is unavailable. Please use the enquiry page.');
  const result=await window.TrawellBeyondEnquiries.submit({
   source:'enquiry',name:String(data.get('name')||'').trim(),phone,
   email:String(data.get('email')||'').trim(),destination:context.name||String(data.get('destination')||''),
   dates:String(data.get('dates')||''),travelers:String(data.get('travelers')||''),
   purpose:`Selected experience: ${context.title||'Travel experience'}`,
   notes:`Experience: ${context.title||''} (${context.slug||''})\n${String(data.get('notes')||'')}`,
   consent:data.get('consent')==='on',website:String(data.get('website')||'')
  });
  if(!result?.ok)throw new Error('The request could not be saved.');
  form.reset();status.textContent=`Your enquiry was received. Reference: ${result.id||'Received'}. Our team will contact you.`;
 }catch(error){status.textContent=error.message||'Enquiry could not be sent. Please retry.';status.classList.add('error');}
 finally{submit.disabled=false;submit.firstChild.textContent='Send enquiry ';}
});
})();
