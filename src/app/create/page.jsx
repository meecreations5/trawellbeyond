import CreateStudio from '@/components/CreateStudio';
import {publishedOne} from '@/lib/content-server';
export const metadata={title:'CREATE Your Journey'};
export const dynamic='force-dynamic';
export default async function Create({searchParams}){
 const query=await searchParams;
 const page=await publishedOne('pages','create')||{};
 return <CreateStudio page={page} initialDestination={String(query?.destination||'').slice(0,120)}
  initialPurpose={String(query?.purpose||'').slice(0,150)}
  initialNights={Math.max(1,Math.min(21,Number(query?.nights)||3))}
  initialExperience={String(query?.experience||'').slice(0,160)}
  initialNotes={[query?.experienceSlug?`Selected experience: ${String(query.experience||'').slice(0,100)} (${String(query.experienceSlug).slice(0,100)})`:'',String(query?.notes||'').slice(0,700)].filter(Boolean).join('\n')}/>;
}
