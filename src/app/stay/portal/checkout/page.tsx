export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getGuestSession } from '@/lib/guest-auth';
import { getDb } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import StepNavigation from '@/components/portal/StepNavigation';

type ChecklistItem = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
};

export default async function CheckOutPage() {
  const session = await getGuestSession();
  if (!session) redirect('/stay');

  const sql = getDb();
  const [items, [stay]] = await Promise.all([
    sql<ChecklistItem[]>`
      SELECT id, title, description, sort_order
      FROM checklist_items
      WHERE type = 'checkout'
      ORDER BY sort_order ASC
    `,
    sql<{ check_out: string }[]>`
      SELECT check_out FROM stays WHERE id = ${session.stayId} LIMIT 1
    `,
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-forest-800">Check-out</h1>
        <p className="text-gray-500 text-sm mt-1">Please follow these steps before departing</p>
      </div>

      {/* Check-out time reminder */}
      <div className="bg-wood-50 border border-wood-200 rounded-xl px-4 py-4 flex items-start gap-3">
        <div className="flex-shrink-0 text-wood-600 mt-0.5">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-wood-800 text-sm">Check-out by 11:00</p>
          {stay && (
            <p className="text-sm text-wood-700 mt-0.5">
              Please leave the property by 11:00 on {formatDate(stay.check_out)}.
            </p>
          )}
        </div>
      </div>

      {/* Checklist */}
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4 flex gap-3"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-wood-100 text-wood-700 font-bold text-sm flex items-center justify-center">
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
          <p className="text-gray-400 text-sm">No check-out instructions yet.</p>
        </div>
      )}

      <StepNavigation
        prev={{ href: '/stay/portal/during', label: 'During Your Stay' }}
        next={{ href: '/stay/portal/farewell', label: 'See You Next Time' }}
      />
    </div>
  );
}
