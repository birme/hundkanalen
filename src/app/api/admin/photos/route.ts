export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { createPhotoObjectKey, createStorageUrl, isObjectStorageConfigured, putPhotoObject } from '@/lib/object-storage';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getDb();
  const photos = await sql`
    SELECT
      p.id,
      p.filename,
      p.caption,
      p.caption_sv,
      p.category,
      p.sort_order,
      p.storage_url,
      p.is_public,
      p.created_at,
      COALESCE(ci.usage_count, 0)::int AS checklist_usage_count,
      COALESCE(pi.usage_count, 0)::int AS property_info_usage_count
    FROM photos p
    LEFT JOIN (
      SELECT photo_id, COUNT(*)::int AS usage_count
      FROM checklist_items
      WHERE photo_id IS NOT NULL
      GROUP BY photo_id
    ) ci ON ci.photo_id = p.id
    LEFT JOIN (
      SELECT photo_id, COUNT(*)::int AS usage_count
      FROM property_info
      WHERE photo_id IS NOT NULL
      GROUP BY photo_id
    ) pi ON pi.photo_id = p.id
    ORDER BY p.sort_order ASC, p.created_at ASC
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
  const captionSv = (formData.get('caption_sv') as string | null) ?? null;
  const category = (formData.get('category') as string | null) ?? null;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  let storageUrl: string;

  if (isObjectStorageConfigured()) {
    const key = createPhotoObjectKey(file.name);
    await putPhotoObject(key, buffer, file.type);
    storageUrl = createStorageUrl(key);
  } else {
    const base64 = buffer.toString('base64');
    storageUrl = `data:${file.type};base64,${base64}`;
  }

  const sql = getDb();

  // Determine next sort_order
  const [maxResult] = await sql`
    SELECT COALESCE(MAX(sort_order), -1)::int AS max_order FROM photos
  `;
  const nextOrder = (maxResult.max_order as number) + 1;

  const [photo] = await sql`
    INSERT INTO photos (filename, caption, caption_sv, category, sort_order, storage_url)
    VALUES (
      ${file.name},
      ${caption},
      ${captionSv || caption},
      ${category},
      ${nextOrder},
      ${storageUrl}
    )
    RETURNING id, filename, caption, caption_sv, category, sort_order, storage_url, is_public, created_at
  `;

  return Response.json({
    ...photo,
    checklist_usage_count: 0,
    property_info_usage_count: 0,
  }, { status: 201 });
}
