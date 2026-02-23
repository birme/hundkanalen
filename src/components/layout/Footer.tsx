'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide site footer on admin pages — admin has its own layout
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-forest-900 text-forest-100">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-white text-lg mb-3">Hundkanalen</h3>
            <p className="text-sm text-forest-300">
              A countryside retreat in the heart of Hälsingland, Sweden.
              Perfect for families, nature lovers, and those seeking tranquility.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/gallery" className="text-forest-300 hover:text-white transition-colors">Gallery</Link></li>
              <li><Link href="/area-guide" className="text-forest-300 hover:text-white transition-colors">Area Guide</Link></li>
              <li><Link href="/contact" className="text-forest-300 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/stay" className="text-forest-300 hover:text-white transition-colors">Guest Access</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Region</h3>
            <p className="text-sm text-forest-300">
              Hälsingland, Sweden
            </p>
            <p className="text-sm text-forest-300 mt-2">
              A UNESCO World Heritage region known for its decorated farmhouses,
              vast forests, and the majestic Ljusnan river.
            </p>
          </div>
        </div>
        <div className="border-t border-forest-700 mt-8 pt-8 text-center text-sm text-forest-400">
          <p>&copy; {new Date().getFullYear()} Birmé &amp; Claise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
