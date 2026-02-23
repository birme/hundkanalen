'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
};

type AddFormState = {
  name: string;
  email: string;
  password: string;
};

const EMPTY_ADD_FORM: AddFormState = { name: '', email: '', password: '' };

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

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-forest-50 border border-forest-200 px-4 py-3 text-sm text-forest-800">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-5 flex-shrink-0 text-forest-500 mt-0.5"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
          clipRule="evenodd"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<AddFormState>(EMPTY_ADD_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setPageError(null);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error(`Failed to load users (${res.status})`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password) {
      setFormError('All fields are required.');
      return;
    }
    if (addForm.password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addForm.name.trim(),
          email: addForm.email.trim(),
          password: addForm.password,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      const newUser = await res.json();
      setUsers((prev) => [...prev, newUser]);
      setAddForm(EMPTY_ADD_FORM);
      setShowAddForm(false);
      setSuccessMessage(`Admin user "${newUser.name}" created successfully.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: AdminUser) {
    if (!confirm(`Delete admin user "${user.name}"? This action cannot be undone.`)) return;
    setDeleting(user.id);
    setPageError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to delete user.');
    } finally {
      setDeleting(null);
    }
  }

  const currentUserId = session?.user?.id;

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-forest-800">Admin Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage who has admin access to the Färila anno 1923 dashboard.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowAddForm((v) => !v); setFormError(null); }}
          className="btn-primary text-sm"
        >
          {showAddForm ? 'Cancel' : '+ Add Admin'}
        </button>
      </div>

      {/* Success */}
      {successMessage && (
        <div className="mb-6">
          <SuccessBanner message={successMessage} />
        </div>
      )}

      {/* Page error */}
      {pageError && (
        <div className="mb-6">
          <ErrorBanner message={pageError} />
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">New Admin User</h2>
          {formError && (
            <div className="mb-4">
              <ErrorBanner message={formError} />
            </div>
          )}
          <form onSubmit={handleAdd} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="add-name" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-falu-600">*</span>
              </label>
              <input
                id="add-name"
                type="text"
                required
                value={addForm.name}
                onChange={(e) => setAddForm((v) => ({ ...v, name: e.target.value }))}
                placeholder="Jonas Birme"
                className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="add-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-falu-600">*</span>
              </label>
              <input
                id="add-email"
                type="email"
                required
                value={addForm.email}
                onChange={(e) => setAddForm((v) => ({ ...v, email: e.target.value }))}
                placeholder="admin@example.com"
                className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
              />
            </div>
            <div>
              <label htmlFor="add-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-falu-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="add-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={addForm.password}
                  onChange={(e) => setAddForm((v) => ({ ...v, password: e.target.value }))}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Minimum 8 characters.</p>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {saving && <SpinnerIcon />}
                Create Admin
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

      {/* Users table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <SpinnerIcon />
            <span className="ml-3 text-sm">Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="mx-auto size-10 text-gray-300 mb-3"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            <p className="text-sm font-medium text-gray-500">No admin users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Name
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Created
                  </th>
                  <th className="px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 size-8 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center text-sm font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            {isSelf && (
                              <p className="text-xs text-forest-600 font-medium">You</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isSelf ? (
                          <span
                            title="Cannot delete yourself"
                            className="text-xs text-gray-300 cursor-not-allowed select-none"
                          >
                            Delete
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            disabled={deleting === user.id}
                            className="text-xs font-medium text-falu-600 hover:text-falu-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1"
                          >
                            {deleting === user.id && <SpinnerIcon />}
                            {deleting === user.id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && users.length > 0 && (
        <p className="text-xs text-gray-400 mt-3 text-right">
          {users.length} {users.length === 1 ? 'admin' : 'admins'}
        </p>
      )}
    </div>
  );
}
