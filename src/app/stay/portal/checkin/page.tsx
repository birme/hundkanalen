export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getGuestSession } from '@/lib/guest-auth';
import { getDb } from '@/lib/db';
import StepNavigation from '@/components/portal/StepNavigation';
import ChecklistWithModals from '@/components/portal/ChecklistWithModals';
import type { ChecklistItemWithLinks } from '@/components/portal/ChecklistWithModals';

export default async function CheckInPage() {
  const session = await getGuestSession();
  if (!session) redirect('/stay');

  const sql = getDb();
  const rows = await sql<(ChecklistItemWithLinks & { linked_info: string })[]>`
    SELECT ci.id, ci.title, ci.description, ci.sort_order, ci.photo_id,
      COALESCE(json_agg(json_build_object('id', pi.id, 'title', pi.title, 'content', pi.content, 'photoId', pi.photo_id))
        FILTER (WHERE pi.id IS NOT NULL), '[]'::json) AS linked_info
    FROM checklist_items ci
    LEFT JOIN checklist_property_info cpi ON cpi.checklist_item_id = ci.id
    LEFT JOIN property_info pi ON pi.id = cpi.property_info_id
    WHERE ci.type = 'checkin'
    GROUP BY ci.id, ci.title, ci.description, ci.sort_order, ci.photo_id
    ORDER BY ci.sort_order ASC
  `;

  const items: ChecklistItemWithLinks[] = rows.map((row) => ({
    ...row,
    linked_info: typeof row.linked_info === 'string' ? JSON.parse(row.linked_info) : row.linked_info,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-forest-800">Check-in</h1>
        <p className="text-gray-500 text-sm mt-1">Follow these steps when you arrive</p>
      </div>

      {items.length > 0 ? (
        <ChecklistWithModals items={items} accentColor="forest" />
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
