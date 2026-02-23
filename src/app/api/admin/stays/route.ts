export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { generateUniqueAccessCode } from '@/lib/access-code';

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

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getDb();
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');

  await autoUpdateStatuses();

  let stays;
  if (status) {
    stays = await sql`
      SELECT * FROM stays
      WHERE status = ${status}
      ORDER BY check_in DESC
    `;
  } else {
    stays = await sql`
      SELECT * FROM stays
      ORDER BY check_in DESC
    `;
  }

  return Response.json(stays);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getDb();
  const body = await request.json();
  const {
    guest_name,
    guest_email,
    check_in,
    check_out,
    guests,
    total_price,
    keybox_code,
    notes,
  } = body;

  if (!guest_name || !check_in || !check_out || !guests || total_price == null) {
    return Response.json(
      { error: 'Missing required fields: guest_name, check_in, check_out, guests, total_price' },
      { status: 400 }
    );
  }

  const access_code = await generateUniqueAccessCode();

  const [stay] = await sql`
    INSERT INTO stays (
      guest_name,
      guest_email,
      check_in,
      check_out,
      guests,
      total_price,
      access_code,
      keybox_code,
      notes,
      status,
      created_by
    ) VALUES (
      ${guest_name},
      ${guest_email ?? null},
      ${check_in},
      ${check_out},
      ${guests},
      ${total_price},
      ${access_code},
      ${keybox_code ?? null},
      ${notes ?? null},
      'upcoming',
      ${session.user.id}
    )
    RETURNING *
  `;

  return Response.json(stay, { status: 201 });
}
