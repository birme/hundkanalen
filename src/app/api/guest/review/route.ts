export const dynamic = 'force-dynamic';

import { getDb } from '@/lib/db';
import { getGuestSession } from '@/lib/guest-auth';

export async function POST(request: Request) {
  const session = await getGuestSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { rating, message } = body;

  if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return Response.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
  }

  const sql = getDb();

  // Check for existing review
  const [existing] = await sql`
    SELECT id FROM guest_reviews WHERE stay_id = ${session.stayId} LIMIT 1
  `;

  if (existing) {
    return Response.json({ error: 'Review already submitted' }, { status: 409 });
  }

  const [review] = await sql`
    INSERT INTO guest_reviews (stay_id, rating, message)
    VALUES (${session.stayId}, ${rating}, ${message?.trim() || null})
    RETURNING id, stay_id, rating, message, created_at
  `;

  return Response.json(review, { status: 201 });
}
