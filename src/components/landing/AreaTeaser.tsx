'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { IconBadge, type SiteIconName } from '@/components/icons/SiteIcon';

type Activity = {
  icon: SiteIconName;
  title: string;
  description: string;
};

const copy = {
  en: {
    eyebrow: 'Discover Hälsingland',
    title: 'A Region Rich in Nature & Culture',
    intro:
      'Our retreat is nestled in the heart of Hälsingland, a region celebrated for its vast forests, the majestic Ljusnan river, and a living cultural heritage. From UNESCO-listed decorated farmhouses to endless outdoor adventures, there is something for everyone in every season.',
    cta: 'Explore the Area Guide',
    activities: [
      {
        icon: 'mountain',
        title: 'Hiking & Nature',
        description: 'Explore pristine forests, trails along the Ljusnan river, and scenic mountain paths.',
      },
      {
        icon: 'outdoor',
        title: 'Fishing',
        description: 'World-class fishing in the Ljusnan river and surrounding lakes, grayling, trout, and pike.',
      },
      {
        icon: 'snow',
        title: 'Winter Sports',
        description: 'Cross-country skiing, snowmobiling, and downhill slopes within easy reach.',
      },
      {
        icon: 'heritage',
        title: 'UNESCO Heritage',
        description: "Hälsingland's decorated farmhouses are a UNESCO World Heritage Site and a must-see.",
      },
    ] satisfies Activity[],
  },
  sv: {
    eyebrow: 'Upptäck Hälsingland',
    title: 'En region rik på natur och kultur',
    intro:
      'Huset ligger i hjärtat av Hälsingland, en region med stora skogar, Ljusnan och ett levande kulturarv. Här finns allt från världsarvsklassade hälsingegårdar till äventyr utomhus, oavsett årstid.',
    cta: 'Utforska området',
    activities: [
      {
        icon: 'mountain',
        title: 'Vandring och natur',
        description: 'Utforska skogar, leder längs Ljusnan och vackra stigar i närområdet.',
      },
      {
        icon: 'outdoor',
        title: 'Fiske',
        description: 'Fina fiskemöjligheter i Ljusnan och sjöarna runt omkring med harr, öring och gädda.',
      },
      {
        icon: 'snow',
        title: 'Vinteraktiviteter',
        description: 'Längdskidor, skoterleder och utförsåkning finns inom räckhåll.',
      },
      {
        icon: 'heritage',
        title: 'UNESCO-världsarv',
        description: 'Hälsinglands dekorerade gårdar är ett världsarv och väl värda ett besök.',
      },
    ] satisfies Activity[],
  },
};

export default function AreaTeaser() {
  const { locale } = useLanguage();
  const t = copy[locale];

  return (
    <section className="bg-cream-50 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="container-wide">
        <div className="grid min-w-0 gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-falu-700">
              {t.eyebrow}
            </p>
            <h2 className="mb-4 text-3xl font-bold leading-tight text-[#17123b] md:text-4xl">
              {t.title}
            </h2>
            <p className="mb-6 text-sm leading-7 text-gray-600 md:text-base">
              {t.intro}
            </p>
            <Link href="/area-guide" className="btn-secondary !rounded-full">
              {t.cta}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {t.activities.map((activity) => (
              <div key={activity.title} className="rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-sm md:p-5">
                <IconBadge name={activity.icon} className="mb-4 size-11" iconClassName="size-5" />
                <h3 className="mb-1 text-sm font-semibold text-[#17123b] md:text-base">{activity.title}</h3>
                <p className="text-xs leading-5 text-gray-600 md:text-sm">{activity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
