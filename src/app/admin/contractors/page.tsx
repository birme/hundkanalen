'use client';

import { useEffect, useState } from 'react';

type AccessLink = {
  id: string;
  valid_from: string;
  valid_until: string;
  sent_at: string | null;
  created_at: string;
};

type Contractor = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  access_links: AccessLink[];
};

type ContractorForm = {
  name: string;
  email: string;
  phone: string;
  notes: string;
};

type LinkForm = {
  valid_from: string;
  valid_until: string;
  keybox_code: string;
  instructions: string;
  send_email: boolean;
};

const EMPTY_CONTRACTOR: ContractorForm = { name: '', email: '', phone: '', notes: '' };
const EMPTY_LINK: LinkForm = {
  valid_from: '',
  valid_until: '',
  keybox_code: '',
  instructions: 'Nyckelboxen sitter vid entrén. Öppna boxen med koden och lägg tillbaka nyckeln i boxen när arbetet är klart.',
  send_email: true,
};

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
    <div className="rounded-lg border border-falu-200 bg-falu-50 px-4 py-3 text-sm text-falu-800">
      {message}
    </div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-800">
      {message}
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Stockholm',
  }).format(new Date(value));
}

function ContractorFields({
  form,
  onChange,
}: {
  form: ContractorForm;
  onChange: (form: ContractorForm) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          className="w-full rounded-lg border-gray-300 text-sm focus:border-forest-500 focus:ring-forest-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(event) => onChange({ ...form, email: event.target.value })}
          className="w-full rounded-lg border-gray-300 text-sm focus:border-forest-500 focus:ring-forest-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(event) => onChange({ ...form, phone: event.target.value })}
          className="w-full rounded-lg border-gray-300 text-sm focus:border-forest-500 focus:ring-forest-500"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={(event) => onChange({ ...form, notes: event.target.value })}
          className="w-full rounded-lg border-gray-300 text-sm focus:border-forest-500 focus:ring-forest-500"
        />
      </div>
    </div>
  );
}

function AccessLinkFields({
  form,
  onChange,
}: {
  form: LinkForm;
  onChange: (form: LinkForm) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Valid from</label>
        <input
          type="datetime-local"
          required
          value={form.valid_from}
          onChange={(event) => onChange({ ...form, valid_from: event.target.value })}
          className="w-full rounded-lg border-gray-300 text-sm focus:border-forest-500 focus:ring-forest-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Valid until</label>
        <input
          type="datetime-local"
          required
          value={form.valid_until}
          onChange={(event) => onChange({ ...form, valid_until: event.target.value })}
          className="w-full rounded-lg border-gray-300 text-sm focus:border-forest-500 focus:ring-forest-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Keybox code</label>
        <input
          type="text"
          required
          value={form.keybox_code}
          onChange={(event) => onChange({ ...form, keybox_code: event.target.value })}
          className="w-full rounded-lg border-gray-300 font-mono text-sm focus:border-forest-500 focus:ring-forest-500"
        />
      </div>
      <div className="flex items-end">
        <label className="flex items-center gap-2 rounded-lg border border-cream-200 bg-cream-50 px-3 py-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.send_email}
            onChange={(event) => onChange({ ...form, send_email: event.target.checked })}
            className="rounded border-gray-300 text-forest-600 focus:ring-forest-500"
          />
          Send email with secret link
        </label>
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">Instructions shown on the secret page</label>
        <textarea
          rows={4}
          required
          value={form.instructions}
          onChange={(event) => onChange({ ...form, instructions: event.target.value })}
          className="w-full rounded-lg border-gray-300 text-sm focus:border-forest-500 focus:ring-forest-500"
        />
      </div>
    </div>
  );
}

function contractorToForm(contractor: Contractor): ContractorForm {
  return {
    name: contractor.name,
    email: contractor.email,
    phone: contractor.phone ?? '',
    notes: contractor.notes ?? '',
  };
}

