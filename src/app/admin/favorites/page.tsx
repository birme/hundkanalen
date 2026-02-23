'use client';

import { useState, useEffect, useCallback } from 'react';

type FavoritePlace = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  url: string | null;
  distance: string | null;
  owner_tips: string | null;
};

type NewFavorite = {
  name: string;
  description: string;
  category: string;
  icon: string;
  url: string;
  distance: string;
  owner_tips: string;
};

const CATEGORY_OPTIONS = [
  { value: 'activity', label: 'Activity' },
  { value: 'culture',  label: 'Culture & Heritage' },
  { value: 'nature',   label: 'Nature & Wildlife' },
  { value: 'outdoor',  label: 'Outdoor & Adventure' },
  { value: 'family',   label: 'Family Activities' },
  { value: 'winter',   label: 'Winter Activities' },
  { value: 'dining',   label: 'Dining & Cafes' },
];

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((o) => [o.value, o.label])
);

const CATEGORY_BADGE_COLOR: Record<string, string> = {
  activity: 'bg-wood-50 text-wood-800 border-wood-200',
  culture:  'bg-falu-50 text-falu-800 border-falu-200',
  nature:   'bg-forest-50 text-forest-800 border-forest-200',
  outdoor:  'bg-forest-50 text-forest-800 border-forest-200',
  family:   'bg-wood-50 text-wood-800 border-wood-200',
  winter:   'bg-blue-50 text-blue-800 border-blue-200',
  dining:   'bg-cream-100 text-cream-900 border-cream-300',
};

