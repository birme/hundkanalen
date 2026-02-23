'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const dashboardHref = session?.user?.role === 'admin' ? '/admin' : '/guest';

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-forest-100 sticky top-0 z-50">
      <nav className="container-wide flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🏡</span>
          <div>
            <span className="font-semibold text-forest-800 text-lg">Hundkanalen 3</span>
            <span className="hidden sm:inline text-sm text-wood-600 ml-2">Färila, Hälsingland</span>
          </div>
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
            <Link href="/login" className="btn-primary text-sm !py-2 !px-4">
              Log in
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-gray-600"
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
            <Link href="/login" className="btn-primary text-sm !py-2 !px-4 w-full text-center" onClick={() => setMobileMenuOpen(false)}>
              Log in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
