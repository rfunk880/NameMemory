import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/api/health'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/api/uploads') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon');

  const token = request.cookies.get('auth-token')?.value;
  const user = token ? await verifyToken(token) : null;

  if (!isPublic && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
