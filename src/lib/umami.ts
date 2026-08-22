const DEFAULT_UMAMI_BASE_URL = 'https://birme-hundkanalenstats.umami-software-umami.auto.prod-se.osaas.io';
const DEFAULT_UMAMI_WEBSITE_ID = '3ab03276-8a81-44f0-b4e7-f1cedd9406fb';

type UmamiStatsValue = number | { value?: number; prev?: number };

type UmamiStatsResponse = {
  pageviews?: UmamiStatsValue;
  visitors?: UmamiStatsValue;
  visits?: UmamiStatsValue;
  bounces?: UmamiStatsValue;
  totaltime?: UmamiStatsValue;
};

type UmamiMetric = {
  x?: string;
  y?: number;
  name?: string;
  visitors?: number;
  views?: number;
};

function cleanUrl(value: string | undefined) {
  return value?.trim().replace(/\/$/, '') || '';
}

function metricValue(value: UmamiStatsValue | undefined) {
  if (typeof value === 'number') return value;
  return value?.value ?? 0;
}

function normalizeMetric(row: UmamiMetric) {
  return {
    name: row.x ?? row.name ?? 'Unknown',
    value: row.y ?? row.visitors ?? row.views ?? 0,
  };
}

async function umamiFetch<T>(path: string, token: string) {
  const baseUrl = cleanUrl(process.env.UMAMI_BASE_URL) || DEFAULT_UMAMI_BASE_URL;
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Umami request failed: ${response.status} ${text.slice(0, 200)}`);
  }

  return response.json() as Promise<T>;
}

async function getToken() {
  const apiToken = process.env.UMAMI_API_TOKEN?.trim();
  if (apiToken) return apiToken;

  const username = process.env.UMAMI_USERNAME?.trim();
  const password = process.env.UMAMI_PASSWORD?.trim();
  if (!username || !password) return null;

  const baseUrl = cleanUrl(process.env.UMAMI_BASE_URL) || DEFAULT_UMAMI_BASE_URL;
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username, password }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Umami login failed: ${response.status} ${text.slice(0, 200)}`);
  }

  const body = (await response.json()) as { token?: string };
  return body.token ?? null;
}

async function getMetric(type: string, token: string, startAt: number, endAt: number, limit = 8) {
  const params = new URLSearchParams({
    startAt: String(startAt),
    endAt: String(endAt),
    type,
    limit: String(limit),
  });
  return umamiFetch<UmamiMetric[]>(`/api/websites/${getWebsiteId()}/metrics?${params.toString()}`, token);
}

async function getPathMetrics(token: string, startAt: number, endAt: number) {
  try {
    return await getMetric('path', token, startAt, endAt);
  } catch {
    return getMetric('url', token, startAt, endAt);
  }
}

export function getWebsiteId() {
  return process.env.UMAMI_WEBSITE_ID?.trim() || DEFAULT_UMAMI_WEBSITE_ID;
}

export async function getUmamiOverview(days: number) {
  const token = await getToken();
  if (!token) {
    return {
      configured: false,
      dashboardUrl: cleanUrl(process.env.UMAMI_BASE_URL) || DEFAULT_UMAMI_BASE_URL,
      websiteId: getWebsiteId(),
    };
  }

  const endAt = Date.now();
  const startAt = endAt - days * 24 * 60 * 60 * 1000;
  const websiteId = getWebsiteId();
  const rangeParams = new URLSearchParams({
    startAt: String(startAt),
    endAt: String(endAt),
  });

  const [stats, active, pageviews, topPages, referrers, devices, countries] = await Promise.all([
    umamiFetch<UmamiStatsResponse>(`/api/websites/${websiteId}/stats?${rangeParams.toString()}`, token),
    umamiFetch<{ visitors?: number }>(`/api/websites/${websiteId}/active`, token).catch(() => ({ visitors: 0 })),
    umamiFetch<{ pageviews?: Array<{ x: string; y: number }>; sessions?: Array<{ x: string; y: number }> }>(
      `/api/websites/${websiteId}/pageviews?${rangeParams.toString()}&unit=day&timezone=Europe%2FStockholm`,
      token,
    ),
    getPathMetrics(token, startAt, endAt),
    getMetric('referrer', token, startAt, endAt),
    getMetric('device', token, startAt, endAt),
    getMetric('country', token, startAt, endAt),
  ]);

  const visits = metricValue(stats.visits);
  const bounces = metricValue(stats.bounces);

  return {
    configured: true,
    dashboardUrl: cleanUrl(process.env.UMAMI_BASE_URL) || DEFAULT_UMAMI_BASE_URL,
    websiteId,
    days,
    summary: {
      pageviews: metricValue(stats.pageviews),
      visitors: metricValue(stats.visitors),
      visits,
      bounces,
      bounceRate: visits > 0 ? Math.round((bounces / visits) * 100) : 0,
      activeVisitors: active.visitors ?? 0,
    },
    pageviews: pageviews.pageviews ?? [],
    sessions: pageviews.sessions ?? [],
    topPages: topPages.map(normalizeMetric),
    referrers: referrers.map(normalizeMetric),
    devices: devices.map(normalizeMetric),
    countries: countries.map(normalizeMetric),
  };
}
