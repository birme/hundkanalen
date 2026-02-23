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

  // Create extensions
  await sql`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto"
  `;

  // === Migration 001: Original tables ===
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

  // === Migration 002: Stays, checklists, property info, photos ===
  await sql`
    CREATE TABLE IF NOT EXISTS stays (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      access_code TEXT UNIQUE NOT NULL,
      guest_name TEXT NOT NULL,
      guest_email TEXT,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guests INTEGER NOT NULL DEFAULT 1,
      total_price INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'SEK',
      keybox_code TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'upcoming'
        CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_stays_access_code ON stays(access_code)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_stays_status ON stays(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_stays_check_in ON stays(check_in)`;

  await sql`
    CREATE TABLE IF NOT EXISTS checklist_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type TEXT NOT NULL CHECK (type IN ('checkin', 'checkout')),
      title TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_checklist_items_type ON checklist_items(type)`;

  await sql`
    CREATE TABLE IF NOT EXISTS property_info (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_property_info_category ON property_info(category)`;

  await sql`
    CREATE TABLE IF NOT EXISTS photos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      filename TEXT NOT NULL,
      caption TEXT,
      category TEXT DEFAULT 'general',
      sort_order INTEGER NOT NULL DEFAULT 0,
      storage_url TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_photos_category ON photos(category)`;

  // === Migration 003: Privacy controls, global access code, favorite places ===
  await sql`ALTER TABLE photos ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false`;

  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS favorite_places (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'activity',
      icon TEXT DEFAULT '',
      url TEXT,
      distance TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_favorite_places_category ON favorite_places(category)`;

  // === Migration 004: Owner tips and stay-featured activities ===
  await sql`ALTER TABLE favorite_places ADD COLUMN IF NOT EXISTS owner_tips TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS stay_favorites (
      stay_id UUID NOT NULL REFERENCES stays(id) ON DELETE CASCADE,
      favorite_id UUID NOT NULL REFERENCES favorite_places(id) ON DELETE CASCADE,
      added_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (stay_id, favorite_id)
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_stay_favorites_stay_id ON stay_favorites(stay_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_stay_favorites_favorite_id ON stay_favorites(favorite_id)`;

  // Seed default site settings
  await sql`
    INSERT INTO site_settings (key, value) VALUES
      ('global_access_code', 'HUNDKANALEN')
    ON CONFLICT (key) DO NOTHING
  `;

  // Seed default favorite places
  const existingPlaces = await sql`SELECT id FROM favorite_places LIMIT 1`;
  if (existingPlaces.length === 0) {
    await sql`
      INSERT INTO favorite_places (name, description, category, icon, url, distance, sort_order) VALUES
        ('Bommars, Letsbo', 'One of the 7 UNESCO World Heritage decorated farmhouses. Guided summer tours with stunning painted interiors.', 'culture', '🏛️', 'https://bommars.se', '15 min', 0),
        ('Järvzoo / Vildriket', 'Walk among wolves, bears, lynx and wolverines on a 3 km forest boardwalk. Open year-round.', 'family', '🐻', 'https://vildriket.se/en/', '35 min', 1),
        ('Järvsöbacken', 'Family-friendly ski resort with 20 pistes. Children under 6 ski free. Ski school available.', 'winter', '⛷️', 'https://www.jarvsobacken.se/english-information/', '35 min', 2),
        ('Stenegård, Järvsö', '19th-century farm estate with artisan craft shops, gallery, bakery, and local products.', 'culture', '🎨', 'https://stenegard.com/english', '35 min', 3),
        ('Hamra National Park', 'Old-growth forest with trees over 400 years old. Highest brown bear density in Sweden. Beautiful hiking.', 'nature', '🌲', 'https://www.sverigesnationalparker.se/en/choose-park---list/hamra-national-park/', '1.5 h', 4),
        ('Ljusnan River Fishing', 'World-class fishing for grayling, trout and pike. Permits available at ifiske.se.', 'outdoor', '🎣', 'https://www.ifiske.se', '0 min', 5),
        ('Skålvallssjön', 'Swimming lake with sandy beach. Perfect for summer days. Walking distance from the property.', 'outdoor', '🏊', NULL, '5 min', 6),
        ('Järvsö Bergscykelpark', 'Sweden''s best-rated mountain bike park with trails for all skill levels.', 'outdoor', '🚵', 'https://jarvsobergscykelpark.se/?lang=en', '35 min', 7),
        ('Loos Cobalt Mine', 'Underground museum with guided tours. A fascinating piece of Swedish mining history.', 'culture', '⛏️', NULL, '45 min', 8),
        ('Ersk-Matsgården, Ljusdal', 'Traditional Hälsingland cuisine in a heritage setting. Perfect for a special dinner.', 'dining', '🍽️', NULL, '20 min', 9),
        ('Dellen Crater Lakes', 'Ancient meteor crater lakes with crystal-clear water. Great for cycling and swimming.', 'nature', '🌊', NULL, '45 min', 10)
    `;
  }

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

  // Seed default checklist items
  const existingChecklist = await sql`SELECT id FROM checklist_items LIMIT 1`;
  if (existingChecklist.length === 0) {
    await sql`
      INSERT INTO checklist_items (type, title, description, sort_order) VALUES
        ('checkin', 'Find the keybox', 'The keybox is located next to the front door. Use the code provided in your stay details.', 0),
        ('checkin', 'Enter and explore', 'Welcome! Take a look around and make yourself at home.', 1),
        ('checkin', 'Check heating', 'The thermostat is in the hallway. Adjust to your comfort level.', 2),
        ('checkin', 'Connect to WiFi', 'Network name and password are on the info card in the kitchen.', 3),
        ('checkin', 'Review house rules', 'Please check the property information section for house rules and important details.', 4),
        ('checkout', 'Take out the trash', 'Separate recycling into the bins in the utility room. Take bags to the outdoor bins.', 0),
        ('checkout', 'Run the dishwasher', 'Load any used dishes and start the dishwasher before you leave.', 1),
        ('checkout', 'Gather used towels', 'Place all used towels in the laundry basket in the bathroom.', 2),
        ('checkout', 'Close all windows', 'Make sure all windows are closed and locked.', 3),
        ('checkout', 'Set thermostat to 15C', 'Turn down the heating to 15 degrees before leaving.', 4),
        ('checkout', 'Lock up and return key', 'Lock the front door and return the key to the keybox.', 5),
        ('checkout', 'Check for belongings', 'Double-check under beds, in the fridge, and in the bathroom for forgotten items.', 6)
    `;
  }

  // Seed default property info
  const existingInfo = await sql`SELECT id FROM property_info LIMIT 1`;
  if (existingInfo.length === 0) {
    await sql`
      INSERT INTO property_info (title, content, category, sort_order) VALUES
        ('House Rules', 'No smoking indoors. Quiet hours are 22:00-07:00. Pets are welcome but must not be left unattended. Please treat the property with care.', 'rules', 0),
        ('WiFi', 'Network: Hundkanalen3\nPassword: See the info card on the kitchen counter.', 'practical', 0),
        ('Heating', 'The house has electric radiators controlled by a thermostat in the hallway. In winter, the fireplace can also be used - firewood is stored in the shed outside.', 'practical', 1),
        ('Waste & Recycling', 'Sweden has source separation for waste. Please sort into: food waste (green bin), plastics (yellow bin), paper/cardboard (blue bin), glass (at recycling station), and residual waste (black bin). Recycling bins are in the utility room.', 'practical', 2),
        ('Emergency Contacts', 'Emergency services: 112\nNon-emergency police: 114 14\nNearest hospital: Ljusdals halsocentral, Ljusdal (30 min drive)\nProperty owner: Jonas - contact details provided in your booking confirmation.', 'emergency', 0),
        ('Check-in Time', 'Check-in from 15:00. If you need early check-in, please contact us in advance.', 'practical', 3),
        ('Check-out Time', 'Check-out by 11:00. Please follow the check-out checklist before leaving.', 'practical', 4),
        ('Parking', 'Free parking is available directly outside the house. There is space for 2-3 cars.', 'practical', 5),
        ('Getting Here', 'Hundkanalen 3 is located in Farila, Halsingland. From Stockholm, take E4 north to Gavle, then Route 83 west towards Ljusdal/Farila. The drive takes approximately 3.5-4 hours.', 'location', 0)
    `;
  }

  return Response.json({
    success: true,
    message: 'Database seeded successfully',
    tables: [
      'users', 'bookings', 'blocked_dates', 'pricing_defaults', 'pricing_seasons', 'inquiries',
      'stays', 'checklist_items', 'property_info', 'photos', 'site_settings', 'favorite_places', 'stay_favorites',
    ],
  });
}
