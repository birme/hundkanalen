ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS title_sv TEXT;
ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS description_sv TEXT;

ALTER TABLE property_info ADD COLUMN IF NOT EXISTS title_sv TEXT;
ALTER TABLE property_info ADD COLUMN IF NOT EXISTS content_sv TEXT;

ALTER TABLE favorite_places ADD COLUMN IF NOT EXISTS name_sv TEXT;
ALTER TABLE favorite_places ADD COLUMN IF NOT EXISTS description_sv TEXT;
ALTER TABLE favorite_places ADD COLUMN IF NOT EXISTS owner_tips_sv TEXT;

ALTER TABLE photos ADD COLUMN IF NOT EXISTS caption_sv TEXT;

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
WHERE title_sv IS NULL OR description_sv IS NULL;

UPDATE property_info
SET
  title_sv = COALESCE(title_sv, CASE title
    WHEN 'House Rules' THEN 'Husregler'
    WHEN 'WiFi' THEN 'WiFi'
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
WHERE title_sv IS NULL OR content_sv IS NULL;

UPDATE favorite_places
SET
  name_sv = COALESCE(name_sv, CASE name
    WHEN 'Bommars, Letsbo' THEN 'Bommars, Letsbo'
    WHEN 'Järvzoo / Vildriket' THEN 'Järvzoo / Vildriket'
    WHEN 'Järvsöbacken' THEN 'Järvsöbacken'
    WHEN 'Stenegård, Järvsö' THEN 'Stenegård, Järvsö'
    WHEN 'Hamra National Park' THEN 'Hamra nationalpark'
    WHEN 'Ljusnan River Fishing' THEN 'Fiske i Ljusnan'
    WHEN 'Skålvallssjön' THEN 'Skålvallssjön'
    WHEN 'Järvsö Bergscykelpark' THEN 'Järvsö Bergscykelpark'
    WHEN 'Loos Cobalt Mine' THEN 'Loos koboltgruva'
    WHEN 'Ersk-Matsgården, Ljusdal' THEN 'Ersk-Matsgården, Ljusdal'
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
WHERE name_sv IS NULL OR description_sv IS NULL OR owner_tips_sv IS NULL;

UPDATE photos
SET caption_sv = COALESCE(caption_sv, caption)
WHERE caption_sv IS NULL;
