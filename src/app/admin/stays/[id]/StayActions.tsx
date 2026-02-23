'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  stayId: string;
  guestName: string;
};

export default function StayActions({ stayId, guestName }: Props) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stays/${stayId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error (${res.status})`);
      }
      router.refresh();
      setShowConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="bg-falu-50 border border-falu-200 rounded-lg px-4 py-3 text-sm text-right">
          <p className="font-medium text-falu-800 mb-2">
            Cancel stay for {guestName}?
          </p>
          <p className="text-xs text-falu-600 mb-3">
            This will mark the stay as cancelled. This action cannot be undone.
          </p>
          {error && (
            <p className="text-xs text-falu-700 mb-2 font-medium">{error}</p>
          )}
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowConfirm(false);
                setError(null);
              }}
              className="text-xs text-gray-600 hover:text-gray-800 transition-colors px-3 py-1.5 rounded border border-gray-200 bg-white"
              disabled={loading}
            >
              Keep Stay
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-falu-600 hover:bg-falu-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors px-3 py-1.5 rounded"
            >
              {loading ? (
                <>
                  <svg
                    className="size-3 animate-spin"
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
                  Cancelling...
                </>
              ) : (
                'Yes, Cancel Stay'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-2 rounded-lg border border-falu-200 bg-white px-4 py-2 text-sm font-medium text-falu-700 transition-colors hover:bg-falu-50 hover:border-falu-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="size-4"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z"
          clipRule="evenodd"
        />
      </svg>
      Cancel Stay
    </button>
  );
}
