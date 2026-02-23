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
    <header className="bg-white/90 backdrop-blur-sm border-b border-forest-100 sticky top-0 z-50">
      <nav className="container-wide flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🏡</span>
          <span className="font-semibold text-forest-800 text-lg">Färila anno 1923</span>
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
            className="text-xs font-semibold text-white bg-forest-600 hover:bg-forest-700 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap"
          >
            Access Your Stay
          </Link>
          <button
            className="p-2 text-gray-600"
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
        <div className="md:hidden border-t border-forest-100 bg-white px-4 py-4 space-y-3">
          <Link href="/gallery" className="block text-gray-600 hover:text-forest-700" onClick={() => setMobileMenuOpen(false)}>
            Gallery
          </Link>
          <Link href="/area-guide" className="block text-gray-600 hover:text-forest-700" onClick={() => setMobileMenuOpen(false)}>
            Area Guide
          </Link>
          <Link href="/contact" className="block text-gray-600 hover:text-forest-700" onClick={() => setMobileMenuOpen(false)}>
            Contact
          </Link>
          <Link href="/stay" className="block text-forest-700 font-medium" onClick={() => setMobileMenuOpen(false)}>
            Access Your Stay
          </Link>
          {session ? (
            <>
              <Link href={dashboardHref} className="block text-forest-700 font-medium" onClick={() => setMobileMenuOpen(false)}>
                {session.user?.name || 'Dashboard'}
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                className="block text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="block text-sm text-gray-500 hover:text-gray-700" onClick={() => setMobileMenuOpen(false)}>
              Admin Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
