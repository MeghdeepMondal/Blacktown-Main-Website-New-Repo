'use client'
import Layout from "@/components/Layout"
import { useState } from 'react'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Mail, Phone, Heart, Send } from "lucide-react"

// Background components from homepage
const BackgroundShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(255,192,203,0.2)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path d="M0,0 Q50,100 100,0 V100 H0 Z" fill="url(#grad1)" />
      <circle cx="80%" cy="60%" r="100" fill="rgba(255,192,203,0.2)" />
    </svg>
  </div>
);

const DecorativeShapes = () => (
  <>
    <motion.div
      className="absolute top-10 right-10 opacity-20"
      animate={{
        rotate: [0, 360],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 15, repeat: Infinity }}
    >
      <svg width="50" height="50" viewBox="0 0 50 50">
        <path
          d="M25 0L30 20L50 25L30 30L25 50L20 30L0 25L20 20L25 0Z"
          fill="rgba(255,105,180,0.5)"
        />
      </svg>
    </motion.div>
    <motion.div
      className="absolute bottom-20 left-10 opacity-15"
      animate={{
        y: [-10, 10],
        x: [-5, 5],
      }}
      transition={{ duration: 4, repeat: Infinity, yoyo: true }}
    >
      <Heart className="h-12 w-12 text-pink-300" />
    </motion.div>
  </>
);

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
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-100">
        <main className="container mx-auto px-4 py-12 relative">
          <BackgroundShapes />
          <DecorativeShapes />
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-center mb-12 text-pink-800">Contact Us</h1>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl text-pink-800 flex items-center">
                    <Send className="mr-3 h-6 w-6 text-pink-500" />
                    Get in Touch
                  </CardTitle>
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
                        className="border-pink-200 focus:border-pink-500"
                      />
                      <Input 
                        placeholder="Last Name" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="border-pink-200 focus:border-pink-500"
                      />
                    </div>
                    <Input 
                      type="email" 
                      placeholder="Email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="border-pink-200 focus:border-pink-500"
                    />
                    <Input 
                      placeholder="Subject" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="border-pink-200 focus:border-pink-500"
                    />
                    <Textarea 
                      placeholder="Your Message" 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="border-pink-200 focus:border-pink-500 min-h-[220px]"
                      rows={8}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                    {submitStatus === 'success' && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-green-600"
                      >
                        Message sent successfully!
                      </motion.p>
                    )}
                    {submitStatus === 'error' && (
                      <p className="text-red-600">Failed to send message. Please try again.</p>
                    )}
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl text-pink-800 flex items-center">
                    <Mail className="mr-3 h-6 w-6 text-pink-500" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <motion.div 
                    className="flex items-start space-x-3"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MapPin className="w-5 h-5 text-pink-500 mt-1" />
                    <p className="text-gray-700">
                      Wotso, Westpoint Shopping Centre<br />
                      Level 4, Shop 4023/17 Patrick St<br />
                      Blacktown, NSW, Australia, 2148
                    </p>
                  </motion.div>

                  <motion.div 
                    className="flex items-center space-x-3"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Mail className="w-5 h-5 text-pink-500" />
                    <a 
                      href="mailto:contact@oneheartblacktown.org.au" 
                      className="text-pink-600 hover:text-pink-700 transition-colors duration-300"
                    >
                      contact@oneheartblacktown.org.au
                    </a>
                  </motion.div>

                  <div className="mt-6 rounded-lg overflow-hidden shadow-lg">
                    <iframe
                      title="One Heart Blacktown Location"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3314.8116913129307!2d150.90364531531036!3d-33.76760098068419!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b129838f39a743f%3A0x3017d681632a850!2sWestpoint%20Blacktown!5e0!3m2!1sen!2sau!4v1653615248974!5m2!1sen!2sau"
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="hover:opacity-90 transition-opacity duration-300"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </Layout>
  )
}