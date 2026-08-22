export type Locale = 'en' | 'sv';

export const defaultLocale: Locale = 'en';

export function isLocale(value: string | null): value is Locale {
  return value === 'en' || value === 'sv';
}

export function detectPreferredLocale(languages: readonly string[]): Locale {
  return languages.some((language) => language.toLowerCase().startsWith('sv')) ? 'sv' : defaultLocale;
}
