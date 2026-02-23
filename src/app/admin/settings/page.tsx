'use client';

import { useState, useEffect, useCallback } from 'react';

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

type Settings = {
  global_access_code: string;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Access code editing
  const [editingCode, setEditingCode] = useState(false);
  const [codeValue, setCodeValue] = useState('');
  const [savingCode, setSavingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSuccess, setCodeSuccess] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error(`Failed to load settings (${res.status})`);
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  function handleEditCode() {
    setCodeValue(settings?.global_access_code ?? '');
    setCodeError(null);
    setCodeSuccess(false);
    setEditingCode(true);
  }

  function handleCancelCode() {
    setEditingCode(false);
    setCodeError(null);
  }

  async function handleSaveCode(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = codeValue.trim().toUpperCase();
    if (!trimmed) {
      setCodeError('Access code cannot be empty.');
      return;
    }
    setSavingCode(true);
    setCodeError(null);
    setCodeSuccess(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'global_access_code', value: trimmed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      const updated = await res.json();
      setSettings(updated);
      setEditingCode(false);
      setCodeSuccess(true);
      setTimeout(() => setCodeSuccess(false), 4000);
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSavingCode(false);
    }
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest-800">Site Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage global site access code and privacy settings.
        </p>
      </div>

      {pageError && (
        <div className="mb-6">
          <ErrorBanner message={pageError} />
        </div>
      )}

      {codeSuccess && (
        <div className="mb-6">
          <SuccessBanner message="Access code updated successfully." />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <SpinnerIcon className="size-5" />
          <span className="ml-3 text-sm">Loading settings...</span>
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl">
          {/* Global access code card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="font-semibold text-forest-800">Gallery Access Code</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Guests enter this code on the Gallery page to unlock all photos.
                  Share it in booking confirmations.
                </p>
              </div>
            </div>

            <div className="mt-5">
              {editingCode ? (
                <form onSubmit={handleSaveCode} className="flex flex-col gap-3">
                  <div>
                    <label htmlFor="access-code-input" className="block text-xs font-medium text-gray-600 mb-1">
                      New access code
                    </label>
                    <input
                      id="access-code-input"
                      type="text"
                      value={codeValue}
                      onChange={(e) => {
                        setCodeValue(e.target.value.toUpperCase());
                        setCodeError(null);
                      }}
                      placeholder="e.g. HUNDKANALEN"
                      className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm font-mono tracking-wider uppercase"
                      autoComplete="off"
                      spellCheck={false}
                      autoFocus
                    />
                  </div>
                  {codeError && <ErrorBanner message={codeError} />}
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={savingCode}
                      className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                      {savingCode && <SpinnerIcon />}
                      {savingCode ? 'Saving...' : 'Save Code'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelCode}
                      disabled={savingCode}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-4 bg-cream-50 border border-cream-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current code</span>
                    <code className="font-mono text-base font-semibold text-forest-800 tracking-widest">
                      {settings?.global_access_code ?? '—'}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={handleEditCode}
                    className="text-sm font-medium text-forest-600 hover:text-forest-800 transition-colors flex-shrink-0"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Info card */}
          <div className="bg-cream-50 border border-cream-200 rounded-xl px-5 py-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">How it works</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-forest-500 mt-0.5">&#10003;</span>
                Public visitors see a curated selection of photos without a code.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-forest-500 mt-0.5">&#10003;</span>
                Guests who enter the access code unlock the full photo gallery.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-forest-500 mt-0.5">&#10003;</span>
                Access is stored in a browser cookie and persists across visits.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-forest-500 mt-0.5">&#10003;</span>
                Mark individual photos as public or private in the Photos section.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
