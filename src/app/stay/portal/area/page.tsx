export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getGuestSession } from '@/lib/guest-auth';

export default async function AreaGuidePage() {
  const session = await getGuestSession();
  if (!session) {
    redirect('/stay');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold text-forest-800">Explore the Area</h1>
        <p className="text-gray-500 mt-1">Hälsingland — forests, lakes, and living heritage</p>
      </div>

      {/* Intro */}
      <div className="bg-forest-50 border border-forest-200 rounded-2xl px-6 py-6">
        <h2 className="font-semibold text-forest-800 text-lg mb-3">Welcome to Hälsingland</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          Hälsingland is a region of vast forests, crystal-clear lakes, and the majestic Ljusnan river.
          The area is a UNESCO World Heritage Site, celebrated for its unique decorated farmhouses —
          magnificent timber buildings with lavishly painted interiors representing the pinnacle of
          Scandinavian folk art.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Whether you are here for outdoor adventures, cultural heritage, or simply to relax in the
          Swedish countryside, Hälsingland has something for every season. Färila is perfectly situated
          for exploring the best the region has to offer.
        </p>
      </div>

      {/* Highlights */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-5">
          <h3 className="font-semibold text-forest-700 mb-2">Outdoors</h3>
          <ul className="space-y-1.5 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-forest-500 mt-0.5 flex-shrink-0">&#10003;</span>
              Hiking and trail walking in boreal forests
            </li>
            <li className="flex items-start gap-2">
              <span className="text-forest-500 mt-0.5 flex-shrink-0">&#10003;</span>
              Fishing in Ljusnan and nearby lakes
            </li>
            <li className="flex items-start gap-2">
              <span className="text-forest-500 mt-0.5 flex-shrink-0">&#10003;</span>
              Swimming at local bathing spots in summer
            </li>
            <li className="flex items-start gap-2">
              <span className="text-forest-500 mt-0.5 flex-shrink-0">&#10003;</span>
              Cross-country &amp; downhill skiing in winter
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-5">
          <h3 className="font-semibold text-forest-700 mb-2">Culture &amp; Heritage</h3>
          <ul className="space-y-1.5 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-forest-500 mt-0.5 flex-shrink-0">&#10003;</span>
              UNESCO decorated farmhouses
            </li>
            <li className="flex items-start gap-2">
              <span className="text-forest-500 mt-0.5 flex-shrink-0">&#10003;</span>
              Järvsö village &amp; bear park (35 min)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-forest-500 mt-0.5 flex-shrink-0">&#10003;</span>
              Ljusdal town with restaurants &amp; shops (20 min)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-forest-500 mt-0.5 flex-shrink-0">&#10003;</span>
              Midsummer and seasonal celebrations
            </li>
          </ul>
        </div>
      </div>

      {/* Link to full area guide */}
      <div className="bg-wood-50 border border-wood-200 rounded-xl px-6 py-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-wood-800">Full Area Guide</p>
          <p className="text-sm text-wood-600 mt-0.5">
            Detailed information on activities, nearby places, and getting around
          </p>
        </div>
        <Link
          href="/area-guide"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline flex-shrink-0 text-sm"
        >
          View guide
        </Link>
      </div>
    </div>
  );
}
