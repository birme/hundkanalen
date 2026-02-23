import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { formatSEK, formatDate, daysBetween } from '@/lib/utils';
import StayStatusBadge from '@/components/admin/StayStatusBadge';
import CopyButton from '@/components/admin/CopyButton';
import StayActions from './StayActions';
import StayEditForm from './StayEditForm';
import StayFavorites from './StayFavorites';

export const dynamic = 'force-dynamic';

type Stay = {
  id: string;
  guest_name: string;
  guest_email: string | null;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  access_code: string;
  keybox_code: string | null;
  notes: string | null;
  packing_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export default async function StayDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user?.role !== 'admin') {
    redirect('/login?callbackUrl=/admin/stays');
  }

  const { id } = await params;
  const sql = getDb();

  const [stay] = await sql<Stay[]>`SELECT * FROM stays WHERE id = ${id}`;
  if (!stay) {
    notFound();
  }

  const [review] = await sql`SELECT rating, message, created_at FROM guest_reviews WHERE stay_id = ${id} LIMIT 1`;

  const nights = daysBetween(stay.check_in, stay.check_out);
  const canCancel = stay.status !== 'cancelled' && stay.status !== 'completed';

  return (
    <div>
      {/* Back navigation */}
      <Link
        href="/admin/stays"
        className="text-sm text-forest-600 hover:text-forest-800 transition-colors mb-6 inline-flex items-center gap-1.5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="size-3.5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
        Back to Stays
      </Link>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-forest-800">{stay.guest_name}</h1>
            <StayStatusBadge status={stay.status} />
          </div>
          <p className="text-sm text-gray-500">
            Stay ID:{' '}
            <span className="font-mono text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">
              {stay.id}
            </span>
          </p>
        </div>

        {canCancel && (
          <StayActions stayId={stay.id} guestName={stay.guest_name} />
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main details — left two columns */}
        <div className="lg:col-span-2 space-y-5">

          {/* Access code */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Guest Access Code
            </h2>
            <div className="flex items-center gap-3 bg-cream-50 border border-cream-200 rounded-lg px-4 py-3">
              <span className="font-mono text-2xl font-bold tracking-[0.25em] text-forest-800 flex-1">
                {stay.access_code}
              </span>
              <CopyButton text={stay.access_code} label="Copy code" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this code with the guest so they can access their booking details
              and check-in information at{' '}
              <strong>hundkanalen.apps.osaas.io/stay</strong>.
            </p>
          </div>

          {/* Stay details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Stay Details
            </h2>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                  Check-in
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatDate(stay.check_in)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                  Check-out
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatDate(stay.check_out)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                  Duration
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  {nights} {nights === 1 ? 'night' : 'nights'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                  Guests
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  {stay.guests} {stay.guests === 1 ? 'person' : 'people'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                  Total Price
                </dt>
                <dd className="text-sm font-semibold text-gray-900">
                  {formatSEK(stay.total_price)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                  Price per Night
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatSEK(Math.round(stay.total_price / nights))}
                </dd>
              </div>
            </dl>
          </div>

          {/* Guest information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Guest Information
            </h2>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                  Name
                </dt>
                <dd className="text-sm font-medium text-gray-900">{stay.guest_name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                  Email
                </dt>
                <dd className="text-sm text-gray-900">
                  {stay.guest_email ? (
                    <a
                      href={`mailto:${stay.guest_email}`}
                      className="text-forest-600 hover:text-forest-800 transition-colors"
                    >
                      {stay.guest_email}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Not provided</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Notes */}
          {stay.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Internal Notes
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{stay.notes}</p>
            </div>
          )}

          {/* Packing notes */}
          {stay.packing_notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Guest Packing Notes
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{stay.packing_notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar — right column */}
        <div className="space-y-5">

          {/* Keybox code */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Keybox Code
            </h2>
            {stay.keybox_code ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold tracking-widest text-gray-900">
                  {stay.keybox_code}
                </span>
                <CopyButton text={stay.keybox_code} />
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Not set</p>
            )}
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Status
            </h2>
            <StayStatusBadge status={stay.status} />
            <p className="text-xs text-gray-400 mt-2">
              Status updates automatically based on check-in and check-out dates.
            </p>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Record Info
            </h2>
            <dl className="space-y-2.5">
              <div>
                <dt className="text-xs text-gray-400">Created</dt>
                <dd className="text-sm text-gray-700">
                  {formatDate(stay.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Last Updated</dt>
                <dd className="text-sm text-gray-700">
                  {formatDate(stay.updated_at)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Guest Review */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Guest Review
            </h2>
            {review ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none" aria-label={`${review.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= review.rating ? 'text-yellow-400' : 'text-gray-200'}
                      >
                        {star <= review.rating ? '★' : '☆'}
                      </span>
                    ))}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{review.rating}/5</span>
                </div>
                {review.message && (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.message}</p>
                )}
                <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No review submitted</p>
            )}
          </div>
        </div>
      </div>

      {/* Featured activities — full width below */}
      <div className="mt-8">
        <StayFavorites stayId={stay.id} />
      </div>

      {/* Edit form — full width below */}
      <div className="mt-4">
        <StayEditForm stay={stay} />
      </div>
    </div>
  );
}
