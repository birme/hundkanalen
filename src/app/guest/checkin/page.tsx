import Link from 'next/link';

export default function CheckinPage() {
  return (
    <div>
      <Link href="/guest" className="text-sm text-forest-600 hover:text-forest-800 mb-4 inline-block">
        &larr; Back to dashboard
      </Link>
      <h1 className="text-3xl font-bold text-forest-800 mb-4">Check-in Information</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-forest-800 text-lg mb-3">Arrival</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><strong>Check-in time:</strong> From 15:00</li>
            <li><strong>Check-out time:</strong> By 11:00</li>
            <li><strong>Address:</strong> Hundkanalen 3, 820 64 Färila</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-forest-800 text-lg mb-3">Access</h2>
          <p className="text-sm text-gray-600">
            Key and access instructions will be shared here 24 hours before your check-in date.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-forest-800 text-lg mb-3">House Rules</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>No smoking inside the house</li>
            <li>Pets are welcome — please clean up after them</li>
            <li>Quiet hours: 22:00–07:00</li>
            <li>Please sort waste for recycling</li>
            <li>Leave the house in the condition you found it</li>
          </ul>
        </div>

        <div className="bg-cream-50 border border-cream-200 rounded-xl p-6">
          <h2 className="font-semibold text-forest-800 mb-2">Emergency Contacts</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li><strong>Emergency (SOS):</strong> 112</li>
            <li><strong>Non-emergency police:</strong> 114 14</li>
            <li><strong>Healthcare advice:</strong> 1177</li>
            <li><strong>Host:</strong> hundkanalen@birme.se</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
