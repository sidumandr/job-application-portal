'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'sonner'

interface Application {
  _id: string
  name: string
  email: string
  phone: string
  position: string
  createdAt: string
}

export default function AdminPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications', {
        credentials: 'include'
      })

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Başvurular yüklenirken bir hata oluştu')
      }

      const data = await res.json()
      setApplications(data)
    } catch (error) {
      toast.error('Başvurular yüklenirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (res.ok) {
        router.push('/admin/login')
      }
    } catch (error) {
      toast.error('Çıkış yapılırken bir hata oluştu')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu başvuruyu silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        toast.success('Başvuru başarıyla silindi')
        fetchApplications()
      } else {
        throw new Error('Başvuru silinirken bir hata oluştu')
      }
    } catch (error) {
      toast.error('Başvuru silinirken bir hata oluştu')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Başvuru Listesi</h1>
          <Button onClick={handleLogout} variant="outline">
            Çıkış Yap
          </Button>
        </div>

        <div className="grid gap-6">
          {applications.map((application) => (
            <Card key={application._id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{application.name}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(application._id)}
                  >
                    Sil
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">E-posta</p>
                    <p>{application.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p>{application.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pozisyon</p>
                    <p>{application.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Başvuru Tarihi</p>
                    <p>{new Date(application.createdAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {applications.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-gray-500">Henüz başvuru bulunmuyor</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 