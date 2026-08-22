'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { localizedNullableText } from '@/lib/localized-content';

type Photo = {
  id: string;
  caption: string | null;
  caption_sv: string | null;
  category: string | null;
};

const copy = {
  en: {
    gallery: 'Gallery',
    glimpse: 'A glimpse of what awaits you',
    comingSoon: 'Photos coming soon',
    seeHouse: 'See the house',
    allPhotos: 'All photos',
    propertyPhoto: 'Property photo',
  },
  sv: {
    gallery: 'Galleri',
    glimpse: 'En försmak av vad som väntar',
    comingSoon: 'Foton kommer snart',
    seeHouse: 'Se huset',
    allPhotos: 'Alla foton',
    propertyPhoto: 'Foto från huset',
  },
};

export default function PhotoGrid() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLanguage();
  const t = copy[locale];

  useEffect(() => {
    fetch('/api/public/photos')
      .then((res) => res.json())
      .then((data) => {
        setPhotos(Array.isArray(data) ? data.slice(0, 6) : []);
      })
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bg-[#17123b] px-4 py-10 text-white sm:px-6 sm:py-16 lg:px-8">
        <div className="container-wide">
          <div className="mb-6">
            <h2 className="text-3xl font-bold">{t.gallery}</h2>
            <p className="text-white/75">{t.glimpse}</p>
          </div>
          <div className="flex min-w-0 gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[72svh] min-w-full animate-pulse rounded-[2rem] bg-white/10 md:h-64 md:min-w-0 md:flex-1" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (photos.length === 0) {
    return (
      <section className="bg-[#17123b] px-4 py-10 text-white sm:px-6 sm:py-16 lg:px-8">
        <div className="container-wide">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center">
            <h2 className="mb-2 text-3xl font-bold">{t.gallery}</h2>
            <p className="text-white/75">{t.comingSoon}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#17123b] px-4 py-10 text-white sm:px-6 sm:py-16 lg:px-8">
      <div className="container-wide">
        <div className="mb-6 flex items-end justify-between gap-4 md:mb-10">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/70">{t.gallery}</p>
            <h2 className="text-3xl font-bold leading-tight md:text-4xl">{t.seeHouse}</h2>
          </div>
          <Link href="/gallery" className="rounded-full border border-white/15 bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/15 backdrop-blur-xl hover:bg-white/20">
            {t.allPhotos}
          </Link>
        </div>
        <div className="flex min-w-0 snap-x gap-4 overflow-x-auto pb-4 overscroll-x-contain md:grid md:grid-cols-3 md:overflow-visible">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className={`relative min-w-full snap-start overflow-hidden rounded-[2rem] bg-white/10 shadow-xl shadow-black/20 ${
                i === 0 ? 'h-[78svh] md:col-span-2 md:row-span-2 md:h-auto md:aspect-square' : 'h-[72svh] md:h-auto md:aspect-[4/3]'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/photos/${photo.id}`}
                alt={localizedNullableText(locale, photo.caption, photo.caption_sv) || t.propertyPhoto}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,10,36,0.04),rgba(13,10,36,0.72))]" />
              <div className="absolute inset-x-3 bottom-3 rounded-[1.5rem] border border-white/15 bg-[#17123b]/55 p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl">
                <p className="text-sm font-semibold">{localizedNullableText(locale, photo.caption, photo.caption_sv) || 'Färila anno 1923'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
