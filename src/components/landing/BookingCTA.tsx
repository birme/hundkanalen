import Link from 'next/link';

export default function BookingCTA() {
  return (
    <section className="bg-[#17123b] px-4 pb-28 pt-10 text-white sm:px-6 sm:pb-16 sm:pt-16 lg:px-8">
      <div className="container-narrow rounded-[2rem] border border-white/10 bg-white/10 p-6 text-center shadow-2xl shadow-black/20 backdrop-blur md:p-10">
        <h2 className="mb-4 text-3xl font-bold leading-tight md:text-4xl">Interested in Staying?</h2>
        <p className="mx-auto mb-8 max-w-xl text-sm leading-7 text-white/65 md:text-lg">
          Whether it is a summer holiday, a cozy winter retreat, or a family gathering —
          get in touch to learn more and check availability.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/contact" className="btn-primary !rounded-full !bg-white !text-[#17123b] hover:!bg-cream-100">
            Send an Inquiry
          </Link>
          <Link href="/stay" className="btn-outline !rounded-full !border-white/25 !text-white hover:!bg-white/10">
            Have an access code? Enter here
          </Link>
        </div>
      </div>
    </section>
  );
}
