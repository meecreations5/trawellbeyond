/** Quick release audit. Source/asset checks only; does not replace live web vitals. */
import fs from 'node:fs';
import crypto from 'node:crypto';
const path=file=>fs.readFileSync(file,'utf8');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const must=(ok,detail)=>{if(!ok)throw new Error(`V8.1 motion audit: ${detail}`);};
const expected={
 'public/assets/trawellbeyond-master.svg':'799a9fe32266ba8afffb9edf0ba392983c4cddc433626fdff4166d89e0333e58',
 'public/assets/trawellbeyond-display.svg':'06bdaa3267c1e35d113a8b4218b0ac8c7d98180776cf678f59c403da43b43149'
};
for(const [file,sig] of Object.entries(expected))must(hash(file)===sig,`${file} artwork changed`);
for(const file of ['public/index.html','src/templates/destination.html','src/templates/experience.html','src/templates/journey.html']){
 const source=path(file);must(source.includes('/v81-motion.css'),`${file} missing CSS`);
 must(source.includes('/v81-motion.js'),`${file} missing browser adapter`);
}
const motion=path('public/v81-motion.css');must(motion.includes('prefers-reduced-motion:reduce'),'missing reduce-motion styling');
must(motion.includes('pointer-events:none'),'intro could block page');
must(!/infinite\s*;/.test(motion),'infinite motion added');
must(path('src/components/CreateStudio.jsx').includes('cr-v81-progress'),'CREATE progress not connected');
must(path('src/components/StoryPhilosophy.jsx').includes('<JourneyLine'),'philosophy line not connected');
must(path('src/components/InquiryForm.jsx').includes('if(!result?.ok)'),'false enquiry-success regression');
must(path('public/journey-tray.js').includes('tb_journey_v73'),'saved journey storage key changed');
console.log('V8.1 audit passed: original logos, all HTML templates, React paths, reduced motion, save/enquiry integrity.');
