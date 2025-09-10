import { NextResponse } from 'next/server';
import { verifyToken } from './app/util/jwt-access';

export async function middleware(request) {
  // Define protected routes
  const protectedPaths = ['/dashboard', '/admin', '/profile'];
  
  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    try {
      // Get token from cookies or Authorization header
      const token = request.cookies.get('authToken')?.value || 
                   request.headers.get('authorization')?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Verify token
      await verifyToken(token);
      
      // Token is valid, continue
      return NextResponse.next();
    } catch (error) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/profile/:path*']
};
