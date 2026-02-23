'use client';

import { useState, useEffect, useRef } from 'react';

type Photo = {
  id: string;
  filename: string;
  caption: string | null;
  category: string | null;
  sort_order: number;
  storage_url: string;
  created_at: string;
};

const CATEGORY_OPTIONS = [
  { value: '', label: 'No category' },
  { value: 'exterior', label: 'Exterior' },
  { value: 'interior', label: 'Interior' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'living', label: 'Living Room' },
  { value: 'garden', label: 'Garden & Outdoors' },
  { value: 'area', label: 'Area & Nature' },
  { value: 'other', label: 'Other' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-falu-50 border border-falu-200 px-4 py-3 text-sm text-falu-800">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-5 flex-shrink-0 text-falu-500 mt-0.5"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
          clipRule="evenodd"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
}

function PhotoCard({
  photo,
  onUpdate,
  onDelete,
}: {
  photo: Photo;
  onUpdate: (id: string, data: { caption?: string; category?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [caption, setCaption] = useState(photo.caption ?? '');
  const [category, setCategory] = useState(photo.category ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCaptionChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCaption(e.target.value);
    setDirty(true);
  }

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setCategory(e.target.value);
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onUpdate(photo.id, {
        caption: caption.trim() || undefined,
        category: category || undefined,
      });
      setDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete photo "${photo.filename}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(photo.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete.');
      setDeleting(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/photos/${photo.id}`}
          alt={caption || photo.filename}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Metadata */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Caption</label>
          <input
            type="text"
            value={caption}
            onChange={handleCaptionChange}
            placeholder="Add a caption..."
            className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
          <select
            value={category}
            onChange={handleCategoryChange}
            className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {error && <ErrorBanner message={error} />}

        <div className="flex items-center justify-between mt-auto pt-1">
          <p className="text-xs text-gray-400 truncate max-w-[120px]" title={photo.filename}>
            {photo.filename}
          </p>
          <div className="flex items-center gap-2">
            {dirty && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="text-xs font-medium text-forest-600 hover:text-forest-800 transition-colors disabled:opacity-60 inline-flex items-center gap-1"
              >
                {saving && <SpinnerIcon className="size-3" />}
                Save
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs font-medium text-falu-600 hover:text-falu-800 transition-colors disabled:opacity-60 inline-flex items-center gap-1"
            >
              {deleting && <SpinnerIcon className="size-3" />}
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  async function fetchPhotos() {
    setLoading(true);
    setPageError(null);
    try {
      const res = await fetch('/api/admin/photos');
      if (!res.ok) throw new Error(`Failed to load photos (${res.status})`);
      const data = await res.json();
      setPhotos(data);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to load photos.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected
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

      const res = await fetch('/api/admin/photos', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Upload failed (${res.status})`);
      }

      const newPhoto = await res.json();
      setPhotos((prev) => [...prev, newPhoto]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleUpdate(id: string, data: { caption?: string; category?: string }) {
    const res = await fetch(`/api/admin/photos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Server error (${res.status})`);
    }
    const updated = await res.json();
    setPhotos((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/photos/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Server error (${res.status})`);
    }
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-forest-800">Photos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage property photos. Accepted formats: JPEG, PNG, WebP. Max 5 MB each.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {uploading && (
            <span className="text-sm text-gray-500 inline-flex items-center gap-2">
              <SpinnerIcon />
              Uploading...
            </span>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Upload Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileChange}
            aria-label="Upload photo"
          />
        </div>
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="mb-6">
          <ErrorBanner message={uploadError} />
        </div>
      )}

      {/* Page error */}
      {pageError && (
        <div className="mb-6">
          <ErrorBanner message={pageError} />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <SpinnerIcon />
          <span className="ml-3 text-sm">Loading photos...</span>
        </div>
      ) : photos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-20 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mx-auto size-12 text-gray-300 mb-3"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-500">No photos yet.</p>
          <p className="text-xs text-gray-400 mt-1">Click &ldquo;Upload Photo&rdquo; to add your first image.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 text-right">
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
          </p>
        </>
      )}
    </div>
  );
}
