export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getGuestSession } from '@/lib/guest-auth';
import { getDb } from '@/lib/db';
import StepNavigation from '@/components/portal/StepNavigation';

type PropertyInfoItem = {
  id: string;
  title: string;
  content: string;
  sort_order: number;
};

export default async function BeforeYourStayPage() {
  const session = await getGuestSession();
  if (!session) redirect('/stay');

  const sql = getDb();
  const [[stay], packingDefaults, locationItems] = await Promise.all([
    sql<{ packing_notes: string | null }[]>`
      SELECT packing_notes FROM stays WHERE id = ${session.stayId} LIMIT 1
    `,
    sql<PropertyInfoItem[]>`
      SELECT id, title, content, sort_order FROM property_info
      WHERE category = 'packing' ORDER BY sort_order ASC
    `,
    sql<PropertyInfoItem[]>`
      SELECT id, title, content, sort_order FROM property_info
      WHERE category = 'location' ORDER BY sort_order ASC
    `,
  ]);

  if (!stay) redirect('/stay');

  const hasPackingNotes = stay.packing_notes && stay.packing_notes.trim().length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-forest-800">Before Your Stay</h1>
        <p className="text-gray-500 text-sm mt-1">Prepare for your visit</p>
      </div>

      {/* What to Pack */}
      <section>
        <h2 className="text-lg font-semibold text-forest-800 mb-3 flex items-center gap-2">
          <span aria-hidden="true">🧳</span> What to Pack
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
                <h3 className="font-semibold text-forest-800 text-sm">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 px-5 py-6 text-center">
            <p className="text-gray-400 text-sm">No packing information available yet.</p>
          </div>
        )}
      </section>

      {/* How to Get Here */}
      {locationItems.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-forest-800 mb-3 flex items-center gap-2">
            <span aria-hidden="true">📍</span> How to Get Here
          </h2>
          <div className="space-y-3">
            {locationItems.map((item) => (
              <div
                key={item.id}
                className="bg-cream-50 border border-cream-200 rounded-xl px-5 py-4"
              >
                <h3 className="font-semibold text-wood-800 text-sm">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </p>
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
