import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { z } from 'zod'

// Input validation schema
const formSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  position: z.string().min(2).max(100)
})

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3 // Maximum 3 submissions per IP
}

// Store submission attempts
const submissionAttempts = new Map<string, { count: number; resetTime: number }>()

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Input validation
    const validatedData = formSchema.parse(body)

    // Rate limiting check
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const attempt = submissionAttempts.get(ip)

    if (attempt && now < attempt.resetTime) {
      if (attempt.count >= RATE_LIMIT.max) {
        return NextResponse.json(
          { error: 'Too many submissions. Please try again later.' },
          { status: 429 }
        )
      }
    } else {
      submissionAttempts.set(ip, { count: 0, resetTime: now + RATE_LIMIT.windowMs })
    }

    // Database connection
    const client = await clientPromise
    const db = client.db()
    const applicationsCollection = db.collection('applications')

    // Check for duplicate email
    const existingApplication = await applicationsCollection.findOne({ email: validatedData.email })
    if (existingApplication) {
      return NextResponse.json(
        { error: 'An application with this email already exists' },
        { status: 400 }
      )
    }

    // Create application
    const result = await applicationsCollection.insertOne({
      ...validatedData,
      createdAt: new Date()
    })

    // Increment submission count
    const currentAttempt = submissionAttempts.get(ip)!
    currentAttempt.count++
    submissionAttempts.set(ip, currentAttempt)

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    console.error('Submission error:', error)
    return NextResponse.json(
      { error: 'An error occurred while submitting the application' },
      { status: 500 }
    )
  }
} 