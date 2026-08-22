'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/i18n/LanguageProvider';

const copy = {
  en: {
    title: 'Reset Admin Password',
    intro: 'Enter your admin email and we will send a reset link.',
    email: 'Email',
    sendError: 'Could not send reset email',
    sent: 'If an admin account exists for that email, a reset link has been sent.',
    sending: 'Sending...',
    send: 'Send Reset Link',
    remembered: 'Remembered it?',
    back: 'Back to login',
  },
  sv: {
    title: 'Återställ adminlösenord',
    intro: 'Ange din admin-e-post så skickar vi en återställningslänk.',
    email: 'E-post',
    sendError: 'Kunde inte skicka återställningsmejl',
    sent: 'Om det finns ett adminkonto för den e-posten har en återställningslänk skickats.',
    sending: 'Skickar...',
    send: 'Skicka återställningslänk',
    remembered: 'Kom du ihåg det?',
    back: 'Tillbaka till login',
  },
};

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const { locale } = useLanguage();
  const t = copy[locale];

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
        throw new Error(body.error || t.sendError);
      }

      setStatus('sent');
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.sendError);
      setStatus('error');
    }
  }

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-forest-800">{t.title}</h1>
          <p className="text-gray-600">{t.intro}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              {t.email}
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
              {t.sent}
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-falu-200 bg-falu-50 px-4 py-3 text-sm text-falu-700">
              {error}
            </p>
          )}

          <button type="submit" disabled={status === 'sending'} className="btn-primary w-full disabled:opacity-50">
            {status === 'sending' ? t.sending : t.send}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {t.remembered}{' '}
          <Link href="/login" className="text-forest-600 underline hover:text-forest-800">
            {t.back}
          </Link>
        </p>
      </div>
    </div>
  );
}
