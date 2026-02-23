import Link from 'next/link';

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <Link href="/guest" className="text-sm text-forest-600 hover:text-forest-800 mb-4 inline-block">
        &larr; Back to dashboard
      </Link>
      <h1 className="text-3xl font-bold text-forest-800 mb-4">Booking Details</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-500">
          Booking ID: <span className="font-mono text-sm">{params.id}</span>
        </p>
        <p className="text-sm text-gray-400 mt-4 italic">
          Booking details will appear here once the booking system is fully connected.
        </p>
      </div>
    </div>
  );
}
