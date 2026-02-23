'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Stay = {
  id: string;
  guest_name: string;
  guest_email: string | null;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  keybox_code: string | null;
  notes: string | null;
  packing_notes: string | null;
};

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
  status: string;
};

const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function stayToForm(stay: Stay): FormData {
  // Normalise date strings to YYYY-MM-DD for input[type=date]
  const toDateStr = (val: string) => {
    const d = new Date(val);
    return d.toISOString().split('T')[0];
  };

  return {
    guest_name: stay.guest_name,
    guest_email: stay.guest_email ?? '',
    check_in: toDateStr(stay.check_in),
    check_out: toDateStr(stay.check_out),
    guests: String(stay.guests),
    total_price: String(stay.total_price),
    keybox_code: stay.keybox_code ?? '',
    notes: stay.notes ?? '',
    packing_notes: stay.packing_notes ?? '',
    status: stay.status,
  };
}

export default function StayEditForm({ stay }: { stay: Stay }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormData>(() => stayToForm(stay));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        guest_name: form.guest_name.trim(),
        guest_email: form.guest_email.trim() || null,
        check_in: form.check_in,
        check_out: form.check_out,
        guests: parseInt(form.guests, 10),
        total_price: parseFloat(form.total_price),
        keybox_code: form.keybox_code.trim() || null,
        notes: form.notes.trim() || null,
        packing_notes: form.packing_notes.trim() || null,
        status: form.status,
      };

      const res = await fetch(`/api/admin/stays/${stay.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error (${res.status})`);
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
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
            <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474ZM4.75 7.5a.75.75 0 0 0 0 1.5h1.638l-.25.25a1.24 1.24 0 0 1-.27.19l-1.63.676.015-.036c.069-.165.133-.332.192-.5H4.75ZM3 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2.5a.75.75 0 0 0-1.5 0V11a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V5a.5.5 0 0 1 .5-.5h2.5a.75.75 0 0 0 0-1.5H3Z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Edit Stay</span>
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
        <form onSubmit={handleSubmit} className="border-t border-gray-100 divide-y divide-gray-100">

          {/* Guest information */}
          <div className="px-6 py-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Guest Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="edit_guest_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Guest Name <span className="text-falu-600">*</span>
                </label>
                <input
                  id="edit_guest_name"
                  name="guest_name"
                  type="text"
                  required
                  value={form.guest_name}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="edit_guest_email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Guest Email
                </label>
                <input
                  id="edit_guest_email"
                  name="guest_email"
                  type="email"
                  value={form.guest_email}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Stay details */}
          <div className="px-6 py-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Stay Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit_check_in"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Check-in <span className="text-falu-600">*</span>
                </label>
                <input
                  id="edit_check_in"
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
                  htmlFor="edit_check_out"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Check-out <span className="text-falu-600">*</span>
                </label>
                <input
                  id="edit_check_out"
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
                  htmlFor="edit_guests"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Number of Guests <span className="text-falu-600">*</span>
                </label>
                <input
                  id="edit_guests"
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
                  htmlFor="edit_total_price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Total Price (SEK) <span className="text-falu-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="edit_total_price"
                    name="total_price"
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={form.total_price}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                    SEK
                  </span>
                </div>
              </div>
              <div>
                <label
                  htmlFor="edit_status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  id="edit_status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Access & notes */}
          <div className="px-6 py-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Access & Notes
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="edit_keybox_code"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Keybox Code
                </label>
                <input
                  id="edit_keybox_code"
                  name="keybox_code"
                  type="text"
                  value={form.keybox_code}
                  onChange={handleChange}
                  placeholder="1234"
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm font-mono"
                />
              </div>
              <div>
                <label
                  htmlFor="edit_notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Internal Notes
                </label>
                <textarea
                  id="edit_notes"
                  name="notes"
                  rows={3}
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any special requests or reminders..."
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm resize-none"
                />
              </div>
              <div>
                <label htmlFor="edit_packing_notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Guest Packing Notes
                </label>
                <textarea
                  id="edit_packing_notes"
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

          {/* Submit */}
          <div className="px-6 py-5 bg-gray-50 rounded-b-xl flex flex-col gap-3">
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

            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-forest-50 border border-forest-200 px-4 py-3 text-sm text-forest-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5 flex-shrink-0 text-forest-500"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Stay updated successfully.</span>
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
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(stayToForm(stay));
                  setError(null);
                  setSuccess(false);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                disabled={loading}
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
