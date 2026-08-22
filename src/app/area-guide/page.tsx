'use client';

import { useState, useEffect, useCallback } from 'react';
import PublicImageHero from '@/components/layout/PublicImageHero';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { SiteIcon, iconForCategory, type SiteIconName } from '@/components/icons/SiteIcon';
import { localizedNullableText, localizedText } from '@/lib/localized-content';

type FavoritePlace = {
  id: string;
  name: string;
  name_sv: string | null;
  description: string | null;
  description_sv: string | null;
  category: string;
  icon: string | null;
  url: string | null;
  distance: string | null;
  owner_tips: string | null;
  owner_tips_sv: string | null;
};

type GroupedPlaces = Record<string, FavoritePlace[]>;

const CATEGORY_CONFIG: Record<string, { label: { en: string; sv: string }; icon: SiteIconName; color: string }> = {
  culture:  { label: { en: 'Culture & Heritage', sv: 'Kultur och arv' }, icon: 'heritage', color: 'bg-falu-50 border-falu-200 text-falu-800' },
  family:   { label: { en: 'Family Activities', sv: 'Familjeaktiviteter' }, icon: 'users', color: 'bg-wood-50 border-wood-200 text-wood-800' },
  winter:   { label: { en: 'Winter Activities', sv: 'Vinteraktiviteter' }, icon: 'snow', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  nature:   { label: { en: 'Nature & Wildlife', sv: 'Natur och djurliv' }, icon: 'nature', color: 'bg-forest-50 border-forest-200 text-forest-800' },
  outdoor:  { label: { en: 'Outdoor & Adventure', sv: 'Friluftsliv och äventyr' }, icon: 'outdoor', color: 'bg-forest-50 border-forest-200 text-forest-800' },
  dining:   { label: { en: 'Dining & Cafés', sv: 'Mat och caféer' }, icon: 'coffee', color: 'bg-cream-100 border-cream-300 text-cream-900' },
  activity: { label: { en: 'Activities', sv: 'Aktiviteter' }, icon: 'activity', color: 'bg-wood-50 border-wood-200 text-wood-800' },
};

const pageCopy = {
  en: {
    heroEyebrow: 'Area Guide',
    heroTitle: 'Forests, river days and Hälsingland culture',
    heroDescription:
      'A guide to the local places, seasons and small discoveries that make the stay feel rooted in Färila.',
    unescoTitle: 'UNESCO World Heritage',
    unescoText:
      'The decorated farmhouses of Hälsingland are a UNESCO World Heritage Site. These magnificent timber buildings, with their lavishly painted interiors, represent the pinnacle of Scandinavian folk art and are found throughout the region. Several are open to visitors during summer.',
    unescoNote:
      'Notable decorated farmhouse visits in the region: Gästgivars in Stene, Erik-Anders in Asta, and Pallars in Långhed.',
    loadingRecommendations: 'Loading local recommendations...',
    localRecommendations: 'Local Recommendations',
    ownersTip: "Owner's tip:",
    visitWebsite: 'Visit website',
    activitiesBySeason: 'Activities by Season',
    nearbyTowns: 'Nearby Towns',
    seasons: [
      {
        name: 'Summer',
        period: 'Jun-Aug',
        icon: 'sun' as SiteIconName,
        color: 'bg-amber-50 border-amber-200',
        headingColor: 'text-amber-800',
        activities: [
          'Swimming in lakes and the Ljusnan river',
          'Hiking the Hälsingeleden trail (160 km)',
          'Fishing, grayling, trout, and pike',
          'Berry and mushroom picking (Allemansrätten)',
          'Visiting UNESCO decorated farmhouses',
          'Midsummer celebrations',
          'Cycling the Dellenbanan route',
        ],
      },
      {
        name: 'Autumn',
        period: 'Sep-Nov',
        icon: 'nature' as SiteIconName,
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
        period: 'Dec-Feb',
        icon: 'snow' as SiteIconName,
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
        period: 'Mar-May',
        icon: 'sun' as SiteIconName,
        color: 'bg-forest-50 border-forest-200',
        headingColor: 'text-forest-800',
        activities: [
          'Bird watching, cranes and migratory birds',
          'Early hiking as snow melts',
          'Spring fishing season',
          'Walpurgis Night celebrations',
          'Wildflower meadows',
        ],
      },
    ],
    nearby: [
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
        description: 'A major city with a large airport, shopping centres, and rich cultural offerings, a great day-trip destination.',
      },
    ],
  },
  sv: {
    heroEyebrow: 'Området',
    heroTitle: 'Skogar, älvdagar och hälsingekultur',
    heroDescription:
      'En guide till lokala platser, årstider och små upptäckter som gör vistelsen förankrad i Färila.',
    unescoTitle: 'UNESCO-världsarv',
    unescoText:
      'Hälsinglands dekorerade gårdar är ett UNESCO-världsarv. De praktfulla timmerbyggnaderna med rikt målade interiörer är en höjdpunkt inom nordisk folkkonst och finns runt om i regionen. Flera gårdar är öppna för besök under sommaren.',
    unescoNote:
      'Tips på besök i regionen: Gästgivars i Stene, Erik-Anders i Asta och Pallars i Långhed.',
    loadingRecommendations: 'Laddar lokala rekommendationer...',
    localRecommendations: 'Lokala rekommendationer',
    ownersTip: 'Ägarnas tips:',
    visitWebsite: 'Besök webbplats',
    activitiesBySeason: 'Aktiviteter efter säsong',
    nearbyTowns: 'Närliggande orter',
    seasons: [
      {
        name: 'Sommar',
        period: 'Jun-aug',
        icon: 'sun' as SiteIconName,
        color: 'bg-amber-50 border-amber-200',
        headingColor: 'text-amber-800',
        activities: [
          'Bad i sjöar och Ljusnan',
          'Vandring på Hälsingeleden (160 km)',
          'Fiske efter harr, öring och gädda',
          'Bär- och svampplockning med allemansrätten',
          'Besök på världsarvsklassade hälsingegårdar',
          'Midsommarfirande',
          'Cykling längs Dellenbanan',
        ],
      },
      {
        name: 'Höst',
        period: 'Sep-nov',
        icon: 'nature' as SiteIconName,
        color: 'bg-orange-50 border-orange-200',
        headingColor: 'text-orange-800',
        activities: [
          'Starka höstfärger i gamla skogar',
          'Svampplockning',
          'Vackra bilutflykter genom Hälsingland',
          'Jaktsäsong',
          'Mysiga kvällar vid eldstaden',
        ],
      },
      {
        name: 'Vinter',
        period: 'Dec-feb',
        icon: 'snow' as SiteIconName,
        color: 'bg-blue-50 border-blue-200',
        headingColor: 'text-blue-800',
        activities: [
          'Utförsåkning i Järvsöbacken (20 nedfarter)',
          'Längdskidåkning',
          'Skoteråkning',
          'Pimpling',
          'Norrskensspaning',
          'Julmarknader',
        ],
      },
      {
        name: 'Vår',
        period: 'Mar-maj',
        icon: 'sun' as SiteIconName,
        color: 'bg-forest-50 border-forest-200',
        headingColor: 'text-forest-800',
        activities: [
          'Fågelskådning med tranor och flyttfåglar',
          'Tidiga vandringar när snön smälter',
          'Vårfiske',
          'Valborgsfirande',
          'Vilda blomsterängar',
        ],
      },
    ],
    nearby: [
      {
        place: 'Ljusdal',
        description: 'Närmaste tätort med mataffärer, restauranger, apotek och tågstation med vidare förbindelser.',
      },
      {
        place: 'Järvsö',
        description: 'En populär besöksort med skidbacke, Järvsö Djurpark och flera äventyrsaktiviteter.',
      },
      {
        place: 'Hudiksvall',
        description: 'En charmig kuststad med shopping, restauranger och regional flygplats.',
      },
      {
        place: 'Sundsvall',
        description: 'En större stad med flygplats, shopping och kulturutbud, bra för en dagsutflykt.',
      },
    ],
  },
};

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

