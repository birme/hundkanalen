import type { MetadataRoute } from 'next';
import { siteName } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: 'Färila 1923',
    description: 'Countryside retreat in Färila, Hälsingland, Sweden.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f4ef',
    theme_color: '#17123b',
    lang: 'en',
  };
}
