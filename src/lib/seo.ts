import type { Metadata } from 'next';

export const siteUrl = 'https://fritidshuset.birme.se';
export const siteName = 'Färila anno 1923';
export const propertyLocation = 'Färila, Hälsingland, Sweden';
export const ogImagePath = '/opengraph-image?v=20260822-2205';

export const seo = {
  title: `${siteName} | Countryside Retreat in Hälsingland, Sweden`,
  description:
    'A renovated 1920s countryside villa in Färila, Hälsingland with 4-5 bedrooms, modern kitchen, fireplace, terrace and access to forests, skiing, fishing and UNESCO heritage.',
  svDescription:
    'Ett renoverat fritidshus från 1920-talet i Färila, Hälsingland med 4-5 sovrum, modernt kök, eldstad, altan och närhet till skog, skidåkning, fiske och världsarv.',
  keywords: [
    'Färila holiday home',
    'Hälsingland vacation rental',
    'fritidshus Färila',
    'stuga Hälsingland',
    'Järvsö accommodation',
    'family villa Sweden',
    'UNESCO Hälsingland farmhouses',
    'Järvsöbacken',
    'Järvsö downhill',
  ],
};

export function absoluteUrl(path = '/') {
  return new URL(path, siteUrl).toString();
}

export function pageMetadata({
  title,
  description,
  path,
  images = [ogImagePath],
}: {
  title: string;
  description: string;
  path: string;
  images?: string[];
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: url,
        sv: url,
        'x-default': url,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: 'website',
      locale: 'en_US',
      alternateLocale: ['sv_SE'],
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    alternateName: 'Fritidshuset i Färila',
    url: siteUrl,
    inLanguage: ['en', 'sv'],
  };
}

export function lodgingJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LodgingBusiness', 'VacationRental'],
    name: siteName,
    alternateName: 'Fritidshuset i Färila',
    url: siteUrl,
    description: seo.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Färila',
      addressRegion: 'Gävleborg County',
      addressCountry: 'SE',
    },
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: '4-5 bedrooms', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Modern kitchen', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Fireplace', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Terrace', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'WiFi', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Parking', value: true },
    ],
    touristType: ['Families', 'Nature lovers', 'Skiers', 'Cyclists', 'Cultural heritage travelers'],
    knowsAbout: [
      'Hälsingland',
      'Färila',
      'Järvsöbacken',
      'Järvsö Bergscykelpark',
      'UNESCO Decorated Farmhouses of Hälsingland',
      'Ljusnan river',
    ],
  };
}

export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Where is Färila anno 1923 located?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Färila anno 1923 is a countryside holiday home in Färila, Hälsingland, Sweden, close to forests, the Ljusnan river and regional attractions around Järvsö and Ljusdal.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many guests can stay at the house?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The house is suited for families and groups, with 4-5 bedrooms and space for up to 10 guests.',
        },
      },
      {
        '@type': 'Question',
        name: 'What can guests do nearby?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nearby activities include skiing at Järvsöbacken, downhill biking at Järvsö Bergscykelpark, fishing in Ljusnan, hiking, swimming, visiting Hälsingland UNESCO decorated farmhouses and exploring local cafés and villages.',
        },
      },
    ],
  };
}
