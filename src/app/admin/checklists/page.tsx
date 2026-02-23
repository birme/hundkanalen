'use client';

import { useState, useEffect } from 'react';

type ChecklistItem = {
  id: string;
  type: 'checkin' | 'checkout';
  title: string;
  description: string | null;
  sort_order: number;
};

type EditState = {
  title: string;
  description: string;
};

type AddFormState = {
  title: string;
  description: string;
  sort_order: string;
};

const EMPTY_ADD_FORM: AddFormState = { title: '', description: '', sort_order: '0' };

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

function ChecklistSection({
  title,
  type,
  items,
  onAdd,
  onUpdate,
  onDelete,
}: {
  title: string;
  type: 'checkin' | 'checkout';
  items: ChecklistItem[];
  onAdd: (type: 'checkin' | 'checkout', data: AddFormState) => Promise<void>;
  onUpdate: (id: string, data: EditState) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditState>({ title: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<AddFormState>(EMPTY_ADD_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function startEdit(item: ChecklistItem) {
    setEditingId(item.id);
    setEditValues({ title: item.title, description: item.description ?? '' });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setError(null);
  }

  async function handleSaveEdit(id: string) {
    if (!editValues.title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onUpdate(id, { title: editValues.title.trim(), description: editValues.description.trim() });
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this checklist item?')) return;
    setDeleting(id);
    setError(null);
    try {
      await onDelete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete.');
    } finally {
      setDeleting(null);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onAdd(type, { ...addForm, title: addForm.title.trim(), description: addForm.description.trim() });
      setAddForm(EMPTY_ADD_FORM);
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item.');
    } finally {
      setSaving(false);
    }
  }

  const accentColor = type === 'checkin' ? 'forest' : 'wood';
  const headerBg = type === 'checkin' ? 'bg-forest-50 border-forest-200' : 'bg-wood-50 border-wood-200';
  const headerText = type === 'checkin' ? 'text-forest-800' : 'text-wood-800';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Section header */}
      <div className={`px-4 sm:px-6 py-4 border-b ${headerBg} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2`}>
        <div className="flex items-center gap-3">
          <span className={`text-lg font-semibold ${headerText}`}>{title}</span>
          <span className="text-xs font-medium bg-white border border-gray-200 text-gray-500 rounded-full px-2 py-0.5">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => { setShowAddForm((v) => !v); setError(null); }}
          className={`btn-${accentColor === 'forest' ? 'primary' : 'secondary'} text-sm`}
        >
          {showAddForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 pt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {/* Items list */}
      <div className="divide-y divide-gray-100">
        {items.length === 0 && !showAddForm && (
          <div className="px-4 sm:px-6 py-10 text-center">
            <p className="text-sm text-gray-400 italic">No items yet. Add one to get started.</p>
          </div>
        )}

        {items.map((item) => (
          <div key={item.id} className="px-4 sm:px-6 py-4">
            {editingId === item.id ? (
              /* Inline edit form */
              <div className="space-y-3">
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <textarea
                    value={editValues.description}
                    onChange={(e) => setEditValues((v) => ({ ...v, description: e.target.value }))}
                    rows={2}
                    className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm resize-none"
                    placeholder="Optional description..."
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
                <div className="flex items-start gap-3 min-w-0">
                  <span className={`mt-0.5 flex-shrink-0 size-5 rounded-full border-2 ${type === 'checkin' ? 'border-forest-300' : 'border-wood-300'}`} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
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

        {/* Add form */}
        {showAddForm && (
          <div className="px-4 sm:px-6 py-5 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">New Item</p>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Title <span className="text-falu-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addForm.title}
                  onChange={(e) => setAddForm((v) => ({ ...v, title: e.target.value }))}
                  placeholder="e.g. Return keys to keybox"
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={addForm.description}
                  onChange={(e) => setAddForm((v) => ({ ...v, description: e.target.value }))}
                  rows={2}
                  placeholder="Optional description..."
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm resize-none"
                />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
                <input
                  type="number"
                  min="0"
                  value={addForm.sort_order}
                  onChange={(e) => setAddForm((v) => ({ ...v, sort_order: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
                />
              </div>
              <div className="flex items-center gap-3 pt-1">
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
                  onClick={() => { setShowAddForm(false); setAddForm(EMPTY_ADD_FORM); setError(null); }}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminChecklistsPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    setPageError(null);
    try {
      const res = await fetch('/api/admin/checklists');
      if (!res.ok) throw new Error(`Failed to load checklists (${res.status})`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to load checklists.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(type: 'checkin' | 'checkout', data: AddFormState) {
    const res = await fetch('/api/admin/checklists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        title: data.title,
        description: data.description || undefined,
        sort_order: parseInt(data.sort_order, 10) || 0,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Server error (${res.status})`);
    }
    const newItem = await res.json();
    setItems((prev) => [...prev, newItem]);
  }

  async function handleUpdate(id: string, data: EditState) {
    const res = await fetch(`/api/admin/checklists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        description: data.description || null,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Server error (${res.status})`);
    }
    const updated = await res.json();
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/checklists/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Server error (${res.status})`);
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const checkinItems = items.filter((i) => i.type === 'checkin');
  const checkoutItems = items.filter((i) => i.type === 'checkout');

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest-800">Checklists</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage check-in and check-out checklists shown to guests during their stay.
        </p>
      </div>

      {pageError && (
        <div className="mb-6">
          <ErrorBanner message={pageError} />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <SpinnerIcon />
          <span className="ml-3 text-sm">Loading checklists...</span>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <ChecklistSection
            title="Check-in Checklist"
            type="checkin"
            items={checkinItems}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
          <ChecklistSection
            title="Check-out Checklist"
            type="checkout"
            items={checkoutItems}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}
