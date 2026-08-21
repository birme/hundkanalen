import Link from 'next/link';

const activities = [
  {
    icon: '🏔️',
    title: 'Hiking & Nature',
    description: 'Explore pristine forests, trails along the Ljusnan river, and scenic mountain paths.',
  },
  {
    icon: '🎣',
    title: 'Fishing',
    description: 'World-class fishing in the Ljusnan river and surrounding lakes — grayling, trout, and pike.',
  },
  {
    icon: '⛷️',
    title: 'Winter Sports',
    description: 'Cross-country skiing, snowmobiling, and downhill slopes within easy reach.',
  },
  {
    icon: '🏛️',
    title: 'UNESCO Heritage',
    description: 'Hälsingland\'s decorated farmhouses are a UNESCO World Heritage Site — a must-see.',
  },
];

export default function AreaTeaser() {
  return (
    <section className="bg-cream-50 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="container-wide">
        <div className="grid min-w-0 gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-falu-700">
              Discover Hälsingland
            </p>
            <h2 className="mb-4 text-3xl font-bold leading-tight text-[#17123b] md:text-4xl">
              A Region Rich in Nature &amp; Culture
            </h2>
            <p className="mb-6 text-sm leading-7 text-gray-600 md:text-base">
              Our retreat is nestled in the heart of Hälsingland — a region celebrated for its
              vast forests, the majestic Ljusnan river, and a living cultural heritage.
              From UNESCO-listed decorated farmhouses to endless outdoor adventures,
              there is something for everyone in every season.
            </p>
            <Link href="/area-guide" className="btn-secondary !rounded-full">
              Explore the Area Guide
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {activities.map((activity) => (
              <div key={activity.title} className="rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-sm md:p-5">
                <span className="mb-4 grid size-11 place-items-center rounded-2xl bg-[#17123b] text-2xl text-white">{activity.icon}</span>
                <h3 className="mb-1 text-sm font-semibold text-[#17123b] md:text-base">{activity.title}</h3>
                <p className="text-xs leading-5 text-gray-600 md:text-sm">{activity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
