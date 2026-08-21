'use client';

import { useEffect, useState } from 'react';

type Photo = {
  id: string;
  caption: string | null;
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
    <section className="relative isolate overflow-hidden bg-[#17123b] px-4 pb-8 pt-24 text-white sm:px-6 sm:pb-12 sm:pt-28 lg:px-8">
      <div className="absolute inset-0">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/photos/${photo.id}`}
            alt={photo.caption || title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(145deg,#17123b,#4f28ad_55%,#df8510)]" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,10,36,0.38),rgba(13,10,36,0.86))]" />
      </div>

      <div className={`container-wide relative min-h-[21rem] content-end ${align === 'center' ? 'text-center' : ''}`}>
        <div className={`max-w-3xl ${align === 'center' ? 'mx-auto' : ''}`}>
          <p className="mb-3 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold uppercase text-white/80 backdrop-blur">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-bold leading-none sm:text-5xl md:text-6xl">{title}</h1>
          <p className="mt-4 text-base leading-7 text-white/75 sm:text-lg">{description}</p>
        </div>
      </div>
    </section>
  );
}
