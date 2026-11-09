import {publishedOne} from '@/lib/content-server';
import {EditorialCopy} from '@/components/EditorialCopy';
export const metadata={title:'Privacy Notice'};export const dynamic='force-dynamic';
const starter=`When you send an enquiry, TrawellBeyond collects the contact and travel preference information you choose to provide so our team can respond and develop a travel proposal.

## How information is used

Your enquiry is visible to authorized team members and used to discuss your travel request. No online payments are processed.

## Data security

Enquiry data is stored in a protected database, not made publicly accessible through the website.

## Your choices

Use our contact page to request access, correction or deletion of information provided in an enquiry.

This starter notice requires business and legal review before publishing, including retention periods and contact details.`;
export default async function Privacy(){const page=await publishedOne('pages','privacy')||{};return <main className="tb-legal tb-container"><h1>{page.title||'Privacy Notice'}</h1><EditorialCopy text={page.description||starter}/></main>;}
