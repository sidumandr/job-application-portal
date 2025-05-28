import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

const JWT_SECRET = process.env.JWT_SECRET

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { error: 'Token bulunamadı' },
        { status: 401 }
      )
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)

      if (payload.role !== 'admin') {
        return NextResponse.json(
          { error: 'Yetkisiz erişim' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { 
          isAuthenticated: true,
          user: {
            id: payload.id,
            username: payload.username,
            role: payload.role
          }
        },
        { status: 200 }
      )

    } catch (error) {
      console.error('Token doğrulama hatası:', error)
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Auth kontrol hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
} 