import { auth } from '@/lib/auth';
import Link from 'next/link';

export default async function GuestDashboard() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-forest-800 mb-2">
        Welcome, {session?.user?.name || 'Guest'}
      </h1>
      <p className="text-gray-600 mb-8">
        Here you can view your bookings and check-in information.
      </p>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-forest-800 text-lg mb-2">Your Bookings</h2>
          <p className="text-sm text-gray-500 mb-4">View upcoming and past stays.</p>
          <p className="text-sm text-gray-400 italic">No bookings yet.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-forest-800 text-lg mb-2">Check-in Info</h2>
          <p className="text-sm text-gray-500 mb-4">Access details for your upcoming stay.</p>
          <Link href="/guest/checkin" className="text-sm text-forest-600 hover:text-forest-800 font-medium">
            View check-in details &rarr;
          </Link>
        </div>
      </div>

      <div className="mt-8 bg-cream-50 border border-cream-200 rounded-xl p-6">
        <h2 className="font-semibold text-forest-800 mb-2">Need Help?</h2>
        <p className="text-sm text-gray-600">
          Contact us at <span className="text-forest-700 font-medium">hundkanalen@birme.se</span> for
          any questions about your stay.
        </p>
      </div>
    </div>
  );
}
