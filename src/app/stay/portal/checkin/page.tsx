export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getGuestSession } from '@/lib/guest-auth';
import { getDb } from '@/lib/db';

type ChecklistItem = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  sort_order: number;
};

type PropertyInfoItem = {
  id: string;
  category: string;
  title: string;
  content: string;
  sort_order: number;
};

export default async function CheckInPage() {
  const session = await getGuestSession();
  if (!session) {
    redirect('/stay');
  }

  const sql = getDb();

  const [checklistItems, infoItems] = await Promise.all([
    sql<ChecklistItem[]>`
      SELECT id, type, title, description, sort_order
      FROM checklist_items
      WHERE type = 'checkin'
      ORDER BY sort_order ASC
    `,
    sql<PropertyInfoItem[]>`
      SELECT id, category, title, content, sort_order
      FROM property_info
      WHERE category IN ('practical', 'location')
      ORDER BY category ASC, sort_order ASC
    `,
  ]);

  const practicalItems = infoItems.filter((i) => i.category === 'practical');
  const locationItems = infoItems.filter((i) => i.category === 'location');

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold text-forest-800">Check-in Instructions</h1>
        <p className="text-gray-500 mt-1">Everything you need to know for a smooth arrival</p>
      </div>

      {/* Checklist */}
      {checklistItems.length > 0 && (
        <section>
          <div className="space-y-4">
            {checklistItems.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5 flex gap-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-forest-100 text-forest-700 font-bold text-sm flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-forest-800">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {checklistItems.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 px-6 py-10 text-center">
          <p className="text-gray-400 text-sm">No check-in instructions have been added yet.</p>
        </div>
      )}

      {/* Location & Directions */}
      {locationItems.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-forest-800 mb-4">Location &amp; Directions</h2>
          <div className="space-y-4">
            {locationItems.map((item) => (
              <div key={item.id} className="bg-cream-50 border border-cream-200 rounded-xl px-6 py-5">
                <h3 className="font-semibold text-wood-800 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{item.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Practical Information */}
      {practicalItems.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-forest-800 mb-4">Practical Information</h2>
          <div className="space-y-4">
            {practicalItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5">
                <h3 className="font-semibold text-forest-800 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{item.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
