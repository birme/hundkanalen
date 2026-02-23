import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = '__Secure-authjs.session-token';
const AUTH_COOKIE_DEV = 'authjs.session-token';
const GUEST_COOKIE = 'hundkanalen-guest-session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  matcher: ['/admin/:path*', '/stay/portal/:path*'],
};
