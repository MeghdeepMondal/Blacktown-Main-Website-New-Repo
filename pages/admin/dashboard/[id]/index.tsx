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
  events?: any[]
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
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  const [markerPosition, setMarkerPosition] = useState(center)
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })

  useEffect(() => {
    const fetchAdminData = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/admin/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch admin data');
          }
          const data = await response.json();
          setAdminData(data.admin);
          setEvents(data.events);
        } catch (error) {
          console.error('Error fetching admin data:', error);
          setError('Failed to load admin data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAdminData();
  }, [id]);

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
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newEvent,
          adminId: id,
        }),
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
      setShowAddEventForm(false);
    } catch (error) {
      console.error('Error adding event:', error)
      setError('Failed to add event. Please try again.')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
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

  const handleEditEvent = (eventId: string) => {
    // Implement your edit event logic here
    console.log("Edit event:", eventId);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!adminData) {
    return <div>No admin data found.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
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

        {/* Events Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Your Events</h2>
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <Card key={event.id} className="p-4">
                  <h3 className="text-lg font-semibold">{event.name}</h3>
                  <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                  <p className="mt-2">{event.description}</p>
                  <p className="mt-2">Location: {event.location}</p>
                  <p className="mt-2">Frequency: {event.frequency}</p>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button onClick={() => handleEditEvent(event.id)}>Edit</Button>
                    <Button variant="destructive" onClick={() => handleDeleteEvent(event.id)}>Delete</Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p>No events created yet.</p>
          )}
        </div>
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