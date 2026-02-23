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
      <section className="section-padding bg-cream-50">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-forest-800 mb-4">Gallery</h2>
            <p className="text-gray-600">A glimpse of what awaits you</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-cream-100 rounded-xl aspect-[4/3] animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (photos.length === 0) {
    return (
      <section className="section-padding bg-cream-50">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-forest-800 mb-4">Gallery</h2>
            <p className="text-gray-600">Photos coming soon</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-cream-50">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-forest-800 mb-4">Gallery</h2>
          <p className="text-gray-600">A glimpse of what awaits you</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className={`rounded-xl aspect-[4/3] overflow-hidden ${
                i === 0 ? 'md:col-span-2 md:row-span-2 md:aspect-square' : ''
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/photos/${photo.id}`}
                alt={photo.caption || 'Property photo'}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/gallery" className="btn-outline">
            View Gallery
          </Link>
        </div>
      </div>
    </section>
  );
}
