'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      checkin: (form.elements.namedItem('checkin') as HTMLInputElement).value,
      checkout: (form.elements.namedItem('checkout') as HTMLInputElement).value,
      guests: (form.elements.namedItem('guests') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus('sent');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="section-padding">
      <div className="container-narrow">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-forest-800 mb-4">Contact & Booking</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Interested in staying with us? Fill out the form below and we will
            get back to you with availability and pricing.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="checkin" className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    id="checkin"
                    name="checkin"
                    className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500"
                  />
                </div>
                <div>
                  <label htmlFor="checkout" className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out
                  </label>
                  <input
                    type="date"
                    id="checkout"
                    name="checkout"
                    className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500"
                  />
                </div>
                <div>
                  <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                    Guests
                  </label>
                  <input
                    type="number"
                    id="guests"
                    name="guests"
                    min="1"
                    max="10"
                    defaultValue="2"
                    className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500"
                  placeholder="Tell us about your trip — any questions or special requests..."
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-primary w-full disabled:opacity-50"
              >
                {status === 'sending' ? 'Sending...' : 'Send Inquiry'}
              </button>

              {status === 'sent' && (
                <p className="text-forest-600 text-sm text-center">
                  Thank you! We have received your inquiry and will reply within 24 hours.
                </p>
              )}
              {status === 'error' && (
                <p className="text-falu-600 text-sm text-center">
                  Something went wrong. Please try again or email us directly.
                </p>
              )}
            </form>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-cream-50 border border-cream-200 rounded-2xl p-6">
              <h3 className="font-semibold text-forest-800 mb-3">Good to Know</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>Check-in from 15:00, check-out by 11:00</li>
                <li>Minimum stay: 2 nights</li>
                <li>Pets welcome (please let us know)</li>
                <li>Free parking on-site</li>
                <li>WiFi included</li>
              </ul>
            </div>
            <div className="bg-forest-50 border border-forest-200 rounded-2xl p-6">
              <h3 className="font-semibold text-forest-800 mb-3">Direct Contact</h3>
              <p className="text-sm text-gray-600">
                Prefer to reach us directly? Send an email and we will respond promptly.
              </p>
              <p className="text-sm text-forest-700 font-medium mt-2">
                hundkanalen@birme.se
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
