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
          flexDirection: 'column',
          justifyContent: 'space-between',
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
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(8,7,24,0.82) 0%, rgba(8,7,24,0.58) 46%, rgba(8,7,24,0.18) 100%), linear-gradient(180deg, rgba(8,7,24,0.16) 0%, rgba(8,7,24,0.62) 100%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: 30, opacity: 0.82, letterSpacing: 2, textTransform: 'uppercase' }}>
            Countryside Retreat
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: 760,
              padding: 36,
              borderRadius: 32,
              background: 'rgba(15, 11, 43, 0.54)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <div style={{ fontSize: 86, fontWeight: 800, lineHeight: 0.95 }}>{siteName}</div>
            <div style={{ marginTop: 28, fontSize: 34, opacity: 0.88 }}>
              Färila, Hälsingland, Sweden
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, fontSize: 26 }}>
            <span style={{ padding: '16px 24px', borderRadius: 999, background: 'rgba(15,11,43,0.66)', border: '1px solid rgba(255,255,255,0.16)' }}>
              4-5 bedrooms
            </span>
            <span style={{ padding: '16px 24px', borderRadius: 999, background: 'rgba(15,11,43,0.66)', border: '1px solid rgba(255,255,255,0.16)' }}>
              Families
            </span>
            <span style={{ padding: '16px 24px', borderRadius: 999, background: 'rgba(15,11,43,0.66)', border: '1px solid rgba(255,255,255,0.16)' }}>
              Nature & heritage
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
