import { NextResponse } from 'next/server'
import { sign } from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import clientPromise from '@/lib/mongodb'
import { z } from 'zod'

// Environment variables check
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

// Input validation schema
const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8)
})

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // Maximum 5 attempts per IP
}

// Store failed login attempts
const failedAttempts = new Map<string, { count: number; resetTime: number }>()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Input validation
    const validatedData = loginSchema.parse(body)
    const { username, password } = validatedData

    // Rate limiting check
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const attempt = failedAttempts.get(ip)

    if (attempt && now < attempt.resetTime) {
      if (attempt.count >= RATE_LIMIT.max) {
        return NextResponse.json(
          { error: 'Too many login attempts. Please try again later.' },
          { status: 429 }
        )
      }
    } else {
      failedAttempts.set(ip, { count: 0, resetTime: now + RATE_LIMIT.windowMs })
    }

    // Database connection
    const client = await clientPromise
    const db = client.db()
    const adminCollection = db.collection('adminPanel')

    // Find admin user
    const admin = await adminCollection.findOne({ username })
    if (!admin) {
      // Increment failed attempts
      const currentAttempt = failedAttempts.get(ip)!
      currentAttempt.count++
      failedAttempts.set(ip, currentAttempt)

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Password verification
    const isValidPassword = await bcrypt.compare(password, admin.password)
    if (!isValidPassword) {
      // Increment failed attempts
      const currentAttempt = failedAttempts.get(ip)!
      currentAttempt.count++
      failedAttempts.set(ip, currentAttempt)

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Reset failed attempts on successful login
    failedAttempts.delete(ip)

    // Generate JWT token
    const token = sign(
      { username: admin.username, role: 'admin' },
      process.env.JWT_SECRET || '',
      { expiresIn: '1h' }
    )

    // Set cookie with secure options
    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 hour
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
} 