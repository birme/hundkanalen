export const dynamic = 'force-dynamic';

import { requireAdmin } from '@/lib/admin-auth';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const daysParam = Number(url.searchParams.get('days') || '30');
  const days = Number.isFinite(daysParam) ? Math.min(365, Math.max(1, Math.round(daysParam))) : 30;
  const sql = getDb();

  const [summary] = await sql`
    SELECT
      COUNT(*)::int AS pageviews,
      COUNT(DISTINCT visitor_hash)::int AS visitors,
      COUNT(*) FILTER (WHERE locale = 'sv')::int AS sv_pageviews,
      COUNT(*) FILTER (WHERE locale = 'en')::int AS en_pageviews
    FROM site_pageviews
    WHERE created_at >= NOW() - (${days} || ' days')::interval
  `;

  const daily = await sql`
    SELECT
      DATE(created_at) AS date,
      COUNT(*)::int AS pageviews,
      COUNT(DISTINCT visitor_hash)::int AS visitors
    FROM site_pageviews
    WHERE created_at >= NOW() - (${days} || ' days')::interval
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  const topPages = await sql`
    SELECT
      split_part(path, '?', 1) AS path,
      COUNT(*)::int AS pageviews,
      COUNT(DISTINCT visitor_hash)::int AS visitors
    FROM site_pageviews
    WHERE created_at >= NOW() - (${days} || ' days')::interval
    GROUP BY split_part(path, '?', 1)
    ORDER BY pageviews DESC
    LIMIT 12
  `;

  const referrers = await sql`
    SELECT
      COALESCE(NULLIF(referrer, ''), 'Direct') AS referrer,
      COUNT(*)::int AS pageviews,
      COUNT(DISTINCT visitor_hash)::int AS visitors
    FROM site_pageviews
    WHERE created_at >= NOW() - (${days} || ' days')::interval
    GROUP BY COALESCE(NULLIF(referrer, ''), 'Direct')
    ORDER BY pageviews DESC
    LIMIT 12
  `;

  const devices = await sql`
    SELECT
      CASE
        WHEN viewport_width IS NULL THEN 'unknown'
        WHEN viewport_width < 768 THEN 'mobile'
        WHEN viewport_width < 1024 THEN 'tablet'
        ELSE 'desktop'
      END AS device,
      COUNT(*)::int AS pageviews
    FROM site_pageviews
    WHERE created_at >= NOW() - (${days} || ' days')::interval
    GROUP BY device
    ORDER BY pageviews DESC
  `;

  return Response.json({ days, summary, daily, topPages, referrers, devices });
}
