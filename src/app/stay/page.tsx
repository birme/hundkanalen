'use client';

import { useState, FormEvent } from 'react';
import PublicImageHero from '@/components/layout/PublicImageHero';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { SiteIcon } from '@/components/icons/SiteIcon';

const copy = {
  en: {
    heroEyebrow: 'Guest Portal',
    heroTitle: 'Access your stay',
    heroDescription: 'Enter the stay code from your hosts to open check-in details, house information and check-out steps.',
    invalidCode: 'Invalid access code. Please try again.',
    genericError: 'Something went wrong. Please try again.',
    cardTitle: 'Guest Portal',
    location: 'Hälsingland, Sweden',
    accessCode: 'Access Code',
    verifying: 'Verifying...',
    access: 'Access My Stay',
    help: 'Enter the access code provided by your host',
    sentBy: 'Your code was sent by the property owners Jonas & Frédérique.',
    trouble: 'Having trouble?',
    contactUs: 'Contact us',
  },
  sv: {
    heroEyebrow: 'Gästportal',
    heroTitle: 'Öppna din vistelse',
    heroDescription: 'Ange vistelsekoden från dina värdar för att se incheckning, husinformation och utcheckning.',
    invalidCode: 'Ogiltig kod. Försök igen.',
    genericError: 'Något gick fel. Försök igen.',
    cardTitle: 'Gästportal',
    location: 'Hälsingland, Sverige',
    accessCode: 'Vistelsekod',
    verifying: 'Verifierar...',
    access: 'Öppna min vistelse',
    help: 'Ange koden du fått av värden',
    sentBy: 'Koden skickades av fastighetsägarna Jonas & Frédérique.',
    trouble: 'Problem?',
    contactUs: 'Kontakta oss',
  },
};

export default function StayAccessPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { locale } = useLanguage();
  const t = copy[locale];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/guest/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.invalidCode);
        setLoading(false);
        return;
      }

      // Redirect to portal on success
      window.location.href = '/stay/portal';
    } catch {
      setError(t.genericError);
      setLoading(false);
    }
  }

  return (
    <>
      <PublicImageHero
        eyebrow={t.heroEyebrow}
        title={t.heroTitle}
        description={t.heroDescription}
      />
      <div className="flex items-center justify-center px-4 pb-28 pt-10 sm:px-6 sm:pb-16 lg:px-8">
        <div className="w-full max-w-md mx-auto">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-forest-100 shadow-lg overflow-hidden">
          {/* Card header */}
          <div className="bg-forest-700 px-8 py-8 text-center">
            <span className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-white/15 text-white">
              <SiteIcon name="home" className="size-6" />
            </span>
            <h1 className="text-2xl font-bold text-white">{t.cardTitle}</h1>
            <p className="text-forest-200 text-sm mt-1">{t.location}</p>
          </div>

          {/* Card body */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-forest-800 mb-2"
                >
                  {t.accessCode}
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXXXX"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  required
                  className="
                    w-full px-4 py-4
                    text-center text-2xl font-mono tracking-widest
                    uppercase
                    bg-cream-50 border-2 border-forest-200
                    rounded-xl
                    text-forest-900
                    placeholder:text-forest-200 placeholder:font-mono
                    focus:outline-none focus:border-forest-500 focus:bg-white
                    transition-colors
                  "
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.trim().length === 0}
                className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t.verifying : t.access}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              {t.help}
            </p>
          </div>
        </div>

        {/* Help text below card */}
        <p className="text-center text-xs text-gray-400 mt-4">
          {t.sentBy}
          <br />
          {t.trouble}{' '}
          <a href="/contact" className="text-forest-600 hover:text-forest-800 underline">
            {t.contactUs}
          </a>
        </p>
        </div>
      </div>
    </>
  );
}
