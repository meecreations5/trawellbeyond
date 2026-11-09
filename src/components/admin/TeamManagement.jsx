'use client';
import {useCallback,useEffect,useMemo,useState} from 'react';
import {INVITABLE_ROLES,ROLE_LABELS} from '@/lib/team-access.mjs';
import './team-management.css';

export default function TeamManagement({request,currentUid}){
 const [email,setEmail]=useState(''),[role,setRole]=useState('editor');
 const [members,setMembers]=useState([]),[invites,setInvites]=useState([]);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const load=useCallback(async()=>{
  setBusy(true);setError('');
  try{
   const result=await request('/api/admin/team/snapshot');
   setMembers(result.members||[]);setInvites(result.invites||[]);
  }catch(e){setError(e.message);}finally{setBusy(false);}
 },[request]);
 useEffect(()=>{load();},[load]);
 const joinedEmails=useMemo(()=>new Set(members.map(m=>(m.email||'').toLowerCase())),[members]);
 async function invite(e){
  e.preventDefault();setBusy(true);setError('');setNotice('');
  try{
   const result=await request('/api/admin/team/invites',{method:'POST',body:{email,role}});
   setEmail('');setNotice(`Invitation saved for ${result.email}. Share your /admin sign-in link with the teammate. No email is sent automatically.`);
   await load();
  }catch(err){setError(err.message);}finally{setBusy(false);}
 }
 async function changeInvite(record,patch){
  if(busy)return;
  if(!window.confirm(`${patch.active===false?'Revoke':patch.active===true?'Reactivate':'Change'} invitation for ${record.email}? Existing joined members are managed separately below.`))return;
  setBusy(true);setError('');setNotice('');
  try{
   await request('/api/admin/team/invites',{method:'PATCH',body:{email:record.email,role:patch.role||record.role,active:patch.active??record.active}});
   setNotice('Invitation updated.');await load();
  }catch(err){setError(err.message);}finally{setBusy(false);}
 }
 async function changeMember(record,patch){
  if(busy||record.id===currentUid||record.role==='super_admin')return;
  const next={uid:record.id,role:patch.role||record.role,active:patch.active??record.active};
  if(!window.confirm(`${!next.active?'Disable':next.active&&!record.active?'Enable':'Update'} ${record.email||record.id} as ${ROLE_LABELS[next.role]}?`))return;
  setBusy(true);setError('');setNotice('');
  try{await request('/api/admin/team/members',{method:'PATCH',body:next});setNotice('Team membership updated. Access changes are enforced by Firebase rules.');await load();}
  catch(err){setError(err.message);}finally{setBusy(false);}
 }
 const joinUrl=typeof window!=='undefined'?`${window.location.origin}/admin`:'/admin';
 async function copyInvite(){
  const text=`You have been invited to help prepare content for TrawellBeyond. Open ${joinUrl} and sign in with your invited Microsoft account. Your access is controlled by your assigned role.`;
  try{await navigator.clipboard.writeText(text);setNotice('Sign-in instructions copied. Send them to the invited team member.');}
  catch{window.prompt('Copy and share these instructions',text);}
 }
 return <div className="tm-root">
  <section className="tm-hero"><span>OWNER ACCESS CONTROL</span><h2>Invite a teammate. Keep publishing under control.</h2><p>Team members sign in through Microsoft. Invited users get their own Firebase membership automatically after their first sign-in. Only you can change permissions. No shared passwords and no Firebase console UID entry for new teammates.</p></section>
  <section className="tm-card"><div className="tm-section-head"><div><h3>Add a team member</h3><p>Enter the exact Microsoft email address the teammate will use to sign in.</p></div><button type="button" className="a-btn a-outline" onClick={copyInvite}>Copy sign-in instructions</button></div>
   <form onSubmit={invite} className="tm-invite-form"><label>Microsoft email<input type="email" value={email} placeholder="teammate@company.com" required autoComplete="email" onChange={e=>setEmail(e.target.value)}/></label><label>Access role<select value={role} onChange={e=>setRole(e.target.value)}>{INVITABLE_ROLES.map(r=><option key={r} value={r}>{ROLE_LABELS[r]}</option>)}</select></label><button className="a-btn a-primary" disabled={busy||!email.trim()} type="submit">{busy?'Saving…':'Add invitation'}</button></form>
   <div className="tm-role-notes"><p><b>Publisher</b> can edit and publish. <b>Content Editor</b> prepares draft copy and photos. <b>Media Assistant</b> handles photos and galleries on drafts only. Existing published pages remain protected from editor/media changes.</p></div>
  </section>
  <section className="tm-card"><div className="tm-section-head"><div><h3>Invitations</h3><p>Invites remain usable until revoked. Joined users have a separate membership, which you can disable below.</p></div><button className="a-btn a-outline" disabled={busy} onClick={load}>Refresh</button></div>
   {invites.length===0?<p className="tm-empty">No invitations yet.</p>:<div className="tm-table">{invites.map(inv=><div className="tm-row" key={inv.id}><div><strong>{inv.email}</strong><small>{joinedEmails.has(inv.email)?'Joined':'Awaiting first Microsoft sign-in'} · {inv.active?'Invitation active':'Invitation revoked'}</small></div><select aria-label={`Invitation role for ${inv.email}`} disabled={busy||!inv.active||joinedEmails.has(inv.email)} value={inv.role} onChange={e=>changeInvite(inv,{role:e.target.value})}>{INVITABLE_ROLES.map(r=><option key={r} value={r}>{ROLE_LABELS[r]}</option>)}</select><button disabled={busy} className="a-btn a-outline" onClick={()=>changeInvite(inv,{active:!inv.active})}>{inv.active?'Revoke':'Reactivate'}</button></div>)}</div>}
  </section>
  <section className="tm-card"><div className="tm-section-head"><div><h3>Team members</h3><p>Pause access instantly or change an active member's role. Your own Super Admin role is protected.</p></div><b>{members.filter(x=>x.active).length} active</b></div>
   {members.length===0?<p className="tm-empty">No joined members yet.</p>:<div className="tm-table">{members.map(member=>{const locked=member.id===currentUid||member.role==='super_admin';return <div className="tm-row" key={member.id}><div><strong>{member.name||member.email||'Staff member'} {member.id===currentUid?'(You)':''}</strong><small>{member.email||`UID: ${member.id}`} · {member.active?'Active':'Disabled'}</small></div><select aria-label={`Role for ${member.email||member.id}`} value={member.role} disabled={busy||locked} onChange={e=>changeMember(member,{role:e.target.value})}>{(locked?['super_admin']:['admin',...INVITABLE_ROLES]).map(r=><option value={r} key={r}>{ROLE_LABELS[r]}</option>)}</select><button className="a-btn a-outline" disabled={busy||locked} onClick={()=>changeMember(member,{active:!member.active})}>{locked?'Protected':member.active?'Disable':'Enable'}</button></div>;})}</div>}
  </section>
  {notice&&<div role="status" className="a-alert a-success">{notice}</div>}
  {error&&<div role="alert" className="a-alert a-error">{error}</div>}
  <p className="tm-bottom">Security reminder: deploy both <code>firestore.rules</code> and <code>storage.rules</code> before inviting staff. This screen does not create Microsoft accounts or send email invitations.</p>
 </div>;
}
