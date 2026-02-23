'use client';

import { useState, useEffect, useCallback } from 'react';

type FavoritePlace = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  url: string | null;
  distance: string | null;
  owner_tips: string | null;
};

type GroupedPlaces = Record<string, FavoritePlace[]>;

const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  culture:  { label: 'Culture & Heritage', icon: '🏛️', color: 'bg-falu-50 border-falu-200 text-falu-800' },
  family:   { label: 'Family Activities',  icon: '👨‍👩‍👧', color: 'bg-wood-50 border-wood-200 text-wood-800' },
  winter:   { label: 'Winter Activities',  icon: '⛷️', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  nature:   { label: 'Nature & Wildlife',  icon: '🌿', color: 'bg-forest-50 border-forest-200 text-forest-800' },
  outdoor:  { label: 'Outdoor & Adventure',icon: '🥾', color: 'bg-forest-50 border-forest-200 text-forest-800' },
  dining:   { label: 'Dining & Cafés',     icon: '☕', color: 'bg-cream-100 border-cream-300 text-cream-900' },
  activity: { label: 'Activities',         icon: '🎯', color: 'bg-wood-50 border-wood-200 text-wood-800' },
};

const seasons = [
  {
    name: 'Summer',
    period: 'Jun–Aug',
    icon: '☀️',
    color: 'bg-amber-50 border-amber-200',
    headingColor: 'text-amber-800',
    activities: [
      'Swimming in lakes and the Ljusnan river',
      'Hiking the Hälsingeleden trail (160 km)',
      'Fishing — grayling, trout, and pike',
      'Berry and mushroom picking (Allemansrätten)',
      'Visiting UNESCO decorated farmhouses',
      'Midsummer celebrations',
      'Cycling the Dellenbanan route',
    ],
  },
  {
    name: 'Autumn',
    period: 'Sep–Nov',
    icon: '🍂',
    color: 'bg-orange-50 border-orange-200',
    headingColor: 'text-orange-800',
    activities: [
      'Spectacular fall colors in ancient forests',
      'Mushroom foraging',
      'Scenic drives through Hälsingland',
      'Hunting season',
      'Cozy evenings by the fireplace',
    ],
  },
  {
    name: 'Winter',
    period: 'Dec–Feb',
    icon: '❄️',
    color: 'bg-blue-50 border-blue-200',
    headingColor: 'text-blue-800',
    activities: [
      'Downhill skiing at Järvsöbacken (20 pistes)',
      'Cross-country skiing',
      'Snowmobiling',
      'Ice fishing',
      'Northern lights viewing',
      'Christmas markets',
    ],
  },
  {
    name: 'Spring',
    period: 'Mar–May',
    icon: '🌸',
    color: 'bg-green-50 border-green-200',
    headingColor: 'text-green-800',
    activities: [
      'Bird watching — cranes and migratory birds',
      'Early hiking as snow melts',
      'Spring fishing season',
      'Walpurgis Night celebrations',
      'Wildflower meadows',
    ],
  },
];

const nearby = [
  {
    place: 'Ljusdal',
    description: 'The nearest town, with supermarkets, restaurants, pharmacy, and a train station connecting to the wider rail network.',
  },
  {
    place: 'Järvsö',
    description: 'A popular tourist village with a top-rated ski resort, the Järvsö Djurpark bear and wolf park, and a range of adventure activities.',
  },
  {
    place: 'Hudiksvall',
    description: 'A charming coastal town offering good shopping, varied dining, and a regional airport.',
  },
  {
    place: 'Sundsvall',
    description: 'A major city with a large airport, shopping centres, and rich cultural offerings — a great day-trip destination.',
  },
];

function SpinnerIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg
      className={`${className} animate-spin`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>
  );
}

