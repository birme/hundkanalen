import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-forest-100">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-white text-lg mb-3">Hundkanalen 3</h3>
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
              <li><Link href="/contact" className="text-forest-300 hover:text-white transition-colors">Contact & Booking</Link></li>
              <li><Link href="/login" className="text-forest-300 hover:text-white transition-colors">Guest Login</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Location</h3>
            <address className="text-sm text-forest-300 not-italic">
              Hundkanalen 3<br />
              820 64 Färila<br />
              Hälsingland, Sweden
            </address>
            <p className="text-sm text-forest-300 mt-3">
              ~350 km north of Stockholm<br />
              Train to Ljusdal station
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
