import { NextRequest, NextResponse } from 'next/server';

const publicPaths = ['/login', '/signup'];
const privatePaths = [];

export function middleware(request: NextRequest) {
  // restrict access to pages based on the token present in cookies
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // if the token is present in the cookie, user is already authenticated
  if (publicPaths.includes(path) && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/signup',
    '/login'
  ],
}