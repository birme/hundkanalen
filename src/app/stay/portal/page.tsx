export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getGuestSession } from '@/lib/guest-auth';
import { getDb } from '@/lib/db';
import { formatDate, daysBetween } from '@/lib/utils';

const JOURNEY_STEPS = [
  {
    number: 1,
    href: '/stay/portal/before',
    title: 'Before Your Stay',
    subtitle: 'What to pack and how to get here',
    emoji: '🧳',
  },
  {
    number: 2,
    href: '/stay/portal/access',
    title: 'How to Get In',
    subtitle: 'Key box code and access details',
    emoji: '🔑',
  },
  {
    number: 3,
    href: '/stay/portal/checkin',
    title: 'Check-in',
    subtitle: 'Arrival checklist',
    emoji: '🏠',
  },
  {
    number: 4,
    href: '/stay/portal/during',
    title: 'During Your Stay',
    subtitle: 'Activities, property info, and photos',
    emoji: '☀️',
  },
  {
    number: 5,
    href: '/stay/portal/checkout',
    title: 'Check-out',
    subtitle: 'Departure checklist',
    emoji: '👋',
  },
  {
    number: 6,
    href: '/stay/portal/farewell',
    title: 'See You Next Time',
    subtitle: 'Share your experience',
    emoji: '⭐',
  },
];

export default async function GuestPortalPage() {
  const session = await getGuestSession();
  if (!session) {
    redirect('/stay');
  }

  const sql = getDb();
  const [stay] = await sql`
    SELECT guest_name, check_in, check_out, guests
    FROM stays
    WHERE id = ${session.stayId}
    LIMIT 1
  `;

  if (!stay) {
    redirect('/stay');
  }

  const nights = daysBetween(stay.check_in, stay.check_out);
  const firstName = stay.guest_name.split(' ')[0];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-forest-800">
          Welcome, {firstName}!
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          {formatDate(stay.check_in)} &ndash; {formatDate(stay.check_out)} &middot; {nights} {nights === 1 ? 'night' : 'nights'} &middot; {stay.guests} {stay.guests === 1 ? 'guest' : 'guests'}
        </p>
      </div>

      {/* Journey timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-6 bottom-6 w-px bg-forest-200" aria-hidden="true" />

        <div className="space-y-3">
          {JOURNEY_STEPS.map((step) => (
            <Link
              key={step.number}
              href={step.href}
              className="relative flex items-center gap-4 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4 hover:border-forest-300 hover:shadow-md transition-all group active:scale-[0.98]"
            >
              {/* Step circle */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center text-lg z-10 group-hover:bg-forest-200 transition-colors">
                {step.emoji}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-forest-800 text-sm group-hover:text-forest-900">
                  {step.title}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">{step.subtitle}</p>
              </div>

              {/* Arrow */}
              <svg
                className="w-4 h-4 text-gray-300 group-hover:text-forest-500 transition-colors flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
