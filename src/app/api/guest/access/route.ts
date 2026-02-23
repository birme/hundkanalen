export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { createGuestSession } from '@/lib/guest-auth';

export async function POST(request: NextRequest) {
  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const rawCode = body.code;
  if (!rawCode || typeof rawCode !== 'string') {
    return Response.json({ error: 'Access code is required' }, { status: 400 });
  }

  const code = rawCode.trim().toUpperCase();

  const sql = getDb();
  const [stay] = await sql`
    SELECT
      id,
      guest_name,
      check_in,
      check_out,
      status
    FROM stays
    WHERE UPPER(TRIM(access_code)) = ${code}
    LIMIT 1
  `;

  if (!stay) {
    return Response.json({ error: 'Invalid access code' }, { status: 401 });
  }

  if (stay.status === 'cancelled') {
    return Response.json({ error: 'This stay has been cancelled' }, { status: 401 });
  }

  await createGuestSession(stay.id, stay.guest_name, new Date(stay.check_out));

  return Response.json({
    success: true,
    stay: {
      guest_name: stay.guest_name,
      check_in: stay.check_in,
      check_out: stay.check_out,
    },
  });
}
