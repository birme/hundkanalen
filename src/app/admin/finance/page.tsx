'use client';

import { useEffect, useMemo, useState } from 'react';

type MaintenanceStatus = 'planned' | 'in_progress' | 'done' | 'deferred';
type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';

type MaintenanceItem = {
  id: string;
  title: string;
  area: string;
  description: string | null;
  source: string | null;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  target_year: number | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  completed_at: string | null;
  sort_order: number;
};

type MaintenanceForm = {
  title: string;
  area: string;
  description: string;
  source: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  target_year: string;
  estimated_cost: string;
  actual_cost: string;
  completed_at: string;
};

const EMPTY_FORM: MaintenanceForm = {
  title: '',
  area: 'Exterior',
  description: '',
  source: '',
  priority: 'medium',
  status: 'planned',
  target_year: String(new Date().getFullYear()),
  estimated_cost: '',
  actual_cost: '',
  completed_at: '',
};

const STATUS_LABELS: Record<MaintenanceStatus, string> = {
  planned: 'Planned',
  in_progress: 'In progress',
  done: 'Done',
  deferred: 'Deferred',
};

const PRIORITY_LABELS: Record<MaintenancePriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const STATUS_STYLES: Record<MaintenanceStatus, string> = {
  planned: 'bg-blue-50 text-blue-800 border-blue-200',
  in_progress: 'bg-wood-50 text-wood-800 border-wood-200',
  done: 'bg-forest-50 text-forest-800 border-forest-200',
  deferred: 'bg-gray-50 text-gray-700 border-gray-200',
};

const PRIORITY_STYLES: Record<MaintenancePriority, string> = {
  low: 'bg-gray-50 text-gray-700 border-gray-200',
  medium: 'bg-blue-50 text-blue-800 border-blue-200',
  high: 'bg-wood-50 text-wood-800 border-wood-200',
  urgent: 'bg-falu-50 text-falu-800 border-falu-200',
};

const SEK = new Intl.NumberFormat('sv-SE', {
  style: 'currency',
  currency: 'SEK',
  maximumFractionDigits: 0,
});

