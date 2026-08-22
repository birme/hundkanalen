export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { createPhotoObjectKey, createStorageUrl, isObjectStorageConfigured, putPhotoObject } from '@/lib/object-storage';

type LegacyPhoto = {
  id: string;
  filename: string;
  storage_url: string;
};

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isObjectStorageConfigured()) {
    return Response.json({ error: 'Photo object storage is not configured' }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const limit = Math.min(Math.max(Number(body.limit) || 25, 1), 100);
  const sql = getDb();

  const photos = await sql<LegacyPhoto[]>`
    SELECT id, filename, storage_url
    FROM photos
    WHERE storage_url LIKE 'data:%;base64,%'
    ORDER BY created_at ASC
    LIMIT ${limit}
  `;

  let migrated = 0;
  const failed: Array<{ id: string; error: string }> = [];

  for (const photo of photos) {
    try {
      const match = photo.storage_url.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        failed.push({ id: photo.id, error: 'Invalid legacy data URL' });
        continue;
      }

      const contentType = match[1];
      const buffer = Buffer.from(match[2], 'base64');
      const key = createPhotoObjectKey(photo.filename);
      await putPhotoObject(key, buffer, contentType);
      await sql`
        UPDATE photos
        SET storage_url = ${createStorageUrl(key)}
        WHERE id = ${photo.id}
      `;
      migrated += 1;
    } catch (error) {
      failed.push({
        id: photo.id,
        error: error instanceof Error ? error.message : 'Unknown migration error',
      });
    }
  }

  const [{ remaining }] = await sql<{ remaining: number }[]>`
    SELECT COUNT(*)::int AS remaining
    FROM photos
    WHERE storage_url LIKE 'data:%;base64,%'
  `;

  return Response.json({
    scanned: photos.length,
    migrated,
    remaining,
    failed,
  });
}
