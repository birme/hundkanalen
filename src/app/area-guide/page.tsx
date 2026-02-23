import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Area Guide | Hundkanalen 3',
  description: 'Discover Hälsingland — outdoor adventures, UNESCO heritage, and Swedish countryside at its finest.',
};

const seasons = [
  {
    name: 'Summer (Jun–Aug)',
    activities: [
      'Swimming in lakes and the Ljusnan river',
      'Hiking and trail walking',
      'Fishing — pike, trout, and grayling',
      'Berry and mushroom picking',
      'Visiting Hälsingland\'s decorated farmhouses',
      'Midsummer celebrations',
    ],
  },
  {
    name: 'Autumn (Sep–Nov)',
    activities: [
      'Spectacular fall colors in the forests',
      'Hunting season',
      'Mushroom foraging',
      'Scenic drives through Hälsingland',
      'Cozy evenings by the fireplace',
    ],
  },
  {
    name: 'Winter (Dec–Feb)',
    activities: [
      'Cross-country skiing',
      'Downhill skiing at nearby resorts',
      'Snowmobiling',
      'Ice fishing',
      'Northern lights viewing',
      'Christmas markets in Ljusdal',
    ],
  },
  {
    name: 'Spring (Mar–May)',
    activities: [
      'Bird watching — cranes and migratory birds',
      'Early hiking as snow melts',
      'Spring fishing season begins',
      'Walpurgis Night celebrations',
      'Wildflower meadows',
    ],
  },
];

const nearby = [
  { place: 'Ljusdal', distance: '20 min', description: 'Nearest town with supermarkets, restaurants, pharmacy, and train station.' },
  { place: 'Järvsö', distance: '35 min', description: 'Popular tourist village with ski resort, bear park, and adventure activities.' },
  { place: 'Hudiksvall', distance: '1 h', description: 'Coastal town with shopping, restaurants, and regional airport.' },
  { place: 'Sundsvall', distance: '1.5 h', description: 'Major city with airport, shopping malls, and cultural offerings.' },
];

export default function AreaGuidePage() {
  return (
    <div className="section-padding">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-forest-800 mb-4">Area Guide</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hälsingland is a region of vast forests, the majestic Ljusnan river, and a living
            cultural heritage. Here is your guide to making the most of your stay.
          </p>
        </div>

        {/* UNESCO Section */}
        <section className="mb-16">
          <div className="bg-falu-50 border border-falu-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-falu-800 mb-4">UNESCO World Heritage</h2>
            <p className="text-gray-700 mb-4">
              The decorated farmhouses of Hälsingland are a UNESCO World Heritage Site. These
              magnificent timber buildings, with their lavishly painted interiors, represent the
              pinnacle of Scandinavian folk art and are found throughout the region. Several are
              open to visitors during summer.
            </p>
            <p className="text-sm text-falu-700">
              Nearest decorated farmhouse visits: Gästgivars in Stene, Erik-Anders in Asta, and Pallars in Långhed.
            </p>
          </div>
        </section>

        {/* Seasons */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-forest-800 mb-8 text-center">Activities by Season</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {seasons.map((season) => (
              <div key={season.name} className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-forest-700 text-lg mb-4">{season.name}</h3>
                <ul className="space-y-2">
                  {season.activities.map((activity) => (
                    <li key={activity} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-forest-500 mt-0.5">&#10003;</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Nearby */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-forest-800 mb-8 text-center">Nearby Places</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {nearby.map((item) => (
              <div key={item.place} className="bg-cream-50 rounded-xl border border-cream-200 p-5">
                <h3 className="font-semibold text-forest-800">{item.place}</h3>
                <p className="text-sm text-wood-600 mb-2">{item.distance} by car</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Practical */}
        <section>
          <div className="bg-forest-50 border border-forest-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-forest-800 mb-4">Getting Here</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-forest-700 mb-2">By Car</h3>
                <p className="text-sm text-gray-600">
                  ~350 km north of Stockholm via E4 and Route 83. Approximately 3.5 hours drive.
                  Free parking at the property.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-forest-700 mb-2">By Train</h3>
                <p className="text-sm text-gray-600">
                  SJ regional trains run to Ljusdal station from Stockholm Central (~4 hours).
                  We can arrange pickup from the station.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-forest-700 mb-2">By Air</h3>
                <p className="text-sm text-gray-600">
                  Nearest airports: Hudiksvall (1h) or Sundsvall-Timrå (1.5h).
                  Car rental available at both airports.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
