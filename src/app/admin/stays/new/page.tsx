'use client';

import { useState } from 'react';
import Link from 'next/link';
import CopyButton from '@/components/admin/CopyButton';

type FormData = {
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  guests: string;
  total_price: string;
  keybox_code: string;
  notes: string;
  packing_notes: string;
};

type CreatedStay = {
  id: string;
  guest_name: string;
  access_code: string;
  check_in: string;
  check_out: string;
};

const INITIAL_FORM: FormData = {
  guest_name: '',
  guest_email: '',
  check_in: '',
  check_out: '',
  guests: '1',
  total_price: '',
  keybox_code: '',
  notes: '',
  packing_notes: '',
};

export default function NewStayPage() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdStay, setCreatedStay] = useState<CreatedStay | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        guest_name: form.guest_name.trim(),
        guest_email: form.guest_email.trim() || undefined,
        check_in: form.check_in,
        check_out: form.check_out,
        guests: parseInt(form.guests, 10),
        total_price: parseFloat(form.total_price),
        keybox_code: form.keybox_code.trim() || undefined,
        notes: form.notes.trim() || undefined,
        packing_notes: form.packing_notes.trim() || undefined,
      };

      const res = await fetch('/api/admin/stays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error (${res.status})`);
      }

      const stay = await res.json();
      setCreatedStay(stay);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  function handleCreateAnother() {
    setCreatedStay(null);
    setForm(INITIAL_FORM);
    setError(null);
  }

  if (createdStay) {
    return (
      <div>
        <Link
          href="/admin/stays"
          className="text-sm text-forest-600 hover:text-forest-800 transition-colors mb-6 inline-flex items-center gap-1.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-3.5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
          Back to Stays
        </Link>

        <div className="max-w-lg">
          {/* Success card */}
          <div className="bg-white rounded-xl border border-forest-200 shadow-sm overflow-hidden">
            <div className="bg-forest-600 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 rounded-full bg-white/20 p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-5 text-white"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Stay Created</h2>
                  <p className="text-sm text-forest-100 mt-0.5">
                    {createdStay.guest_name} &mdash; {createdStay.check_in} to{' '}
                    {createdStay.check_out}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Guest Access Code
              </p>
              <div className="flex items-center gap-3 bg-cream-50 border border-cream-200 rounded-lg px-4 py-3">
                <span className="font-mono text-2xl font-bold tracking-[0.25em] text-forest-800 flex-1">
                  {createdStay.access_code}
                </span>
                <CopyButton text={createdStay.access_code} label="Copy code" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Share this code with the guest so they can access their booking details
                and check-in information.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={handleCreateAnother}
              className="btn-outline text-sm"
            >
              Create Another
            </button>
            <Link
              href={`/admin/stays/${createdStay.id}`}
              className="btn-primary text-sm"
            >
              View Stay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/stays"
        className="text-sm text-forest-600 hover:text-forest-800 transition-colors mb-6 inline-flex items-center gap-1.5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="size-3.5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
        Back to Stays
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest-800">Create Stay</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manually register a new guest stay. An access code will be generated automatically.
        </p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">

          {/* Guest information */}
          <div className="px-6 py-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Guest Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="guest_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Guest Name <span className="text-falu-600">*</span>
                </label>
                <input
                  id="guest_name"
                  name="guest_name"
                  type="text"
                  required
                  value={form.guest_name}
                  onChange={handleChange}
                  placeholder="Anna Lindqvist"
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="guest_email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Guest Email
                  <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  id="guest_email"
                  name="guest_email"
                  type="email"
                  value={form.guest_email}
                  onChange={handleChange}
                  placeholder="anna@example.com"
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Stay details */}
          <div className="px-6 py-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Stay Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="check_in"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Check-in Date <span className="text-falu-600">*</span>
                </label>
                <input
                  id="check_in"
                  name="check_in"
                  type="date"
                  required
                  value={form.check_in}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="check_out"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Check-out Date <span className="text-falu-600">*</span>
                </label>
                <input
                  id="check_out"
                  name="check_out"
                  type="date"
                  required
                  value={form.check_out}
                  onChange={handleChange}
                  min={form.check_in || undefined}
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="guests"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Number of Guests <span className="text-falu-600">*</span>
                </label>
                <input
                  id="guests"
                  name="guests"
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={form.guests}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="total_price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Total Price (SEK) <span className="text-falu-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="total_price"
                    name="total_price"
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={form.total_price}
                    onChange={handleChange}
                    placeholder="4 500"
                    className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                    SEK
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Access & notes */}
          <div className="px-6 py-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Access & Notes
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="keybox_code"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Keybox Code
                  <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  id="keybox_code"
                  name="keybox_code"
                  type="text"
                  value={form.keybox_code}
                  onChange={handleChange}
                  placeholder="1234"
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Physical keybox combination shown to guests during check-in.
                </p>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Internal Notes
                  <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any special requests or reminders..."
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor="packing_notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Guest Packing Notes
                  <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="packing_notes"
                  name="packing_notes"
                  rows={3}
                  value={form.packing_notes}
                  onChange={handleChange}
                  placeholder="e.g. Bed sheets are provided. Bring warm layers for evening walks..."
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Per-stay packing info shown to guests. Leave empty to use global defaults.
                </p>
              </div>
            </div>
          </div>

          {/* Error + submit */}
          <div className="px-6 py-5 bg-gray-50 rounded-b-xl flex flex-col gap-4">
            {error && (
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
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="size-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
                      />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Stay'
                )}
              </button>
              <Link
                href="/admin/stays"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
