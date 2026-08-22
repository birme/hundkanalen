'use client';

import { useLanguage } from '@/components/i18n/LanguageProvider';
import { IconBadge, type SiteIconName } from '@/components/icons/SiteIcon';

type Highlight = {
  icon: SiteIconName;
  title: string;
  description: string;
};

const copy = {
  en: {
    eyebrow: 'The Property',
    title: 'Built for slow days',
    intro:
      'A lovingly renovated 1920s villa that blends authentic Swedish character with modern comfort, set in the peaceful countryside of Hälsingland.',
    highlights: [
      {
        icon: 'home',
        title: '160 m² Living Space',
        description: 'A spacious 6-room renovated villa from the 1920s with generous room for the whole family.',
      },
      {
        icon: 'bed',
        title: '4-5 Bedrooms',
        description: 'Flexible sleeping arrangements for up to 10 guests, ideal for families or groups of friends.',
      },
      {
        icon: 'kitchen',
        title: 'Modern Kitchen',
        description: 'Fully equipped kitchen for preparing meals together, with modern appliances and ample counter space.',
      },
      {
        icon: 'fireplace',
        title: 'Fireplace',
        description: 'Cozy up by the fireplace on chilly evenings, the heart of the home for warm gatherings.',
      },
      {
        icon: 'sun',
        title: 'Spacious Terrace',
        description: 'Enjoy outdoor dining and evening relaxation on the terrace overlooking the garden.',
      },
      {
        icon: 'snow',
        title: 'Air Conditioning',
        description: 'Stay comfortable year-round with modern climate control throughout the house.',
      },
    ] satisfies Highlight[],
  },
  sv: {
    eyebrow: 'Huset',
    title: 'Byggt för lugna dagar',
    intro:
      'En varsamt renoverad 1920-talsvilla som kombinerar svensk huskänsla med modern komfort i den stilla hälsingemiljön.',
    highlights: [
      {
        icon: 'home',
        title: '160 m² boyta',
        description: 'En rymlig renoverad sexrumsvilla från 1920-talet med gott om plats för hela familjen.',
      },
      {
        icon: 'bed',
        title: '4-5 sovrum',
        description: 'Flexibla sovplatser för upp till 10 gäster, perfekt för familjer eller kompisgäng.',
      },
      {
        icon: 'kitchen',
        title: 'Modernt kök',
        description: 'Fullt utrustat kök för gemensam matlagning, med moderna vitvaror och bra arbetsytor.',
      },
      {
        icon: 'fireplace',
        title: 'Eldstad',
        description: 'Samlas vid eldstaden under kyliga kvällar, ett varmt hjärta i huset.',
      },
      {
        icon: 'sun',
        title: 'Rymlig altan',
        description: 'Njut av måltider utomhus och lugna kvällar på altanen mot trädgården.',
      },
      {
        icon: 'snow',
        title: 'Luftkonditionering',
        description: 'Modern klimatkontroll gör huset bekvämt året runt.',
      },
    ] satisfies Highlight[],
  },
};

export default function PropertyHighlights() {
  const { locale } = useLanguage();
  const t = copy[locale];

  return (
    <section className="bg-cream-50 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="container-wide">
        <div className="mb-6 flex items-end justify-between gap-4 md:mb-12 md:text-center">
          <div className="md:mx-auto">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-falu-700">{t.eyebrow}</p>
            <h2 className="text-3xl font-bold leading-tight text-[#17123b] md:text-4xl">{t.title}</h2>
          </div>
          <span className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#17123b] shadow-sm md:hidden">
            160 m²
          </span>
        </div>
        <p className="mb-6 max-w-2xl text-sm leading-6 text-gray-600 md:mx-auto md:mb-12 md:text-center md:text-base">
            {t.intro}
        </p>
        <div className="flex min-w-0 snap-x gap-4 overflow-x-auto pb-3 overscroll-x-contain md:grid md:grid-cols-2 md:gap-6 md:overflow-visible lg:grid-cols-3">
          {t.highlights.map((item) => (
            <div
              key={item.title}
              className="min-w-[78%] snap-start rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur md:min-w-0 md:p-6"
            >
              <IconBadge name={item.icon} className="mb-5" />
              <h3 className="mb-2 text-lg font-semibold text-[#17123b]">{item.title}</h3>
              <p className="text-sm leading-6 text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
