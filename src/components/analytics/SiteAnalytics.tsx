'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/i18n/LanguageProvider';

const ignoredPrefixes = ['/admin', '/api', '/login', '/forgot-password', '/reset-password', '/contractor-access'];

export default function SiteAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useLanguage();

  useEffect(() => {
    if (!pathname || ignoredPrefixes.some((prefix) => pathname.startsWith(prefix))) {
      return;
    }

    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    const payload = {
      path,
      referrer: document.referrer || null,
      locale,
      viewportWidth: window.innerWidth,
      title: document.title,
    };

    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/pageview', blob);
      return;
    }

    void fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [locale, pathname, searchParams]);

  return null;
}
