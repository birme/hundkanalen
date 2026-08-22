export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getGuestSession } from '@/lib/guest-auth';
import { getDb } from '@/lib/db';
import StepNavigation from '@/components/portal/StepNavigation';
import { SiteIcon } from '@/components/icons/SiteIcon';
import { isLocale } from '@/lib/i18n';
import { localizedText } from '@/lib/localized-content';

type PropertyInfoItem = {
  id: string;
  title: string;
  title_sv: string | null;
  content: string;
  content_sv: string | null;
  sort_order: number;
  photo_id: string | null;
};

export default async function BeforeYourStayPage() {
  const session = await getGuestSession();
  if (!session) redirect('/stay');

  const sql = getDb();
  const cookieStore = cookies();
  const cookieLocale = cookieStore.get('hk-locale')?.value ?? null;
  const locale = isLocale(cookieLocale) ? cookieLocale : 'en';
  const [[stay], packingDefaults, locationItems] = await Promise.all([
    sql<{ packing_notes: string | null }[]>`
      SELECT packing_notes FROM stays WHERE id = ${session.stayId} LIMIT 1
    `,
    sql<PropertyInfoItem[]>`
      SELECT id, title, title_sv, content, content_sv, sort_order, photo_id FROM property_info
      WHERE category = 'packing' ORDER BY sort_order ASC
    `,
    sql<PropertyInfoItem[]>`
      SELECT id, title, title_sv, content, content_sv, sort_order, photo_id FROM property_info
      WHERE category = 'location' ORDER BY sort_order ASC
    `,
  ]);

  if (!stay) redirect('/stay');

  const hasPackingNotes = stay.packing_notes && stay.packing_notes.trim().length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-forest-800">{locale === 'sv' ? 'Inför vistelsen' : 'Before Your Stay'}</h1>
        <p className="text-gray-500 text-sm mt-1">{locale === 'sv' ? 'Förbered dig inför besöket' : 'Prepare for your visit'}</p>
      </div>

      {/* What to Pack */}
      <section>
        <h2 className="text-lg font-semibold text-forest-800 mb-3 flex items-center gap-2">
          <SiteIcon name="luggage" className="size-5" /> {locale === 'sv' ? 'Att packa' : 'What to Pack'}
        </h2>
        {hasPackingNotes ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {stay.packing_notes}
            </p>
          </div>
        ) : packingDefaults.length > 0 ? (
          <div className="space-y-3">
            {packingDefaults.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
              >
                <h3 className="font-semibold text-forest-800 text-sm">{localizedText(locale, item.title, item.title_sv)}</h3>
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
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 px-5 py-6 text-center">
            <p className="text-gray-400 text-sm">{locale === 'sv' ? 'Det finns ingen packningsinformation ännu.' : 'No packing information available yet.'}</p>
          </div>
        )}
      </section>

      {/* How to Get Here */}
      {locationItems.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-forest-800 mb-3 flex items-center gap-2">
            <SiteIcon name="mapPin" className="size-5" /> {locale === 'sv' ? 'Hitta hit' : 'How to Get Here'}
          </h2>
          <div className="space-y-3">
            {locationItems.map((item) => (
              <div
                key={item.id}
                className="bg-cream-50 border border-cream-200 rounded-xl px-5 py-4"
              >
                <h3 className="font-semibold text-wood-800 text-sm">{localizedText(locale, item.title, item.title_sv)}</h3>
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
        </section>
      )}

      <StepNavigation
        next={{ href: '/stay/portal/access', label: 'How to Get In' }}
      />
    </div>
  );
}
