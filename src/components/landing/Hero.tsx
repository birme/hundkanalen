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
    <section className="relative overflow-hidden bg-[#15113a] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#141039_0%,#1f174e_48%,#3c1f5c_100%)]" />
      <div className="absolute inset-x-0 top-0 h-44 bg-white/5" />

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 md:pb-20 md:pt-28 lg:px-8">
        <div className="grid min-w-0 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="order-2 min-w-0 lg:order-1">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white/85 shadow-sm backdrop-blur-md">
              <span className="grid size-6 place-items-center rounded-full bg-white/15">⌂</span>
              Färila, Hälsingland
            </div>

            <h1 className="max-w-xl text-[2.65rem] font-bold leading-[0.98] tracking-normal sm:text-6xl lg:text-7xl">
              Färila anno 1923
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/70 sm:text-lg">
              A warm countryside villa with old-house character, modern comfort and quiet access to forest,
              river and UNESCO heritage.
            </p>

            <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {['Villa', 'Families', 'Nature', 'Winter', 'Heritage'].map((chip, index) => (
                <span
                  key={chip}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm ${
                    index === 0
                      ? 'border-white/30 bg-white text-[#17123b]'
                      : 'border-white/15 bg-white/10 text-white/80 backdrop-blur'
                  }`}
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="mt-8 grid max-w-md grid-cols-3 gap-2 sm:gap-3">
              {quickFacts.map((fact) => (
                <div key={fact.label} className="min-w-0 rounded-3xl border border-white/10 bg-white/10 px-3 py-3 backdrop-blur-md sm:px-4">
                  <p className="text-xl font-bold sm:text-2xl">{fact.value}</p>
                  <p className="text-xs text-white/60">{fact.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="btn-primary !rounded-full !bg-white !px-7 !text-[#17123b] hover:!bg-cream-100">
                Send an Inquiry
              </Link>
              <Link href="/gallery" className="btn-outline !rounded-full !border-white/25 !text-white hover:!bg-white/10">
                View Gallery
              </Link>
            </div>
          </div>

          <div className="order-1 min-w-0 lg:order-2">
            <div className="relative mx-auto w-full max-w-[430px] lg:max-w-[520px]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.4rem] border border-white/15 bg-[#251d4f] shadow-2xl shadow-black/30 sm:aspect-[4/5]">
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#130f2e] via-[#130f2e]/25 to-transparent" />
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                  <span className="rounded-full bg-black/35 px-3 py-2 text-xs font-medium text-white backdrop-blur-md">
                    Countryside retreat
                  </span>
                  <Link
                    href="/stay"
                    className="grid size-11 place-items-center rounded-full bg-white/20 text-lg backdrop-blur-md"
                    aria-label="Access your stay"
                  >
                    →
                  </Link>
                </div>
                <div className="absolute bottom-4 left-4 right-4 rounded-[2rem] border border-white/15 bg-[#17123b]/75 p-5 shadow-xl backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold leading-tight">Färila anno 1923</h2>
                      <p className="mt-1 text-sm text-white/65">Hundkanalen 3, Färila</p>
                    </div>
                    <div className="rounded-full bg-violet-500 px-3 py-2 text-sm font-semibold shadow-lg shadow-violet-950/40">
                      4.9
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs text-white/75">
                    <span className="rounded-2xl bg-white/10 px-2 py-3">Kitchen</span>
                    <span className="rounded-2xl bg-white/10 px-2 py-3">Fireplace</span>
                    <span className="rounded-2xl bg-white/10 px-2 py-3">Terrace</span>
                  </div>
                </div>
              </div>
              <div className="absolute -right-2 top-1/2 hidden rounded-[2rem] border border-white/15 bg-white/15 p-4 text-center text-sm shadow-2xl backdrop-blur-xl sm:block">
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
