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
    <section className="bg-[#f6f0e4] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="container-wide">
        <div className="mb-6 flex items-end justify-between gap-4 md:mb-12 md:text-center">
          <div className="md:mx-auto">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-falu-700">The Property</p>
            <h2 className="text-3xl font-bold leading-tight text-[#17123b] md:text-4xl">Built for slow days</h2>
          </div>
          <span className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#17123b] shadow-sm md:hidden">
            160 m²
          </span>
        </div>
        <p className="mb-6 max-w-2xl text-sm leading-6 text-gray-600 md:mx-auto md:mb-12 md:text-center md:text-base">
            A lovingly renovated 1920s villa that blends authentic Swedish character
            with modern comfort, set in the peaceful countryside of Hälsingland.
        </p>
        <div className="flex snap-x gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible lg:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="min-w-[78%] snap-start rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur md:min-w-0 md:p-6"
            >
              <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-[#17123b] text-2xl text-white">{item.icon}</span>
              <h3 className="mb-2 text-lg font-semibold text-[#17123b]">{item.title}</h3>
              <p className="text-sm leading-6 text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
