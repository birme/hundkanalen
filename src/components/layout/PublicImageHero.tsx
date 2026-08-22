'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { localizedNullableText } from '@/lib/localized-content';

type Photo = {
  id: string;
  caption: string | null;
  caption_sv: string | null;
};

type PublicImageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: 'center' | 'left';
};

export default function PublicImageHero({
  eyebrow,
  title,
  description,
  align = 'center',
}: PublicImageHeroProps) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const { locale } = useLanguage();

  useEffect(() => {
    fetch('/api/public/photos')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPhoto(data[0]);
        }
      })
      .catch(() => setPhoto(null));
  }, []);

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-[#17123b] px-4 pb-24 pt-24 text-white sm:px-6 md:min-h-[34rem] md:pb-14 md:pt-28 lg:px-8">
      <div className="absolute inset-0">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/photos/${photo.id}`}
            alt={localizedNullableText(locale, photo.caption, photo.caption_sv) || title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(145deg,#17123b,#4f28ad_55%,#df8510)]" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,10,36,0.38)_0%,rgba(13,10,36,0.28)_34%,rgba(13,10,36,0.84)_100%)] md:bg-[linear-gradient(180deg,rgba(13,10,36,0.42)_0%,rgba(13,10,36,0.30)_34%,rgba(13,10,36,0.90)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,255,255,0.18),transparent_30%),linear-gradient(115deg,rgba(255,255,255,0.08),transparent_38%)]" />
      </div>

      <div className={`container-wide relative flex min-h-[calc(100svh-12rem)] items-end md:min-h-[22rem] ${align === 'center' ? 'justify-center text-center' : ''}`}>
        <div className={`rounded-[2rem] border border-white/15 bg-[#0f0b2b]/42 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:border-white/20 sm:bg-[#0f0b2b]/56 sm:p-7 sm:backdrop-blur-2xl ${align === 'center' ? 'mx-auto max-w-3xl' : 'max-w-3xl'}`}>
          <p className="mb-3 inline-flex rounded-full border border-white/15 bg-[#0f0b2b]/55 px-3 py-2 text-xs font-semibold uppercase text-white backdrop-blur-xl">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-bold leading-none drop-shadow-2xl [text-shadow:0_3px_24px_rgba(0,0,0,0.65)] sm:text-5xl md:text-6xl">{title}</h1>
          <p className="mt-4 hidden text-base leading-7 text-white/90 [text-shadow:0_2px_14px_rgba(0,0,0,0.55)] sm:block sm:text-lg">{description}</p>
        </div>
      </div>
    </section>
  );
}
