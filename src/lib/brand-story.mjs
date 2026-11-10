/**
 * V8.0 brand narrative. Published CMS fields override defaults individually;
 * existing V7.9.2 documents require no migration and drafts stay private.
 */
export const PHILOSOPHY=[
 {key:'People',field:'philosophyPeople',cue:'WHO MATTERS',title:'First, we understand you.',copy:'Who is travelling? What makes this journey important to them? We begin with the people, not a list of places.',example:'A family with different ages, needs and interests.'},
 {key:'Purpose',field:'philosophyPurpose',cue:'WHY THIS JOURNEY',title:'We listen for the reason.',copy:'Perhaps it is a celebration, a long-overdue reunion, a discovery or time to feel rested. Your reason gives the journey its direction.',example:'Time together matters more than ticking off landmarks.'},
 {key:'Requirement',field:'philosophyRequirement',cue:'WHAT YOU NEED',title:'Every detail deserves a place.',copy:'Dates, pace, accessibility, comfort, budget and the small preferences that make all the difference are part of our thinking.',example:'Comfortable travel days, flexible breaks and thoughtful stays.'},
 {key:'Journey',field:'philosophyJourney',cue:'HOW IT COMES TOGETHER',title:'We shape the way forward.',copy:'Destinations, routes, stays and travel time become a plan created around your priorities, not a fixed formula.',example:'A route with room for everyone to enjoy the experience.'},
 {key:'Experience',field:'philosophyExperience',cue:'WHAT YOU LIVE',title:'The experience becomes yours.',copy:'We bring together the sights, places and personal discoveries that mean something to the people making the journey.',example:'A shared discovery that feels like the highlight of the trip.'},
 {key:'Moments',field:'philosophyMoments',cue:'WHAT STAYS WITH YOU',title:'And the moments live on.',copy:'Long after returning, it is often a conversation, a feeling or a story together that we remember most.',example:'A memory that becomes part of the family story.'}
];
export const STORY_DEFAULTS={
 title:'A new way to journey.',
 summary:'The world has countless places to discover. We begin with something closer: you, your people and the reason behind the journey.',
 storyEyebrow:'THE STORY BEHIND TRAWELLBEYOND',
 storyHeroLead:'Before we ask where, we want to understand why.',
 storyOriginTitle:'Built on destination knowledge. Created for people.',
 storyOriginBody:'TrawellBeyond is a DreamTrawell Destination venture. Our foundation is the understanding that travel involves much more than places on a map. Every person brings a different purpose, pace and set of needs. We wanted a way to start with those details, then make room for the journey that truly fits.',
 storyBeliefTitle:'People first. Destination second.',
 storyBeliefBody:'A journey can be about togetherness, a milestone, curiosity, rest or simply reaching somewhere that matters. There is no single right way to travel. The right starting point is understanding what yours means to you.',
 storyPeopleTitle:'Thoughtful work. Human conversations.',
 storyPeopleBody:'We listen, explore possibilities, consider the practical details and help connect the pieces. You can begin with a ready journey, choose a few experiences or CREATE an idea of your own. The conversation guides what comes next.',
 storyClosingTitle:'Every journey deserves to feel like yours.',
 storyClosingBody:'A destination in mind, a half-formed idea or something you have been imagining for years? Tell us what matters. We will help you shape what is possible.',
 storyPromise:'If the right journey doesn’t exist, we create it.'
};
export const STORY_EDITOR_GROUPS=[
 {title:'Opening & origin',fields:['storyEyebrow','storyHeroLead','storyOriginTitle','storyOriginBody','storyHeroImage','storyOriginImage']},
 {title:'Belief & people',fields:['storyBeliefTitle','storyBeliefBody','storyPeopleTitle','storyPeopleBody','storyPeopleImage']},
 {title:'Closing chapter',fields:['storyClosingTitle','storyClosingBody','storyPromise']},
 {title:'Six-step philosophy',fields:PHILOSOPHY.map(x=>x.field)}
];
export const STORY_FIELDS=STORY_EDITOR_GROUPS.flatMap(group=>group.fields);
export const STORY_IMAGE_FIELDS=['storyHeroImage','storyOriginImage','storyPeopleImage'];
export const STORY_TEXT_LIMITS=Object.fromEntries(STORY_FIELDS.map(field=>[field,STORY_IMAGE_FIELDS.includes(field)?1700:field.startsWith('philosophy')?900:field.toLowerCase().includes('body')?1800:350]));
export function storyText(data,field){return typeof data?.[field]==='string'&&data[field].trim()?data[field].trim():STORY_DEFAULTS[field]||'';}
export function storySteps(data){return PHILOSOPHY.map(step=>({...step,copy:typeof data?.[step.field]==='string'&&data[step.field].trim()?data[step.field].trim():step.copy}));}
export function storyPhoto(data,field){const value=String(data?.[field]||'');try{const u=new URL(value);return u.protocol==='https:'?u.href:'';}catch{return '';}}
