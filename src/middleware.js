import { NextResponse } from 'next/server';
import { verifyToken } from './app/util/jwt-access'; // This should work if jwt.js is in /src/util/

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Allow these routes without authentication
  const publicRoutes = [
    '/login',
    '/register',
    '/api/v1/auth',
    '/_next',
    '/favicon.ico'
  ];
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check for token in Authorization header
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }
    
    // For UI routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    // Verify the token
    await verifyToken(token);
    return NextResponse.next();
  } catch (error) {
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // For UI routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
