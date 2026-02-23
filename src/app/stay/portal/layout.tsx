import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getGuestSession } from '@/lib/guest-auth';
import { getDb } from '@/lib/db';
import { formatDateShort } from '@/lib/utils';

export default async function GuestPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getGuestSession();
  if (!session) {
    redirect('/stay');
  }

  const sql = getDb();
  const [stay] = await sql`
    SELECT guest_name, check_in, check_out
    FROM stays
    WHERE id = ${session.stayId}
    LIMIT 1
  `;

  if (!stay) {
    redirect('/stay');
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Minimal portal header */}
      <header className="bg-forest-700 text-white sticky top-0 z-50 shadow-md">
        <div className="px-4 py-3 flex items-center justify-between max-w-2xl mx-auto">
          <Link
            href="/stay/portal"
            className="font-semibold text-white hover:text-forest-200 transition-colors text-sm"
          >
            Färila anno 1923
          </Link>
          <div className="text-right">
            <p className="text-white text-sm font-medium">{stay.guest_name.split(' ')[0]}</p>
            <p className="text-forest-300 text-xs">
              {formatDateShort(stay.check_in)} &ndash; {formatDateShort(stay.check_out)}
            </p>
          </div>
        </div>
      </header>

      {/* Page content — mobile-first */}
      <main className="px-4 py-6 max-w-2xl mx-auto">
        {children}
      </main>
    </div>
  );
}
