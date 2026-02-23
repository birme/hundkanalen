import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const sql = getDb();
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!from || !to) {
    return Response.json({ error: 'Missing from/to parameters' }, { status: 400 });
  }

  const bookings = await sql`
    SELECT check_in, check_out FROM bookings
    WHERE status IN ('confirmed', 'pending')
    AND check_in <= ${to}
    AND check_out >= ${from}
  `;

  const blockedDates = await sql`
    SELECT date_start, date_end, reason FROM blocked_dates
    WHERE date_start <= ${to}
    AND date_end >= ${from}
  `;

  return Response.json({ bookings, blockedDates });
}
