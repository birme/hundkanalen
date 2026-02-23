'use client';

import { useState } from 'react';

export default function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/guest/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, message: message.trim() || null }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit review');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-forest-50 border border-forest-200 rounded-xl px-5 py-6 text-center">
        <div className="flex items-center justify-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
            >
              &#9733;
            </span>
          ))}
        </div>
        <p className="font-semibold text-forest-800">Thank you for your feedback!</p>
        <p className="text-sm text-forest-600 mt-1">
          We appreciate you taking the time to share your experience.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-5 space-y-5"
    >
      <div>
        <h2 className="font-semibold text-forest-800 text-sm mb-3">How was your stay?</h2>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="text-3xl transition-transform hover:scale-110 active:scale-95 focus:outline-none"
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              <span className={star <= (hoveredStar || rating) ? 'text-yellow-400' : 'text-gray-200'}>
                &#9733;
              </span>
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm text-gray-500 ml-2">{rating}/5</span>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="review_message" className="block text-sm font-medium text-gray-700 mb-1">
          Tell us more (optional)
        </label>
        <textarea
          id="review_message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="What did you enjoy most? Anything we could improve?"
          className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500 text-sm resize-none"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-falu-50 border border-falu-200 px-4 py-3 text-sm text-falu-800">
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full bg-forest-700 text-white rounded-lg px-5 py-3 text-sm font-medium hover:bg-forest-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
