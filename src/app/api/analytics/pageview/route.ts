export const dynamic = 'force-dynamic';

import crypto from 'crypto';
import { getDb } from '@/lib/db';

const MAX_PATH_LENGTH = 500;
const MAX_REFERRER_LENGTH = 500;

function hash(value: string) {
  const salt = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'hundkanalen-analytics';
  return crypto.createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') || 'unknown';
}

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

export async function POST(request: Request) {
  const dnt = request.headers.get('dnt') === '1' || request.headers.get('sec-gpc') === '1';
  if (dnt) {
    return new Response(null, { status: 204 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload = body as {
    path?: unknown;
    referrer?: unknown;
    locale?: unknown;
    viewportWidth?: unknown;
  };

  const path = cleanString(payload.path, MAX_PATH_LENGTH);
  if (!path || !path.startsWith('/')) {
    return Response.json({ error: 'Invalid path' }, { status: 400 });
  }

  if (
    path.startsWith('/admin') ||
    path.startsWith('/api') ||
    path.startsWith('/login') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password') ||
    path.startsWith('/contractor-access')
  ) {
    return new Response(null, { status: 204 });
  }

  const locale = payload.locale === 'sv' || payload.locale === 'en' ? payload.locale : null;
  const viewportWidth =
    typeof payload.viewportWidth === 'number' && Number.isFinite(payload.viewportWidth)
      ? Math.max(0, Math.min(10000, Math.round(payload.viewportWidth)))
      : null;

  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const day = new Date().toISOString().slice(0, 10);
  const visitorHash = hash(`${day}:${ip}:${userAgent}`);
  const userAgentHash = hash(userAgent);
  const referrer = cleanString(payload.referrer, MAX_REFERRER_LENGTH);

  const sql = getDb();
  await sql`
    INSERT INTO site_pageviews (
      path,
      referrer,
      locale,
      viewport_width,
      visitor_hash,
      user_agent_hash
    )
    VALUES (
      ${path},
      ${referrer},
      ${locale},
      ${viewportWidth},
      ${visitorHash},
      ${userAgentHash}
    )
  `;

  return new Response(null, { status: 204 });
}
