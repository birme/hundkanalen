'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  // Hide site header on admin pages — admin has its own sidebar navigation
  // Hide on portal paths — portal has its own minimal header
  if (pathname.startsWith('/admin') || pathname.startsWith('/stay/portal')) {
    return null;
  }

  const dashboardHref = '/admin';

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 border-white/10 bg-white/10 px-3 py-3 backdrop-blur-xl md:sticky md:border-b md:border-forest-100 md:bg-white/90 md:px-0 md:py-0">
      <nav className="container-wide flex items-center justify-between md:px-6 md:py-4 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2 rounded-full bg-white/15 px-2 py-1.5 text-white backdrop-blur-md md:bg-transparent md:p-0 md:text-forest-800">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/20 text-base md:size-auto md:bg-transparent md:text-2xl">⌂</span>
          <span className="truncate text-sm font-semibold md:text-lg">Färila anno 1923</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/gallery" className="text-sm text-gray-600 hover:text-forest-700 transition-colors">
            Gallery
          </Link>
          <Link href="/area-guide" className="text-sm text-gray-600 hover:text-forest-700 transition-colors">
            Area Guide
          </Link>
          <Link href="/contact" className="text-sm text-gray-600 hover:text-forest-700 transition-colors">
            Contact
          </Link>
          <Link href="/stay" className="text-sm text-forest-700 font-medium hover:text-forest-800 transition-colors">
            Access Your Stay
          </Link>
          {session ? (
            <div className="flex items-center gap-3">
              <Link href={dashboardHref} className="text-sm text-forest-700 font-medium hover:text-forest-800 transition-colors">
                {session.user?.name || 'Dashboard'}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Admin
            </Link>
          )}
        </div>

        {/* Mobile: Access button + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <Link
            href="/stay"
            className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#17123b] shadow-sm transition-colors whitespace-nowrap"
          >
            Stay Code
          </Link>
          <button
            className="rounded-full bg-white/15 p-2 text-white backdrop-blur-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
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
        <div className="mx-3 mt-1 rounded-3xl border border-white/15 bg-[#17123b]/95 px-4 py-4 text-white shadow-2xl md:hidden">
          <div className="grid gap-2">
          <Link href="/gallery" className="rounded-2xl px-3 py-3 text-white/80 hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>
            Gallery
          </Link>
          <Link href="/area-guide" className="rounded-2xl px-3 py-3 text-white/80 hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>
            Area Guide
          </Link>
          <Link href="/contact" className="rounded-2xl px-3 py-3 text-white/80 hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>
            Contact
          </Link>
          <Link href="/stay" className="rounded-2xl bg-white px-3 py-3 font-medium text-[#17123b]" onClick={() => setMobileMenuOpen(false)}>
            Access Your Stay
          </Link>
          {session ? (
            <>
              <Link href={dashboardHref} className="rounded-2xl px-3 py-3 font-medium text-white" onClick={() => setMobileMenuOpen(false)}>
                {session.user?.name || 'Dashboard'}
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                className="rounded-2xl px-3 py-3 text-left text-white/65"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-2xl px-3 py-3 text-sm text-white/60" onClick={() => setMobileMenuOpen(false)}>
              Admin Login
            </Link>
          )}
          </div>
        </div>
      )}
    </header>
    <nav className="fixed bottom-4 left-4 right-4 z-40 rounded-full border border-white/15 bg-[#17123b]/85 px-3 py-2 text-white shadow-2xl shadow-black/30 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-4 text-center text-[11px] font-medium">
        {[
          { href: '/', label: 'Home' },
          { href: '/gallery', label: 'Photos' },
          { href: '/stay', label: 'Stay' },
          { href: '/contact', label: 'Contact' },
        ].map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-2 py-2 ${active ? 'bg-white/15 text-white' : 'text-white/70'}`}
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
