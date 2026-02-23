const photos = [
  { label: 'Living Room', color: 'bg-wood-200' },
  { label: 'Kitchen', color: 'bg-cream-200' },
  { label: 'Master Bedroom', color: 'bg-forest-200' },
  { label: 'Terrace', color: 'bg-forest-100' },
  { label: 'Garden View', color: 'bg-cream-300' },
  { label: 'Fireplace', color: 'bg-falu-100' },
];

export default function PhotoGrid() {
  return (
    <section className="section-padding bg-cream-50">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-forest-800 mb-4">Gallery</h2>
          <p className="text-gray-600">A glimpse of what awaits you at Hundkanalen 3</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, i) => (
            <div
              key={photo.label}
              className={`${photo.color} rounded-xl aspect-[4/3] flex items-center justify-center ${
                i === 0 ? 'md:col-span-2 md:row-span-2 md:aspect-square' : ''
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-2 opacity-40">📷</div>
                <span className="text-sm font-medium text-gray-600">{photo.label}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <a href="/gallery" className="btn-outline">
            View Full Gallery
          </a>
        </div>
      </div>
    </section>
  );
}