export default function AdminContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<ContractorForm>(EMPTY_CONTRACTOR);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ContractorForm>(EMPTY_CONTRACTOR);
  const [linkFormFor, setLinkFormFor] = useState<string | null>(null);
  const [linkForm, setLinkForm] = useState<LinkForm>(EMPTY_LINK);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchContractors();
  }, []);

  async function fetchContractors() {
    setLoading(true);
    setPageError(null);
    try {
      const res = await fetch('/api/admin/contractors');
      if (!res.ok) throw new Error(`Failed to load contractors (${res.status})`);
      setContractors(await res.json());
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to load contractors.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setPageError(null);
    try {
      const res = await fetch('/api/admin/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      const contractor = await res.json();
      setContractors((current) => [...current, contractor]);
      setAddForm(EMPTY_CONTRACTOR);
      setShowAddForm(false);
      setSuccessMessage(`Contractor "${contractor.name}" added.`);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to add contractor.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(id: string) {
    setSaving(true);
    setPageError(null);
    try {
      const res = await fetch(`/api/admin/contractors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      const contractor = await res.json();
      setContractors((current) => current.map((item) => (item.id === id ? { ...item, ...contractor } : item)));
      setEditingId(null);
      setSuccessMessage(`Contractor "${contractor.name}" updated.`);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to update contractor.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(contractor: Contractor) {
    if (!confirm(`Delete contractor "${contractor.name}" and all access links?`)) return;
    setDeleting(contractor.id);
    setPageError(null);
    try {
      const res = await fetch(`/api/admin/contractors/${contractor.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      setContractors((current) => current.filter((item) => item.id !== contractor.id));
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to delete contractor.');
    } finally {
      setDeleting(null);
    }
  }

  async function handleCreateAccessLink(contractor: Contractor) {
    setSaving(true);
    setPageError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch(`/api/admin/contractors/${contractor.id}/access-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...linkForm,
          valid_from: new Date(linkForm.valid_from).toISOString(),
          valid_until: new Date(linkForm.valid_until).toISOString(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      await fetchContractors();
      setLinkFormFor(null);
      setLinkForm(EMPTY_LINK);
      setSuccessMessage(
        body.access_url && !linkForm.send_email
          ? `Access link created for ${contractor.name}: ${body.access_url}`
          : body.message ?? `Access link created for ${contractor.name}.`
      );
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to create access link.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest-800">Contractors</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage contractor contact details and time-limited keybox access links.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((value) => !value)}
          className="btn-primary text-sm"
        >
          {showAddForm ? 'Cancel' : '+ Add Contractor'}
        </button>
      </div>

      {pageError && <div className="mb-6"><ErrorBanner message={pageError} /></div>}
      {successMessage && <div className="mb-6"><SuccessBanner message={successMessage} /></div>}

      {showAddForm && (
        <form onSubmit={handleAdd} className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">New Contractor</h2>
          <ContractorFields form={addForm} onChange={setAddForm} />
          <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-60">
            {saving && <SpinnerIcon />}
            Add Contractor
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <SpinnerIcon />
          <span className="ml-3 text-sm">Loading contractors...</span>
        </div>
      ) : contractors.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
          <p className="text-sm font-medium text-gray-500">No contractors yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {contractors.map((contractor) => (
            <section key={contractor.id} className="rounded-xl border border-gray-200 bg-white p-6">
              {editingId === contractor.id ? (
                <div className="space-y-4">
                  <ContractorFields form={editForm} onChange={setEditForm} />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => handleSaveEdit(contractor.id)} disabled={saving} className="btn-primary text-sm disabled:opacity-60">
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="text-sm text-gray-500 hover:text-gray-700">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-forest-800">{contractor.name}</h2>
                      <p className="text-sm text-gray-600">{contractor.email}</p>
                      {contractor.phone && <p className="text-sm text-gray-500">{contractor.phone}</p>}
                      {contractor.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-gray-500">{contractor.notes}</p>}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => { setLinkFormFor(contractor.id); setLinkForm(EMPTY_LINK); }}
                        className="text-sm font-medium text-forest-600 hover:text-forest-800"
                      >
                        Create Access Link
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingId(contractor.id); setEditForm(contractorToForm(contractor)); }}
                        className="text-sm font-medium text-gray-500 hover:text-gray-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(contractor)}
                        disabled={deleting === contractor.id}
                        className="text-sm font-medium text-falu-600 hover:text-falu-800 disabled:opacity-60"
                      >
                        {deleting === contractor.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>

                  {linkFormFor === contractor.id && (
                    <div className="mt-5 rounded-xl border border-cream-200 bg-cream-50 p-4">
                      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
                        Time-limited access
                      </h3>
                      <AccessLinkFields form={linkForm} onChange={setLinkForm} />
                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleCreateAccessLink(contractor)}
                          disabled={saving}
                          className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-60"
                        >
                          {saving && <SpinnerIcon />}
                          Create{linkForm.send_email ? ' & Send Email' : ''}
                        </button>
                        <button type="button" onClick={() => setLinkFormFor(null)} className="text-sm text-gray-500 hover:text-gray-700">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {contractor.access_links.length > 0 && (
                    <div className="mt-5">
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Recent access links</h3>
                      <div className="space-y-2">
                        {contractor.access_links.slice(0, 3).map((link) => (
                          <div key={link.id} className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between">
                            <span>{formatDateTime(link.valid_from)} - {formatDateTime(link.valid_until)}</span>
                            <span>{link.sent_at ? `Sent ${formatDateTime(link.sent_at)}` : 'Not emailed'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
