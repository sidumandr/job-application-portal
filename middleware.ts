import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-123'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to API routes and login page
  if (pathname.startsWith('/api/') || pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      const url = new URL('/admin/login', request.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }

    try {
      // verify token
      const secret = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)

      // Checking the admin role
      if (payload.role !== 'admin') {
        throw new Error('Unauthorized role')
      }

      // If token is valid continue
      return NextResponse.next()
    } catch (error) {
      console.error('Token verification failed:', error)
      // Clearing invalid token cookies and redirecting to the login page
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin_token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
} 