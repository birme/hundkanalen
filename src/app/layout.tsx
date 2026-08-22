import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SessionWrapper from '@/components/layout/SessionWrapper';
import { LanguageProvider } from '@/components/i18n/LanguageProvider';
import UmamiAnalytics from '@/components/analytics/UmamiAnalytics';
import JsonLd from '@/components/seo/JsonLd';
import { absoluteUrl, faqJsonLd, lodgingJsonLd, ogImagePath, seo, siteName, siteUrl, websiteJsonLd } from '@/lib/seo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: seo.title,
    template: `%s | ${siteName}`,
  },
  description: seo.description,
  applicationName: siteName,
  authors: [{ name: 'Birmé & Claise' }],
  creator: 'Birmé & Claise',
  publisher: 'Birmé & Claise',
  keywords: seo.keywords,
  category: 'travel',
  alternates: {
    canonical: siteUrl,
    languages: {
      en: siteUrl,
      sv: siteUrl,
      'x-default': siteUrl,
    },
  },
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: siteUrl,
    siteName,
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['sv_SE'],
    images: [
      {
        url: absoluteUrl(ogImagePath),
        width: 1200,
        height: 630,
        alt: `${siteName} in Hälsingland, Sweden`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: seo.title,
    description: seo.description,
    images: [absoluteUrl(ogImagePath)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <a href="#main-content" lang="en" className="skip-link">
          Skip to main content
        </a>
        <SessionWrapper>
          <LanguageProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
              <Footer />
            </div>
          </LanguageProvider>
        </SessionWrapper>
        <JsonLd data={websiteJsonLd()} />
        <JsonLd data={lodgingJsonLd()} />
        <JsonLd data={faqJsonLd()} />
        <UmamiAnalytics />
      </body>
    </html>
  );
}
