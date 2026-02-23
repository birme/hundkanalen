import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getGuestSession } from '@/lib/guest-auth';
import { getDb } from '@/lib/db';
import { formatDateShort } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/stay/portal', label: 'Overview' },
  { href: '/stay/portal/checkin', label: 'Check-in' },
  { href: '/stay/portal/checkout', label: 'Check-out' },
  { href: '/stay/portal/info', label: 'Property Info' },
  { href: '/stay/portal/area', label: 'Area Guide' },
  { href: '/stay/portal/photos', label: 'Photos' },
];

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
      {/* Portal header */}
      <header className="bg-forest-700 text-white shadow-md">
        <div className="container-wide px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-forest-200 hover:text-white transition-colors text-sm">
                Hundkanalen 3
              </Link>
              <span className="text-forest-400">/</span>
              <span className="text-white font-medium text-sm">Guest Portal</span>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold text-sm">{stay.guest_name}</p>
              <p className="text-forest-200 text-xs mt-0.5">
                {formatDateShort(stay.check_in)} &ndash; {formatDateShort(stay.check_out)}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="container-wide px-4 sm:px-6 lg:px-8 border-t border-forest-600">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="
                  flex-shrink-0
                  px-4 py-3
                  text-sm font-medium
                  text-forest-200
                  hover:text-white hover:bg-forest-600
                  transition-colors
                  whitespace-nowrap
                  border-b-2 border-transparent
                  hover:border-forest-300
                "
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Page content */}
      <main className="container-wide px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
