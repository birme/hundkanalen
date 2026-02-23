'use client';

import { useState, useEffect } from 'react';

type PropertyInfoItem = {
  id: string;
  title: string;
  content: string;
  category: string;
  sort_order: number;
};

type EditState = {
  title: string;
  content: string;
  category: string;
};

type AddFormState = {
  title: string;
  content: string;
  category: string;
};

const EMPTY_ADD_FORM: AddFormState = {
  title: '',
  content: '',
  category: 'general',
};

const CATEGORY_LABELS: Record<string, string> = {
  rules: 'House Rules',
  practical: 'Practical Information',
  emergency: 'Emergency',
  location: 'Location & Directions',
  packing: 'Packing & What to Bring',
  general: 'General',
};

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const CATEGORY_COLORS: Record<string, string> = {
  rules: 'bg-forest-50 border-forest-200 text-forest-800',
  practical: 'bg-wood-50 border-wood-200 text-wood-800',
  emergency: 'bg-falu-50 border-falu-200 text-falu-800',
  location: 'bg-cream-100 border-cream-300 text-cream-900',
  packing: 'bg-blue-50 border-blue-200 text-blue-800',
  general: 'bg-gray-50 border-gray-200 text-gray-800',
};

function SpinnerIcon() {
  return (
    <svg
      className="size-4 animate-spin"
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

function CategoryBadge({ category }: { category: string }) {
  const label = CATEGORY_LABELS[category] ?? category;
  const colors = CATEGORY_COLORS[category] ?? 'bg-gray-50 border-gray-200 text-gray-700';
  return (
    <span className={`inline-block text-xs font-medium border rounded-full px-2.5 py-0.5 ${colors}`}>
      {label}
    </span>
  );
}

export default function AdminPropertyInfoPage() {
  const [items, setItems] = useState<PropertyInfoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditState>({ title: '', content: '', category: 'general' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<AddFormState>(EMPTY_ADD_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reordering, setReordering] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    setPageError(null);
    try {
      const res = await fetch('/api/admin/property-info');
      if (!res.ok) throw new Error(`Failed to load property info (${res.status})`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to load property info.');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(item: PropertyInfoItem) {
    setEditingId(item.id);
    setEditValues({ title: item.title, content: item.content, category: item.category });
    setFormError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setFormError(null);
  }

  async function handleSaveEdit(id: string) {
    if (!editValues.title.trim() || !editValues.content.trim()) {
      setFormError('Title and content are required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/admin/property-info/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editValues.title.trim(),
          content: editValues.content.trim(),
          category: editValues.category,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      const updated = await res.json();
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setEditingId(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this property info item?')) return;
    setDeleting(id);
    setFormError(null);
    try {
      const res = await fetch(`/api/admin/property-info/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to delete.');
    } finally {
      setDeleting(null);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.title.trim() || !addForm.content.trim()) {
      setFormError('Title and content are required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      // Auto-assign sort_order: max in this category + 1
      const categoryItems = items.filter((i) => i.category === addForm.category);
      const maxOrder = categoryItems.reduce((max, i) => Math.max(max, i.sort_order), -1);
      const res = await fetch('/api/admin/property-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: addForm.title.trim(),
          content: addForm.content.trim(),
          category: addForm.category,
          sort_order: maxOrder + 1,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      const newItem = await res.json();
      setItems((prev) => [...prev, newItem]);
      setAddForm(EMPTY_ADD_FORM);
      setShowAddForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add item.');
    } finally {
      setSaving(false);
    }
  }

  async function handleMoveUp(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const group = items
      .filter((i) => i.category === item.category)
      .sort((a, b) => a.sort_order - b.sort_order);
    const idx = group.findIndex((i) => i.id === id);
    if (idx <= 0) return;

    setReordering(id);
    const prev = items.map((i) => ({ ...i }));

    // Swap sort_order with the item above
    const above = group[idx - 1];
    setItems((current) =>
      current
        .map((i) => {
          if (i.id === id) return { ...i, sort_order: above.sort_order };
          if (i.id === above.id) return { ...i, sort_order: item.sort_order };
          return i;
        })
        .sort((a, b) => a.sort_order - b.sort_order)
    );

    // Build new ordered IDs for the whole category group
    const newGroup = [...group];
    [newGroup[idx - 1], newGroup[idx]] = [newGroup[idx], newGroup[idx - 1]];
    const orderedIds = newGroup.map((i) => i.id);

    try {
      const res = await fetch('/api/admin/property-info/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: item.category, orderedIds }),
      });
      if (!res.ok) throw new Error('Failed to save order');
    } catch {
      setItems(prev);
      setPageError('Failed to reorder items. Please try again.');
    } finally {
      setReordering(null);
    }
  }

  async function handleMoveDown(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const group = items
      .filter((i) => i.category === item.category)
      .sort((a, b) => a.sort_order - b.sort_order);
    const idx = group.findIndex((i) => i.id === id);
    if (idx < 0 || idx >= group.length - 1) return;

    setReordering(id);
    const prev = items.map((i) => ({ ...i }));

    // Swap sort_order with the item below
    const below = group[idx + 1];
    setItems((current) =>
      current
        .map((i) => {
          if (i.id === id) return { ...i, sort_order: below.sort_order };
          if (i.id === below.id) return { ...i, sort_order: item.sort_order };
          return i;
        })
        .sort((a, b) => a.sort_order - b.sort_order)
    );

    // Build new ordered IDs for the whole category group
    const newGroup = [...group];
    [newGroup[idx], newGroup[idx + 1]] = [newGroup[idx + 1], newGroup[idx]];
    const orderedIds = newGroup.map((i) => i.id);

    try {
      const res = await fetch('/api/admin/property-info/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: item.category, orderedIds }),
      });
      if (!res.ok) throw new Error('Failed to save order');
    } catch {
      setItems(prev);
      setPageError('Failed to reorder items. Please try again.');
    } finally {
      setReordering(null);
    }
  }

  // Group items by category
  const grouped = items.reduce<Record<string, PropertyInfoItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Order categories consistently
  const orderedCategories = CATEGORY_OPTIONS
    .map((opt) => opt.value)
    .filter((cat) => grouped[cat] && grouped[cat].length > 0);

  // Include any unknown categories at the end
  const extraCategories = Object.keys(grouped).filter((cat) => !orderedCategories.includes(cat));
  const allCategories = [...orderedCategories, ...extraCategories];

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-forest-800">Property Info</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage information displayed to guests about the property.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowAddForm((v) => !v); setFormError(null); }}
          className="btn-primary text-sm"
        >
          {showAddForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {pageError && (
        <div className="mb-6">
          <ErrorBanner message={pageError} />
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">New Item</h2>
          {formError && (
            <div className="mb-4">
              <ErrorBanner message={formError} />
            </div>
          )}
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-falu-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addForm.title}
                  onChange={(e) => setAddForm((v) => ({ ...v, title: e.target.value }))}
                  placeholder="e.g. WiFi Password"
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={addForm.category}
                  onChange={(e) => setAddForm((v) => ({ ...v, category: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content <span className="text-falu-600">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={addForm.content}
                  onChange={(e) => setAddForm((v) => ({ ...v, content: e.target.value }))}
                  placeholder="Enter the information for guests..."
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm resize-y"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {saving && <SpinnerIcon />}
                Add Item
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setAddForm(EMPTY_ADD_FORM); setFormError(null); }}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <SpinnerIcon />
          <span className="ml-3 text-sm">Loading property info...</span>
        </div>
      ) : items.length === 0 && !showAddForm ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-16 text-center">
          <p className="text-sm font-medium text-gray-500">No property info yet.</p>
          <p className="text-xs text-gray-400 mt-1">Click &ldquo;+ Add Item&rdquo; to create your first entry.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {allCategories.map((category) => (
            <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                <CategoryBadge category={category} />
                <span className="text-xs text-gray-400">{grouped[category].length} {grouped[category].length === 1 ? 'item' : 'items'}</span>
              </div>

              <div className="divide-y divide-gray-100">
                {grouped[category].sort((a, b) => a.sort_order - b.sort_order).map((item, index, arr) => (
                  <div key={item.id} className="px-6 py-4">
                    {editingId === item.id ? (
                      /* Inline edit form */
                      <div className="space-y-3">
                        {formError && editingId === item.id && (
                          <ErrorBanner message={formError} />
                        )}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                          <input
                            type="text"
                            value={editValues.title}
                            onChange={(e) => setEditValues((v) => ({ ...v, title: e.target.value }))}
                            className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                          <select
                            value={editValues.category}
                            onChange={(e) => setEditValues((v) => ({ ...v, category: e.target.value }))}
                            className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
                          >
                            {CATEGORY_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
                          <textarea
                            value={editValues.content}
                            onChange={(e) => setEditValues((v) => ({ ...v, content: e.target.value }))}
                            rows={4}
                            className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm resize-y"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            disabled={saving}
                            className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                          >
                            {saving && <SpinnerIcon />}
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={saving}
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display row */
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 mb-1">{item.title}</p>
                          <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
                            {item.content}
                          </pre>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                          {/* Reorder arrows */}
                          <button
                            type="button"
                            onClick={() => handleMoveUp(item.id)}
                            disabled={reordering !== null || index === 0}
                            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move up"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                              <path fillRule="evenodd" d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(item.id)}
                            disabled={reordering !== null || index === arr.length - 1}
                            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move down"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                              <path fillRule="evenodd" d="M10.53 13.53a.75.75 0 0 1-1.06 0l-4.25-4.25a.75.75 0 1 1 1.06-1.06L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25Z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <span className="text-gray-300" aria-hidden="true">|</span>
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="text-xs font-medium text-forest-600 hover:text-forest-800 transition-colors"
                          >
                            Edit
                          </button>
                          <span className="text-gray-300" aria-hidden="true">|</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleting === item.id}
                            className="text-xs font-medium text-falu-600 hover:text-falu-800 transition-colors disabled:opacity-60"
                          >
                            {deleting === item.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
