'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('saving');
    setError('');

    const form = e.currentTarget;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setStatus('error');
      return;
    }

    try {
      const res = await fetch('/api/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Could not reset password');
      }

      setStatus('saved');
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password');
      setStatus('error');
    }
  }

  if (!token) {
    return (
      <div className="rounded-2xl border border-falu-200 bg-falu-50 p-6 text-center text-sm text-falu-800">
        This reset link is missing a token. Request a new password reset.
      </div>
    );
  }

  if (status === 'saved') {
    return (
      <div className="rounded-2xl border border-forest-200 bg-white p-6 text-center sm:p-8">
        <h2 className="mb-2 text-xl font-bold text-forest-800">Password Updated</h2>
        <p className="mb-6 text-sm text-gray-600">You can now sign in with your new password.</p>
        <Link href="/login" className="btn-primary w-full">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
          New Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-falu-200 bg-falu-50 px-4 py-3 text-sm text-falu-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={status === 'saving'} className="btn-primary w-full disabled:opacity-50">
        {status === 'saving' ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="section-padding text-center">Loading...</div>}>
      <div className="section-padding">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-forest-800">Set New Password</h1>
            <p className="text-gray-600">Choose a new password for your admin account.</p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    </Suspense>
  );
}
