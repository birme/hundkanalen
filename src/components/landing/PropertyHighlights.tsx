const highlights = [
  {
    icon: '🏠',
    title: '160 m² Living Space',
    description: 'A spacious 6-room renovated villa from the 1920s with generous room for the whole family.',
  },
  {
    icon: '🛏️',
    title: '4–5 Bedrooms',
    description: 'Flexible sleeping arrangements for up to 10 guests, ideal for families or groups of friends.',
  },
  {
    icon: '🍳',
    title: 'Modern Kitchen',
    description: 'Fully equipped kitchen for preparing meals together, with modern appliances and ample counter space.',
  },
  {
    icon: '🔥',
    title: 'Fireplace',
    description: 'Cozy up by the fireplace on chilly evenings — the heart of the home for warm gatherings.',
  },
  {
    icon: '☀️',
    title: 'Spacious Terrace',
    description: 'Enjoy outdoor dining and evening relaxation on the terrace overlooking the garden.',
  },
  {
    icon: '❄️',
    title: 'Air Conditioning',
    description: 'Stay comfortable year-round with modern climate control throughout the house.',
  },
];

export default function PropertyHighlights() {
  return (
    <section className="section-padding bg-white">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-forest-800 mb-4">The Property</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A lovingly renovated 1920s villa that blends authentic Swedish character
            with modern comfort, set in the peaceful countryside of Hälsingland.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {highlights.map((item) => (
            <div key={item.title} className="text-center p-6 rounded-xl bg-cream-50 border border-cream-200">
              <span className="text-4xl mb-4 block">{item.icon}</span>
              <h3 className="font-semibold text-forest-800 text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
