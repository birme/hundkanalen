'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Photo = {
  id: string;
  caption: string | null;
  category: string | null;
};

export default function PhotoGrid() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

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
            <h2 className="text-3xl font-bold">Gallery</h2>
            <p className="text-white/60">A glimpse of what awaits you</p>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 min-w-[72%] animate-pulse rounded-[2rem] bg-white/10 md:min-w-0 md:flex-1" />
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
            <h2 className="mb-2 text-3xl font-bold">Gallery</h2>
            <p className="text-white/60">Photos coming soon</p>
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
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/45">Gallery</p>
            <h2 className="text-3xl font-bold leading-tight md:text-4xl">See the house</h2>
          </div>
          <Link href="/gallery" className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/15">
            All photos
          </Link>
        </div>
        <div className="flex snap-x gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className={`relative min-w-[78%] snap-start overflow-hidden rounded-[2rem] bg-white/10 shadow-xl shadow-black/20 ${
                i === 0 ? 'h-[28rem] md:col-span-2 md:row-span-2 md:h-auto md:aspect-square' : 'h-80 md:h-auto md:aspect-[4/3]'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/photos/${photo.id}`}
                alt={photo.caption || 'Property photo'}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-4">
                <p className="text-sm font-medium">{photo.caption || 'Färila anno 1923'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