const DEFAULT_NEW: NewFavorite = {
  name: '',
  description: '',
  category: 'activity',
  icon: '',
  url: '',
  distance: '',
  owner_tips: '',
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
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-falu-50 border border-falu-200 px-4 py-3 text-sm text-falu-800">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 flex-shrink-0 text-falu-500 mt-0.5" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

function FavoriteCard({
  place,
  onUpdate,
  onDelete,
}: {
  place: FavoritePlace;
  onUpdate: (id: string, data: Partial<NewFavorite>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<NewFavorite>({
    name: place.name,
    description: place.description ?? '',
    category: place.category,
    icon: place.icon ?? '',
    url: place.url ?? '',
    distance: place.distance ?? '',
    owner_tips: place.owner_tips ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError(null);
    try {
      await onUpdate(place.id, form);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${place.name}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(place.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete.');
      setDeleting(false);
    }
  }

  const badgeColor = CATEGORY_BADGE_COLOR[place.category] ?? 'bg-gray-100 text-gray-700 border-gray-200';

  if (editing) {
    return (
      <div className="bg-white rounded-xl border border-forest-300 p-5 flex flex-col gap-3">
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Icon (emoji)</label>
              <input
                name="icon"
                type="text"
                value={form.icon}
                onChange={handleChange}
                placeholder="e.g. 🏔️"
                className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Distance</label>
              <input
                name="distance"
                type="text"
                value={form.distance}
                onChange={handleChange}
                placeholder="e.g. 35 min by car"
                className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Website URL</label>
              <input
                name="url"
                type="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe this place..."
                className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm resize-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Owner&apos;s Tip</label>
              <textarea
                name="owner_tips"
                value={form.owner_tips}
                onChange={handleChange}
                rows={2}
                placeholder="e.g. Try the elk meatballs — amazing!"
                className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">Personal recommendation shown to guests</p>
            </div>
          </div>
          {error && <ErrorBanner message={error} />}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {saving && <SpinnerIcon />}
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setError(null); }}
              disabled={saving}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:border-forest-300 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl flex-shrink-0" aria-hidden="true">{place.icon || '📍'}</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-forest-800 truncate">{place.name}</h3>
            <span className={`inline-block text-xs border rounded-full px-2 py-0.5 mt-0.5 ${badgeColor}`}>
              {CATEGORY_LABEL[place.category] ?? place.category}
            </span>
          </div>
        </div>
        {place.distance && (
          <span className="text-xs bg-cream-100 text-cream-900 border border-cream-200 rounded-full px-2.5 py-0.5 whitespace-nowrap flex-shrink-0">
            {place.distance}
          </span>
        )}
      </div>
      {place.description && (
        <p className="text-sm text-gray-600 leading-relaxed">{place.description}</p>
      )}
      {place.owner_tips && (
        <div className="bg-cream-50 border-l-4 border-wood-400 rounded-r-lg px-3 py-2">
          <p className="text-sm text-wood-700 italic">Owner&apos;s tip: {place.owner_tips}</p>
        </div>
      )}
      {place.url && (
        <a
          href={place.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-forest-600 hover:text-forest-800 hover:underline truncate"
        >
          {place.url}
        </a>
      )}
      {error && <ErrorBanner message={error} />}
      <div className="flex items-center gap-3 mt-auto pt-1 border-t border-gray-100">
        <button
          type="button"
          onClick={() => { setEditing(true); setError(null); }}
          className="text-xs font-medium text-forest-600 hover:text-forest-800 transition-colors"
        >
          Edit
        </button>
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
  );
}

export default function AdminFavoritesPage() {
  const [places, setPlaces] = useState<FavoritePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [newForm, setNewForm] = useState<NewFavorite>(DEFAULT_NEW);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const res = await fetch('/api/admin/favorites');
      if (!res.ok) throw new Error(`Failed to load favorites (${res.status})`);
      const data = await res.json();
      setPlaces(data);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to load favorites.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  function handleNewChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setNewForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm.name.trim()) { setAddError('Name is required.'); return; }
    setAdding(true);
    setAddError(null);
    try {
      const res = await fetch('/api/admin/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newForm.name.trim(),
          description: newForm.description.trim() || undefined,
          category: newForm.category,
          icon: newForm.icon.trim() || undefined,
          url: newForm.url.trim() || undefined,
          distance: newForm.distance.trim() || undefined,
          owner_tips: newForm.owner_tips.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      const created = await res.json();
      setPlaces((prev) => [...prev, created]);
      setNewForm(DEFAULT_NEW);
      setShowAddForm(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add place.');
    } finally {
      setAdding(false);
    }
  }

  async function handleUpdate(id: string, data: Partial<NewFavorite>) {
    const res = await fetch(`/api/admin/favorites/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Server error (${res.status})`);
    }
    const updated = await res.json();
    setPlaces((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/favorites/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Server error (${res.status})`);
    }
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-forest-800">Favorite Places</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage local recommendations shown on the Area Guide page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowAddForm(!showAddForm); setAddError(null); }}
          className="btn-primary text-sm"
        >
          {showAddForm ? 'Cancel' : '+ Add Place'}
        </button>
      </div>

      {pageError && (
        <div className="mb-6">
          <ErrorBanner message={pageError} />
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-forest-300 p-6 mb-6">
          <h2 className="font-semibold text-forest-800 mb-4">Add New Place</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input
                name="name"
                type="text"
                value={newForm.name}
                onChange={handleNewChange}
                placeholder="e.g. Järvsöbacken Ski Resort"
                className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select
                name="category"
                value={newForm.category}
                onChange={handleNewChange}
                className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Icon (emoji)</label>
              <input
                name="icon"
                type="text"
                value={newForm.icon}
                onChange={handleNewChange}
                placeholder="e.g. ⛷️"
                className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Distance</label>
              <input
                name="distance"
                type="text"
                value={newForm.distance}
                onChange={handleNewChange}
                placeholder="e.g. 35 min by car"
                className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Website URL</label>
              <input
                name="url"
                type="url"
                value={newForm.url}
                onChange={handleNewChange}
                placeholder="https://..."
                className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                name="description"
                value={newForm.description}
                onChange={handleNewChange}
                rows={3}
                placeholder="Describe this place for guests..."
                className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Owner&apos;s Tip</label>
              <textarea
                name="owner_tips"
                value={newForm.owner_tips}
                onChange={handleNewChange}
                rows={2}
                placeholder="e.g. Try the elk meatballs — amazing!"
                className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">Personal recommendation shown to guests</p>
            </div>
            {addError && (
              <div className="sm:col-span-2">
                <ErrorBanner message={addError} />
              </div>
            )}
            <div className="sm:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={adding}
                className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {adding && <SpinnerIcon />}
                {adding ? 'Adding...' : 'Add Place'}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setAddError(null); setNewForm(DEFAULT_NEW); }}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <SpinnerIcon className="size-5" />
          <span className="ml-3 text-sm">Loading places...</span>
        </div>
      ) : places.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-20 text-center">
          <div className="text-5xl mb-3" aria-hidden="true">&#11088;</div>
          <p className="text-sm font-medium text-gray-500">No favorite places yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            Click &ldquo;+ Add Place&rdquo; to add your first recommendation.
          </p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {places.map((place) => (
              <FavoriteCard
                key={place.id}
                place={place}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 text-right">
            {places.length} {places.length === 1 ? 'place' : 'places'}
          </p>
        </>
      )}
    </div>
  );
}
