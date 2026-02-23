import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { formatSEK, formatDateShort, daysBetween } from '@/lib/utils';
import StayStatusBadge from '@/components/admin/StayStatusBadge';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await auth();
  const sql = getDb();

  // Auto-update statuses
  const today = new Date().toISOString().split('T')[0];
  await sql`
    UPDATE stays SET status = 'active', updated_at = NOW()
    WHERE status = 'upcoming' AND check_in <= ${today}::date AND check_out >= ${today}::date
  `;
  await sql`
    UPDATE stays SET status = 'completed', updated_at = NOW()
    WHERE status IN ('upcoming', 'active') AND check_out < ${today}::date
  `;

  const [upcomingResult] = await sql`SELECT COUNT(*)::int AS count FROM stays WHERE status = 'upcoming'`;
  const [activeResult] = await sql`SELECT COUNT(*)::int AS count FROM stays WHERE status = 'active'`;
  const [revenueResult] = await sql`SELECT COALESCE(SUM(total_price), 0)::int AS total FROM stays WHERE status IN ('completed', 'active')`;
  const [totalStaysResult] = await sql`SELECT COUNT(*)::int AS count FROM stays WHERE status != 'cancelled'`;

  const upcomingStays = await sql`
    SELECT * FROM stays WHERE status = 'upcoming' ORDER BY check_in ASC LIMIT 5
  `;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-forest-800 mb-1">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {session?.user?.name || 'Admin'}.
          </p>
        </div>
        <Link href="/admin/stays/new" className="btn-primary text-sm">
          + Create Stay
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl p-5 bg-forest-50 text-forest-700">
          <p className="text-sm font-medium opacity-80">Upcoming Stays</p>
          <p className="text-3xl font-bold mt-1">{upcomingResult.count}</p>
        </div>
        <div className="rounded-xl p-5 bg-wood-50 text-wood-700">
          <p className="text-sm font-medium opacity-80">Active Now</p>
          <p className="text-3xl font-bold mt-1">{activeResult.count}</p>
        </div>
        <div className="rounded-xl p-5 bg-cream-100 text-cream-800">
          <p className="text-sm font-medium opacity-80">Total Stays</p>
          <p className="text-3xl font-bold mt-1">{totalStaysResult.count}</p>
        </div>
        <div className="rounded-xl p-5 bg-falu-50 text-falu-700">
          <p className="text-sm font-medium opacity-80">Revenue</p>
          <p className="text-3xl font-bold mt-1">{formatSEK(revenueResult.total)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-forest-800 text-lg">Upcoming Stays</h2>
          <Link href="/admin/stays?status=upcoming" className="text-sm text-forest-600 hover:text-forest-800 transition-colors">
            View all
          </Link>
        </div>
        {upcomingStays.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No upcoming stays. Create one to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Guest</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Dates</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Nights</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Price</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Status</th>
                  <th className="pb-3"><span className="sr-only">View</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {upcomingStays.map((stay) => (
                  <tr key={stay.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 text-sm font-medium text-gray-900">{stay.guest_name}</td>
                    <td className="py-3 text-sm text-gray-700">
                      {formatDateShort(stay.check_in)} - {formatDateShort(stay.check_out)}
                    </td>
                    <td className="py-3 text-sm text-gray-700">{daysBetween(stay.check_in, stay.check_out)}</td>
                    <td className="py-3 text-sm font-medium text-gray-900">{formatSEK(stay.total_price)}</td>
                    <td className="py-3"><StayStatusBadge status={stay.status} /></td>
                    <td className="py-3 text-right">
                      <Link href={`/admin/stays/${stay.id}`} className="text-sm text-forest-600 hover:text-forest-800">
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
    </div>
  );
}