function FavoritePlaceCard({
  place,
  locale,
  ownersTip,
  visitWebsite,
}: {
  place: FavoritePlace;
  locale: 'en' | 'sv';
  ownersTip: string;
  visitWebsite: string;
}) {
  const config = CATEGORY_CONFIG[place.category] ?? { label: { en: place.category, sv: place.category }, icon: iconForCategory(place.category), color: 'bg-gray-50 border-gray-200 text-gray-800' };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:border-forest-300 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#17123b] text-white">
            <SiteIcon name={config.icon} className="size-5" />
          </span>
          <h3 className="font-semibold text-forest-800 leading-tight">{localizedText(locale, place.name, place.name_sv)}</h3>
        </div>
        {place.distance && (
          <span className="text-xs bg-cream-100 text-cream-900 border border-cream-200 rounded-full px-2.5 py-0.5 whitespace-nowrap flex-shrink-0">
            {place.distance}
          </span>
        )}
      </div>
      {localizedNullableText(locale, place.description, place.description_sv) && (
        <p className="text-sm text-gray-600 leading-relaxed">{localizedNullableText(locale, place.description, place.description_sv)}</p>
      )}
      {localizedNullableText(locale, place.owner_tips, place.owner_tips_sv) && (
        <div className="bg-cream-50 border-l-4 border-wood-400 rounded-r-lg px-3 py-2">
          <p className="text-sm text-wood-700 italic">{ownersTip} {localizedNullableText(locale, place.owner_tips, place.owner_tips_sv)}</p>
        </div>
      )}
      {place.url && (
        <a
          href={place.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-forest-600 hover:text-forest-800 hover:underline transition-colors mt-auto"
        >
          {visitWebsite} &rarr;
        </a>
      )}
    </div>
  );
}

