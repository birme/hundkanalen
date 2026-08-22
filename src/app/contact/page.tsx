'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import PublicImageHero from '@/components/layout/PublicImageHero';
import { useLanguage } from '@/components/i18n/LanguageProvider';

const copy = {
  en: {
    heroEyebrow: 'Contact & Booking',
    heroTitle: 'Plan your stay at Färila anno 1923',
    heroDescription:
      'Send an inquiry with your dates and group size, and we will get back to you with availability and pricing.',
    fullName: 'Full Name *',
    email: 'Email *',
    checkin: 'Check-in',
    checkout: 'Check-out',
    guests: 'Guests',
    message: 'Message',
    messagePlaceholder: 'Tell us about your trip, any questions or special requests...',
    sending: 'Sending...',
    send: 'Send Inquiry',
    sent: 'Thank you! We have received your inquiry and will reply within 24 hours.',
    error: 'Something went wrong. Please try again or email us directly.',
    goodToKnow: 'Good to Know',
    facts: [
      'Check-in from 15:00, check-out by 11:00',
      'Minimum stay: 2 nights',
      'Pets welcome (please let us know)',
      'Free parking on-site',
      'WiFi included',
    ],
    directContact: 'Direct Contact',
    directText: 'Prefer to reach us directly? Send an email and we will respond promptly.',
  },
  sv: {
    heroEyebrow: 'Kontakt och bokning',
    heroTitle: 'Planera din vistelse på Färila anno 1923',
    heroDescription:
      'Skicka en förfrågan med datum och antal gäster, så återkommer vi med tillgänglighet och pris.',
    fullName: 'Namn *',
    email: 'E-post *',
    checkin: 'Incheckning',
    checkout: 'Utcheckning',
    guests: 'Gäster',
    message: 'Meddelande',
    messagePlaceholder: 'Berätta om resan, frågor eller särskilda önskemål...',
    sending: 'Skickar...',
    send: 'Skicka förfrågan',
    sent: 'Tack! Vi har tagit emot din förfrågan och återkommer inom 24 timmar.',
    error: 'Något gick fel. Försök igen eller mejla oss direkt.',
    goodToKnow: 'Bra att veta',
    facts: [
      'Incheckning från 15:00, utcheckning senast 11:00',
      'Minsta vistelse: 2 nätter',
      'Husdjur är välkomna (säg gärna till)',
      'Gratis parkering på tomten',
      'WiFi ingår',
    ],
    directContact: 'Direktkontakt',
    directText: 'Vill du kontakta oss direkt? Skicka ett mejl så svarar vi så snart vi kan.',
  },
};

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const { locale } = useLanguage();
  const t = copy[locale];

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
    <>
      <PublicImageHero
        eyebrow={t.heroEyebrow}
        title={t.heroTitle}
        description={t.heroDescription}
      />
      <div className="section-padding">
        <div className="container-narrow">

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t.fullName}
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
                    {t.email}
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
                    {t.checkin}
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
                    {t.checkout}
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
                    {t.guests}
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
                  {t.message}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500"
                  placeholder={t.messagePlaceholder}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-primary w-full disabled:opacity-50"
              >
                {status === 'sending' ? t.sending : t.send}
              </button>

              {status === 'sent' && (
                <p className="text-forest-600 text-sm text-center">
                  {t.sent}
                </p>
              )}
              {status === 'error' && (
                <p className="text-falu-600 text-sm text-center">
                  {t.error}
                </p>
              )}
            </form>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-cream-50 border border-cream-200 rounded-2xl p-6">
              <h3 className="font-semibold text-forest-800 mb-3">{t.goodToKnow}</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                {t.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </div>
            <div className="bg-forest-50 border border-forest-200 rounded-2xl p-6">
              <h3 className="font-semibold text-forest-800 mb-3">{t.directContact}</h3>
              <p className="text-sm text-gray-600">
                {t.directText}
              </p>
              <p className="text-sm text-forest-700 font-medium mt-2">
                hundkanalen@birme.se
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
