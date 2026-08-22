'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { SiteIcon } from '@/components/icons/SiteIcon';

const copy = {
  en: {
    description:
      'A countryside retreat in the heart of Hälsingland, Sweden. Perfect for families, nature lovers, and those seeking tranquility.',
    quickLinks: 'Quick Links',
    gallery: 'Gallery',
    areaGuide: 'Area Guide',
    contact: 'Contact',
    guestAccess: 'Guest Access',
    region: 'Region',
    regionText:
      'A UNESCO World Heritage region known for its decorated farmhouses, vast forests, and the majestic Ljusnan river.',
    rights: 'All rights reserved.',
  },
  sv: {
    description:
      'Ett lantligt fritidshus i hjärtat av Hälsingland. Perfekt för familjer, naturälskare och dig som söker lugn.',
    quickLinks: 'Snabblänkar',
    gallery: 'Galleri',
    areaGuide: 'Området',
    contact: 'Kontakt',
    guestAccess: 'Gästaccess',
    region: 'Region',
    regionText:
      'En UNESCO-världsarvsregion känd för sina dekorerade hälsingegårdar, stora skogar och mäktiga Ljusnan.',
    rights: 'Alla rättigheter förbehållna.',
  },
};

export default function Footer() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const t = copy[locale];

  // Hide site footer on admin pages — admin has its own layout
  // Hide on portal paths — portal has its own minimal layout
  if (pathname.startsWith('/admin') || pathname.startsWith('/stay/portal') || pathname.startsWith('/contractor-access')) {
    return null;
  }

  return (
    <footer className="bg-[#17123b] px-4 pb-28 pt-8 text-white sm:px-6 sm:pb-10 sm:pt-12 lg:px-8">
      <div className="container-wide">
        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur md:p-8">
          <div className="grid grid-cols-1 gap-7 md:grid-cols-3 md:gap-10">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold">
                <span className="grid size-7 place-items-center rounded-full bg-white/15">
                  <SiteIcon name="home" className="size-4" />
                </span>
                Färila anno 1923
              </div>
              <p className="text-sm leading-6 text-white/75">
                {t.description}
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white/90">{t.quickLinks}</h3>
              <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-1">
                <li>
                  <Link href="/gallery" className="block rounded-2xl bg-white/5 px-3 py-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white">
                    {t.gallery}
                  </Link>
                </li>
                <li>
                  <Link href="/area-guide" className="block rounded-2xl bg-white/5 px-3 py-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white">
                    {t.areaGuide}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="block rounded-2xl bg-white/5 px-3 py-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white">
                    {t.contact}
                  </Link>
                </li>
                <li>
                  <Link href="/stay" className="block rounded-2xl bg-white/5 px-3 py-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white">
                    {t.guestAccess}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white/90">{t.region}</h3>
              <p className="text-sm text-white/70">
                Hälsingland, Sweden
              </p>
              <p className="mt-2 text-sm leading-6 text-white/75">
                {t.regionText}
              </p>
            </div>
          </div>
          <div className="mt-7 border-t border-white/10 pt-5 text-center text-xs text-white/65 md:mt-8 md:pt-6">
            <p>&copy; {new Date().getFullYear()} Birmé &amp; Claise. {t.rights}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
