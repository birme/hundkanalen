import { NextRequest } from 'next/server';
import { hash } from 'bcryptjs';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const sql = getDb();
  const body = await request.json();
  const { secret } = body;

  if (secret !== process.env.SEED_SECRET) {
    return Response.json({ error: 'Invalid seed secret' }, { status: 403 });
  }

  // Create tables
  await sql`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto"
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('admin', 'guest')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guests INTEGER NOT NULL DEFAULT 1,
      total_price INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS blocked_dates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      date_start DATE NOT NULL,
      date_end DATE NOT NULL,
      reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS pricing_defaults (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      weekday_rate INTEGER NOT NULL DEFAULT 1200,
      weekend_rate INTEGER NOT NULL DEFAULT 1500,
      cleaning_fee INTEGER NOT NULL DEFAULT 800,
      currency TEXT NOT NULL DEFAULT 'SEK',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS pricing_seasons (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      date_start DATE NOT NULL,
      date_end DATE NOT NULL,
      weekday_rate INTEGER NOT NULL,
      weekend_rate INTEGER NOT NULL,
      min_nights INTEGER NOT NULL DEFAULT 2,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS inquiries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      check_in DATE,
      check_out DATE,
      guests INTEGER,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'replied', 'archived')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Seed admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hundkanalen.se';
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';
  const passwordHash = await hash(adminPassword, 12);

  await sql`
    INSERT INTO users (email, name, password_hash, role)
    VALUES (${adminEmail}, ${'Admin'}, ${passwordHash}, 'admin')
    ON CONFLICT (email) DO UPDATE SET
      password_hash = ${passwordHash},
      updated_at = NOW()
  `;

  // Seed default pricing
  const existingDefaults = await sql`SELECT id FROM pricing_defaults LIMIT 1`;
  if (existingDefaults.length === 0) {
    await sql`
      INSERT INTO pricing_defaults (weekday_rate, weekend_rate, cleaning_fee)
      VALUES (1200, 1500, 800)
    `;
  }

  return Response.json({
    success: true,
    message: 'Database seeded successfully',
    tables: ['users', 'bookings', 'blocked_dates', 'pricing_defaults', 'pricing_seasons', 'inquiries'],
  });
}
