import Link from 'next/link';
import {publishedOne} from '@/lib/content-server';
import {STORY_DEFAULTS,storyPhoto,storyText,storySteps} from '@/lib/brand-story.mjs';
import StoryPhilosophy from '@/components/StoryPhilosophy';
import ChapterProgress from '@/components/motion/ChapterProgress';
import {resolveImageVariant} from '@/lib/media-variants.mjs';
import '@/components/story-experience.css';
export const metadata={title:'Our Story',description:'Discover TrawellBeyond, a DreamTrawell Destination venture. People first. Destination second. Your journey, created around you.'};
export const dynamic='force-dynamic';
function StoryPhoto({data,field,label,caption,className='',priority=false}){
 const url=storyPhoto(data,field);
 const image=url?resolveImageVariant(data,url,'medium'):'';
 return <div className={`bs-picture ${image?'bs-picture-has-photo':'bs-picture-abstract'} ${className}`}>
  {image?<img src={image} alt={label} loading={priority?"eager":"lazy"} fetchPriority={priority?"high":"auto"} decoding="async"/>:<div className="bs-picture-art" aria-hidden="true"><span className="bs-art-sun"/><span className="bs-art-road"/><span className="bs-art-path"/></div>}
  <span className="bs-picture-label">{caption}</span>
 </div>;
}
export default async function OurStory(){
 const data=await publishedOne('pages','our-story')||{};
 const name=data.title||STORY_DEFAULTS.title;
 const original=String(data.description||'').split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
 return <main className="bs-page" id="story-top"><ChapterProgress/>
  <section className="bs-hero bs-wide" aria-labelledby="bs-story-title">
   <div className="bs-hero-copy tb-reveal"><span className="bs-kicker">01 / {storyText(data,'storyEyebrow')}</span><h1 id="bs-story-title">{name}</h1><p className="bs-hero-lead">{storyText(data,'storyHeroLead')}</p><p className="bs-hero-summary">{data.summary||STORY_DEFAULTS.summary}</p><div className="bs-hero-cta"><a href="#our-beginning" className="bs-link">Discover our story <span aria-hidden="true">↘</span></a><span>PEOPLE FIRST · DESTINATION SECOND</span></div></div>
   <div className="bs-hero-picture tb-parallax-media" data-parallax="24"><StoryPhoto data={data} field="storyHeroImage" priority label="TrawellBeyond editorial journey photograph" caption="TRAVEL · JOURNEYS · EXPERIENCES"/><span className="bs-hero-stamp" aria-hidden="true">CREATED<br/>AROUND<br/><i>YOU.</i></span></div>
  </section>
  <section id="our-beginning" className="bs-origin bs-wide" aria-labelledby="bs-origin-title">
   <div className="bs-chapter-heading tb-reveal"><span className="bs-kicker">02 / WHERE WE COME FROM</span><h2 id="bs-origin-title">{storyText(data,'storyOriginTitle')}</h2></div>
   <div className="bs-origin-copy tb-reveal"><p>{storyText(data,'storyOriginBody')}</p>{original.length>0&&<details className="bs-origin-extra"><summary>More about our beginning <span aria-hidden="true">↗</span></summary><div>{original.map((p,i)=><p key={i}>{p}</p>)}</div></details>}<div className="bs-signature">A DREAMTRAWELL DESTINATION VENTURE</div></div>
   <StoryPhoto data={data} field="storyOriginImage" label="An editorial photograph illustrating how journeys come together" caption="UNDERSTAND. CREATE. EXPERIENCE." className="bs-origin-photo tb-reveal"/>
  </section>
  <section id="what-we-believe" className="bs-belief" aria-labelledby="bs-belief-title"><div className="bs-wide bs-belief-inner"><span className="bs-kicker bs-kicker-light">03 / WHAT WE BELIEVE</span><h2 id="bs-belief-title" className="tb-reveal">{storyText(data,'storyBeliefTitle')}</h2><p className="tb-reveal">{storyText(data,'storyBeliefBody')}</p><div className="bs-belief-footer"><span>CREATED AROUND YOU.</span><span aria-hidden="true">✳</span></div></div></section>
  <StoryPhilosophy steps={storySteps(data)}/>
  <section id="the-people" className="bs-people bs-wide" aria-labelledby="bs-people-title"><div className="bs-people-photo tb-reveal"><StoryPhoto data={data} field="storyPeopleImage" label="TrawellBeyond people and planning editorial photograph" caption="05 / THE HUMAN SIDE OF TRAVEL"/></div><div className="bs-people-copy tb-reveal"><span className="bs-kicker">05 / HOW WE WORK</span><h2 id="bs-people-title">{storyText(data,'storyPeopleTitle')}</h2><p>{storyText(data,'storyPeopleBody')}</p><div className="bs-people-steps"><span>01 &nbsp; Understand</span><span>02 &nbsp; Create</span><span>03 &nbsp; Experience</span></div></div></section>
  {(data.photoCredit||data.imageCredits)&&<details className="bs-photo-credits bs-wide"><summary>Photography &amp; attribution <span aria-hidden="true">↗</span></summary>{data.photoCredit&&<p>Cover: {data.photoCredit} {data.photoLicense&&` · ${data.photoLicense}`} {data.photoSourceUrl&&<a href={data.photoSourceUrl} target="_blank" rel="noopener noreferrer">Source ↗</a>}</p>}{String(data.imageCredits||'').split(/\n/).filter(Boolean).map((line,i)=><p key={i}>{line}</p>)}</details>}
  <section id="your-chapter" className="bs-closing" aria-labelledby="bs-closing-title"><div className="bs-wide bs-closing-content tb-reveal"><span className="bs-kicker">06 / YOUR CHAPTER</span><h2 id="bs-closing-title">{storyText(data,'storyClosingTitle')}</h2><p>{storyText(data,'storyClosingBody')}</p><blockquote>{storyText(data,'storyPromise')}</blockquote><div className="bs-closing-actions"><Link className="bs-primary" href="/create">CREATE your journey <span aria-hidden="true">↗</span></Link><Link className="bs-link" href="/contact">Start with a conversation <span aria-hidden="true">↗</span></Link></div></div></section>
 </main>;
}
