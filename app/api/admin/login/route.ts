import { NextResponse } from 'next/server'
import { sign } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

const JWT_SECRET = process.env.JWT_SECRET

export async function POST(request: Request) {
  try {
  
    const body = await request.json()
    console.log('Login request body:', body)

    const { username, password } = body

    if (!username || !password) {
      console.log('Missing username or password')
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      )
    }

    try {
      // db connection
      console.log('Connecting to MongoDB Atlas...')
      console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is not set')
      
      const client = await clientPromise
      console.log('MongoDB connected successfully')
      
      const db = client.db('jobApplications')
      console.log('Using database: jobApplications')
      
      // find admin user
      console.log('Finding admin user:', username)
      const admin = await db.collection('adminPanel').findOne({ username })
      console.log('Found admin:', admin ? 'Yes' : 'No')

      if (!admin) {
        console.log('Admin not found')
        return NextResponse.json(
          { error: 'Geçersiz kullanıcı adı veya şifre' },
          { status: 401 }
        )
      }

      // check password
      console.log('Verifying password...')
      const isValidPassword = await bcrypt.compare(password, admin.password)
      console.log('Password valid:', isValidPassword)

      if (!isValidPassword) {
        console.log('Invalid password')
        return NextResponse.json(
          { error: 'Geçersiz kullanıcı adı veya şifre' },
          { status: 401 }
        )
      }

      // create JWT token
      console.log('Creating JWT token...')
      const token = sign(
        { 
          id: admin._id.toString(),
          username: admin.username,
          role: 'admin'
        },
        JWT_SECRET,
        { expiresIn: '1d' }
      )
      console.log('Token created successfully')

      // create response
      const response = NextResponse.json(
        { 
          success: true,
          message: 'Giriş başarılı',
          redirectTo: '/admin'
        },
        { status: 200 }
      )

      // set cookie
      console.log('Setting cookie...')
      response.cookies.set({
        name: 'admin_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/'
      })
      console.log('Cookie set successfully')

      return response

    } catch (dbError: any) {
      console.error('Database error details:', {
        name: dbError?.name || 'Unknown',
        message: dbError?.message || 'No message',
        stack: dbError?.stack || 'No stack trace'
      })
      return NextResponse.json(
        { error: 'Veritabanı bağlantısında hata oluştu' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Login error details:', {
      name: error?.name || 'Unknown',
      message: error?.message || 'No message',
      stack: error?.stack || 'No stack trace'
    })
    return NextResponse.json(
      { error: 'Giriş yapılırken bir hata oluştu' },
      { status: 500 }
    )
  }
} 