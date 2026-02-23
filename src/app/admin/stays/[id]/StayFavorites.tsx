'use client';

import { useState, useEffect, useCallback } from 'react';

type FavoritePlace = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  distance: string | null;
  owner_tips: string | null;
};

const CATEGORY_LABEL: Record<string, string> = {
  activity: 'Activity',
  culture: 'Culture & Heritage',
  nature: 'Nature & Wildlife',
  outdoor: 'Outdoor & Adventure',
  family: 'Family Activities',
  winter: 'Winter Activities',
  dining: 'Dining & Cafes',
};

const CATEGORY_BADGE_COLOR: Record<string, string> = {
  activity: 'bg-wood-50 text-wood-800 border-wood-200',
  culture: 'bg-falu-50 text-falu-800 border-falu-200',
  nature: 'bg-forest-50 text-forest-800 border-forest-200',
  outdoor: 'bg-forest-50 text-forest-800 border-forest-200',
  family: 'bg-wood-50 text-wood-800 border-wood-200',
  winter: 'bg-blue-50 text-blue-800 border-blue-200',
  dining: 'bg-cream-100 text-cream-900 border-cream-300',
};

const CATEGORY_ORDER = ['culture', 'nature', 'outdoor', 'family', 'winter', 'dining', 'activity'];

export default function StayFavorites({ stayId }: { stayId: string }) {
  const [open, setOpen] = useState(false);
  const [allPlaces, setAllPlaces] = useState<FavoritePlace[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [initialIds, setInitialIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [placesRes, selectedRes] = await Promise.all([
        fetch('/api/admin/favorites'),
        fetch(`/api/admin/stays/${stayId}/favorites`),
      ]);

      if (!placesRes.ok) throw new Error('Failed to load favorites');
      if (!selectedRes.ok) throw new Error('Failed to load stay selections');

      const places: FavoritePlace[] = await placesRes.json();
      const ids: string[] = await selectedRes.json();

      setAllPlaces(places);
      const idSet = new Set(ids);
      setSelectedIds(idSet);
      setInitialIds(new Set(ids));
      setFetched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [stayId]);

  useEffect(() => {
    if (open && !fetched) {
      fetchData();
    }
  }, [open, fetched, fetchData]);

  function togglePlace(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setSuccess(false);
  }

  function selectAll() {
    setSelectedIds(new Set(allPlaces.map((p) => p.id)));
    setSuccess(false);
  }

  function selectNone() {
    setSelectedIds(new Set());
    setSuccess(false);
  }

  const hasChanges = (() => {
    if (selectedIds.size !== initialIds.size) return true;
    const arr = Array.from(selectedIds);
    for (let i = 0; i < arr.length; i++) {
      if (!initialIds.has(arr[i])) return true;
    }
    return false;
  })();

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/admin/stays/${stayId}/favorites`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite_ids: Array.from(selectedIds) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error (${res.status})`);
      }

      setInitialIds(new Set(selectedIds));
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  // Group places by category
  const grouped: Record<string, FavoritePlace[]> = {};
  for (const cat of CATEGORY_ORDER) {
    const items = allPlaces.filter((p) => p.category === cat);
    if (items.length > 0) grouped[cat] = items;
  }
  // Any extra categories
  for (const p of allPlaces) {
    if (!grouped[p.category]) {
      grouped[p.category] = allPlaces.filter((fp) => fp.category === p.category);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-4 text-gray-400"
            aria-hidden="true"
          >
            <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Featured Activities</span>
          {initialIds.size > 0 && (
            <span className="text-xs bg-forest-50 text-forest-700 border border-forest-200 rounded-full px-2 py-0.5">
              {initialIds.size} selected
            </span>
          )}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className={`size-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <svg
                className="size-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
              </svg>
              <span className="ml-3 text-sm">Loading activities...</span>
            </div>
          ) : allPlaces.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-gray-500">
              No favorite places configured yet. Add some in the{' '}
              <a href="/admin/favorites" className="text-forest-600 hover:text-forest-800 underline">
                Favorites
              </a>{' '}
              section first.
            </div>
          ) : (
            <>
              {/* Quick actions */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-forest-600 hover:text-forest-800 font-medium transition-colors"
                >
                  Select all
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={selectNone}
                  className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  Clear all
                </button>
                <span className="flex-1" />
                <span className="text-gray-400">
                  {selectedIds.size} of {allPlaces.length} selected
                </span>
              </div>

              {/* Checkbox list grouped by category */}
              <div className="divide-y divide-gray-100">
                {Object.entries(grouped).map(([cat, places]) => (
                  <div key={cat} className="px-6 py-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      {CATEGORY_LABEL[cat] ?? cat}
                    </h4>
                    <div className="space-y-2">
                      {places.map((place) => {
                        const isChecked = selectedIds.has(place.id);
                        const badgeColor = CATEGORY_BADGE_COLOR[place.category] ?? 'bg-gray-100 text-gray-700 border-gray-200';
                        return (
                          <label
                            key={place.id}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                              isChecked ? 'bg-forest-50 border border-forest-200' : 'hover:bg-gray-50 border border-transparent'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePlace(place.id)}
                              className="rounded border-gray-300 text-forest-600 focus:ring-forest-500"
                            />
                            <span className="text-lg flex-shrink-0" aria-hidden="true">
                              {place.icon || '📍'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {place.name}
                                </span>
                                <span className={`text-xs border rounded-full px-2 py-0.5 flex-shrink-0 ${badgeColor}`}>
                                  {CATEGORY_LABEL[place.category] ?? place.category}
                                </span>
                              </div>
                              {place.owner_tips && (
                                <p className="text-xs text-wood-600 italic mt-0.5 truncate">
                                  Tip: {place.owner_tips}
                                </p>
                              )}
                            </div>
                            {place.distance && (
                              <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                                {place.distance}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Save */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
                {error && (
                  <div className="flex items-start gap-3 rounded-lg bg-falu-50 border border-falu-200 px-4 py-3 text-sm text-falu-800">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 flex-shrink-0 text-falu-500 mt-0.5" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 rounded-lg bg-forest-50 border border-forest-200 px-4 py-3 text-sm text-forest-800">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 flex-shrink-0 text-forest-500" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                    <span>Featured activities saved.</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {saving && (
                      <svg className="size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                      </svg>
                    )}
                    {saving ? 'Saving...' : 'Save Selection'}
                  </button>
                  {hasChanges && (
                    <span className="text-xs text-gray-400">Unsaved changes</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
