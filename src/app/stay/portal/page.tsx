export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getGuestSession } from '@/lib/guest-auth';
import { getDb } from '@/lib/db';
import { formatDate, daysBetween } from '@/lib/utils';

type Stay = {
  id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  keybox_code: string | null;
  notes: string | null;
  status: string;
};

function isKeyboxVisible(checkIn: string, checkOut: string): boolean {
  const now = new Date();
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const windowStart = new Date(checkInDate);
  windowStart.setHours(windowStart.getHours() - 24);

  const windowEnd = new Date(checkOutDate);
  windowEnd.setHours(23, 59, 59, 999);

  return now >= windowStart && now <= windowEnd;
}

const QUICK_LINKS = [
  {
    href: '/stay/portal/checkin',
    title: 'Check-in Instructions',
    description: 'Arrival details, access, and what to expect',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
      </svg>
    ),
  },
  {
    href: '/stay/portal/checkout',
    title: 'Check-out Instructions',
    description: 'Departure checklist and what to leave behind',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
      </svg>
    ),
  },
  {
    href: '/stay/portal/info',
    title: 'Property Info',
    description: 'House rules, WiFi, appliances, and emergency contacts',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
];

export default async function GuestPortalPage() {
  const session = await getGuestSession();
  if (!session) {
    redirect('/stay');
  }

  const sql = getDb();
  const [stay] = await sql<Stay[]>`
    SELECT
      id,
      guest_name,
      check_in,
      check_out,
      guests,
      keybox_code,
      notes,
      status
    FROM stays
    WHERE id = ${session.stayId}
    LIMIT 1
  `;

  if (!stay) {
    redirect('/stay');
  }

  const nights = daysBetween(stay.check_in, stay.check_out);
  const showKeybox = isKeyboxVisible(stay.check_in, stay.check_out);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-forest-800">
          Welcome, {stay.guest_name.split(' ')[0]}!
        </h1>
        <p className="text-gray-500 mt-1">
          Your stay at Hundkanalen 3, Färila, Hälsingland
        </p>
      </div>

      {/* Stay summary */}
      <div className="bg-white rounded-2xl border border-forest-100 shadow-sm overflow-hidden">
        <div className="bg-forest-50 border-b border-forest-100 px-6 py-4">
          <h2 className="font-semibold text-forest-800">Your Stay</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
          <div className="px-6 py-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Check-in</p>
            <p className="font-semibold text-forest-800 text-sm">{formatDate(stay.check_in)}</p>
            <p className="text-xs text-gray-500 mt-0.5">from 15:00</p>
          </div>
          <div className="px-6 py-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Check-out</p>
            <p className="font-semibold text-forest-800 text-sm">{formatDate(stay.check_out)}</p>
            <p className="text-xs text-gray-500 mt-0.5">by 11:00</p>
          </div>
          <div className="px-6 py-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Duration</p>
            <p className="font-semibold text-forest-800 text-sm">{nights} {nights === 1 ? 'night' : 'nights'}</p>
          </div>
          <div className="px-6 py-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Guests</p>
            <p className="font-semibold text-forest-800 text-sm">{stay.guests} {stay.guests === 1 ? 'person' : 'people'}</p>
          </div>
        </div>
      </div>

      {/* Keybox code */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${
        showKeybox ? 'bg-forest-700 border-forest-600' : 'bg-white border-gray-100'
      }`}>
        <div className={`px-6 py-4 border-b ${
          showKeybox ? 'border-forest-600' : 'border-gray-100'
        }`}>
          <h2 className={`font-semibold ${showKeybox ? 'text-white' : 'text-forest-800'}`}>
            Key Box Code
          </h2>
        </div>
        <div className="px-6 py-6 text-center">
          {showKeybox && stay.keybox_code ? (
            <>
              <p className="text-forest-200 text-sm mb-4">
                Enter this code on the key box to access the property
              </p>
              <div className="inline-block bg-forest-900/50 rounded-xl px-8 py-4">
                <span className="font-mono text-4xl font-bold tracking-[0.25em] text-white">
                  {stay.keybox_code}
                </span>
              </div>
              <p className="text-forest-300 text-xs mt-4">
                Keep this code confidential
              </p>
            </>
          ) : (
            <>
              <div className="text-gray-300 mb-3">
                <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Available 24 hours before check-in</p>
              <p className="text-gray-400 text-sm mt-1">
                The key box code will appear here on {formatDate(stay.check_in)} from 15:00
              </p>
            </>
          )}
        </div>
      </div>

      {/* Notes from host */}
      {stay.notes && (
        <div className="bg-cream-50 border border-cream-200 rounded-2xl px-6 py-5">
          <h2 className="font-semibold text-wood-800 mb-2">Note from your host</h2>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{stay.notes}</p>
        </div>
      )}

      {/* Quick links */}
      <div>
        <h2 className="font-semibold text-forest-800 mb-4">Guest Guide</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="
                bg-white rounded-xl border border-gray-100 shadow-sm
                px-5 py-5
                hover:border-forest-300 hover:shadow-md
                transition-all group
              "
            >
              <div className="text-forest-600 mb-3 group-hover:text-forest-700 transition-colors">
                {link.icon}
              </div>
              <h3 className="font-semibold text-forest-800 text-sm mb-1">{link.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
