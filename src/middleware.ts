import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = '__Secure-authjs.session-token';
const AUTH_COOKIE_DEV = 'authjs.session-token';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken =
    request.cookies.get(AUTH_COOKIE)?.value ||
    request.cookies.get(AUTH_COOKIE_DEV)?.value;

  if (pathname.startsWith('/guest') || pathname.startsWith('/admin')) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/guest/:path*', '/admin/:path*'],
};
