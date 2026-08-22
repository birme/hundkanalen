'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/i18n/LanguageProvider';

type Photo = {
  id: string;
  caption: string | null;
};

const copy = {
  en: {
    location: 'Färila, Hälsingland',
    description:
      'A warm countryside villa with old-house character, modern comfort and quiet access to forest, river and UNESCO heritage.',
    inquiry: 'Inquiry',
    photos: 'Photos',
    retreat: 'Countryside retreat',
    accessStay: 'Access your stay',
    sendInquiry: 'Send Inquiry',
    gallery: 'Gallery',
    driveFrom: 'Drive from',
    quickFacts: [
      { label: 'Guests', value: '10' },
      { label: 'Bedrooms', value: '4-5' },
      { label: 'Built', value: '1923' },
    ],
    chips: ['Villa', 'Families', 'Nature', 'Winter', 'Heritage'],
    features: ['Kitchen', 'Fireplace', 'Terrace'],
  },
  sv: {
    location: 'Färila, Hälsingland',
    description:
      'En varm lantvilla med gammal huskänsla, modern komfort och nära till skog, älv och världsarv.',
    inquiry: 'Förfrågan',
    photos: 'Foton',
    retreat: 'Lantlig retreat',
    accessStay: 'Öppna din vistelse',
    sendInquiry: 'Skicka förfrågan',
    gallery: 'Galleri',
    driveFrom: 'Bilresa från',
    quickFacts: [
      { label: 'Gäster', value: '10' },
      { label: 'Sovrum', value: '4-5' },
      { label: 'Byggt', value: '1923' },
    ],
    chips: ['Villa', 'Familjer', 'Natur', 'Vinter', 'Kulturarv'],
    features: ['Kök', 'Eldstad', 'Altan'],
  },
};

export default function Hero() {
  const [heroPhoto, setHeroPhoto] = useState<Photo | null>(null);
  const { locale } = useLanguage();
  const t = copy[locale];

  useEffect(() => {
    fetch('/api/public/photos')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setHeroPhoto(data[0]);
        }
      })
      .catch(() => setHeroPhoto(null));
  }, []);

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#15113a] text-white lg:min-h-[42rem]">
      <div className="absolute inset-0">
        {heroPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/photos/${heroPhoto.id}`}
            alt={heroPhoto.caption || 'Färila anno 1923'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(145deg,#243c2d,#7c2d45_58%,#c58b4a)]" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,10,36,0.22)_0%,rgba(13,10,36,0.10)_36%,rgba(13,10,36,0.74)_100%)] lg:bg-[linear-gradient(180deg,rgba(13,10,36,0.38)_0%,rgba(13,10,36,0.22)_34%,rgba(13,10,36,0.86)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,255,255,0.20),transparent_30%),linear-gradient(115deg,rgba(255,255,255,0.08),transparent_38%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-24 pt-24 sm:px-6 lg:min-h-[42rem] lg:px-8 lg:pb-14 lg:pt-28">
        <div className="grid min-w-0 gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="min-w-0 lg:rounded-[2rem] lg:border lg:border-white/15 lg:bg-[#0f0b2b]/36 lg:p-5 lg:shadow-2xl lg:shadow-black/25 lg:backdrop-blur-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-2 text-xs font-medium text-white/90 shadow-sm backdrop-blur-xl">
              <span className="grid size-6 place-items-center rounded-full bg-white/15">⌂</span>
              {t.location}
            </div>

            <h1 className="max-w-xl text-[3.15rem] font-bold leading-[0.92] tracking-normal drop-shadow-2xl [text-shadow:0_4px_28px_rgba(0,0,0,0.82)] sm:text-6xl lg:text-7xl">
              Färila anno 1923
            </h1>
            <p className="mt-4 hidden max-w-lg text-base leading-7 text-white/90 drop-shadow [text-shadow:0_2px_14px_rgba(0,0,0,0.65)] lg:block lg:text-lg">
              {t.description}
            </p>

            <div className="mt-5 grid max-w-xs grid-cols-2 gap-3 lg:hidden">
              <Link href="/contact" className="btn-primary !rounded-full !bg-white !px-5 !text-[#17123b] hover:!bg-cream-100">
                {t.inquiry}
              </Link>
              <Link href="/gallery" className="btn-outline !rounded-full !border-white/25 !bg-black/20 !px-5 !text-white backdrop-blur-xl hover:!bg-black/30">
                {t.photos}
              </Link>
            </div>

            <div className="mt-6 hidden gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex [&::-webkit-scrollbar]:hidden">
              {t.chips.map((chip, index) => (
                <span
                  key={chip}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm ${
                    index === 0
                      ? 'border-white/35 bg-white text-[#17123b] shadow-lg shadow-black/15'
                      : 'border-white/15 bg-white/15 text-white/90 backdrop-blur-xl'
                  }`}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="hidden min-w-0 lg:flex lg:flex-col lg:items-end lg:gap-3">
            <div className="w-full rounded-[2rem] border border-white/20 bg-[#17123b]/50 p-4 shadow-2xl shadow-black/25 backdrop-blur-2xl sm:p-5 lg:max-w-[28rem] xl:max-w-[30rem]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/55">{t.retreat}</p>
                  <h2 className="mt-1 text-2xl font-bold leading-tight">Färila anno 1923</h2>
                  <p className="mt-1 text-sm text-white/65">{t.location}</p>
                </div>
                <Link
                  href="/stay"
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-lg text-[#17123b] shadow-lg shadow-black/20"
                  aria-label={t.accessStay}
                >
                  →
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                {t.quickFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="min-w-0 rounded-3xl border border-white/10 bg-white/10 px-3 py-3 text-center backdrop-blur-xl sm:px-4"
                  >
                    <p className="text-xl font-bold sm:text-2xl">{fact.value}</p>
                    <p className="text-[11px] text-white/60 sm:text-xs">{fact.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link href="/contact" className="btn-primary !rounded-full !bg-white !px-5 !text-[#17123b] hover:!bg-cream-100">
                  {t.sendInquiry}
                </Link>
                <Link href="/gallery" className="btn-outline !rounded-full !border-white/25 !bg-white/10 !px-5 !text-white hover:!bg-white/15">
                  {t.gallery}
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-white/75">
                {t.features.map((item) => (
                  <div key={item} className="rounded-2xl bg-white/10 px-2 py-3 backdrop-blur-xl">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden justify-end lg:flex lg:w-full lg:max-w-[28rem] xl:max-w-[30rem]">
              <div className="w-full rounded-[1.5rem] border border-white/15 bg-white/15 px-5 py-3 text-center text-sm shadow-2xl backdrop-blur-2xl sm:max-w-[10rem]">
                <p className="text-xs text-white/60">{t.driveFrom}</p>
                <p className="text-lg font-bold">Stockholm</p>
                <p className="text-white/75">3.5-4 h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
