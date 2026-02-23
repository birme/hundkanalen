export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const sql = getDb();

  const [photo] = await sql`
    SELECT storage_url, filename FROM photos WHERE id = ${id}
  `;

  if (!photo) {
    return new Response('Photo not found', { status: 404 });
  }

  const dataUrl = photo.storage_url as string;

  // Parse data URL: data:<mime>;base64,<data>
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return new Response('Invalid photo data', { status: 500 });
  }

  const mimeType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': buffer.byteLength.toString(),
    },
  });
}
