'use client';

import { useState, useEffect, useRef } from 'react';

type Photo = {
  id: string;
  filename: string;
  caption: string | null;
};

type Props = {
  photoId: string | null;
  onSelect: (photoId: string | null) => void;
};

function SpinnerIcon({ className = 'size-4' }: { className?: string }) {
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

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function PhotoPicker({ photoId, onSelect }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function openModal() {
    setModalOpen(true);
    setUploadError(null);
    if (photos.length === 0) {
      await fetchPhotos();
    }
  }

  async function fetchPhotos() {
    setLoadingPhotos(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/admin/photos');
      if (!res.ok) throw new Error(`Failed to load photos (${res.status})`);
      const data = await res.json();
      setPhotos(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load photos.');
    } finally {
      setLoadingPhotos(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Invalid file type. Please use JPEG, PNG, or WebP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File too large. Maximum size is 5 MB.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/photos', { method: 'POST', body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Upload failed (${res.status})`);
      }
      const newPhoto: Photo = await res.json();
      setPhotos((prev) => [...prev, newPhoto]);
      onSelect(newPhoto.id);
      setModalOpen(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  function handleSelect(id: string) {
    onSelect(id);
    setModalOpen(false);
  }

  // Close modal on Escape key
  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setModalOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  return (
    <div>
      {/* Current selection */}
      {photoId ? (
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/photos/${photoId}`}
            alt="Selected photo"
            className="w-20 h-14 object-cover rounded-lg border border-gray-200 flex-shrink-0"
          />
          <div className="flex flex-col gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={openModal}
              className="text-xs font-medium text-forest-600 hover:text-forest-800 transition-colors"
            >
              Change Photo
            </button>
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="text-xs font-medium text-falu-600 hover:text-falu-800 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4 text-gray-400">
            <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
          </svg>
          Choose Photo
        </button>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Modal panel */}
          <div
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-base font-semibold text-forest-800">Choose Photo</h2>
              <div className="flex items-center gap-3">
                {/* Upload new button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-forest-600 bg-forest-50 border border-forest-200 rounded-lg px-3 py-1.5 hover:bg-forest-100 transition-colors disabled:opacity-60"
                >
                  {uploading ? <SpinnerIcon className="size-3" /> : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
                      <path d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 0 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z" />
                      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                    </svg>
                  )}
                  {uploading ? 'Uploading...' : 'Upload New'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleFileChange}
                  aria-label="Upload new photo"
                />
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Upload error */}
            {uploadError && (
              <div className="px-5 pt-3 flex-shrink-0">
                <div className="flex items-start gap-2 rounded-lg bg-falu-50 border border-falu-200 px-3 py-2 text-xs text-falu-800">
                  <span>{uploadError}</span>
                </div>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loadingPhotos ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <SpinnerIcon />
                  <span className="ml-2 text-sm">Loading photos...</span>
                </div>
              ) : loadError ? (
                <div className="py-8 text-center text-sm text-falu-600">{loadError}</div>
              ) : photos.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-gray-500">No photos yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Click &ldquo;Upload New&rdquo; to add photos.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {/* None option */}
                  <button
                    type="button"
                    onClick={() => { onSelect(null); setModalOpen(false); }}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-colors ${
                      photoId === null
                        ? 'border-forest-500 bg-forest-50 text-forest-700'
                        : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    None
                  </button>
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => handleSelect(photo.id)}
                      className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                        photo.id === photoId
                          ? 'border-forest-500 ring-2 ring-forest-300'
                          : 'border-transparent hover:border-forest-300'
                      }`}
                      title={photo.caption || photo.filename}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/photos/${photo.id}`}
                        alt={photo.caption || photo.filename}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {photo.id === photoId && (
                        <div className="absolute inset-0 bg-forest-600/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-6 text-white drop-shadow">
                            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
