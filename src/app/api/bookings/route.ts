import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const sql = getDb();
  const session = await auth();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');

  let bookings;
  if (session.user.role === 'admin') {
    bookings = status
      ? await sql`SELECT * FROM bookings WHERE status = ${status} ORDER BY check_in ASC`
      : await sql`SELECT * FROM bookings ORDER BY check_in ASC`;
  } else {
    bookings = await sql`SELECT * FROM bookings WHERE user_id = ${session.user.id} ORDER BY check_in ASC`;
  }

  return Response.json(bookings);
}

export async function POST(request: NextRequest) {
  const sql = getDb();
  const session = await auth();
  if (!session || session.user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { user_id, check_in, check_out, guests, total_price, notes } = body;

  const [booking] = await sql`
    INSERT INTO bookings (user_id, check_in, check_out, guests, total_price, notes, status)
    VALUES (${user_id}, ${check_in}, ${check_out}, ${guests}, ${total_price}, ${notes || null}, 'confirmed')
    RETURNING *
  `;

  return Response.json(booking, { status: 201 });
}
