export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getGuestSession } from '@/lib/guest-auth';
import { getDb } from '@/lib/db';
import StepNavigation from '@/components/portal/StepNavigation';

type ChecklistItem = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
};

export default async function CheckInPage() {
  const session = await getGuestSession();
  if (!session) redirect('/stay');

  const sql = getDb();
  const items = await sql<ChecklistItem[]>`
    SELECT id, title, description, sort_order
    FROM checklist_items
    WHERE type = 'checkin'
    ORDER BY sort_order ASC
  `;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-forest-800">Check-in</h1>
        <p className="text-gray-500 text-sm mt-1">Follow these steps when you arrive</p>
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4 flex gap-3"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-forest-100 text-forest-700 font-bold text-sm flex items-center justify-center">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-forest-800 text-sm">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-8 text-center">
          <p className="text-gray-400 text-sm">No check-in instructions yet.</p>
        </div>
      )}

      <StepNavigation
        prev={{ href: '/stay/portal/access', label: 'How to Get In' }}
        next={{ href: '/stay/portal/during', label: 'During Your Stay' }}
      />
    </div>
  );
}
