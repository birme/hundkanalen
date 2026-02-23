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
    <section className="section-padding bg-white">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-falu-700 text-sm font-medium tracking-wide uppercase mb-2">
              Discover Hälsingland
            </p>
            <h2 className="text-3xl font-bold text-forest-800 mb-4">
              A Region Rich in Nature &amp; Culture
            </h2>
            <p className="text-gray-600 mb-6">
              Our retreat is nestled in the heart of Hälsingland — a region celebrated for its
              vast forests, the majestic Ljusnan river, and a living cultural heritage.
              From UNESCO-listed decorated farmhouses to endless outdoor adventures,
              there is something for everyone in every season.
            </p>
            <Link href="/area-guide" className="btn-secondary">
              Explore the Area Guide
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {activities.map((activity) => (
              <div key={activity.title} className="bg-forest-50 rounded-xl p-5 border border-forest-100">
                <span className="text-3xl mb-3 block">{activity.icon}</span>
                <h3 className="font-semibold text-forest-800 mb-1">{activity.title}</h3>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
