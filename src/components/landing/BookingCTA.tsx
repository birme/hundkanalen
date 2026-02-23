import Link from 'next/link';

export default function BookingCTA() {
  return (
    <section className="section-padding bg-forest-800 text-white">
      <div className="container-narrow text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Book Your Stay?</h2>
        <p className="text-forest-200 text-lg mb-8 max-w-xl mx-auto">
          Whether it is a summer holiday, a cozy winter retreat, or a family gathering —
          Hundkanalen 3 is waiting for you. Get in touch to check availability and reserve your dates.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/contact" className="btn-primary !bg-white !text-forest-800 hover:!bg-cream-100">
            Send a Booking Inquiry
          </Link>
          <Link href="/stay" className="btn-outline !border-white/40 !text-white hover:!bg-white/10">
            Have an access code? Enter here
          </Link>
        </div>
      </div>
    </section>
  );
}
