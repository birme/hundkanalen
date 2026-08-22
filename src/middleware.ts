import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = '__Secure-authjs.session-token';
const AUTH_COOKIE_DEV = 'authjs.session-token';
const GUEST_COOKIE = 'hundkanalen-guest-session';
const OLD_PUBLIC_HOST = 'hundkanalen.apps.osaas.io';
const NEW_PUBLIC_ORIGIN = 'https://fritidshuset.birme.se';
const REDIRECT_OLD_DOMAIN = process.env.REDIRECT_OLD_DOMAIN === 'true';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host')?.toLowerCase();

  if (REDIRECT_OLD_DOMAIN && host === OLD_PUBLIC_HOST && pathname !== '/health' && pathname !== '/healthz') {
    const redirectUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, NEW_PUBLIC_ORIGIN);
    return NextResponse.redirect(redirectUrl, 308);
  }

  if (pathname.startsWith('/admin')) {
    const sessionToken =
      request.cookies.get(AUTH_COOKIE)?.value ||
      request.cookies.get(AUTH_COOKIE_DEV)?.value;

    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith('/stay/portal')) {
    const guestToken = request.cookies.get(GUEST_COOKIE)?.value;
    if (!guestToken) {
      return NextResponse.redirect(new URL('/stay', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
