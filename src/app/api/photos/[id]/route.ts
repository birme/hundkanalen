export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getPhotoObject } from '@/lib/object-storage';

type RouteContext = { params: Promise<{ id: string }> };

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const sql = getDb();

  const [photo] = await sql`
    SELECT storage_url, filename FROM photos WHERE id = ${id}
  `;

  if (!photo) {
    return new Response('Photo not found', { status: 404 });
  }

  const storageUrl = photo.storage_url as string;

  if (storageUrl.startsWith('s3://')) {
    const object = await getPhotoObject(storageUrl);

    return new Response(toArrayBuffer(object.body), {
      status: 200,
      headers: {
        'Content-Type': object.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': object.body.byteLength.toString(),
      },
    });
  }

  // Parse legacy data URL: data:<mime>;base64,<data>
  const match = storageUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return new Response('Invalid photo data', { status: 500 });
  }

  const mimeType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');

  return new Response(toArrayBuffer(buffer), {
    status: 200,
    headers: {
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': buffer.byteLength.toString(),
    },
  });
}
