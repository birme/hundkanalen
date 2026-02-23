import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { formatSEK, formatDateShort, daysBetween } from '@/lib/utils';
import StayStatusBadge from '@/components/admin/StayStatusBadge';

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
  created_at: string;
  updated_at: string;
};

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

async function autoUpdateStatuses() {
  const sql = getDb();
  const today = new Date().toISOString().split('T')[0];

  await sql`
    UPDATE stays
    SET status = 'active', updated_at = NOW()
    WHERE status = 'upcoming'
      AND check_in <= ${today}::date
      AND check_out >= ${today}::date
  `;

  await sql`
    UPDATE stays
    SET status = 'completed', updated_at = NOW()
    WHERE status IN ('upcoming', 'active')
      AND check_out < ${today}::date
  `;
}

export default async function AdminStaysPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session || session.user?.role !== 'admin') {
    redirect('/login?callbackUrl=/admin/stays');
  }

  const { status: statusFilter } = await searchParams;

  const sql = getDb();
  await autoUpdateStatuses();

  const stays: Stay[] = statusFilter
    ? await sql<Stay[]>`
        SELECT * FROM stays
        WHERE status = ${statusFilter}
        ORDER BY check_in DESC
      `
    : await sql<Stay[]>`
        SELECT * FROM stays
        ORDER BY check_in DESC
      `;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-forest-800">Stays</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage all guest stays at Färila anno 1923
          </p>
        </div>
        <Link href="/admin/stays/new" className="btn-primary text-sm">
          + Create Stay
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200 overflow-x-auto whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
        {STATUS_TABS.map((tab) => {
          const isActive = (statusFilter ?? '') === tab.key;
          const href = tab.key ? `/admin/stays?status=${tab.key}` : '/admin/stays';
          return (
            <Link
              key={tab.key}
              href={href}
              className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2 ${
                isActive
                  ? 'border-forest-600 text-forest-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {stays.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="mx-auto size-10 text-gray-300 mb-3"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
            <p className="text-sm font-medium text-gray-500">No stays found</p>
            {statusFilter && (
              <p className="text-xs text-gray-400 mt-1">
                There are no {statusFilter} stays.{' '}
                <Link href="/admin/stays" className="text-forest-600 hover:text-forest-700 underline">
                  View all stays
                </Link>
              </p>
            )}
            {!statusFilter && (
              <p className="text-xs text-gray-400 mt-1">
                Create your first stay to get started.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Guest
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Check-in
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Check-out
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Nights
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Guests
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Price
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Code
                  </th>
                  <th className="px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stays.map((stay) => (
                  <tr
                    key={stay.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {stay.guest_name}
                        </p>
                        {stay.guest_email && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {stay.guest_email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {formatDateShort(stay.check_in)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {formatDateShort(stay.check_out)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">
                      {daysBetween(stay.check_in, stay.check_out)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">
                      {stay.guests}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {formatSEK(stay.total_price)}
                    </td>
                    <td className="px-6 py-4">
                      <StayStatusBadge status={stay.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 rounded px-2 py-1 tracking-widest">
                        {stay.access_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/stays/${stay.id}`}
                        className="text-sm font-medium text-forest-600 hover:text-forest-800 transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {stays.length > 0 && (
        <p className="text-xs text-gray-400 mt-3 text-right">
          {stays.length} {stays.length === 1 ? 'stay' : 'stays'} shown
        </p>
      )}
    </div>
  );
}
