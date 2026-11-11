/** V7.9.2: Share one CMS safely without handing out owner privileges. */
export const TEAM_ROLES = ['super_admin', 'admin', 'publisher', 'editor', 'media'];
export const INVITABLE_ROLES = ['publisher', 'editor', 'media'];
export const ROLE_LABELS = {
 super_admin:'Super Admin',admin:'Admin (legacy)',publisher:'Publisher',editor:'Content Editor',media:'Media Assistant'
};
export const MEDIA_EDIT_FIELDS = [
 'heroImage','photoCredit','photoLicense','photoSourceUrl','galleryImages','dayImages','imageCredits',
 'imageVariants','storyImage1','storyImage2','storyImage3',
 'homeCreateImage','homeMomentImage1','homeMomentImage2','homeMomentImage3',
 'mediaReviewStatus','mediaReviewedAt','mediaReviewedBy'
];
export const canManageTeam = role => role === 'super_admin';
export const canPublishContent = role => ['super_admin','admin','publisher'].includes(role);
export const canEditDraft = role => ['super_admin','admin','publisher','editor','media'].includes(role);
export const canCreateContent = role => ['super_admin','admin','publisher','editor'].includes(role);
export const canEditText = role => ['super_admin','admin','publisher','editor'].includes(role);
export const canManageMedia = role => canEditDraft(role);
export const canReadEnquiries = role => ['super_admin','admin','publisher'].includes(role);
export const canDeleteContent = role => ['super_admin','admin'].includes(role);
export const canEditRecord = (role, record) => !!record && (canPublishContent(role) || record.status === 'draft' && canEditDraft(role));
/** Manual edits by content/media staff also need a Publisher to review any new
 * pictures. Changing an approved draft's pictures invalidates its approval. */
export function quarantineDraftPhotoEdits(role,before,next){
 if(!before||before.status!=='draft'||next.status!=='draft')return next;
 const changed=MEDIA_EDIT_FIELDS.filter(k=>!['mediaReviewStatus','mediaReviewedAt','mediaReviewedBy'].includes(k)).some(k=>JSON.stringify(before[k]??'')!==JSON.stringify(next[k]??''));
 if(changed&&(!canPublishContent(role)||before.mediaReviewStatus==='approved'))return {...next,mediaReviewStatus:'pending',mediaReviewedBy:'',mediaReviewedAt:''};
 return next;
}
export function normalizedEmail(value) {
 const email=String(value||'').trim().toLowerCase();
 if(email.length>254 || !/^[^\s/@]+@[^\s/@]+\.[^\s/@]+$/.test(email))throw new Error('Enter a valid Microsoft account email address.');
 return email;
}
/** Extra client-side validation; the actual boundary is deployed Firestore Rules. */
export function assertContentWrite(role, before, next, {create=false}={}) {
 if (create) {
  if(!canCreateContent(role))throw new Error('Your role cannot create content.');
  if(next.status==='published'&&!canPublishContent(role))throw new Error('Only a Publisher or Admin can publish. Save a Draft instead.');
  return;
 }
 if(!canEditRecord(role,before))throw new Error('This record is read-only for your role. Only a Publisher can change live pages.');
 if(next.status==='published'&&!canPublishContent(role))throw new Error('Only a Publisher or Admin can publish content.');
 if(role==='editor'&&next.status!=='draft')throw new Error('Content Editors can only update Draft records.');
 if(role==='editor'&&next.mediaReviewStatus==='approved'&&before?.mediaReviewStatus!=='approved')throw new Error('Only a Publisher can approve imported photos.');
 if(role==='media') {
  if(next.mediaReviewStatus==='approved')throw new Error('A Media Assistant cannot approve photographs for publication.');
  if(next.status!=='draft')throw new Error('Media Assistants may only update Draft photographs.');
  const keys=new Set([...Object.keys(before||{}),...Object.keys(next||{})]);
  const changed=[...keys].filter(k=>JSON.stringify(before[k]??'')!==JSON.stringify(next[k]??''));
  const forbidden=changed.filter(k=>!MEDIA_EDIT_FIELDS.includes(k));
  if(forbidden.length)throw new Error(`Media Assistants cannot change ${forbidden.join(', ')}. Only image fields are permitted.`);
 }
}
