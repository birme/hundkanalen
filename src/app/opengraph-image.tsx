import { ImageResponse } from 'next/og';
import { siteName } from '@/lib/seo';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          color: 'white',
          background:
            'linear-gradient(135deg, rgba(23,18,59,1) 0%, rgba(55,35,76,1) 44%, rgba(126,43,39,1) 100%)',
        }}
      >
        <div style={{ fontSize: 30, opacity: 0.78, letterSpacing: 2, textTransform: 'uppercase' }}>
          Countryside Retreat
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 86, fontWeight: 800, lineHeight: 0.95 }}>{siteName}</div>
          <div style={{ marginTop: 28, fontSize: 34, opacity: 0.82 }}>
            Färila, Hälsingland, Sweden
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18, fontSize: 26 }}>
          <span style={{ padding: '16px 24px', borderRadius: 999, background: 'rgba(255,255,255,0.16)' }}>
            4-5 bedrooms
          </span>
          <span style={{ padding: '16px 24px', borderRadius: 999, background: 'rgba(255,255,255,0.16)' }}>
            Families
          </span>
          <span style={{ padding: '16px 24px', borderRadius: 999, background: 'rgba(255,255,255,0.16)' }}>
            Nature & heritage
          </span>
        </div>
      </div>
    ),
    size,
  );
}
