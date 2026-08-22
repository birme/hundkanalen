export const dynamic = 'force-dynamic';

import { requireAdmin } from '@/lib/admin-auth';
import { getUmamiOverview } from '@/lib/umami';

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const daysParam = Number(url.searchParams.get('days') || '30');
  const days = Number.isFinite(daysParam) ? Math.min(365, Math.max(1, Math.round(daysParam))) : 30;

  try {
    const overview = await getUmamiOverview(days);
    return Response.json(overview);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to load Umami analytics',
      },
      { status: 502 },
    );
  }
}
