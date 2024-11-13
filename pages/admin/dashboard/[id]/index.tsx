import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, ChevronDown, ChevronUp, Trash2, MapPin, LogOut } from 'lucide-react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '300px'
}

const center = {
  lat: -33.7688,
  lng: 150.9051
}

interface AdminData {
  id: string
  name: string
  email: string
  description?: string
  address?: string
  contactDetails?: string
}

const AdminDashboard: React.FC = () => {
  const router = useRouter()
  const { id } = router.query
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [events, setEvents] = useState([])
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
    frequency: '',
    location: '',
    description: '',
    lat: center.lat,
    lng: center.lng
  })
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  const [markerPosition, setMarkerPosition] = useState(center)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })

  useEffect(() => {
    const fetchAdminData = async () => {
      if (id) {
        const token = localStorage.getItem('adminToken')
        if (!token) {
          router.push('/admin/auth')
          return
        }

        try {
          const response = await fetch(`/api/admin/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (!response.ok) {
            throw new Error('Failed to fetch admin data')
          }
          const data = await response.json()
          setAdminData(data)
        } catch (error) {
          console.error('Error fetching admin data:', error)
          router.push('/admin/auth')
        }
      }
    }

    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    }

    fetchAdminData()
    fetchEvents()
  }, [id, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewEvent(prev => ({ ...prev, [name]: value }))
  }

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      setMarkerPosition({ lat, lng })
      setNewEvent(prev => ({ ...prev, lat, lng }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      })

      if (!response.ok) {
        throw new Error('Failed to add event')
      }

      const addedEvent = await response.json()
      setEvents(prev => [...prev, addedEvent])
      setNewEvent({
        name: '',
        date: '',
        frequency: '',
        location: '',
        description: '',
        lat: center.lat,
        lng: center.lng
      })
      setMarkerPosition(center)
    } catch (error) {
      console.error('Error adding event:', error)
      alert('Failed to add event. Please try again.')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      setEvents(prev => prev.filter(event => event.id !== eventId))
      if (expandedEventId === eventId) {
        setExpandedEventId(null)
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event. Please try again.')
    }
  }

  const toggleEventDetails = (eventId: string) => {
    setExpandedEventId(prev => prev === eventId ? null : eventId)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/auth')
  }

  return (
    <div>
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
                <Link href="/" className="text-white hover:text-pink-500">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/opportunities"
                  className="text-white hover:text-pink-500"
                >
                  Opportunities
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white hover:text-pink-500">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-white hover:text-pink-500">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white hover:text-pink-500">
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white hover:text-pink-500"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="text-white hover:text-pink-500"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {adminData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Admin Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Name:</strong> {adminData.name}</p>
              <p><strong>Email:</strong> {adminData.email}</p>
              {adminData.description && <p><strong>Description:</strong> {adminData.description}</p>}
              {adminData.address && <p><strong>Address:</strong> {adminData.address}</p>}
              {adminData.contactDetails && <p><strong>Contact Details:</strong> {adminData.contactDetails}</p>}
            </CardContent>
          </Card>
        )}
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Event</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name</Label>
                <Input
                  id="name"
                  placeholder="Event Name"
                  name="name"
                  value={newEvent.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  name="date"
                  value={newEvent.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <select
                  id="frequency"
                  name="frequency"
                  value={newEvent.frequency}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Frequency</option>
                  <option value="Once Off">Once Off</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Location"
                  name="location"
                  value={newEvent.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description"
                  name="description"
                  value={newEvent.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {isLoaded && (
                <div className="space-y-2">
                  <Label>Event Location (Click to set)</Label>
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={10}
                    onClick={handleMapClick}
                  >
                    <Marker position={markerPosition} />
                  </GoogleMap>
                </div>
              )}
              <Button type="submit" className="w-full bg-pink-500 text-white">Add Event</Button>
            </form>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mb-4">Existing Events</h2>
        {events.map((event: any) => (
          <Card key={event.id} className="mb-4">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{event.name}</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleEventDetails(event.id)}
                  >
                    {expandedEventId === event.id ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              <p><strong>Frequency:</strong> {event.frequency}</p>
              <p><strong>Location:</strong> {event.location}</p>
              {expandedEventId === event.id && (
                <div className="mt-4">
                  <p><strong>Description:</strong> {event.description}</p>
                  {isLoaded && (
                    <div className="mt-2">
                      <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={{ lat: event.lat, lng: event.lng }}
                        zoom={15}
                      >
                        <Marker position={{ lat: event.lat, lng: event.lng }} />
                      </GoogleMap>
                    </div>
                  )}
                  <h3 className="font-bold mt-4">Enrolled Participants:</h3>
                  <table className="w-full mt-2">
                    <thead>
                      <tr>
                        <th className="text-left">Name</th>
                        <th className="text-left">Email</th>
                        <th className="text-left">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.enrolledParticipants && event.enrolledParticipants.map((participant: any) => (
                        <tr key={participant.id}>
                          <td>{participant.name}</td>
                          <td>{participant.email}</td>
                          <td>{participant.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
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

export default AdminDashboard