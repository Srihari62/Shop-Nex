import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('accessToken')?.value || request.cookies.get('refreshToken')?.value;

  const protectedPaths = ['/profile', '/cart', '/wishlist'];
  const authPaths = ['/login', '/signup'];

  // 1. If trying to access a protected path without a token -> Redirect to Login
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    if (!token) {
      const url = new URL('/login', request.url);
      // Optional: Add redirect query param to return here after login
      // url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // 2. If trying to access login/signup WITH a token -> Redirect to Home
  if (authPaths.some(path => pathname.startsWith(path))) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/profile/:path*', '/cart', '/wishlist', '/login', '/signup'],
};
