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

  // === Migration 005: Packing notes, guest reviews ===
  await sql`ALTER TABLE stays ADD COLUMN IF NOT EXISTS packing_notes TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS guest_reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      stay_id UUID NOT NULL REFERENCES stays(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_guest_reviews_stay_id ON guest_reviews(stay_id)`;

  // === Migration 006: Checklist-to-property-info links ===
  await sql`
    CREATE TABLE IF NOT EXISTS checklist_property_info (
      checklist_item_id UUID NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
      property_info_id UUID NOT NULL REFERENCES property_info(id) ON DELETE CASCADE,
      PRIMARY KEY (checklist_item_id, property_info_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_cpi_checklist_item_id ON checklist_property_info(checklist_item_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cpi_property_info_id ON checklist_property_info(property_info_id)`;

  // === Migration 007: Photo attachments on checklist items and property info ===
  await sql`ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS photo_id UUID REFERENCES photos(id) ON DELETE SET NULL`;
  await sql`ALTER TABLE property_info ADD COLUMN IF NOT EXISTS photo_id UUID REFERENCES photos(id) ON DELETE SET NULL`;

  // === Migration 008: Owner maintenance finance plan ===
  await sql`
    CREATE TABLE IF NOT EXISTS maintenance_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      area TEXT NOT NULL DEFAULT 'general',
      description TEXT,
      source TEXT,
      priority TEXT NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
      status TEXT NOT NULL DEFAULT 'planned'
        CHECK (status IN ('planned', 'in_progress', 'done', 'deferred')),
      target_year INTEGER,
      estimated_cost INTEGER,
      actual_cost INTEGER,
      completed_at DATE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_maintenance_items_status ON maintenance_items(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_maintenance_items_target_year ON maintenance_items(target_year)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_maintenance_items_priority ON maintenance_items(priority)`;

  // === Migration 011: Localized database content ===
  await sql`ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS title_sv TEXT`;
  await sql`ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS description_sv TEXT`;
  await sql`ALTER TABLE property_info ADD COLUMN IF NOT EXISTS title_sv TEXT`;
  await sql`ALTER TABLE property_info ADD COLUMN IF NOT EXISTS content_sv TEXT`;
  await sql`ALTER TABLE favorite_places ADD COLUMN IF NOT EXISTS name_sv TEXT`;
  await sql`ALTER TABLE favorite_places ADD COLUMN IF NOT EXISTS description_sv TEXT`;
  await sql`ALTER TABLE favorite_places ADD COLUMN IF NOT EXISTS owner_tips_sv TEXT`;
  await sql`ALTER TABLE photos ADD COLUMN IF NOT EXISTS caption_sv TEXT`;

  await sql`
    UPDATE checklist_items
    SET
      title_sv = COALESCE(title_sv, CASE title
        WHEN 'Find the keybox' THEN 'Hitta nyckelboxen'
        WHEN 'Enter and explore' THEN 'Gå in och bekanta dig'
        WHEN 'Check heating' THEN 'Kontrollera värmen'
        WHEN 'Connect to WiFi' THEN 'Anslut till WiFi'
        WHEN 'Review house rules' THEN 'Läs husreglerna'
        WHEN 'Take out the trash' THEN 'Ta ut soporna'
        WHEN 'Run the dishwasher' THEN 'Starta diskmaskinen'
        WHEN 'Gather used towels' THEN 'Samla använda handdukar'
        WHEN 'Close all windows' THEN 'Stäng alla fönster'
        WHEN 'Set thermostat to 15C' THEN 'Sänk termostaten till 15C'
        WHEN 'Lock up and return key' THEN 'Lås och lämna tillbaka nyckeln'
        WHEN 'Check for belongings' THEN 'Kontrollera kvarglömda saker'
        ELSE title
      END),
      description_sv = COALESCE(description_sv, CASE title
        WHEN 'Find the keybox' THEN 'Nyckelboxen sitter vid ytterdörren. Använd koden som finns i dina vistelsedetaljer.'
        WHEN 'Enter and explore' THEN 'Välkommen! Titta gärna runt och gör dig hemmastadd.'
        WHEN 'Check heating' THEN 'Termostaten sitter i hallen. Justera till en behaglig temperatur.'
        WHEN 'Connect to WiFi' THEN 'Nätverksnamn och lösenord finns på informationskortet i köket.'
        WHEN 'Review house rules' THEN 'Läs gärna igenom husinformationen för regler och viktiga detaljer.'
        WHEN 'Take out the trash' THEN 'Sortera återvinningen i kärlen i groventrén. Ta påsarna till kärlen utomhus.'
        WHEN 'Run the dishwasher' THEN 'Ställ in använd disk och starta diskmaskinen innan ni åker.'
        WHEN 'Gather used towels' THEN 'Lägg använda handdukar i tvättkorgen i badrummet.'
        WHEN 'Close all windows' THEN 'Kontrollera att alla fönster är stängda och låsta.'
        WHEN 'Set thermostat to 15C' THEN 'Sänk värmen till 15 grader innan ni lämnar huset.'
        WHEN 'Lock up and return key' THEN 'Lås ytterdörren och lägg tillbaka nyckeln i nyckelboxen.'
        WHEN 'Check for belongings' THEN 'Titta en extra gång under sängar, i kylskåpet och i badrummet efter kvarglömda saker.'
        ELSE description
      END)
    WHERE title_sv IS NULL OR description_sv IS NULL
  `;

  await sql`
    UPDATE property_info
    SET
      title_sv = COALESCE(title_sv, CASE title
        WHEN 'House Rules' THEN 'Husregler'
        WHEN 'Heating' THEN 'Värme'
        WHEN 'Waste & Recycling' THEN 'Sopor och återvinning'
        WHEN 'Emergency Contacts' THEN 'Nödkontakter'
        WHEN 'Check-in Time' THEN 'Incheckningstid'
        WHEN 'Check-out Time' THEN 'Utcheckningstid'
        WHEN 'Parking' THEN 'Parkering'
        WHEN 'Getting Here' THEN 'Hitta hit'
        WHEN 'Bed Sheets & Pillows' THEN 'Lakan och kuddar'
        WHEN 'Towels' THEN 'Handdukar'
        WHEN 'Kitchen Essentials' THEN 'Köksbasics'
        ELSE title
      END),
      content_sv = COALESCE(content_sv, CASE title
        WHEN 'House Rules' THEN 'Ingen rökning inomhus. Tyst tid gäller 22:00-07:00. Husdjur är välkomna men får inte lämnas ensamma. Behandla huset varsamt.'
        WHEN 'WiFi' THEN 'Nätverk: Hundkanalen3
Lösenord: Se informationskortet på köksbänken.'
        WHEN 'Heating' THEN 'Huset har elradiatorer som styrs av en termostat i hallen. På vintern kan även eldstaden användas. Ved finns i förrådet utomhus.'
        WHEN 'Waste & Recycling' THEN 'I Sverige sorterar vi avfall. Sortera i: matavfall (grönt kärl), plast (gult kärl), papper/kartong (blått kärl), glas (på återvinningsstation) och restavfall (svart kärl). Återvinningskärlen finns i groventrén.'
        WHEN 'Emergency Contacts' THEN 'Akut: 112
Polis, ej akut: 114 14
Närmaste vårdcentral: Ljusdals hälsocentral, Ljusdal (30 min bilresa)
Fastighetsägare: Jonas - kontaktuppgifter finns i bokningsbekräftelsen.'
        WHEN 'Check-in Time' THEN 'Incheckning från 15:00. Kontakta oss i förväg om ni behöver tidigare incheckning.'
        WHEN 'Check-out Time' THEN 'Utcheckning senast 11:00. Följ gärna checklistan för utcheckning innan ni lämnar huset.'
        WHEN 'Parking' THEN 'Gratis parkering finns direkt utanför huset. Det finns plats för 2-3 bilar.'
        WHEN 'Getting Here' THEN 'Huset ligger i Färila, Hälsingland. Från Stockholm tar du E4 norrut till Gävle och sedan väg 83 västerut mot Ljusdal/Färila. Resan tar cirka 3,5-4 timmar.'
        WHEN 'Bed Sheets & Pillows' THEN 'Lakan, kuddar och örngott finns på plats. Ni behöver inte ta med egna.'
        WHEN 'Towels' THEN 'Handdukar finns till alla gäster. Extra handdukar finns i garderoben i hallen.'
        WHEN 'Kitchen Essentials' THEN 'Grundläggande köksvaror som olja, salt, peppar, kaffe och te finns. Ta med särskilda ingredienser ni vill använda.'
        ELSE content
      END)
    WHERE title_sv IS NULL OR content_sv IS NULL
  `;

  await sql`
    UPDATE favorite_places
    SET
      name_sv = COALESCE(name_sv, CASE name
        WHEN 'Hamra National Park' THEN 'Hamra nationalpark'
        WHEN 'Ljusnan River Fishing' THEN 'Fiske i Ljusnan'
        WHEN 'Loos Cobalt Mine' THEN 'Loos koboltgruva'
        WHEN 'Dellen Crater Lakes' THEN 'Dellensjöarna'
        ELSE name
      END),
      description_sv = COALESCE(description_sv, CASE name
        WHEN 'Bommars, Letsbo' THEN 'En av de sju världsarvsklassade hälsingegårdarna. Guidade sommarturer med fantastiskt målade interiörer.'
        WHEN 'Järvzoo / Vildriket' THEN 'Promenera bland varg, björn, lo och järv på en tre kilometer lång träspång genom skogen. Öppet året runt.'
        WHEN 'Järvsöbacken' THEN 'Familjevänlig skidbacke med 20 nedfarter. Barn under 6 år åker gratis. Skidskola finns.'
        WHEN 'Stenegård, Järvsö' THEN 'Gårdsmiljö från 1800-talet med hantverksbutiker, galleri, bageri och lokala produkter.'
        WHEN 'Hamra National Park' THEN 'Gammelskog med träd över 400 år. Ett av Sveriges björntätaste områden och vacker vandring.'
        WHEN 'Ljusnan River Fishing' THEN 'Fina fiskemöjligheter efter harr, öring och gädda. Fiskekort finns via ifiske.se.'
        WHEN 'Skålvallssjön' THEN 'Badplats med sandstrand. Perfekt för sommardagar och på gångavstånd från huset.'
        WHEN 'Järvsö Bergscykelpark' THEN 'En av Sveriges högst rankade mountainbikeparker med leder för flera nivåer.'
        WHEN 'Loos Cobalt Mine' THEN 'Underjordiskt museum med guidade turer. En fascinerande del av svensk gruvhistoria.'
        WHEN 'Ersk-Matsgården, Ljusdal' THEN 'Traditionell hälsingemat i kulturhistorisk miljö. Passar fint för en särskild middag.'
        WHEN 'Dellen Crater Lakes' THEN 'Gamla meteoritkratersjöar med klart vatten. Fint för cykling och bad.'
        ELSE description
      END),
      owner_tips_sv = COALESCE(owner_tips_sv, owner_tips)
    WHERE name_sv IS NULL OR description_sv IS NULL OR owner_tips_sv IS NULL
  `;

  await sql`
    UPDATE photos
    SET caption_sv = COALESCE(caption_sv, caption)
    WHERE caption_sv IS NULL
  `;

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
        ('Getting Here', 'The house is located in Farila, Halsingland. From Stockholm, take E4 north to Gavle, then Route 83 west towards Ljusdal/Farila. The drive takes approximately 3.5-4 hours.', 'location', 0)
    `;
  }

  // Seed default packing info (if none exist)
  const existingPacking = await sql`SELECT id FROM property_info WHERE category = 'packing' LIMIT 1`;
  if (existingPacking.length === 0) {
    await sql`
      INSERT INTO property_info (title, content, category, sort_order) VALUES
        ('Bed Sheets & Pillows', 'Bed sheets, pillows, and pillowcases are provided. You do not need to bring your own.', 'packing', 0),
        ('Towels', 'Towels are provided for all guests. Extra towels can be found in the hallway closet.', 'packing', 1),
        ('Kitchen Essentials', 'Basic cooking supplies (oil, salt, pepper, coffee, tea) are available. Bring any specialty ingredients you need.', 'packing', 2)
    `;
  }

  // Seed owner maintenance plan from Anticimex inspection notes and later owner updates.
  const existingMaintenance = await sql`SELECT id FROM maintenance_items LIMIT 1`;
  if (existingMaintenance.length === 0) {
    await sql`
      INSERT INTO maintenance_items (
        title, area, description, source, priority, status, target_year,
        estimated_cost, actual_cost, completed_at, sort_order
      ) VALUES
        (
          'Paint rear facade',
          'Exterior / Facade',
          'Owner update: rear facade was painted in 2026 after the 2025 inspection.',
          'Owner note after Anticimex inspection 2025-01-16',
          'medium',
          'done',
          2026,
          NULL,
          NULL,
          NULL,
          0
        ),
        (
          'Paint and maintain remaining facade sections',
          'Exterior / Facade',
          'Inspection noted that parts of the wood facade need painting and maintenance to extend service life.',
          'Anticimex inspection 2025-01-16, exterior facade',
          'high',
          'planned',
          2027,
          NULL,
          NULL,
          NULL,
          1
        ),
        (
          'Paint and maintain exterior doors',
          'Exterior / Doors',
          'Inspection noted that an exterior door needs painting and maintenance.',
          'Anticimex inspection 2025-01-16, exterior doors',
          'medium',
          'planned',
          2027,
          NULL,
          NULL,
          NULL,
          2
        ),
        (
          'Paint and maintain windows',
          'Exterior / Windows',
          'Inspection noted that several windows need painting and maintenance to extend service life.',
          'Anticimex inspection 2025-01-16, exterior windows',
          'medium',
          'planned',
          2027,
          NULL,
          NULL,
          NULL,
          3
        ),
        (
          'Repair rot-damaged balcony railing and door connection',
          'Exterior / Balcony',
          'Inspection noted rot damage in the balcony railing and a deficient connection between balcony and door, with risk of rainwater entering wall and roof structures.',
          'Anticimex inspection 2025-01-16, balcony',
          'urgent',
          'planned',
          2027,
          NULL,
          NULL,
          NULL,
          4
        ),
        (
          'Repair minor rot damage in deck railing',
          'Exterior / Deck',
          'Owner update: deck railings were maintained in 2026 after the inspection noted minor rot damage.',
          'Anticimex inspection 2025-01-16, deck',
          'medium',
          'done',
          2026,
          NULL,
          NULL,
          NULL,
          5
        ),
        (
          'Assess and install chimney weather protection',
          'Roof / Chimney',
          'Inspection noted that the chimney lacks weather protection. A professional should assess whether and how protection should be installed.',
          'Anticimex inspection 2025-01-16, roof',
          'high',
          'planned',
          2027,
          NULL,
          NULL,
          NULL,
          6
        ),
        (
          'Refresh basement surface finishes',
          'Basement',
          'Inspection noted older surface finishes with minor paint flaking in parts of the basement.',
          'Anticimex inspection 2025-01-16, basement general',
          'low',
          'deferred',
          2029,
          NULL,
          NULL,
          NULL,
          7
        )
    `;
  }

  // Keep the initially seeded maintenance timeline aligned with owner updates.
  // These statements intentionally avoid changing estimated_cost and actual_cost.
  await sql`
    UPDATE maintenance_items
    SET
      description = 'Owner update: rear facade was painted in 2026 after the 2025 inspection.',
      status = 'done',
      target_year = 2026,
      updated_at = NOW()
    WHERE title = 'Paint rear facade'
      AND source = 'Owner note after Anticimex inspection 2025-01-16'
  `;
  await sql`
    UPDATE maintenance_items
    SET target_year = 2027, updated_at = NOW()
    WHERE title IN (
      'Paint and maintain remaining facade sections',
      'Paint and maintain exterior doors',
      'Paint and maintain windows',
      'Repair rot-damaged balcony railing and door connection',
      'Assess and install chimney weather protection'
    )
      AND status <> 'done'
      AND source LIKE 'Anticimex inspection 2025-01-16%'
  `;
  await sql`
    UPDATE maintenance_items
    SET
      description = 'Owner update: deck railings were maintained in 2026 after the inspection noted minor rot damage.',
      status = 'done',
      target_year = 2026,
      updated_at = NOW()
    WHERE title = 'Repair minor rot damage in deck railing'
      AND source = 'Anticimex inspection 2025-01-16, deck'
  `;
  await sql`
    UPDATE maintenance_items
    SET target_year = 2029, updated_at = NOW()
    WHERE title = 'Refresh basement surface finishes'
      AND source = 'Anticimex inspection 2025-01-16, basement general'
      AND status <> 'done'
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS site_pageviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      path TEXT NOT NULL,
      referrer TEXT,
      locale TEXT CHECK (locale IN ('en', 'sv')),
      viewport_width INTEGER,
      visitor_hash TEXT NOT NULL,
      user_agent_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_site_pageviews_created_at ON site_pageviews(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_site_pageviews_path ON site_pageviews(path)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_site_pageviews_visitor_created ON site_pageviews(visitor_hash, created_at DESC)`;

  return Response.json({
    success: true,
    message: 'Database seeded successfully',
    tables: [
      'users', 'bookings', 'blocked_dates', 'pricing_defaults', 'pricing_seasons', 'inquiries',
      'stays', 'checklist_items', 'property_info', 'photos', 'site_settings', 'favorite_places', 'stay_favorites',
      'guest_reviews', 'checklist_property_info', 'maintenance_items', 'site_pageviews',
    ],
  });
}
