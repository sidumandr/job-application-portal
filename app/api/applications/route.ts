import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('jobApplications')
    
    const applications = await db.collection('applications')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    if (!applications) {
      return NextResponse.json(
        { error: 'Başvurular bulunamadı' },
        { status: 404 }
      )
    }

    // ObjectId'leri string'e çevir
    const serializedApplications = applications.map(app => ({
      ...app,
      _id: app._id.toString(),
      createdAt: app.createdAt instanceof Date 
        ? app.createdAt.toISOString()
        : new Date(app.createdAt).toISOString()
    }))

    return NextResponse.json(serializedApplications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    
    // MongoDB bağlantı hatası kontrolü
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        { error: 'Veritabanına bağlanılamadı. Lütfen MongoDB URI\'yi kontrol edin.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Başvurular yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 