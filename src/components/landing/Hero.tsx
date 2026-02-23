import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-forest-900 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative container-wide section-padding py-24 sm:py-32">
        <div className="max-w-3xl">
          <p className="text-forest-300 text-sm font-medium tracking-wide uppercase mb-4">
            Hälsingland, Sweden
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Hundkanalen
          </h1>
          <p className="text-xl sm:text-2xl text-forest-200 mb-4">
            A countryside retreat in Hälsingland
          </p>
          <p className="text-forest-300 text-lg max-w-2xl mb-8">
            Experience the beauty of northern Sweden in this renovated 1950s villa.
            Spacious living with 4&ndash;5 bedrooms, a modern kitchen, cozy fireplace,
            and a terrace &mdash; perfect for families and nature lovers.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/contact" className="btn-primary !bg-white !text-forest-800 hover:!bg-cream-100">
              Get in Touch
            </Link>
            <Link href="/gallery" className="btn-outline !border-white/40 !text-white hover:!bg-white/10">
              View Gallery
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
