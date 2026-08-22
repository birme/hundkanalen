import type { Locale } from './i18n';

export function localizedText(locale: Locale, english: string, swedish?: string | null) {
  return locale === 'sv' && swedish?.trim() ? swedish : english;
}

export function localizedNullableText(locale: Locale, english: string | null, swedish?: string | null) {
  if (locale === 'sv' && swedish?.trim()) return swedish;
  return english;
}
