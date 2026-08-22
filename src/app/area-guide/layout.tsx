import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Area Guide',
  description:
    'Local guide to Färila and Hälsingland: Järvsöbacken skiing, Järvsö downhill biking, fishing in Ljusnan, forests, swimming, dining and UNESCO decorated farmhouses.',
  path: '/area-guide',
});

export default function AreaGuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
