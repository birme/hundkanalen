import Hero from '@/components/landing/Hero';
import PropertyHighlights from '@/components/landing/PropertyHighlights';
import PhotoGrid from '@/components/landing/PhotoGrid';
import AreaTeaser from '@/components/landing/AreaTeaser';
import BookingCTA from '@/components/landing/BookingCTA';

export default function Home() {
  return (
    <>
      <Hero />
      <PropertyHighlights />
      <PhotoGrid />
      <AreaTeaser />
      <BookingCTA />
    </>
  );
}
