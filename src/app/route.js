/**
 * TrawellBeyond homepage — the original, approved V5.1 markup is served byte
 * for byte. A Next.js JSX rewrite had previously removed approved sections.
 * Public reads are unprivileged Firestore Web SDK reads; missing content
 * falls back to the approved layout, not an error page.
 *
 * The private /admin and all other App Router routes remain in this project.
 * Homepage, shared navigation and footer copy are dynamically filled from
 * approved CMS records without replacing the design system.
 */
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {homepage,publishedOne,publishedList} from '@/lib/content-server';
import {renderV51Home} from '@/lib/v51-home.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(){
  const template = await readFile(join(process.cwd(),'public','index.html'),'utf8');
  const [page,site,destinations,journeys] = await Promise.all([homepage(),publishedOne('pages','site-settings'),publishedList('destinations'),publishedList('journeys')]);
  const html = renderV51Home(template,{page,site:site||{},destinations,journeys});
  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-trawellbeyond-design': 'approved-v5.1'
    }
  });
}
