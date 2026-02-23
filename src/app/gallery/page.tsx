import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery | Hundkanalen 3',
  description: 'Photos of Hundkanalen 3 — a renovated 1950s villa in Färila, Hälsingland.',
};

const rooms = [
  { label: 'Living Room', description: 'Spacious living area with fireplace and comfortable seating' },
  { label: 'Kitchen', description: 'Modern fully-equipped kitchen with dining area' },
  { label: 'Master Bedroom', description: 'Bright master bedroom with quality furnishings' },
  { label: 'Bedroom 2', description: 'Cozy second bedroom with twin beds' },
  { label: 'Bedroom 3', description: 'Third bedroom, perfect for children' },
  { label: 'Bathroom', description: 'Updated bathroom with shower' },
  { label: 'Terrace', description: 'Spacious terrace for outdoor dining' },
  { label: 'Garden', description: 'Lush garden with beautiful views' },
  { label: 'Exterior', description: 'The villa facade from the garden' },
];

export default function GalleryPage() {
  return (
    <div className="section-padding">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-forest-800 mb-4">Gallery</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Take a virtual tour of Hundkanalen 3. Photos will be updated with professional
            photography — for now, here is a preview of the spaces.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room.label} className="group">
              <div className="bg-cream-100 rounded-xl aspect-[4/3] flex items-center justify-center border border-cream-200 group-hover:border-forest-300 transition-colors">
                <div className="text-center p-4">
                  <div className="text-5xl mb-3 opacity-30">📷</div>
                  <span className="text-sm font-medium text-gray-500">Photo coming soon</span>
                </div>
              </div>
              <h3 className="font-semibold text-forest-800 mt-3">{room.label}</h3>
              <p className="text-sm text-gray-600">{room.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
