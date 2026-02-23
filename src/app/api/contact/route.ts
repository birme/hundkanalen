import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const sql = getDb();
  const body = await request.json();
  const { name, email, checkin, checkout, guests, message } = body;

  if (!name || !email) {
    return Response.json({ error: 'Name and email are required' }, { status: 400 });
  }

  const [inquiry] = await sql`
    INSERT INTO inquiries (name, email, check_in, check_out, guests, message)
    VALUES (${name}, ${email}, ${checkin || null}, ${checkout || null}, ${guests || null}, ${message || null})
    RETURNING *
  `;

  return Response.json({ success: true, id: inquiry.id });
}
