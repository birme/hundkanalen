import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Photo Gallery',
  description:
    'Photos from Färila anno 1923, including the house, interior, garden and Hälsingland surroundings. Guests with an access code can unlock the full gallery.',
  path: '/gallery',
});

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
