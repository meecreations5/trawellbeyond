/** Public reads use the UNPRIVILEGED Firebase Web SDK and Firestore rules.
 * The public query MUST filter status, since rules are not query filters.
 */
import {getFirestore,collection,doc,getDocs,getDoc,query,where,limit as limitTo} from 'firebase/firestore';
import {webApp,isClientConfigured} from './firebase-shared';
import {CONTENT_TYPES,typePath,slugify} from './content.mjs';
const publicDb=()=>getFirestore(webApp());
export async function publishedList(type,count=200){
 if(!isClientConfigured||!CONTENT_TYPES.includes(type))return [];
 try{
  const q=query(collection(publicDb(),typePath(type)),where('status','==','published'),limitTo(Math.min(count,500)));
  const snapshot=await getDocs(q);
  return snapshot.docs.map(d=>({...d.data(),id:d.id})).sort((a,b)=>String(b.publishedAt||b.updatedAt||'').localeCompare(String(a.publishedAt||a.updatedAt||'')));
 }catch(error){console.error('Public CMS list:',type,error.code||error.message);return [];}
}
export async function publishedOne(type,slug){
 if(!isClientConfigured||!CONTENT_TYPES.includes(type)||!slug)return null;
 try{
  const snapshot=await getDoc(doc(publicDb(),typePath(type),slugify(slug)));
  return snapshot.exists()&&snapshot.data().status==='published'?{...snapshot.data(),id:snapshot.id}:null;
 }catch(error){
  // Direct get of an unpublished draft is deliberately rejected by rules.
  // Public routes should silently show their fallback rather than log an error.
  if(error.code!=='permission-denied')console.error('Public CMS detail:',type,error.code||error.message);
  return null;
 }
}
export async function homepage(){return await publishedOne('pages','homepage')||{};}
