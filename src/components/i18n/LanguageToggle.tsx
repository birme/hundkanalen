'use client';

import { useLanguage } from './LanguageProvider';
import type { Locale } from '@/lib/i18n';

const options: Array<{ locale: Locale; label: string }> = [
  { locale: 'en', label: 'EN' },
  { locale: 'sv', label: 'SV' },
];

export default function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={`inline-grid grid-cols-2 rounded-full border border-white/20 bg-white/10 p-1 text-xs font-semibold backdrop-blur-xl md:border-[#17123b]/10 md:bg-[#17123b]/5 ${
        compact ? 'w-20' : 'w-24'
      }`}
      role="group"
      aria-label={locale === 'sv' ? 'Välj språk' : 'Choose language'}
    >
      {options.map((option) => {
        const active = locale === option.locale;
        return (
          <button
            key={option.locale}
            type="button"
            onClick={() => setLocale(option.locale)}
            aria-pressed={active}
            className={`rounded-full px-2 py-1.5 transition-colors ${
              active
                ? 'bg-white text-[#17123b] shadow-sm md:bg-[#17123b] md:text-white'
                : 'text-white/70 hover:text-white md:text-[#17123b]/60 md:hover:text-[#17123b]'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
