import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contact & Booking Inquiry',
  description:
    'Send a booking inquiry for Färila anno 1923 with dates, group size and questions. A countryside retreat in Hälsingland for families and quiet rural stays.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
