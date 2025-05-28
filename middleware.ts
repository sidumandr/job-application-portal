import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-123'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // API rotalarına ve login sayfasına erişime izin ver
  if (pathname.startsWith('/api/') || pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Admin rotalarını koru
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      const url = new URL('/admin/login', request.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }

    try {
      // Token'ı doğrula
      const secret = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)

      // Admin rolünü kontrol et
      if (payload.role !== 'admin') {
        throw new Error('Unauthorized role')
      }

      // Token geçerliyse devam et
      return NextResponse.next()
    } catch (error) {
      console.error('Token verification failed:', error)
      // Token geçersizse cookie'yi temizle ve login sayfasına yönlendir
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