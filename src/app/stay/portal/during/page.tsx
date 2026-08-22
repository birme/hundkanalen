export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getGuestSession } from '@/lib/guest-auth';
import { getDb } from '@/lib/db';
import StepNavigation from '@/components/portal/StepNavigation';
import { SiteIcon, iconForCategory } from '@/components/icons/SiteIcon';
import { isLocale } from '@/lib/i18n';
import { localizedNullableText, localizedText } from '@/lib/localized-content';

type FeaturedPlace = {
  id: string;
  name: string;
  name_sv: string | null;
  description: string | null;
  description_sv: string | null;
  category: string;
  icon: string | null;
  url: string | null;
  distance: string | null;
  owner_tips: string | null;
  owner_tips_sv: string | null;
};

type PropertyInfoItem = {
  id: string;
  category: string;
  title: string;
  title_sv: string | null;
  content: string;
  content_sv: string | null;
  sort_order: number;
  photo_id: string | null;
};

type Photo = {
  id: string;
  caption: string | null;
};

const INFO_CATEGORIES: Record<string, { label: { en: string; sv: string }; defaultOpen: boolean }> = {
  rules: { label: { en: 'House Rules', sv: 'Husregler' }, defaultOpen: true },
  emergency: { label: { en: 'Emergency', sv: 'Nödläge' }, defaultOpen: true },
  practical: { label: { en: 'Practical Information', sv: 'Praktisk information' }, defaultOpen: false },
  general: { label: { en: 'General', sv: 'Allmänt' }, defaultOpen: false },
};

const CATEGORY_ORDER = ['rules', 'emergency', 'practical', 'general'];

export default async function DuringYourStayPage() {
  const session = await getGuestSession();
  if (!session) redirect('/stay');

  const sql = getDb();
  const cookieStore = cookies();
  const cookieLocale = cookieStore.get('hk-locale')?.value ?? null;
  const locale = isLocale(cookieLocale) ? cookieLocale : 'en';

  let photos: Photo[] = [];
  try {
    photos = await sql<Photo[]>`
      SELECT id, caption FROM photos
      WHERE category != 'keybox'
      ORDER BY sort_order ASC
      LIMIT 9
    `;
  } catch {
    photos = [];
  }

  const [featured, infoItems] = await Promise.all([
    sql<FeaturedPlace[]>`
      SELECT fp.id, fp.name, fp.name_sv, fp.description, fp.description_sv, fp.category, fp.icon, fp.url, fp.distance, fp.owner_tips, fp.owner_tips_sv
      FROM stay_favorites sf
      JOIN favorite_places fp ON fp.id = sf.favorite_id
      WHERE sf.stay_id = ${session.stayId}
      ORDER BY fp.sort_order ASC, fp.created_at ASC
    `,
    sql<PropertyInfoItem[]>`
      SELECT id, category, title, title_sv, content, content_sv, sort_order, photo_id
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
        <h1 className="text-2xl font-bold text-forest-800">{locale === 'sv' ? 'Under vistelsen' : 'During Your Stay'}</h1>
        <p className="text-gray-500 text-sm mt-1">{locale === 'sv' ? 'Aktiviteter, information och allt du behöver' : 'Activities, info, and everything you need'}</p>
      </div>

      {/* Featured activities */}
      {featured.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-forest-800 mb-3 flex items-center gap-2">
            <SiteIcon name="star" className="size-5" /> {locale === 'sv' ? 'Våra tips till er' : 'Our Picks for You'}
          </h2>
          <div className="space-y-3">
            {featured.map((place) => (
              <div
                key={place.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="grid size-9 flex-shrink-0 place-items-center rounded-xl bg-[#17123b] text-white">
                      <SiteIcon name={iconForCategory(place.category)} className="size-4" />
                    </span>
                    <h3 className="font-semibold text-forest-800 text-sm leading-tight">
                      {localizedText(locale, place.name, place.name_sv)}
                    </h3>
                  </div>
                  {place.distance && (
                    <span className="text-xs bg-cream-100 text-cream-900 border border-cream-200 rounded-full px-2.5 py-0.5 whitespace-nowrap flex-shrink-0">
                      {place.distance}
                    </span>
                  )}
                </div>
                {localizedNullableText(locale, place.description, place.description_sv) && (
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{localizedNullableText(locale, place.description, place.description_sv)}</p>
                )}
                {localizedNullableText(locale, place.owner_tips, place.owner_tips_sv) && (
                  <div className="bg-cream-50 border-l-4 border-wood-400 rounded-r-lg px-3 py-2 mt-2">
                    <p className="text-sm text-wood-700 italic">
                      {locale === 'sv' ? 'Ägarnas tips:' : "Owner's tip:"} {localizedNullableText(locale, place.owner_tips, place.owner_tips_sv)}
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
                    {locale === 'sv' ? 'Besök webbplats' : 'Visit website'} &rarr;
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
            <SiteIcon name="info" className="size-5" /> {locale === 'sv' ? 'Husinformation' : 'Property Information'}
          </h2>
          <div className="space-y-3">
            {orderedCategories.map((cat) => {
              const config = INFO_CATEGORIES[cat] || { label: { en: cat, sv: cat }, defaultOpen: false };
              const items = grouped[cat];
              return (
                <details key={cat} open={config.defaultOpen || undefined}>
                  <summary className="cursor-pointer bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 font-semibold text-forest-800 text-sm hover:bg-gray-50 transition-colors list-none flex items-center justify-between">
                    <span>{config.label[locale]}</span>
                    <span className="text-gray-400 text-xs">
                      {items.length} {locale === 'sv' ? (items.length === 1 ? 'sak' : 'saker') : (items.length === 1 ? 'item' : 'items')}
                    </span>
                  </summary>
                  <div className="mt-2 space-y-2 pl-1">
                    {items.map((item) => (
                      <div key={item.id} className="bg-white rounded-lg border border-gray-50 px-4 py-3">
                        <h4 className="font-medium text-forest-700 text-sm">{localizedText(locale, item.title, item.title_sv)}</h4>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-wrap">
                          {localizedText(locale, item.content, item.content_sv)}
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
            <SiteIcon name="camera" className="size-5" /> {locale === 'sv' ? 'Huset' : 'The Property'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-[4/3] bg-cream-100 rounded-lg overflow-hidden"
              >
                <Image
                  src={`/api/photos/${photo.id}`}
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
          <p className="font-semibold text-wood-800 text-sm">{locale === 'sv' ? 'Utforska Hälsingland' : 'Explore Hälsingland'}</p>
          <p className="text-xs text-wood-600 mt-0.5">{locale === 'sv' ? 'Aktiviteter, närliggande orter och mer' : 'Activities, nearby towns, and more'}</p>
        </div>
        <Link
          href="/area-guide"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 text-xs font-medium bg-wood-700 text-white rounded-lg px-4 py-2 hover:bg-wood-800 transition-colors"
        >
          {locale === 'sv' ? 'Området' : 'Area Guide'}
        </Link>
      </div>

      <StepNavigation
        prev={{ href: '/stay/portal/checkin', label: 'Check-in' }}
        next={{ href: '/stay/portal/checkout', label: 'Check-out' }}
      />
    </div>
  );
}
