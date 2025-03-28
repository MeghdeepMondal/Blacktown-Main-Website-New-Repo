import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ArrowLeft, ExternalLink } from 'lucide-react'
import Footer from '@/components/footer'
import Header from '@/components/header'

interface Event {
  id: string
  name: string
  description: string
  date: string
  location: string
  photo?: string
  registrationLink?: string
}

export default function EventPage() {
  const router = useRouter()
  const { id } = router.query
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchEvent(id as string)
    }
  }, [id])

  const fetchEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch event')
      }
      const data = await response.json()
      setEvent(data.event)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching event:', error)
      setError('Failed to load event. Please try again later.')
      setLoading(false)
    }
  }

  const getDirectionsUrl = (location: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500"></div>
    </div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  if (!event) {
    return <div className="flex justify-center items-center h-screen">Event not found</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-6 transition-colors duration-300">
          <ArrowLeft className="mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-64 md:h-96">
            <Image
              src={event.photo || "/placeholder.svg?height=400&width=600"}
              alt={event.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            <h1 className="absolute bottom-4 left-4 text-3xl font-bold text-white">{event.name}</h1>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center bg-pink-100 rounded-full px-3 py-1">
                <Calendar className="h-4 w-4 mr-2 text-pink-500" />
                {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="flex items-center bg-pink-100 rounded-full px-3 py-1">
                <MapPin className="h-4 w-4 mr-2 text-pink-500" />
                {event.location}
              </div>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed text-lg max-w-3xl mx-auto">{event.description}</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <Button
                variant="default"
                size="lg"
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white transition-colors duration-300 text-lg py-6"
                onClick={() => window.open(event.registrationLink, '_blank')}
              >
                Register for Event
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 border-pink-500 text-pink-500 hover:bg-pink-50 transition-colors duration-300 text-lg py-6"
                onClick={() => window.open(getDirectionsUrl(event.location), '_blank')}
              >
                Get Directions
                <MapPin className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}