'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { MapPin, Calendar, Heart } from 'lucide-react'

// Types
interface Event {
  id: string
  name: string
  description: string
  date: string
  location: string
  lat: number
  lng: number
  photo?: string
  frequency: string
}

const containerStyle = {
  width: '100%',
  height: '100%'
}

const defaultCenter = {
  lat: -33.7688,
  lng: 150.9051
}

const EventsPage: React.FC = () => {
  const [userLocation, setUserLocation] = useState(defaultCenter)
  const [events, setEvents] = useState<Event[]>([])
  const [radius, setRadius] = useState([5]) // in kilometers
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          setError('Failed to get your location. Using default location.')
        }
      )
    } else {
      setError('Geolocation is not supported by your browser. Using default location.')
    }
  }, [])

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        const data = await response.json()
        if (Array.isArray(data.events)) {
          setEvents(data.events)
        } else {
          throw new Error('Received invalid data format for events')
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching events:', error)
        setError('Failed to load events. Please try again later.')
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Filter events based on radius
  useEffect(() => {
    if (Array.isArray(events)) {
      const filtered = events.filter(event => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          event.lat,
          event.lng
        )
        return distance <= radius[0]
      })
      setFilteredEvents(filtered)
    }
  }, [events, userLocation, radius])

  const toggleFavorite = (eventId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId)
      } else {
        newFavorites.add(eventId)
      }
      return newFavorites
    })
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-100 via-white to-pink-100">
      <header className="bg-black text-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/One Heart.png"
              alt="One Heart Blacktown Logo"
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
            />
            <h1 className="ml-4 text-2xl font-bold">One Heart Blacktown</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/opportunities" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Opportunities
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white hover:text-pink-500 transition-colors duration-300">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-pink-800 mb-4">Events Near You</h1>
          <div className="flex items-center gap-4">
            <span className="text-pink-600 font-medium">Radius: {radius[0]}km</span>
            <div className="w-64">
              <Slider
                defaultValue={[5]}
                max={50}
                min={1}
                step={1}
                value={radius}
                onValueChange={setRadius}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Events List */}
          <div className="space-y-6 max-h-[800px] overflow-y-auto pr-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <Card key={event.id} className="bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full">
                      <Image
                        src={event.photo || "/placeholder.svg?height=400&width=600"}
                        alt={event.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={() => toggleFavorite(event.id)}
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            favorites.has(event.id) ? 'fill-pink-500 text-pink-500' : 'text-gray-500'
                          }`}
                        />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-500">No events found within the selected radius.</p>
            )}
          </div>

          {/* Map */}
          <div className="h-[800px] rounded-lg overflow-hidden">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={userLocation}
                zoom={12}
              >
                {/* User location marker */}
                <Marker
                  position={userLocation}
                  icon={{
                    url: '/user-location.png',
                    scaledSize: new window.google.maps.Size(30, 30),
                  }}
                />

                {/* Event markers */}
                {filteredEvents.map((event) => (
                  <Marker
                    key={event.id}
                    position={{ lat: event.lat, lng: event.lng }}
                    title={event.name}
                  />
                ))}

                {/* Radius circle */}
                <Circle
                  center={userLocation}
                  radius={radius[0] * 1000} // Convert km to meters
                  options={{
                    fillColor: '#f472b6',
                    fillOpacity: 0.1,
                    strokeColor: '#db2777',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                  }}
                />
              </GoogleMap>
            ) : (
              <div>Loading map...</div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-black text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 One Heart Blacktown. All rights reserved.</p>
          <div className="mt-4 flex justify-center items-center">
            <MapPin className="mr-2" />
            <span>Wotso, Westpoint Shopping Centre, Level 4, Shop 4023/17 Patrick St, Blacktown NSW 2148 , Blacktown, NSW, Australia, 2148</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Google Maps Circle component
const Circle: React.FC<{
  center: google.maps.LatLngLiteral;
  radius: number;
  options: google.maps.CircleOptions;
}> = ({ center, radius, options }) => {
  const [circle, setCircle] = useState<google.maps.Circle>()

  useEffect(() => {
    if (!circle) {
      setCircle(new google.maps.Circle())
    }

    return () => {
      if (circle) {
        circle.setMap(null)
      }
    }
  }, [circle])

  useEffect(() => {
    if (circle) {
      circle.setOptions({
        ...options,
        center,
        radius,
        map: options.map,
      })
    }
  }, [circle, center, radius, options])

  return null
}

export default EventsPage