export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Image from 'next/image';
import { getGuestSession } from '@/lib/guest-auth';
import { getDb } from '@/lib/db';

type Photo = {
  id: string;
  url: string;
  caption: string | null;
  sort_order: number;
};

export default async function PhotosPage() {
  const session = await getGuestSession();
  if (!session) {
    redirect('/stay');
  }

  let photos: Photo[] = [];
  try {
    const sql = getDb();
    photos = await sql<Photo[]>`
      SELECT id, url, caption, sort_order
      FROM photos
      ORDER BY sort_order ASC
    `;
  } catch {
    // photos table may not exist yet — treat as empty
    photos = [];
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold text-forest-800">Photos</h1>
        <p className="text-gray-500 mt-1">Hundkanalen 3 — your home for the stay</p>
      </div>

      {photos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-16 text-center">
          <div className="text-gray-200 mb-4">
            <svg className="w-14 h-14 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium">No photos yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Professional photos will be added soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group">
              <div className="relative aspect-[4/3] bg-cream-100 rounded-xl overflow-hidden border border-cream-200 group-hover:border-forest-300 transition-colors">
                <Image
                  src={photo.url}
                  alt={photo.caption || 'Hundkanalen 3'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              {photo.caption && (
                <p className="text-sm text-gray-500 mt-2 px-1">{photo.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
