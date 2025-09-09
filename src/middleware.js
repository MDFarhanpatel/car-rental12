import { NextResponse } from 'next/server';
import { verifyToken } from './app/util/jwt-access';
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Allow these routes without authentication
  const publicRoutes = [
    '/login',
    '/register',
    '/api/v1/auth',
    '/api/v1/register',
    '/_next',
    '/favicon.ico',
    '/',  // Add home page to public routes
  ];
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route) || pathname === route
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Get token from multiple sources
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.replace('Bearer ', '');
  
  // Check cookies for token (browsers store tokens in cookies)
  const tokenFromCookie = request.cookies.get('authToken')?.value;
  
  const token = tokenFromHeader || tokenFromCookie;
  
  if (!token) {
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }
    
    // For UI routes, redirect to login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  try {
    // Verify the token
    const payload = await verifyToken(token);
    
    // Optional: Add user info to request headers for use in pages
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-user-email', payload.email);
    
    return response;
  } catch (error) {
    console.error('Token verification failed:', error);
    
    // Clear invalid token from cookies
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('authToken');
    
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/v1/auth (authentication endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api/v1/auth|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
