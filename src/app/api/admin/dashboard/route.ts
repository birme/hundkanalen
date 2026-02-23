export const dynamic = 'force-dynamic';

import { requireAdmin } from '@/lib/admin-auth';
import { getDb } from '@/lib/db';

async function autoUpdateStatuses() {
  const sql = getDb();
  const today = new Date().toISOString().split('T')[0];

  // upcoming -> active: check_in <= today <= check_out
  await sql`
    UPDATE stays
    SET status = 'active', updated_at = NOW()
    WHERE status = 'upcoming'
      AND check_in <= ${today}::date
      AND check_out >= ${today}::date
  `;

  // upcoming or active -> completed: check_out < today
  await sql`
    UPDATE stays
    SET status = 'completed', updated_at = NOW()
    WHERE status IN ('upcoming', 'active')
      AND check_out < ${today}::date
  `;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getDb();

  await autoUpdateStatuses();

  const [upcomingResult] = await sql`
    SELECT COUNT(*)::int AS count FROM stays WHERE status = 'upcoming'
  `;

  const [activeResult] = await sql`
    SELECT COUNT(*)::int AS count FROM stays WHERE status = 'active'
  `;

  const [revenueResult] = await sql`
    SELECT COALESCE(SUM(total_price), 0)::int AS total
    FROM stays
    WHERE status IN ('completed', 'active')
  `;

  const recentStays = await sql`
    SELECT * FROM stays
    WHERE status = 'upcoming'
    ORDER BY check_in ASC
    LIMIT 5
  `;

  return Response.json({
    upcomingStays: upcomingResult.count,
    activeStays: activeResult.count,
    totalRevenue: revenueResult.total,
    recentStays,
  });
}
