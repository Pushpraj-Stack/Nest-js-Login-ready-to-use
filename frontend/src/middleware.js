import { NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/home'];

// Routes that should redirect to /home if already logged in
const authRoutes = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  // Check for auth routes OR the exact root path
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route)) || pathname === '/';

  // Redirect to login if trying to access protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to home if already logged in and trying to access auth routes or landing page
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/home/:path*', '/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'],
};
