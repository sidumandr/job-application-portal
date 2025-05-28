import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, phone, description } = body

    // Validate required fields
    if (!fullName || !email || !phone || !description) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('jobApplications')
    
    // Insert the application into the database
    await db.collection('applications').insertOne({
      fullName,
      email,
      phone,
      description,
      createdAt: new Date()
    })

    return NextResponse.json(
      { message: 'Başvurunuz başarıyla kaydedildi' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error saving application:', error)
    return NextResponse.json(
      { error: 'Başvuru kaydedilirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 