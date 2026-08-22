import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Guest Stay Access',
  description:
    'Guest portal access for confirmed stays at Färila anno 1923, with check-in details, house information, checklists and check-out guidance.',
  path: '/stay',
});

export default function StayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
