import Link from 'next/link';
import InquiryForm from '@/components/InquiryForm';
import {publishedOne} from '@/lib/content-server';
export const metadata={title:'Contact'};export const dynamic='force-dynamic';
export default async function Contact(){const page=await publishedOne('pages','contact')||{};return <main className="tb-form-page"><div className="tb-form-page-intro"><span className="tb-eyebrow">LET'S CONNECT</span><h1>{page.title||<>A journey starts<br/><em>with a conversation.</em></>}</h1><p>{page.summary||'Tell us what you imagine, what matters to you and what you would like to experience.'}</p><Link href="/create" className="tb-text-link">Or use CREATE Trip Builder ↗</Link></div><InquiryForm source="contact"/></main>;}
