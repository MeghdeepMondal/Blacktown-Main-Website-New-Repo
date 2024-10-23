'use client'
import Layout from "@/components/Layout"
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Mail, Phone } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    }
    setIsSubmitting(false)
  }

  return (
    <Layout>
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="First Name" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  <Input 
                    placeholder="Last Name" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Input 
                  type="email" 
                  placeholder="Email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input 
                  placeholder="Subject" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
                <Textarea 
                  placeholder="Your Message" 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
                <Button type="submit" className="w-full bg-pink-500 text-white" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
                {submitStatus === 'success' && (
                  <p className="text-green-600">Message sent successfully!</p>
                )}
                {submitStatus === 'error' && (
                  <p className="text-red-600">Failed to send message. Please try again.</p>
                )}
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-pink-500 mt-1" />
                <p>
                  Wotso, Westpoint Shopping Centre<br />
                  Level 4, Shop 4023/17 Patrick St<br />
                  Blacktown, NSW, Australia, 2148
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-pink-500" />
                <a href="mailto:contact@oneheartblacktown.org.au" className="hover:underline">
                  contact@oneheartblacktown.org.au
                </a>
              </div>
              <div className="mt-6">
                <iframe
                  title="One Heart Blacktown Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3314.8116913129307!2d150.90364531531036!3d-33.76760098068419!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b129838f39a743f%3A0x3017d681632a850!2sWestpoint%20Blacktown!5e0!3m2!1sen!2sau!4v1653615248974!5m2!1sen!2sau"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </Layout>
  )
}