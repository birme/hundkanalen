const DEFAULT_PUBLIC_APP_URL = 'https://hundkanalen.apps.osaas.io';

function cleanUrl(value: string | undefined) {
  return value?.trim().replace(/\/$/, '') || null;
}

function isRunnerUrl(value: string) {
  const lower = value.toLowerCase();
  return lower.includes('runner') || lower.includes('myapp');
}

export function getPublicAppUrl(request?: Request) {
  const configuredUrl = [
    cleanUrl(process.env.PUBLIC_APP_URL),
    cleanUrl(process.env.NEXT_PUBLIC_APP_URL),
    cleanUrl(process.env.NEXT_PUBLIC_SITE_URL),
  ].find((value): value is string => Boolean(value && !isRunnerUrl(value)));

  if (configuredUrl) return configuredUrl;

  const host = request?.headers.get('host') || '';
  if (host === 'hundkanalen.apps.osaas.io' && !isRunnerUrl(host)) {
    const proto = request?.headers.get('x-forwarded-proto') || 'https';
    return `${proto}://${host}`;
  }

  return DEFAULT_PUBLIC_APP_URL;
}
