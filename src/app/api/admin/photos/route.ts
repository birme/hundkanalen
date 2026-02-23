export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getDb();
  const photos = await sql`
    SELECT id, filename, caption, category, sort_order, storage_url, is_public, created_at
    FROM photos
    ORDER BY sort_order ASC, created_at ASC
  `;

  return Response.json(photos);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: 'Invalid multipart form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json(
      { error: 'File type not allowed. Use JPEG, PNG, or WebP.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: 'File too large. Maximum size is 5 MB.' },
      { status: 400 }
    );
  }

  const caption = (formData.get('caption') as string | null) ?? null;
  const category = (formData.get('category') as string | null) ?? null;

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const dataUrl = `data:${file.type};base64,${base64}`;

  const sql = getDb();

  // Determine next sort_order
  const [maxResult] = await sql`
    SELECT COALESCE(MAX(sort_order), -1)::int AS max_order FROM photos
  `;
  const nextOrder = (maxResult.max_order as number) + 1;

  const [photo] = await sql`
    INSERT INTO photos (filename, caption, category, sort_order, storage_url)
    VALUES (
      ${file.name},
      ${caption},
      ${category},
      ${nextOrder},
      ${dataUrl}
    )
    RETURNING id, filename, caption, category, sort_order, storage_url, created_at
  `;

  return Response.json(photo, { status: 201 });
}
