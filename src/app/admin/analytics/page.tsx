import Link from 'next/link';

const umamiDashboardUrl = 'https://birme-hundkanalenanalytics.umami-software-umami.auto.prod-se.osaas.io';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#17123b]">Site Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Besöksstatistiken hanteras av OSC Analytics via Umami.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="max-w-2xl">
          <p className="text-sm leading-6 text-gray-600">
            Appen är bunden till OSC analytics-instansen <strong>hundkanalenanalytics</strong>.
            Dashboard, webbplatsregistrering och statistik bor därför i Umami i stället för i
            applikationens egen databas.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={umamiDashboardUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#17123b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#241c56]"
            >
              Öppna Umami dashboard
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:border-[#17123b] hover:text-[#17123b]"
            >
              Tillbaka till admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
