'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Photo = {
  id: string;
  caption: string | null;
};

const quickFacts = [
  { label: 'Guests', value: '10' },
  { label: 'Bedrooms', value: '4-5' },
  { label: 'Built', value: '1923' },
];

export default function Hero() {
  const [heroPhoto, setHeroPhoto] = useState<Photo | null>(null);

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
    <section className="relative min-h-[100svh] overflow-hidden bg-[#15113a] text-white md:min-h-[42rem]">
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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,10,36,0.28)_0%,rgba(13,10,36,0.14)_34%,rgba(13,10,36,0.84)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,255,255,0.24),transparent_30%),linear-gradient(115deg,rgba(255,255,255,0.10),transparent_38%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-24 pt-24 sm:px-6 md:min-h-[42rem] md:pb-14 md:pt-28 lg:px-8">
        <div className="grid min-w-0 gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-2 text-xs font-medium text-white/90 shadow-sm backdrop-blur-xl">
              <span className="grid size-6 place-items-center rounded-full bg-white/15">⌂</span>
              Färila, Hälsingland
            </div>

            <h1 className="max-w-xl text-[3rem] font-bold leading-[0.94] tracking-normal drop-shadow-2xl sm:text-6xl lg:text-7xl">
              Färila anno 1923
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/80 drop-shadow sm:text-lg">
              A warm countryside villa with old-house character, modern comfort and quiet access to forest,
              river and UNESCO heritage.
            </p>

            <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {['Villa', 'Families', 'Nature', 'Winter', 'Heritage'].map((chip, index) => (
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

          <div className="min-w-0">
            <div className="rounded-[2rem] border border-white/20 bg-[#17123b]/50 p-4 shadow-2xl shadow-black/25 backdrop-blur-2xl sm:p-5 lg:ml-auto lg:max-w-[30rem]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/55">Countryside retreat</p>
                  <h2 className="mt-1 text-2xl font-bold leading-tight">Färila anno 1923</h2>
                  <p className="mt-1 text-sm text-white/65">Färila, Hälsingland</p>
                </div>
                <Link
                  href="/stay"
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-lg text-[#17123b] shadow-lg shadow-black/20"
                  aria-label="Access your stay"
                >
                  →
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                {quickFacts.map((fact) => (
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
                  Send Inquiry
                </Link>
                <Link href="/gallery" className="btn-outline !rounded-full !border-white/25 !bg-white/10 !px-5 !text-white hover:!bg-white/15">
                  Gallery
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-white/75">
                {['Kitchen', 'Fireplace', 'Terrace'].map((item) => (
                  <div key={item} className="rounded-2xl bg-white/10 px-2 py-3 backdrop-blur-xl">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 hidden justify-end sm:flex">
              <div className="rounded-[2rem] border border-white/15 bg-white/15 px-5 py-4 text-center text-sm shadow-2xl backdrop-blur-2xl">
                <p className="text-xs text-white/60">Drive from</p>
                <p className="text-xl font-bold">Stockholm</p>
                <p className="text-white/75">3.5-4 h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
