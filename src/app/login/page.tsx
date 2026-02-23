'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      // Fetch session to determine role-based redirect
      try {
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        if (callbackUrl && callbackUrl !== '/') {
          window.location.href = callbackUrl;
        } else if (session?.user?.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/guest';
        }
      } catch {
        window.location.href = callbackUrl || '/';
      }
    }
  }

  return (
    <div className="section-padding">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-forest-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to access your booking or admin panel.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500"
            />
          </div>

          {error && (
            <p className="text-falu-600 text-sm">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Need a guest account? Contact us after your booking is confirmed.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="section-padding text-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
