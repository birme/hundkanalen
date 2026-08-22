'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import LanguageToggle from '@/components/i18n/LanguageToggle';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { SiteIcon } from '@/components/icons/SiteIcon';

const copy = {
  en: {
    gallery: 'Gallery',
    areaGuide: 'Area Guide',
    contact: 'Contact',
    stay: 'Access Your Stay',
    stayCode: 'Stay Code',
    toggleMenu: 'Toggle menu',
    dashboard: 'Dashboard',
    signOut: 'Sign out',
    admin: 'Admin',
    adminLogin: 'Admin Login',
    home: 'Home',
    photos: 'Photos',
    homeAria: 'Go to homepage',
  },
  sv: {
    gallery: 'Galleri',
    areaGuide: 'Området',
    contact: 'Kontakt',
    stay: 'Din vistelse',
    stayCode: 'Vistelsekod',
    toggleMenu: 'Öppna meny',
    dashboard: 'Admin',
    signOut: 'Logga ut',
    admin: 'Admin',
    adminLogin: 'Adminlogin',
    home: 'Hem',
    photos: 'Foton',
    homeAria: 'Gå till startsidan',
  },
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const { locale } = useLanguage();
  const t = copy[locale];

  // Hide site header on admin pages — admin has its own sidebar navigation
  // Hide on portal paths — portal has its own minimal header
  if (pathname.startsWith('/admin') || pathname.startsWith('/stay/portal') || pathname.startsWith('/contractor-access')) {
    return null;
  }

  const dashboardHref = '/admin';

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 border-white/10 bg-white/10 px-3 py-3 backdrop-blur-xl md:sticky md:border-b md:border-forest-100 md:bg-white/90 md:px-0 md:py-0">
      <nav className="container-wide flex items-center justify-between md:px-6 md:py-4 lg:px-8">
        <Link href="/" aria-label={t.homeAria} className="flex min-w-0 items-center gap-2 rounded-full bg-white/15 px-2 py-1.5 text-white backdrop-blur-md md:bg-transparent md:p-0 md:text-forest-800">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/20 md:bg-transparent">
            <SiteIcon name="home" className="size-4 md:size-5" />
          </span>
          <span className="truncate text-sm font-semibold md:text-lg">Färila anno 1923</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/gallery" aria-current={pathname === '/gallery' ? 'page' : undefined} className="text-sm text-gray-700 hover:text-forest-700 transition-colors">
            {t.gallery}
          </Link>
          <Link href="/area-guide" aria-current={pathname === '/area-guide' ? 'page' : undefined} className="text-sm text-gray-700 hover:text-forest-700 transition-colors">
            {t.areaGuide}
          </Link>
          <Link href="/contact" aria-current={pathname === '/contact' ? 'page' : undefined} className="text-sm text-gray-700 hover:text-forest-700 transition-colors">
            {t.contact}
          </Link>
          <Link href="/stay" aria-current={pathname === '/stay' ? 'page' : undefined} className="text-sm text-forest-700 font-medium hover:text-forest-800 transition-colors">
            {t.stay}
          </Link>
          <LanguageToggle />
          {session ? (
            <div className="flex items-center gap-3">
              <Link href={dashboardHref} className="text-sm text-forest-700 font-medium hover:text-forest-800 transition-colors">
                {session.user?.name || t.dashboard}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                {t.signOut}
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
              {t.admin}
            </Link>
          )}
        </div>

        {/* Mobile: Access button + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <Link
            href="/stay"
            className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#17123b] shadow-sm transition-colors whitespace-nowrap"
          >
            {t.stayCode}
          </Link>
          <button
            className="rounded-full bg-white/15 p-2 text-white backdrop-blur-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={t.toggleMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="mx-3 mt-1 rounded-3xl border border-white/15 bg-[#17123b]/95 px-4 py-4 text-white shadow-2xl md:hidden">
          <div className="grid gap-2">
          <div className="px-3 py-2">
            <LanguageToggle compact />
          </div>
          <Link href="/gallery" className="rounded-2xl px-3 py-3 text-white/80 hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>
            {t.gallery}
          </Link>
          <Link href="/area-guide" className="rounded-2xl px-3 py-3 text-white/80 hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>
            {t.areaGuide}
          </Link>
          <Link href="/contact" className="rounded-2xl px-3 py-3 text-white/80 hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>
            {t.contact}
          </Link>
          <Link href="/stay" className="rounded-2xl bg-white px-3 py-3 font-medium text-[#17123b]" onClick={() => setMobileMenuOpen(false)}>
            {t.stay}
          </Link>
          {session ? (
            <>
              <Link href={dashboardHref} className="rounded-2xl px-3 py-3 font-medium text-white" onClick={() => setMobileMenuOpen(false)}>
                {session.user?.name || t.dashboard}
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                className="rounded-2xl px-3 py-3 text-left text-white/80"
              >
                {t.signOut}
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-2xl px-3 py-3 text-sm text-white/80" onClick={() => setMobileMenuOpen(false)}>
              {t.adminLogin}
            </Link>
          )}
          </div>
        </div>
      )}
    </header>
    <nav className="fixed bottom-4 left-4 right-4 z-40 rounded-full border border-white/15 bg-[#17123b]/85 px-3 py-2 text-white shadow-2xl shadow-black/30 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-4 text-center text-[11px] font-medium">
        {[
          { href: '/', label: t.home },
          { href: '/gallery', label: t.photos },
          { href: '/stay', label: t.stay },
          { href: '/contact', label: t.contact },
        ].map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`rounded-full px-2 py-2 ${active ? 'bg-white/15 text-white' : 'text-white/80'}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
}
