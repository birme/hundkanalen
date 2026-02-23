export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getGuestSession } from '@/lib/guest-auth';
import { getDb } from '@/lib/db';
import { formatDate } from '@/lib/utils';

type ChecklistItem = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  sort_order: number;
};

type Stay = {
  check_out: string;
};

export default async function CheckOutPage() {
  const session = await getGuestSession();
  if (!session) {
    redirect('/stay');
  }

  const sql = getDb();

  const [checklistItems, [stay]] = await Promise.all([
    sql<ChecklistItem[]>`
      SELECT id, type, title, description, sort_order
      FROM checklist_items
      WHERE type = 'checkout'
      ORDER BY sort_order ASC
    `,
    sql<Stay[]>`
      SELECT check_out
      FROM stays
      WHERE id = ${session.stayId}
      LIMIT 1
    `,
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold text-forest-800">Check-out Instructions</h1>
        <p className="text-gray-500 mt-1">Please follow these steps before departing</p>
      </div>

      {/* Check-out time reminder */}
      <div className="bg-wood-50 border border-wood-200 rounded-xl px-6 py-5 flex items-start gap-4">
        <div className="flex-shrink-0 text-wood-600 mt-0.5">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-wood-800">Check-out by 11:00</p>
          {stay && (
            <p className="text-sm text-wood-700 mt-0.5">
              Please leave the property by 11:00 on {formatDate(stay.check_out)}.
              If you need a late check-out, please contact us in advance.
            </p>
          )}
        </div>
      </div>

      {/* Checklist */}
      {checklistItems.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-forest-800 mb-4">Before You Leave</h2>
          <div className="space-y-3">
            {checklistItems.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5 flex gap-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-wood-100 text-wood-700 font-bold text-sm flex items-center justify-center">
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
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 px-6 py-10 text-center">
          <p className="text-gray-400 text-sm">No check-out instructions have been added yet.</p>
        </div>
      )}

      {/* Thank you note */}
      <div className="bg-forest-700 rounded-2xl px-6 py-6 text-center">
        <p className="text-white font-semibold text-lg mb-1">Thank you for staying with us!</p>
        <p className="text-forest-200 text-sm">
          We hope you enjoyed your time in Hälsingland. We would love to have you back.
        </p>
      </div>
    </div>
  );
}
