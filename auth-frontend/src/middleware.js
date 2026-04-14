import { NextResponse } from 'next/server';

const PROTECTED  = ['/dashboard'];
const AUTH_PAGES = ['/login', '/register'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('authkit_token')?.value;

  const isProtected  = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthPage   = AUTH_PAGES.includes(pathname);

  // No token → redirect protected routes to login
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Has token → redirect auth pages to dashboard
  if (isAuthPage && token) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
