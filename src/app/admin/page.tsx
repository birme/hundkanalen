import { auth } from '@/lib/auth';

export default async function AdminDashboard() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-forest-800 mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Welcome back, {session?.user?.name || 'Admin'}. Manage your property and bookings.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Bookings', value: '0', color: 'bg-forest-50 text-forest-700' },
          { label: 'Upcoming Check-ins', value: '0', color: 'bg-wood-50 text-wood-700' },
          { label: 'Pending Inquiries', value: '0', color: 'bg-cream-100 text-cream-800' },
          { label: 'Total Revenue (SEK)', value: '0', color: 'bg-falu-50 text-falu-700' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-5 ${stat.color}`}>
            <p className="text-sm font-medium opacity-80">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-forest-800 text-lg mb-4">Recent Bookings</h2>
          <p className="text-sm text-gray-400 italic">No bookings yet. They will appear here once guests start booking.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-forest-800 text-lg mb-4">Recent Inquiries</h2>
          <p className="text-sm text-gray-400 italic">No inquiries yet. Contact form submissions will appear here.</p>
        </div>
      </div>
    </div>
  );
}