function SpinnerIcon() {
  return (
    <svg className="size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-falu-50 border border-falu-200 px-4 py-3 text-sm text-falu-800">
      <span className="font-semibold">Error</span>
      <span>{message}</span>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

function toForm(item: MaintenanceItem): MaintenanceForm {
  return {
    title: item.title,
    area: item.area,
    description: item.description ?? '',
    source: item.source ?? '',
    priority: item.priority,
    status: item.status,
    target_year: item.target_year?.toString() ?? '',
    estimated_cost: item.estimated_cost?.toString() ?? '',
    actual_cost: item.actual_cost?.toString() ?? '',
    completed_at: item.completed_at?.slice(0, 10) ?? '',
  };
}

function payloadFromForm(form: MaintenanceForm) {
  return {
    title: form.title.trim(),
    area: form.area.trim(),
    description: form.description.trim() || null,
    source: form.source.trim() || null,
    priority: form.priority,
    status: form.status,
    target_year: form.target_year ? Number(form.target_year) : null,
    estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : null,
    actual_cost: form.actual_cost ? Number(form.actual_cost) : null,
    completed_at: form.completed_at || null,
  };
}

export default function AdminFinancePage() {
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<MaintenanceForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MaintenanceForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    setPageError(null);
    try {
      const res = await fetch('/api/admin/maintenance-items');
      if (!res.ok) throw new Error(`Failed to load maintenance plan (${res.status})`);
      setItems(await res.json());
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to load maintenance plan.');
    } finally {
      setLoading(false);
    }
  }

  const summary = useMemo(() => {
    const open = items.filter((item) => item.status !== 'done');
    const plannedBudget = open.reduce((sum, item) => sum + (item.estimated_cost ?? 0), 0);
    const actualCost = items.reduce((sum, item) => sum + (item.actual_cost ?? 0), 0);
    const urgentCount = open.filter((item) => item.priority === 'urgent' || item.priority === 'high').length;
    const completedCount = items.filter((item) => item.status === 'done').length;
    return { plannedBudget, actualCost, urgentCount, completedCount, openCount: open.length };
  }, [items]);

  const groupedByYear = useMemo(() => {
    return items.reduce<Record<string, MaintenanceItem[]>>((groups, item) => {
      const key = item.target_year?.toString() ?? 'Unscheduled';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {});
  }, [items]);

  const years = Object.keys(groupedByYear).sort((a, b) => {
    if (a === 'Unscheduled') return 1;
    if (b === 'Unscheduled') return -1;
    return Number(a) - Number(b);
  });

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (!addForm.title.trim()) {
      setFormError('Title is required.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch('/api/admin/maintenance-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payloadFromForm(addForm), sort_order: items.length }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      const newItem = await res.json();
      setItems((current) => [...current, newItem]);
      setAddForm(EMPTY_FORM);
      setShowAddForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add maintenance item.');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item: MaintenanceItem) {
    setEditingId(item.id);
    setEditForm(toForm(item));
    setFormError(null);
  }

  async function handleSaveEdit(id: string) {
    if (!editForm.title.trim()) {
      setFormError('Title is required.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/admin/maintenance-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadFromForm(editForm)),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      const updated = await res.json();
      setItems((current) => current.map((item) => (item.id === id ? updated : item)));
      setEditingId(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save maintenance item.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this maintenance item?')) return;
    setDeleting(id);
    setPageError(null);
    try {
      const res = await fetch(`/api/admin/maintenance-items/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to delete maintenance item.');
    } finally {
      setDeleting(null);
    }
  }

  function FormFields({ form, onChange }: { form: MaintenanceForm; onChange: (form: MaintenanceForm) => void }) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(event) => onChange({ ...form, title: event.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
            placeholder="e.g. Paint windows"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
          <input
            type="text"
            value={form.area}
            onChange={(event) => onChange({ ...form, area: event.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target year</label>
          <input
            type="number"
            inputMode="numeric"
            min="2025"
            max="2100"
            value={form.target_year}
            onChange={(event) => onChange({ ...form, target_year: event.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={form.priority}
            onChange={(event) => onChange({ ...form, priority: event.target.value as MaintenancePriority })}
            className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
          >
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(event) => onChange({ ...form, status: event.target.value as MaintenanceStatus })}
            className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated cost</label>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={form.estimated_cost}
            onChange={(event) => onChange({ ...form, estimated_cost: event.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
            placeholder="SEK"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Actual cost</label>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={form.actual_cost}
            onChange={(event) => onChange({ ...form, actual_cost: event.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
            placeholder="SEK"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Completed date</label>
          <input
            type="date"
            value={form.completed_at}
            onChange={(event) => onChange({ ...form, completed_at: event.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) => onChange({ ...form, description: event.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm resize-y"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
          <input
            type="text"
            value={form.source}
            onChange={(event) => onChange({ ...form, source: event.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
            placeholder="e.g. Anticimex inspection 2025-01-16"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-forest-800">Finance</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Owner maintenance plan, budget and completed work for Färila anno 1923.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowAddForm((value) => !value); setFormError(null); }}
          className="btn-primary text-sm"
        >
          {showAddForm ? 'Cancel' : '+ Add Maintenance'}
        </button>
      </div>

      {pageError && <div className="mb-6"><ErrorBanner message={pageError} /></div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Open items</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{summary.openCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Planned budget</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{SEK.format(summary.plannedBudget)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Recorded actuals</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{SEK.format(summary.actualCost)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">High priority</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{summary.urgentCount}</p>
          <p className="text-xs text-gray-400 mt-1">{summary.completedCount} completed</p>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">New Maintenance Item</h2>
          {formError && <ErrorBanner message={formError} />}
          <FormFields form={addForm} onChange={setAddForm} />
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-60 inline-flex items-center gap-2">
              {saving && <SpinnerIcon />}
              Add Item
            </button>
            <button
              type="button"
              onClick={() => { setShowAddForm(false); setAddForm(EMPTY_FORM); setFormError(null); }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <SpinnerIcon />
          <span className="ml-3 text-sm">Loading maintenance plan...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-16 text-center">
          <p className="text-sm font-medium text-gray-500">No maintenance items yet.</p>
          <p className="text-xs text-gray-400 mt-1">Add inspection notes, quotes and completed work here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {years.map((year) => (
            <section key={year} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-gray-800">{year}</h2>
                <span className="text-xs text-gray-400">{groupedByYear[year].length} items</span>
              </div>
              <div className="divide-y divide-gray-100">
                {groupedByYear[year].map((item) => (
                  <div key={item.id} className="px-6 py-5">
                    {editingId === item.id ? (
                      <div className="space-y-4">
                        {formError && <ErrorBanner message={formError} />}
                        <FormFields form={editForm} onChange={setEditForm} />
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            disabled={saving}
                            className="btn-primary text-sm disabled:opacity-60 inline-flex items-center gap-2"
                          >
                            {saving && <SpinnerIcon />}
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingId(null); setFormError(null); }}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                            <Badge className={STATUS_STYLES[item.status]}>{STATUS_LABELS[item.status]}</Badge>
                            <Badge className={PRIORITY_STYLES[item.priority]}>{PRIORITY_LABELS[item.priority]}</Badge>
                          </div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">{item.area}</p>
                          {item.description && (
                            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{item.description}</p>
                          )}
                          {item.source && <p className="text-xs text-gray-400 mt-2">{item.source}</p>}
                        </div>
                        <div className="lg:w-64 flex-shrink-0">
                          <dl className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <dt className="text-xs text-gray-400">Budget</dt>
                              <dd className="font-semibold text-gray-900">{item.estimated_cost !== null ? SEK.format(item.estimated_cost) : '-'}</dd>
                            </div>
                            <div>
                              <dt className="text-xs text-gray-400">Actual</dt>
                              <dd className="font-semibold text-gray-900">{item.actual_cost !== null ? SEK.format(item.actual_cost) : '-'}</dd>
                            </div>
                            <div>
                              <dt className="text-xs text-gray-400">Done</dt>
                              <dd className="font-semibold text-gray-900">{item.completed_at?.slice(0, 10) ?? '-'}</dd>
                            </div>
                          </dl>
                          <div className="flex items-center gap-3 mt-4">
                            <button type="button" onClick={() => startEdit(item)} className="text-sm text-forest-600 hover:text-forest-800">
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              disabled={deleting === item.id}
                              className="text-sm text-falu-600 hover:text-falu-800 disabled:opacity-50"
                            >
                              {deleting === item.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
