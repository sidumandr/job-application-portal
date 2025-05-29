'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { cn } from '@/lib/utils'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface FormData {
  name: string
  email: string
  phone: string
  position: string
}

export default function ApplyPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    position: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Client-side validation
    if (formData.name.length < 2 || formData.name.length > 50) {
      alert('Ad Soyad 2-50 karakter arasında olmalıdır.')
      setIsSubmitting(false)
      return
    }

    if (formData.position.length < 2 || formData.position.length > 100) {
      alert('Pozisyon 2-100 karakter arasında olmalıdır.')
      setIsSubmitting(false)
      return
    }

    // Phone number validation (international format)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(formData.phone)) {
      alert('Lütfen geçerli bir telefon numarası girin (örn: +905551234567)')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitSuccess(true)
        setFormData({
          name: '',
          email: '',
          phone: '',
          position: ''
        })
      } else {
        throw new Error(data.error || 'Form submission failed')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert(error instanceof Error ? error.message : 'Form gönderilirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-foreground mb-4">
            İş Başvuru Formu
          </h1>
          <p className="text-lg text-muted-foreground">
            Kariyer fırsatlarımıza katılmak için formu doldurun
          </p>
        </div>

        {submitSuccess ? (
          <Card className="bg-gradient-card">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold mb-4">
                Başvurunuz Alındı!
              </CardTitle>
              <CardDescription className="mb-8">
                Başvurunuz için teşekkür ederiz. En kısa sürede size dönüş yapacağız.
              </CardDescription>
              <Button
                onClick={() => setSubmitSuccess(false)}
                className="w-full sm:w-auto"
              >
                Yeni Başvuru Yap
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-card">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Adınız ve soyadınız"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ornek@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+905551234567"
                  />
                  <p className="text-sm text-muted-foreground">
                    Uluslararası formatta girin (örn: +905551234567)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Pozisyon</Label>
                  <Input
                    type="text"
                    id="position"
                    name="position"
                    required
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="Başvurmak istediğiniz pozisyon"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Gönderiliyor...
                    </>
                  ) : (
                    'Başvuruyu Gönder'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 