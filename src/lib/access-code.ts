import crypto from 'crypto';
import { getDb } from './db';

// Exclude ambiguous characters: 0/O, 1/I/L
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export async function generateUniqueAccessCode(length = 8): Promise<string> {
  const sql = getDb();

  for (let attempt = 0; attempt < 10; attempt++) {
    const bytes = crypto.randomBytes(length);
    let code = '';
    for (let i = 0; i < length; i++) {
      code += CHARS[bytes[i] % CHARS.length];
    }

    const existing = await sql`SELECT id FROM stays WHERE access_code = ${code}`;
    if (existing.length === 0) {
      return code;
    }
  }

  throw new Error('Failed to generate unique access code after 10 attempts');
}
