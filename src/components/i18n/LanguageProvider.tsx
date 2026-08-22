'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { defaultLocale, detectPreferredLocale, isLocale, type Locale } from '@/lib/i18n';

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const STORAGE_KEY = 'hk-locale';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(savedLocale)) {
      setLocaleState(savedLocale);
      return;
    }

    const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
    setLocaleState(detectPreferredLocale(browserLanguages.filter(Boolean)));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.cookie = `${STORAGE_KEY}=${locale}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
    }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
}
