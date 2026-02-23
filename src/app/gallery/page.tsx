'use client';

import { useState, useEffect, useCallback } from 'react';

type Photo = {
  id: string;
  filename: string;
  caption: string | null;
  category: string | null;
  sort_order: number;
};

function SpinnerIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg
      className={`${className} animate-spin`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
      />
    </svg>
  );
}

function PhotoGrid({ photos }: { photos: Photo[] }) {
  if (photos.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-sm">No photos available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {photos.map((photo) => (
        <div key={photo.id} className="group overflow-hidden rounded-xl bg-cream-100 border border-cream-200 aspect-[4/3] relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/photos/${photo.id}`}
            alt={photo.caption || photo.filename}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {photo.caption && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-white text-sm font-medium">{photo.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function GalleryPage() {
  const [publicPhotos, setPublicPhotos] = useState<Photo[]>([]);
  const [fullPhotos, setFullPhotos] = useState<Photo[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [loadingFull, setLoadingFull] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessCode, setAccessCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const checkAccess = useCallback(async () => {
    setCheckingAccess(true);
    try {
      const res = await fetch('/api/public/check-access');
      if (res.ok) {
        const data = await res.json();
        if (data.verified) {
          setIsVerified(true);
        }
      }
    } catch {
      // Treat as not verified
    } finally {
      setCheckingAccess(false);
    }
  }, []);

  const fetchPublicPhotos = useCallback(async () => {
    setLoadingPublic(true);
    try {
      const res = await fetch('/api/public/photos');
      if (res.ok) {
        const data = await res.json();
        setPublicPhotos(data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingPublic(false);
    }
  }, []);

  const fetchFullGallery = useCallback(async () => {
    setLoadingFull(true);
    try {
      const res = await fetch('/api/public/full-gallery');
      if (res.ok) {
        const data = await res.json();
        setFullPhotos(data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingFull(false);
    }
  }, []);

  useEffect(() => {
    checkAccess();
    fetchPublicPhotos();
  }, [checkAccess, fetchPublicPhotos]);

  useEffect(() => {
    if (isVerified) {
      fetchFullGallery();
    }
  }, [isVerified, fetchFullGallery]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!accessCode.trim()) return;
    setVerifying(true);
    setVerifyError(null);
    try {
      const res = await fetch('/api/public/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode.trim() }),
      });
      if (res.ok) {
        setIsVerified(true);
        setAccessCode('');
      } else {
        const body = await res.json().catch(() => ({}));
        setVerifyError(body.error ?? 'Invalid access code. Please try again.');
      }
    } catch {
      setVerifyError('Something went wrong. Please try again.');
    } finally {
      setVerifying(false);
    }
  }

  const displayedPhotos = isVerified ? fullPhotos : publicPhotos;
  const isLoading = isVerified ? loadingFull : loadingPublic;

  return (
    <div className="section-padding">
      <div className="container-wide">
        {/* Page header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-forest-800 mb-4">Gallery</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore Hundkanalen through photos of the interior, exterior, garden, and the
            surrounding Hälsingland landscape.
          </p>
        </div>

        {/* Access status banner */}
        {!checkingAccess && isVerified && (
          <div className="flex items-center gap-3 bg-forest-50 border border-forest-200 rounded-xl px-5 py-3 mb-8 max-w-xl mx-auto">
            <span className="text-forest-600 text-lg" aria-hidden="true">&#10003;</span>
            <p className="text-sm font-medium text-forest-800">
              Full gallery unlocked &mdash; showing all photos.
            </p>
          </div>
        )}

        {/* Photo grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <SpinnerIcon />
            <span className="ml-3 text-sm">Loading photos...</span>
          </div>
        ) : (
          <PhotoGrid photos={displayedPhotos} />
        )}

        {/* Unlock section — only shown when not verified and not still checking */}
        {!checkingAccess && !isVerified && (
          <div className="mt-16 max-w-lg mx-auto">
            <div className="bg-cream-50 border border-cream-200 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4" aria-hidden="true">&#128274;</div>
              <h2 className="text-xl font-bold text-forest-800 mb-2">Unlock Full Gallery</h2>
              <p className="text-sm text-gray-600 mb-6">
                Enter your access code to view all photos, including detailed interior shots
                and the surrounding area. The access code is included in your booking
                confirmation.
              </p>
              <form onSubmit={handleVerify} className="flex flex-col gap-3">
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value);
                    setVerifyError(null);
                  }}
                  placeholder="Enter access code"
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm text-center tracking-widest uppercase"
                  autoComplete="off"
                  spellCheck={false}
                />
                {verifyError && (
                  <p className="text-sm text-falu-700 bg-falu-50 border border-falu-200 rounded-lg px-4 py-2">
                    {verifyError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={verifying || !accessCode.trim()}
                  className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {verifying && <SpinnerIcon className="size-4" />}
                  {verifying ? 'Verifying...' : 'Unlock Gallery'}
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-4">
                Don&rsquo;t have a code?{' '}
                <a href="/contact" className="text-forest-600 hover:underline">Contact us</a>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
