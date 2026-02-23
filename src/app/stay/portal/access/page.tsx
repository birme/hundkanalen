export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getGuestSession } from '@/lib/guest-auth';
import { getDb } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import StepNavigation from '@/components/portal/StepNavigation';

type Stay = {
  keybox_code: string | null;
  notes: string | null;
  check_in: string;
  check_out: string;
};

type Photo = {
  id: string;
  storage_url: string;
  caption: string | null;
};

function isKeyboxVisible(checkIn: string, checkOut: string): boolean {
  const now = new Date();
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const windowStart = new Date(checkInDate);
  windowStart.setHours(windowStart.getHours() - 24);
  const windowEnd = new Date(checkOutDate);
  windowEnd.setHours(23, 59, 59, 999);
  return now >= windowStart && now <= windowEnd;
}

export default async function AccessPage() {
  const session = await getGuestSession();
  if (!session) redirect('/stay');

  const sql = getDb();

  let keyboxPhotos: Photo[] = [];
  try {
    keyboxPhotos = await sql<Photo[]>`
      SELECT id, storage_url, caption FROM photos
      WHERE category = 'keybox'
      ORDER BY sort_order ASC
      LIMIT 1
    `;
  } catch {
    // photos table may not have keybox category yet
  }

  const [stay] = await sql<Stay[]>`
    SELECT keybox_code, notes, check_in, check_out
    FROM stays WHERE id = ${session.stayId} LIMIT 1
  `;

  if (!stay) redirect('/stay');

  const showKeybox = isKeyboxVisible(stay.check_in, stay.check_out);
  const keyboxPhoto = keyboxPhotos.length > 0 ? keyboxPhotos[0] : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-forest-800">How to Get In</h1>
        <p className="text-gray-500 text-sm mt-1">Access the property</p>
      </div>

      {/* Keybox code */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${
        showKeybox ? 'bg-forest-700 border-forest-600' : 'bg-white border-gray-100'
      }`}>
        <div className={`px-5 py-3 border-b ${
          showKeybox ? 'border-forest-600' : 'border-gray-100'
        }`}>
          <h2 className={`font-semibold text-sm ${showKeybox ? 'text-white' : 'text-forest-800'}`}>
            🔑 Key Box Code
          </h2>
        </div>
        <div className="px-5 py-6 text-center">
          {showKeybox && stay.keybox_code ? (
            <>
              <p className="text-forest-200 text-sm mb-4">
                Enter this code on the key box to access the property
              </p>
              <div className="inline-block bg-forest-900/50 rounded-xl px-8 py-4">
                <span className="font-mono text-4xl font-bold tracking-[0.25em] text-white">
                  {stay.keybox_code}
                </span>
              </div>
              <p className="text-forest-300 text-xs mt-4">
                Keep this code confidential
              </p>
            </>
          ) : (
            <>
              <div className="text-gray-300 mb-3">
                <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium text-sm">Available 24 hours before check-in</p>
              <p className="text-gray-400 text-xs mt-1">
                The key box code will appear here on {formatDate(stay.check_in)} from 15:00
              </p>
            </>
          )}
        </div>
      </div>

      {/* Keybox location photo */}
      {keyboxPhoto && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-forest-800 text-sm">Where to Find the Key Box</h2>
          </div>
          <div className="relative aspect-[4/3]">
            <Image
              src={keyboxPhoto.storage_url}
              alt={keyboxPhoto.caption || 'Key box location'}
              fill
              className="object-cover"
              sizes="(max-width: 672px) 100vw, 672px"
            />
          </div>
          {keyboxPhoto.caption && (
            <p className="px-5 py-3 text-sm text-gray-500">{keyboxPhoto.caption}</p>
          )}
        </div>
      )}

      {/* Notes from host */}
      {stay.notes && (
        <div className="bg-cream-50 border border-cream-200 rounded-xl px-5 py-4">
          <h2 className="font-semibold text-wood-800 text-sm mb-2">Note from your host</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{stay.notes}</p>
        </div>
      )}

      <StepNavigation
        prev={{ href: '/stay/portal/before', label: 'Before Your Stay' }}
        next={{ href: '/stay/portal/checkin', label: 'Check-in' }}
      />
    </div>
  );
}
