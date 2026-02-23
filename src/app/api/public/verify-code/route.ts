export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code } = body;

  if (!code || typeof code !== 'string') {
    return Response.json({ error: 'Access code is required' }, { status: 400 });
  }

  const sql = getDb();
  const [setting] = await sql`
    SELECT value FROM site_settings WHERE key = 'global_access_code'
  `;

  if (!setting) {
    return Response.json({ error: 'Access code not configured' }, { status: 500 });
  }

  if (code.trim().toUpperCase() !== (setting.value as string).trim().toUpperCase()) {
    return Response.json({ error: 'Invalid access code' }, { status: 401 });
  }

  // Set a cookie to remember the visitor is verified
  const cookieStore = await cookies();
  cookieStore.set('hk-site-access', 'verified', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return Response.json({ success: true });
}
