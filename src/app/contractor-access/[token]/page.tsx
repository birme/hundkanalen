export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { getDb } from '@/lib/db';
import {
  ensureContractorAccessTables,
  hashContractorAccessToken,
} from '@/lib/contractor-access';

type PageProps = {
  params: Promise<{ token: string }>;
};

type AccessLink = {
  contractor_name: string;
  valid_from: string;
  valid_until: string;
  keybox_code: string;
  instructions: string;
};

type Photo = {
  id: string;
  storage_url: string;
  caption: string | null;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Stockholm',
  }).format(new Date(value));
}

function StatusPage({ title, message }: { title: string; message: string }) {
  return (
    <main className="min-h-screen bg-[#17123b] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center">
        <div className="w-full rounded-[2rem] border border-white/10 bg-white/10 p-6 text-center shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">Hundkanalen 3, Färila</p>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-4 text-sm leading-6 text-white/65">{message}</p>
        </div>
      </div>
    </main>
  );
}

export default async function ContractorAccessPage({ params }: PageProps) {
  const { token } = await params;
  await ensureContractorAccessTables();

  const sql = getDb();
  const [access] = await sql<AccessLink[]>`
    SELECT
      c.name AS contractor_name,
      l.valid_from,
      l.valid_until,
      l.keybox_code,
      l.instructions
    FROM contractor_access_links l
    JOIN contractors c ON c.id = l.contractor_id
    WHERE l.token_hash = ${hashContractorAccessToken(token)}
    LIMIT 1
  `;

  if (!access) {
    return <StatusPage title="Länken hittades inte" message="Kontrollera att du har öppnat exakt den länk du fått via e-post." />;
  }

  const now = new Date();
  const validFrom = new Date(access.valid_from);
  const validUntil = new Date(access.valid_until);

  if (now < validFrom) {
    return (
      <StatusPage
        title="Länken är inte giltig ännu"
        message={`Den här länken gäller från ${formatDateTime(access.valid_from)}.`}
      />
    );
  }

  if (now > validUntil) {
    return (
      <StatusPage
        title="Länken har gått ut"
        message={`Den här länken var giltig till ${formatDateTime(access.valid_until)}.`}
      />
    );
  }

  let keyboxPhotos: Photo[] = [];
  try {
    keyboxPhotos = await sql<Photo[]>`
      SELECT id, storage_url, caption
      FROM photos
      WHERE category = 'keybox'
      ORDER BY sort_order ASC
      LIMIT 1
    `;
  } catch {
    keyboxPhotos = [];
  }

  const keyboxPhoto = keyboxPhotos[0] ?? null;

  return (
    <main className="min-h-screen bg-[#17123b] px-4 py-6 text-white sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/45">Hundkanalen 3, Färila</p>
          <h1 className="text-3xl font-bold leading-tight">Tillträde för hantverkare</h1>
          <p className="mt-2 text-sm text-white/65">
            Hej {access.contractor_name}. Den här länken gäller från {formatDateTime(access.valid_from)} till {formatDateTime(access.valid_until)}.
          </p>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-sm font-semibold text-white/90">Nyckelboxkod</h2>
          </div>
          <div className="px-5 py-8 text-center">
            <p className="mb-4 text-sm text-white/60">Använd koden nedan för att öppna nyckelboxen.</p>
            <div className="inline-block rounded-2xl bg-black/30 px-8 py-5">
              <span className="font-mono text-4xl font-bold tracking-[0.25em] text-white">
                {access.keybox_code}
              </span>
            </div>
          </div>
        </section>

        {keyboxPhoto && (
          <section className="mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-xl shadow-black/20 backdrop-blur">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white/90">Här hittar du nyckelboxen</h2>
            </div>
            <div className="relative aspect-[4/3]">
              <Image
                src={keyboxPhoto.storage_url}
                alt={keyboxPhoto.caption || 'Nyckelboxens placering'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
            {keyboxPhoto.caption && (
              <p className="px-5 py-4 text-sm text-white/65">{keyboxPhoto.caption}</p>
            )}
          </section>
        )}

        <section className="mt-5 rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-xl shadow-black/20 backdrop-blur">
          <h2 className="mb-3 text-sm font-semibold text-white/90">Instruktioner</h2>
          <p className="whitespace-pre-wrap text-sm leading-7 text-white/70">{access.instructions}</p>
        </section>

        <p className="mt-5 text-center text-xs text-white/40">
          Dela inte länken vidare. Koden visas endast under länkens giltighetstid.
        </p>
      </div>
    </main>
  );
}
