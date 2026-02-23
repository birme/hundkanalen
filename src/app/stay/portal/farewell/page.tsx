export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getGuestSession } from '@/lib/guest-auth';
import { getDb } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import FeedbackForm from './FeedbackForm';
import StepNavigation from '@/components/portal/StepNavigation';

type Review = {
  id: string;
  rating: number;
  message: string | null;
  created_at: string;
};

export default async function FarewellPage() {
  const session = await getGuestSession();
  if (!session) redirect('/stay');

  const sql = getDb();

  let existingReview: Review | null = null;
  try {
    const [review] = await sql<Review[]>`
      SELECT id, rating, message, created_at
      FROM guest_reviews
      WHERE stay_id = ${session.stayId}
      LIMIT 1
    `;
    existingReview = review || null;
  } catch {
    // Table may not exist yet
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-forest-800">See You Next Time!</h1>
        <p className="text-gray-500 text-sm mt-1">
          We hope you enjoyed your stay at Färila anno 1923
        </p>
      </div>

      {/* Thank you message */}
      <div className="bg-forest-700 rounded-2xl px-6 py-6 text-center">
        <p className="text-white font-semibold text-lg mb-1">Thank you for staying with us!</p>
        <p className="text-forest-200 text-sm">
          We hope you had a wonderful time in Hälsingland.
          Your feedback helps us make the experience even better.
        </p>
      </div>

      {/* Review section */}
      {existingReview ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-5">
          <h2 className="font-semibold text-forest-800 text-sm mb-3">Your Review</h2>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-2xl ${star <= existingReview!.rating ? 'text-yellow-400' : 'text-gray-200'}`}
              >
                &#9733;
              </span>
            ))}
            <span className="text-sm text-gray-500 ml-2">{existingReview.rating}/5</span>
          </div>
          {existingReview.message && (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {existingReview.message}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-3">
            Submitted on {formatDate(existingReview.created_at)}
          </p>
        </div>
      ) : (
        <FeedbackForm />
      )}

      <StepNavigation
        prev={{ href: '/stay/portal/checkout', label: 'Check-out' }}
      />
    </div>
  );
}
