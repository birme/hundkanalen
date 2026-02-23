'use client';

import { useState, FormEvent } from 'react';

export default function StayAccessPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/guest/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid access code. Please try again.');
        setLoading(false);
        return;
      }

      // Redirect to portal on success
      window.location.href = '/stay/portal';
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center section-padding">
      <div className="w-full max-w-md mx-auto">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-forest-100 shadow-lg overflow-hidden">
          {/* Card header */}
          <div className="bg-forest-700 px-8 py-8 text-center">
            <div className="text-4xl mb-3">🏡</div>
            <h1 className="text-2xl font-bold text-white">Guest Portal</h1>
            <p className="text-forest-200 text-sm mt-1">Hundkanalen 3, Färila</p>
          </div>

          {/* Card body */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-forest-800 mb-2"
                >
                  Access Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXXXX"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  required
                  className="
                    w-full px-4 py-4
                    text-center text-2xl font-mono tracking-widest
                    uppercase
                    bg-cream-50 border-2 border-forest-200
                    rounded-xl
                    text-forest-900
                    placeholder:text-forest-200 placeholder:font-mono
                    focus:outline-none focus:border-forest-500 focus:bg-white
                    transition-colors
                  "
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.trim().length === 0}
                className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Access My Stay'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              Enter the access code provided by your host
            </p>
          </div>
        </div>

        {/* Help text below card */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Your code was sent by the property owners Jonas &amp; Frédérique.
          <br />
          Having trouble?{' '}
          <a href="/contact" className="text-forest-600 hover:text-forest-800 underline">
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}