function FavoritePlaceCard({ place }: { place: FavoritePlace }) {
  const config = CATEGORY_CONFIG[place.category] ?? { label: place.category, icon: '📍', color: 'bg-gray-50 border-gray-200 text-gray-800' };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:border-forest-300 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">{place.icon || config.icon}</span>
          <h3 className="font-semibold text-forest-800 leading-tight">{place.name}</h3>
        </div>
        {place.distance && (
          <span className="text-xs bg-cream-100 text-cream-900 border border-cream-200 rounded-full px-2.5 py-0.5 whitespace-nowrap flex-shrink-0">
            {place.distance}
          </span>
        )}
      </div>
      {place.description && (
        <p className="text-sm text-gray-600 leading-relaxed">{place.description}</p>
      )}
      {place.owner_tips && (
        <div className="bg-cream-50 border-l-4 border-wood-400 rounded-r-lg px-3 py-2">
          <p className="text-sm text-wood-700 italic">Owner&apos;s tip: {place.owner_tips}</p>
        </div>
      )}
      {place.url && (
        <a
          href={place.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-forest-600 hover:text-forest-800 hover:underline transition-colors mt-auto"
        >
          Visit website &rarr;
        </a>
      )}
    </div>
  );
}

export default function AreaGuidePage() {
  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/public/favorites');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch {
      // Silently fail — static content still shows
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Group favorites by category, preserving CATEGORY_CONFIG order
  const grouped: GroupedPlaces = {};
  const categoryOrder = Object.keys(CATEGORY_CONFIG);
  for (const cat of categoryOrder) {
    const items = favorites.filter((f) => f.category === cat);
    if (items.length > 0) grouped[cat] = items;
  }
  // Any categories not in our config go at the end
  for (const fav of favorites) {
    if (!grouped[fav.category]) {
      grouped[fav.category] = favorites.filter((f) => f.category === fav.category);
    }
  }

  return (
    <div className="section-padding">
      <div className="container-wide">
        {/* Page header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-forest-800 mb-4">Area Guide</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hälsingland is a region of vast forests, the majestic Ljusnan river, and a living
            cultural heritage. Here is your guide to making the most of your stay.
          </p>
        </div>

        {/* UNESCO Section */}
        <section className="mb-16">
          <div className="bg-falu-50 border border-falu-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-falu-800 mb-4">UNESCO World Heritage</h2>
            <p className="text-gray-700 mb-4">
              The decorated farmhouses of Hälsingland are a UNESCO World Heritage Site. These
              magnificent timber buildings, with their lavishly painted interiors, represent the
              pinnacle of Scandinavian folk art and are found throughout the region. Several are
              open to visitors during summer.
            </p>
            <p className="text-sm text-falu-700">
              Notable decorated farmhouse visits in the region: Gästgivars in Stene, Erik-Anders
              in Asta, and Pallars in Långhed.
            </p>
          </div>
        </section>

        {/* Favorite places from API */}
        {loading ? (
          <section className="mb-16">
            <div className="flex items-center justify-center py-16 text-gray-400">
              <SpinnerIcon />
              <span className="ml-3 text-sm">Loading local recommendations...</span>
            </div>
          </section>
        ) : Object.keys(grouped).length > 0 ? (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-forest-800 mb-8 text-center">Local Recommendations</h2>
            <div className="space-y-10">
              {Object.entries(grouped).map(([cat, places]) => {
                const config = CATEGORY_CONFIG[cat] ?? { label: cat, icon: '📍', color: '' };
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl" aria-hidden="true">{config.icon}</span>
                      <h3 className="text-lg font-semibold text-forest-800">{config.label}</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {places.map((place) => (
                        <FavoritePlaceCard key={place.id} place={place} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* Seasons */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-forest-800 mb-8 text-center">Activities by Season</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {seasons.map((season) => (
              <div key={season.name} className={`rounded-xl border p-6 ${season.color}`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl" aria-hidden="true">{season.icon}</span>
                  <div>
                    <h3 className={`font-semibold text-lg leading-tight ${season.headingColor}`}>{season.name}</h3>
                    <p className="text-xs text-gray-500">{season.period}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {season.activities.map((activity) => (
                    <li key={activity} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-forest-500 mt-0.5 flex-shrink-0">&#10003;</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Nearby towns */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-forest-800 mb-8 text-center">Nearby Towns</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {nearby.map((item) => (
              <div key={item.place} className="bg-cream-50 rounded-xl border border-cream-200 p-5">
                <h3 className="font-semibold text-forest-800 mb-2">{item.place}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
