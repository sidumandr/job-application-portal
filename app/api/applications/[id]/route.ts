import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // ID validation
    if (!params.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Geçersiz başvuru ID\'si' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('jobApplications')
    
    const result = await db.collection('applications').deleteOne({
      _id: new ObjectId(params.id)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Başvuru bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Başvuru başarıyla silindi' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting application:', error)
    
    // MongoDB connection error check
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        { error: 'Veritabanına bağlanılamadı. Lütfen MongoDB URI\'yi kontrol edin.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Başvuru silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 