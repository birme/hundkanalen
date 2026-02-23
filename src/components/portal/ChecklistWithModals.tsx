'use client';

import { useState } from 'react';
import PropertyInfoModal from './PropertyInfoModal';

type LinkedPropertyInfo = {
  id: string;
  title: string;
  content: string;
};

export type ChecklistItemWithLinks = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  linked_info: LinkedPropertyInfo[];
};

type Props = {
  items: ChecklistItemWithLinks[];
  accentColor: 'forest' | 'wood';
};

export default function ChecklistWithModals({ items, accentColor }: Props) {
  const [activeModal, setActiveModal] = useState<LinkedPropertyInfo | null>(null);

  const numberBg = accentColor === 'forest'
    ? 'bg-forest-100 text-forest-700'
    : 'bg-wood-100 text-wood-700';

  return (
    <>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4 flex gap-3"
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full ${numberBg} font-bold text-sm flex items-center justify-center`}>
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-forest-800 text-sm">{item.title}</h3>
              {item.description && (
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.description}</p>
              )}
              {item.linked_info.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.linked_info.map((info) => (
                    <button
                      key={info.id}
                      type="button"
                      onClick={() => setActiveModal(info)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-forest-600 bg-forest-50 border border-forest-200 rounded-full px-2.5 py-0.5 hover:bg-forest-100 transition-colors cursor-pointer"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                      </svg>
                      {info.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {activeModal && (
        <PropertyInfoModal
          title={activeModal.title}
          content={activeModal.content}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
}
