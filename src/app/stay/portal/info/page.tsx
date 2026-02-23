export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getGuestSession } from '@/lib/guest-auth';
import { getDb } from '@/lib/db';

type PropertyInfoItem = {
  id: string;
  category: string;
  title: string;
  content: string;
  sort_order: number;
};

type CategoryConfig = {
  label: string;
  bgClass: string;
  borderClass: string;
  headingClass: string;
  titleClass: string;
};

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  rules: {
    label: 'House Rules',
    bgClass: 'bg-red-50',
    borderClass: 'border-red-200',
    headingClass: 'text-red-800',
    titleClass: 'text-red-700',
  },
  practical: {
    label: 'Practical Information',
    bgClass: 'bg-white',
    borderClass: 'border-gray-100',
    headingClass: 'text-forest-800',
    titleClass: 'text-forest-700',
  },
  emergency: {
    label: 'Emergency',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-200',
    headingClass: 'text-orange-800',
    titleClass: 'text-orange-700',
  },
  location: {
    label: 'Location & Directions',
    bgClass: 'bg-cream-50',
    borderClass: 'border-cream-200',
    headingClass: 'text-wood-800',
    titleClass: 'text-wood-700',
  },
  general: {
    label: 'General',
    bgClass: 'bg-white',
    borderClass: 'border-gray-100',
    headingClass: 'text-forest-800',
    titleClass: 'text-forest-700',
  },
};

const CATEGORY_ORDER = ['rules', 'emergency', 'practical', 'location', 'general'];

export default async function PropertyInfoPage() {
  const session = await getGuestSession();
  if (!session) {
    redirect('/stay');
  }

  const sql = getDb();
  const items = await sql<PropertyInfoItem[]>`
    SELECT id, category, title, content, sort_order
    FROM property_info
    ORDER BY category ASC, sort_order ASC
  `;

  // Group by category
  const grouped = items.reduce<Record<string, PropertyInfoItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Build ordered list of categories that have items
  const orderedCategories = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]?.length > 0),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold text-forest-800">Property Information</h1>
        <p className="text-gray-500 mt-1">Everything you need to know about Hundkanalen 3</p>
      </div>

      {orderedCategories.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 px-6 py-10 text-center">
          <p className="text-gray-400 text-sm">No property information has been added yet.</p>
        </div>
      )}

      {orderedCategories.map((category) => {
        const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.general;
        const categoryItems = grouped[category];

        return (
          <section key={category}>
            <h2 className={`text-xl font-bold mb-4 ${config.headingClass}`}>
              {config.label}
            </h2>
            <div className="space-y-3">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border shadow-sm px-6 py-5 ${config.bgClass} ${config.borderClass}`}
                >
                  <h3 className={`font-semibold mb-1 ${config.titleClass}`}>{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
