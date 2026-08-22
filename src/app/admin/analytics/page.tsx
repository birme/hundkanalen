'use client';

import { useEffect, useMemo, useState } from 'react';

type Summary = {
  pageviews: number;
  visitors: number;
  sv_pageviews: number;
  en_pageviews: number;
};

type Row = Record<string, string | number>;

type AnalyticsData = {
  days: number;
  summary: Summary;
  daily: Row[];
  topPages: Row[];
  referrers: Row[];
  devices: Row[];
};

const ranges = [7, 30, 90, 365];

function numberFormat(value: number) {
  return new Intl.NumberFormat('sv-SE').format(value);
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#17123b]">{numberFormat(value)}</p>
    </div>
  );
}

function DataTable({
  title,
  rows,
  columns,
}: {
  title: string;
  rows: Row[];
  columns: { key: string; label: string }[];
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[#17123b]">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">Ingen data ännu.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                {columns.map((column) => (
                  <th key={column.key} className="py-2 pr-4 font-medium">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${title}-${index}`} className="border-b border-gray-50 last:border-0">
                  {columns.map((column) => (
                    <td key={column.key} className="max-w-[28rem] truncate py-3 pr-4 text-gray-700">
                      {typeof row[column.key] === 'number'
                        ? numberFormat(row[column.key] as number)
                        : String(row[column.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?days=${days}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to load analytics'))))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [days]);

  const maxDailyPageviews = useMemo(() => {
    return Math.max(1, ...(data?.daily.map((day) => Number(day.pageviews)) ?? [1]));
  }, [data]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#17123b]">Site Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Privacy-vänlig besöksstatistik för publika sidor.
          </p>
        </div>
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
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">
          Laddar statistik...
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Sidvisningar" value={data.summary.pageviews} />
            <StatCard label="Unika besökare" value={data.summary.visitors} />
            <StatCard label="Svenska sidvisningar" value={data.summary.sv_pageviews} />
            <StatCard label="Engelska sidvisningar" value={data.summary.en_pageviews} />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#17123b]">Daglig trafik</h2>
            {data.daily.length === 0 ? (
              <p className="text-sm text-gray-500">Ingen data ännu.</p>
            ) : (
              <div className="space-y-3">
                {data.daily.map((day) => {
                  const pageviews = Number(day.pageviews);
                  return (
                    <div key={String(day.date)} className="grid grid-cols-[6rem_1fr_4rem] items-center gap-3 text-sm">
                      <span className="text-gray-500">{String(day.date).slice(0, 10)}</span>
                      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-[#17123b]"
                          style={{ width: `${Math.max(4, (pageviews / maxDailyPageviews) * 100)}%` }}
                        />
                      </div>
                      <span className="text-right font-medium text-gray-700">{numberFormat(pageviews)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DataTable
              title="Populära sidor"
              rows={data.topPages}
              columns={[
                { key: 'path', label: 'Sida' },
                { key: 'pageviews', label: 'Visningar' },
                { key: 'visitors', label: 'Besökare' },
              ]}
            />
            <DataTable
              title="Trafikkällor"
              rows={data.referrers}
              columns={[
                { key: 'referrer', label: 'Källa' },
                { key: 'pageviews', label: 'Visningar' },
                { key: 'visitors', label: 'Besökare' },
              ]}
            />
            <DataTable
              title="Enheter"
              rows={data.devices}
              columns={[
                { key: 'device', label: 'Enhet' },
                { key: 'pageviews', label: 'Visningar' },
              ]}
            />
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">
          Kunde inte läsa analytics.
        </div>
      )}
    </div>
  );
}
