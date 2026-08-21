'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setError('');

    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;

    try {
      const res = await fetch('/api/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Could not send reset email');
      }

      setStatus('sent');
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email');
      setStatus('error');
    }
  }

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-forest-800">Reset Admin Password</h1>
          <p className="text-gray-600">Enter your admin email and we will send a reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500"
            />
          </div>

          {status === 'sent' && (
            <p className="rounded-lg border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-800">
              If an admin account exists for that email, a reset link has been sent.
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-falu-200 bg-falu-50 px-4 py-3 text-sm text-falu-700">
              {error}
            </p>
          )}

          <button type="submit" disabled={status === 'sending'} className="btn-primary w-full disabled:opacity-50">
            {status === 'sending' ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Remembered it?{' '}
          <Link href="/login" className="text-forest-600 underline hover:text-forest-800">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