export default function AreaGuidePage() {
  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLanguage();
  const t = pageCopy[locale];

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
    <>
      <PublicImageHero
        eyebrow={t.heroEyebrow}
        title={t.heroTitle}
        description={t.heroDescription}
      />
      <div className="section-padding">
        <div className="container-wide">

        {/* UNESCO Section */}
        <section className="mb-16">
          <div className="bg-falu-50 border border-falu-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-falu-800 mb-4">{t.unescoTitle}</h2>
            <p className="text-gray-700 mb-4">
              {t.unescoText}
            </p>
            <p className="text-sm text-falu-700">
              {t.unescoNote}
            </p>
          </div>
        </section>

        {/* Favorite places from API */}
        {loading ? (
          <section className="mb-16">
            <div className="flex items-center justify-center py-16 text-gray-400">
              <SpinnerIcon />
              <span className="ml-3 text-sm">{t.loadingRecommendations}</span>
            </div>
          </section>
        ) : Object.keys(grouped).length > 0 ? (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-forest-800 mb-8 text-center">{t.localRecommendations}</h2>
            <div className="space-y-10">
              {Object.entries(grouped).map(([cat, places]) => {
                const config = CATEGORY_CONFIG[cat] ?? { label: { en: cat, sv: cat }, icon: iconForCategory(cat), color: '' };
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="grid size-9 place-items-center rounded-xl bg-[#17123b] text-white">
                        <SiteIcon name={config.icon} className="size-4" />
                      </span>
                      <h3 className="text-lg font-semibold text-forest-800">{config.label[locale]}</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {places.map((place) => (
                        <FavoritePlaceCard key={place.id} place={place} locale={locale} ownersTip={t.ownersTip} visitWebsite={t.visitWebsite} />
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
          <h2 className="text-2xl font-bold text-forest-800 mb-8 text-center">{t.activitiesBySeason}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {t.seasons.map((season) => (
              <div key={season.name} className={`rounded-xl border p-6 ${season.color}`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/70">
                    <SiteIcon name={season.icon} className="size-5" />
                  </span>
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
          <h2 className="text-2xl font-bold text-forest-800 mb-8 text-center">{t.nearbyTowns}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.nearby.map((item) => (
              <div key={item.place} className="bg-cream-50 rounded-xl border border-cream-200 p-5">
                <h3 className="font-semibold text-forest-800 mb-2">{item.place}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
        </div>
      </div>
    </>
  );
}
