import {publishedOne} from '@/lib/content-server';
import {EditorialCopy} from '@/components/EditorialCopy';
export const metadata={title:'Terms of Use'};export const dynamic='force-dynamic';
const starter=`TrawellBeyond is an enquiry-led travel service. Website information is for initial planning, not confirmed bookings.

## Availability and prices

Availability, schedules, experience inclusions and final prices require confirmation before any arrangements are made.

## No online payments

This website does not process travel payments or provide checkout.

## Contact

For any questions regarding travel arrangements, please reach us through the contact page.

This starter text requires legal review before publishing.`;
export default async function Terms(){const page=await publishedOne('pages','terms')||{};return <main className="tb-legal tb-container"><h1>{page.title||'Terms of Use'}</h1><EditorialCopy text={page.description||starter}/></main>;}
