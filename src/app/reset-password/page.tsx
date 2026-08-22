'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/i18n/LanguageProvider';

const copy = {
  en: {
    mismatch: 'Passwords do not match',
    resetError: 'Could not reset password',
    missingToken: 'This reset link is missing a token. Request a new password reset.',
    updatedTitle: 'Password Updated',
    updatedText: 'You can now sign in with your new password.',
    login: 'Go to Login',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    updating: 'Updating...',
    update: 'Update Password',
    pageTitle: 'Set New Password',
    pageIntro: 'Choose a new password for your admin account.',
    loading: 'Loading...',
  },
  sv: {
    mismatch: 'Lösenorden matchar inte',
    resetError: 'Kunde inte återställa lösenordet',
    missingToken: 'Återställningslänken saknar token. Begär en ny lösenordsåterställning.',
    updatedTitle: 'Lösenordet är uppdaterat',
    updatedText: 'Du kan nu logga in med ditt nya lösenord.',
    login: 'Gå till login',
    newPassword: 'Nytt lösenord',
    confirmPassword: 'Bekräfta lösenord',
    updating: 'Uppdaterar...',
    update: 'Uppdatera lösenord',
    pageTitle: 'Ange nytt lösenord',
    pageIntro: 'Välj ett nytt lösenord för ditt adminkonto.',
    loading: 'Laddar...',
  },
};

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');
  const { locale } = useLanguage();
  const t = copy[locale];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('saving');
    setError('');

    const form = e.currentTarget;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;

    if (password !== confirmPassword) {
      setError(t.mismatch);
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
        throw new Error(body.error || t.resetError);
      }

      setStatus('saved');
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.resetError);
      setStatus('error');
    }
  }

  if (!token) {
    return (
      <div className="rounded-2xl border border-falu-200 bg-falu-50 p-6 text-center text-sm text-falu-800">
        {t.missingToken}
      </div>
    );
  }

  if (status === 'saved') {
    return (
      <div className="rounded-2xl border border-forest-200 bg-white p-6 text-center sm:p-8">
        <h2 className="mb-2 text-xl font-bold text-forest-800">{t.updatedTitle}</h2>
        <p className="mb-6 text-sm text-gray-600">{t.updatedText}</p>
        <Link href="/login" className="btn-primary w-full">
          {t.login}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
          {t.newPassword}
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
          {t.confirmPassword}
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
        {status === 'saving' ? t.updating : t.update}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const { locale } = useLanguage();
  const t = copy[locale];

  return (
    <Suspense fallback={<div className="section-padding text-center">{t.loading}</div>}>
      <div className="section-padding">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-forest-800">{t.pageTitle}</h1>
            <p className="text-gray-600">{t.pageIntro}</p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    </Suspense>
  );
}
