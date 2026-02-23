import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hundkanalen 3 | Countryside Retreat in Hälsingland, Sweden',
  description:
    'Book your stay at Hundkanalen 3 — a renovated 1950s villa in Färila, Hälsingland. 160m², 4-5 bedrooms, modern kitchen, terrace, and fireplace. Perfect for families and nature lovers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
