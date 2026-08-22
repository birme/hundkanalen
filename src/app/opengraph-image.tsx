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

async function getOgPhotoUrl() {
  try {
    const response = await fetch(absoluteUrl('/api/public/photos'), {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;

    const photos = (await response.json()) as PublicPhoto[];
    const photo = photos[0];
    return photo?.id ? absoluteUrl(`/api/photos/${photo.id}`) : null;
  } catch {
    return null;
  }
}

export default async function Image() {
  const photoUrl = await getOgPhotoUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          padding: 72,
          color: 'white',
          background:
            'linear-gradient(135deg, rgba(23,18,59,1) 0%, rgba(55,35,76,1) 44%, rgba(126,43,39,1) 100%)',
        }}
      >
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(8,7,24,0.86) 0%, rgba(8,7,24,0.62) 48%, rgba(8,7,24,0.20) 100%), linear-gradient(180deg, rgba(8,7,24,0.18) 0%, rgba(8,7,24,0.72) 100%)',
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
          <div style={{ fontSize: 28, opacity: 0.86, letterSpacing: 2, textTransform: 'uppercase' }}>
            Countryside Retreat
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: 860,
            }}
          >
            <div
              style={{
                fontSize: 92,
                fontWeight: 800,
                lineHeight: 0.95,
                textShadow: '0 6px 34px rgba(0,0,0,0.72)',
              }}
            >
              {siteName}
            </div>
            <div
              style={{
                marginTop: 28,
                fontSize: 34,
                opacity: 0.92,
                textShadow: '0 4px 24px rgba(0,0,0,0.70)',
              }}
            >
              Färila, Hälsingland, Sweden
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, fontSize: 26 }}>
            <span style={{ padding: '16px 24px', borderRadius: 999, background: 'rgba(15,11,43,0.74)', border: '1px solid rgba(255,255,255,0.20)' }}>
              4-5 bedrooms
            </span>
            <span style={{ padding: '16px 24px', borderRadius: 999, background: 'rgba(15,11,43,0.74)', border: '1px solid rgba(255,255,255,0.20)' }}>
              Families
            </span>
            <span style={{ padding: '16px 24px', borderRadius: 999, background: 'rgba(15,11,43,0.74)', border: '1px solid rgba(255,255,255,0.20)' }}>
              Nature & heritage
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
