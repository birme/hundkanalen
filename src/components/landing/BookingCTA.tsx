'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/i18n/LanguageProvider';

const copy = {
  en: {
    title: 'Interested in Staying?',
    text:
      'Whether it is a summer holiday, a cozy winter retreat, or a family gathering, get in touch to learn more and check availability.',
    inquiry: 'Send an Inquiry',
    access: 'Have an access code? Enter here',
  },
  sv: {
    title: 'Vill du boka en vistelse?',
    text:
      'Oavsett om det gäller sommarlov, en mysig vinterhelg eller en familjeträff kan du höra av dig för tillgänglighet och pris.',
    inquiry: 'Skicka en förfrågan',
    access: 'Har du en vistelsekod? Gå hit',
  },
};

export default function BookingCTA() {
  const { locale } = useLanguage();
  const t = copy[locale];

  return (
    <section className="bg-[#17123b] px-4 pb-28 pt-10 text-white sm:px-6 sm:pb-16 sm:pt-16 lg:px-8">
      <div className="container-narrow rounded-[2rem] border border-white/10 bg-white/10 p-6 text-center shadow-2xl shadow-black/20 backdrop-blur md:p-10">
        <h2 className="mb-4 text-3xl font-bold leading-tight md:text-4xl">{t.title}</h2>
        <p className="mx-auto mb-8 max-w-xl text-sm leading-7 text-white/65 md:text-lg">
          {t.text}
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/contact" className="btn-primary !rounded-full !bg-white !text-[#17123b] hover:!bg-cream-100">
            {t.inquiry}
          </Link>
          <Link href="/stay" className="btn-outline !rounded-full !border-white/25 !text-white hover:!bg-white/10">
            {t.access}
          </Link>
        </div>
      </div>
    </section>
  );
}
