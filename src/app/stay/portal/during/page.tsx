export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getGuestSession } from '@/lib/guest-auth';
import { getDb } from '@/lib/db';
import StepNavigation from '@/components/portal/StepNavigation';

type FeaturedPlace = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  url: string | null;
  distance: string | null;
  owner_tips: string | null;
};

type PropertyInfoItem = {
  id: string;
  category: string;
  title: string;
  content: string;
  sort_order: number;
  photo_id: string | null;
};

type Photo = {
  id: string;
  storage_url: string;
  caption: string | null;
};

const INFO_CATEGORIES: Record<string, { label: string; defaultOpen: boolean }> = {
  rules: { label: 'House Rules', defaultOpen: true },
  emergency: { label: 'Emergency', defaultOpen: true },
  practical: { label: 'Practical Information', defaultOpen: false },
  general: { label: 'General', defaultOpen: false },
};

const CATEGORY_ORDER = ['rules', 'emergency', 'practical', 'general'];

export default async function DuringYourStayPage() {
  const session = await getGuestSession();
  if (!session) redirect('/stay');

  const sql = getDb();

  let photos: Photo[] = [];
  try {
    photos = await sql<Photo[]>`
      SELECT id, storage_url, caption FROM photos
      WHERE category != 'keybox'
      ORDER BY sort_order ASC
      LIMIT 9
    `;
  } catch {
    photos = [];
  }

  const [featured, infoItems] = await Promise.all([
    sql<FeaturedPlace[]>`
      SELECT fp.id, fp.name, fp.description, fp.category, fp.icon, fp.url, fp.distance, fp.owner_tips
      FROM stay_favorites sf
      JOIN favorite_places fp ON fp.id = sf.favorite_id
      WHERE sf.stay_id = ${session.stayId}
      ORDER BY fp.sort_order ASC, fp.created_at ASC
    `,
    sql<PropertyInfoItem[]>`
      SELECT id, category, title, content, sort_order, photo_id
      FROM property_info
      WHERE category IN ('rules', 'practical', 'emergency', 'general')
      ORDER BY category ASC, sort_order ASC
    `,
  ]);

  // Group info items by category
  const grouped = infoItems.reduce<Record<string, PropertyInfoItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const orderedCategories = CATEGORY_ORDER.filter((c) => grouped[c] && grouped[c].length > 0);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-forest-800">During Your Stay</h1>
        <p className="text-gray-500 text-sm mt-1">Activities, info, and everything you need</p>
      </div>

      {/* Featured activities */}
      {featured.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-forest-800 mb-3 flex items-center gap-2">
            <span aria-hidden="true">⭐</span> Our Picks for You
          </h2>
          <div className="space-y-3">
            {featured.map((place) => (
              <div
                key={place.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl flex-shrink-0" aria-hidden="true">
                      {place.icon || '📍'}
                    </span>
                    <h3 className="font-semibold text-forest-800 text-sm leading-tight">
                      {place.name}
                    </h3>
                  </div>
                  {place.distance && (
                    <span className="text-xs bg-cream-100 text-cream-900 border border-cream-200 rounded-full px-2.5 py-0.5 whitespace-nowrap flex-shrink-0">
                      {place.distance}
                    </span>
                  )}
                </div>
                {place.description && (
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{place.description}</p>
                )}
                {place.owner_tips && (
                  <div className="bg-cream-50 border-l-4 border-wood-400 rounded-r-lg px-3 py-2 mt-2">
                    <p className="text-sm text-wood-700 italic">
                      Owner&apos;s tip: {place.owner_tips}
                    </p>
                  </div>
                )}
                {place.url && (
                  <a
                    href={place.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-forest-600 hover:text-forest-800 hover:underline mt-2"
                  >
                    Visit website &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Property info sections */}
      {orderedCategories.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-forest-800 mb-3 flex items-center gap-2">
            <span aria-hidden="true">ℹ️</span> Property Information
          </h2>
          <div className="space-y-3">
            {orderedCategories.map((cat) => {
              const config = INFO_CATEGORIES[cat] || { label: cat, defaultOpen: false };
              const items = grouped[cat];
              return (
                <details key={cat} open={config.defaultOpen || undefined}>
                  <summary className="cursor-pointer bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 font-semibold text-forest-800 text-sm hover:bg-gray-50 transition-colors list-none flex items-center justify-between">
                    <span>{config.label}</span>
                    <span className="text-gray-400 text-xs">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </span>
                  </summary>
                  <div className="mt-2 space-y-2 pl-1">
                    {items.map((item) => (
                      <div key={item.id} className="bg-white rounded-lg border border-gray-50 px-4 py-3">
                        <h4 className="font-medium text-forest-700 text-sm">{item.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-wrap">
                          {item.content}
                        </p>
                        {item.photo_id && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`/api/photos/${item.photo_id}`}
                            alt=""
                            className="mt-2 w-full max-h-48 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-forest-800 mb-3 flex items-center gap-2">
            <span aria-hidden="true">📸</span> The Property
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-[4/3] bg-cream-100 rounded-lg overflow-hidden"
              >
                <Image
                  src={photo.storage_url}
                  alt={photo.caption || 'Property photo'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Explore area link */}
      <div className="bg-wood-50 border border-wood-200 rounded-xl px-5 py-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-wood-800 text-sm">Explore Hälsingland</p>
          <p className="text-xs text-wood-600 mt-0.5">Activities, nearby towns, and more</p>
        </div>
        <Link
          href="/area-guide"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 text-xs font-medium bg-wood-700 text-white rounded-lg px-4 py-2 hover:bg-wood-800 transition-colors"
        >
          Area Guide
        </Link>
      </div>

      <StepNavigation
        prev={{ href: '/stay/portal/checkin', label: 'Check-in' }}
        next={{ href: '/stay/portal/checkout', label: 'Check-out' }}
      />
    </div>
  );
}
