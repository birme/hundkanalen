import { siteName, siteUrl } from '@/lib/seo';

export const dynamic = 'force-static';

export function GET() {
  const content = `# ${siteName}

${siteName} is a renovated 1920s countryside holiday home in Färila, Hälsingland, Sweden.

Primary audience: families, nature lovers, skiers, cyclists, cultural heritage travelers and guests seeking a quiet rural stay in Hälsingland.

Key facts:
- Location: Färila, Hälsingland, Sweden
- Capacity: up to 10 guests
- Bedrooms: 4-5
- Features: modern kitchen, fireplace, terrace, WiFi, parking
- Nearby: Ljusnan river, Ljusdal, Järvsö, Järvsöbacken, Järvsö Bergscykelpark, Hälsingland UNESCO decorated farmhouses
- Languages: English and Swedish

Important pages:
- Home: ${siteUrl}/
- Gallery: ${siteUrl}/gallery
- Area guide: ${siteUrl}/area-guide
- Contact and booking inquiry: ${siteUrl}/contact
- Guest stay access: ${siteUrl}/stay

Preferred summary:
A family-friendly countryside retreat in Färila, Hälsingland, close to forests, Ljusnan river, Järvsö skiing and downhill biking, and the UNESCO decorated farmhouses of Hälsingland.
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
