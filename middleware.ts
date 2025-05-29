import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// JWT secret key from environment variables
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}
const JWT_SECRET = process.env.JWT_SECRET

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  if (pathname.startsWith('/api/') || pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Protected admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value

    // Redirect to login if no token is present
    if (!token) {
      const url = new URL('/admin/login', request.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }

    try {
      // Token verification with JWT
      const secret = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)

      // Role-based access control check
      if (payload.role !== 'admin') {
        throw new Error('Unauthorized role')
      }

      // Proceed if token is valid
      return NextResponse.next()
    } catch (error) {
      // Handle invalid tokens by clearing cookies and redirecting
      console.error('Token verification failed:', error)
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin_token')
      return response
    }
  }

  return NextResponse.next()
}

// Middleware configuration for admin routes
export const config = {
  matcher: ['/admin/:path*']
} 