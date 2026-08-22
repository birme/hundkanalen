import { ImageResponse } from 'next/og';
import { absoluteUrl, siteName } from '@/lib/seo';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';
export const dynamic = 'force-dynamic';

type PublicPhoto = {
  id: string;
};

async function getOgPhotoDataUrl() {
  try {
    const response = await fetch(absoluteUrl('/api/public/photos'), {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;

    const photos = (await response.json()) as PublicPhoto[];
    const photo = photos[0];
    if (!photo?.id) return null;

    const photoResponse = await fetch(absoluteUrl(`/api/photos/${photo.id}`), {
      next: { revalidate: 3600 },
    });
    if (!photoResponse.ok) return null;

    const contentType = photoResponse.headers.get('content-type') || 'image/jpeg';
    const bytes = Buffer.from(await photoResponse.arrayBuffer());
    return `data:${contentType};base64,${bytes.toString('base64')}`;
  } catch {
    return null;
  }
}

export default async function Image() {
  const photoUrl = await getOgPhotoDataUrl();

  return new ImageResponse(
    (
      <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            padding: 76,
            color: 'white',
            background:
              'linear-gradient(135deg, rgba(23,18,59,1) 0%, rgba(55,35,76,1) 44%, rgba(126,43,39,1) 100%)',
        }}
      >
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            width={1200}
            height={630}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 1200,
              height: 630,
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(8,7,24,0.72) 0%, rgba(8,7,24,0.46) 44%, rgba(8,7,24,0.18) 74%, rgba(8,7,24,0.04) 100%), linear-gradient(180deg, rgba(8,7,24,0.18) 0%, rgba(8,7,24,0.18) 48%, rgba(8,7,24,0.62) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 48,
            top: 54,
            width: 760,
            height: 526,
            borderRadius: 42,
            background: 'rgba(8,7,24,0.58)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              fontSize: 24,
              opacity: 1,
            }}
          >
            <div style={{ letterSpacing: 3, textTransform: 'uppercase' }}>
              Countryside Retreat
            </div>
            <div style={{ opacity: 0.9 }}>fritidshuset.birme.se</div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: 760,
            }}
          >
            <div
              style={{
                fontSize: 76,
                fontWeight: 800,
                lineHeight: 1,
                textShadow: '0 7px 38px rgba(0,0,0,0.86)',
              }}
            >
              {siteName}
            </div>
            <div
              style={{
                marginTop: 22,
                fontSize: 31,
                opacity: 1,
                textShadow: '0 5px 28px rgba(0,0,0,0.82)',
              }}
            >
              Färila, Hälsingland, Sweden
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: 27,
              lineHeight: 1.32,
              opacity: 1,
              textShadow: '0 5px 28px rgba(0,0,0,0.82)',
              width: 660,
            }}
          >
            <div>4-5 bedrooms for family stays</div>
            <div>Forest, skiing, fishing and Hälsingland heritage nearby</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
