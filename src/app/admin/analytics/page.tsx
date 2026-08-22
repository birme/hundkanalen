'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type MetricRow = {
  name: string;
  value: number;
};

type AnalyticsOverview =
  | {
      configured: false;
      dashboardUrl: string;
      websiteId: string;
    }
  | {
      configured: true;
      dashboardUrl: string;
      websiteId: string;
      days: number;
      summary: {
        pageviews: number;
        visitors: number;
        visits: number;
        bounces: number;
        bounceRate: number;
        activeVisitors: number;
      };
      pageviews: Array<{ x: string; y: number }>;
      sessions: Array<{ x: string; y: number }>;
      topPages: MetricRow[];
      referrers: MetricRow[];
      devices: MetricRow[];
      countries: MetricRow[];
    };

const ranges = [7, 30, 90, 365];

function formatNumber(value: number) {
  return new Intl.NumberFormat('sv-SE').format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sv-SE', { month: 'short', day: 'numeric' }).format(new Date(value));
}

function StatCard({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#17123b]">
        {formatNumber(value)}
        {suffix}
      </p>
    </div>
  );
}

function MetricList({ title, rows }: { title: string; rows: MetricRow[] }) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[#17123b]">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">Ingen data ännu.</p>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={`${title}-${row.name}`} className="space-y-1">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="truncate text-gray-700">{row.name || 'Direct'}</span>
                <span className="font-medium text-gray-900">{formatNumber(row.value)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#17123b]"
                  style={{ width: `${Math.max(5, (row.value / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/analytics?days=${days}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || 'Kunde inte läsa Umami-statistik');
        return body as AnalyticsOverview;
      })
      .then(setData)
      .catch((err) => {
        setData(null);
        setError(err instanceof Error ? err.message : 'Kunde inte läsa Umami-statistik');
      })
      .finally(() => setLoading(false));
  }, [days]);

  const maxDailyPageviews = useMemo(() => {
    if (!data?.configured) return 1;
    return Math.max(1, ...data.pageviews.map((row) => row.y));
  }, [data]);

  const dashboardUrl = data?.dashboardUrl || 'https://birme-hundkanalenstats.umami-software-umami.auto.prod-se.osaas.io';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#17123b]">Site Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Översikt från OSC Analytics / Umami. Detaljer finns i Umami-dashboarden.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex rounded-full border border-gray-200 bg-white p-1">
            {ranges.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDays(range)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  days === range ? 'bg-[#17123b] text-white' : 'text-gray-600 hover:text-[#17123b]'
                }`}
              >
                {range} d
              </button>
            ))}
          </div>
          <Link
            href={dashboardUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-[#17123b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#241c56]"
          >
            Öppna Umami
          </Link>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">
          Laddar statistik...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && data && !data.configured && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-semibold text-amber-900">Umami API är inte konfigurerat ännu</h2>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Lägg till <code>UMAMI_API_TOKEN</code> i appens parameter store, eller använd
            <code> UMAMI_USERNAME</code> och <code>UMAMI_PASSWORD</code>. Om lösenordet innehåller
            specialtecken, använd <code>UMAMI_PASSWORD_B64</code>. Sidan är redan kopplad till
            website-id <code>{data.websiteId}</code>.
          </p>
        </div>
      )}

      {!loading && data?.configured && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Sidvisningar" value={data.summary.pageviews} />
            <StatCard label="Besökare" value={data.summary.visitors} />
            <StatCard label="Sessioner" value={data.summary.visits} />
            <StatCard label="Bounce rate" value={data.summary.bounceRate} suffix="%" />
            <StatCard label="Aktiva nu" value={data.summary.activeVisitors} />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#17123b]">Dagliga sidvisningar</h2>
            {data.pageviews.length === 0 ? (
              <p className="text-sm text-gray-500">Ingen data ännu.</p>
            ) : (
              <div className="space-y-3">
                {data.pageviews.map((row) => (
                  <div key={row.x} className="grid grid-cols-[5rem_1fr_4rem] items-center gap-3 text-sm">
                    <span className="text-gray-500">{formatDate(row.x)}</span>
                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-[#17123b]"
                        style={{ width: `${Math.max(4, (row.y / maxDailyPageviews) * 100)}%` }}
                      />
                    </div>
                    <span className="text-right font-medium text-gray-700">{formatNumber(row.y)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <MetricList title="Populära sidor" rows={data.topPages} />
            <MetricList title="Trafikkällor" rows={data.referrers} />
            <MetricList title="Enheter" rows={data.devices} />
            <MetricList title="Länder" rows={data.countries} />
          </div>
        </>
      )}
    </div>
  );
}
