export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { sendContractorAccessEmail } from '@/lib/email';
import {
  createContractorAccessToken,
  ensureContractorAccessTables,
  getBaseUrlFromRequest,
} from '@/lib/contractor-access';

type RouteContext = { params: Promise<{ id: string }> };

function asRequiredText(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const validFrom = new Date(asRequiredText(body.valid_from));
  const validUntil = new Date(asRequiredText(body.valid_until));
  const keyboxCode = asRequiredText(body.keybox_code);
  const instructions = asRequiredText(body.instructions);

  if (!Number.isFinite(validFrom.getTime()) || !Number.isFinite(validUntil.getTime())) {
    return Response.json({ error: 'Valid from and valid until are required' }, { status: 400 });
  }

  if (validUntil <= validFrom) {
    return Response.json({ error: 'Valid until must be after valid from' }, { status: 400 });
  }

  if (!keyboxCode || !instructions) {
    return Response.json({ error: 'Keybox code and instructions are required' }, { status: 400 });
  }

  await ensureContractorAccessTables();
  const sql = getDb();
  const [contractor] = await sql`
    SELECT id, name, email
    FROM contractors
    WHERE id = ${id}
  `;

  if (!contractor) {
    return Response.json({ error: 'Contractor not found' }, { status: 404 });
  }

  const { token, tokenHash } = createContractorAccessToken();
  const shouldSendEmail = body.send_email !== false;
  const [link] = await sql`
    INSERT INTO contractor_access_links (
      contractor_id, token_hash, valid_from, valid_until, keybox_code,
      instructions, sent_at, created_by
    )
    VALUES (
      ${contractor.id}, ${tokenHash}, ${validFrom}, ${validUntil}, ${keyboxCode},
      ${instructions}, ${shouldSendEmail ? new Date() : null}, ${session.user.id}
    )
    RETURNING id, valid_from, valid_until, sent_at, created_at
  `;

  const accessUrl = `${getBaseUrlFromRequest(request)}/contractor-access/${encodeURIComponent(token)}`;

  if (shouldSendEmail) {
    try {
      await sendContractorAccessEmail({
        email: contractor.email,
        name: contractor.name,
        accessUrl,
        validFrom,
        validUntil,
      });
    } catch (error) {
      console.error('Failed to send contractor access email:', error);
      await sql`
        UPDATE contractor_access_links
        SET sent_at = NULL
        WHERE id = ${link.id}
      `;
      return Response.json({ error: 'Access link was created but email could not be sent' }, { status: 500 });
    }
  }

  return Response.json({
    ...link,
    access_url: accessUrl,
    message: shouldSendEmail
      ? `Access email sent to ${contractor.email}`
      : 'Access link created',
  }, { status: 201 });
}
