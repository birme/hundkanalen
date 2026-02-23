export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getGuestSession } from '@/lib/guest-auth';
import { getDb } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import StepNavigation from '@/components/portal/StepNavigation';
import ChecklistWithModals from '@/components/portal/ChecklistWithModals';
import type { ChecklistItemWithLinks } from '@/components/portal/ChecklistWithModals';

export default async function CheckOutPage() {
  const session = await getGuestSession();
  if (!session) redirect('/stay');

  const sql = getDb();
  const [rows, [stay]] = await Promise.all([
    sql<(ChecklistItemWithLinks & { linked_info: string })[]>`
      SELECT ci.id, ci.title, ci.description, ci.sort_order,
        COALESCE(json_agg(json_build_object('id', pi.id, 'title', pi.title, 'content', pi.content))
          FILTER (WHERE pi.id IS NOT NULL), '[]'::json) AS linked_info
      FROM checklist_items ci
      LEFT JOIN checklist_property_info cpi ON cpi.checklist_item_id = ci.id
      LEFT JOIN property_info pi ON pi.id = cpi.property_info_id
      WHERE ci.type = 'checkout'
      GROUP BY ci.id, ci.title, ci.description, ci.sort_order
      ORDER BY ci.sort_order ASC
    `,
    sql<{ check_out: string }[]>`
      SELECT check_out FROM stays WHERE id = ${session.stayId} LIMIT 1
    `,
  ]);

  const items: ChecklistItemWithLinks[] = rows.map((row) => ({
    ...row,
    linked_info: typeof row.linked_info === 'string' ? JSON.parse(row.linked_info) : row.linked_info,
  }));

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
        <ChecklistWithModals items={items} accentColor="wood" />
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
