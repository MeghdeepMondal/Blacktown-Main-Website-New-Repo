import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, ChevronDown, ChevronUp, Trash2, MapPin, LogOut, X, Edit, Upload } from 'lucide-react'
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
  logo?: string
  lat?: number
  lng?: number
}

interface EventData {
  id: string
  name: string
  date: string
  frequency: string
  location: string
  description: string
  lat: number
  lng: number
  photo?: string
}

const AdminDashboard: React.FC = () => {
  const router = useRouter()
  const { id } = router.query
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [events, setEvents] = useState<EventData[]>([])
  const [newEvent, setNewEvent] = useState<EventData>({
    id: '',
    name: '',
    date: '',
    frequency: '',
    location: '',
    description: '',
    lat: center.lat,
    lng: center.lng
  })
  const [showAddEventForm, setShowAddEventForm] = useState(false)
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  const [markerPosition, setMarkerPosition] = useState(center)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingAdmin, setIsEditingAdmin] = useState(false)
  const [editedAdminData, setEditedAdminData] = useState<AdminData | null>(null)
  const [emailError, setEmailError] = useState('')
  const [eventPhoto, setEventPhoto] = useState<File | null>(null)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })

  useEffect(() => {
    const fetchAdminData = async () => {
      if (id) {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/admin/${id}`)
          if (!response.ok) {
            throw new Error('Failed to fetch admin data')
          }
          const data = await response.json()
          setAdminData(data.admin)
          setEditedAdminData(data.admin)
          setEvents(data.events)
        } catch (error) {
          console.error('Error fetching admin data:', error)
          setError('Failed to load admin data. Please try again.')
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchAdminData()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewEvent(prev => ({ ...prev, [name]: value }))
  }

  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedAdminData(prev => ({ ...prev!, [name]: value }))
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
      const formData = new FormData()
      formData.append('name', newEvent.name)
      formData.append('date', newEvent.date)
      formData.append('frequency', newEvent.frequency)
      formData.append('location', newEvent.location)
      formData.append('description', newEvent.description)
      formData.append('lat', newEvent.lat.toString())
      formData.append('lng', newEvent.lng.toString())
      formData.append('adminId', id as string)
      
      if (eventPhoto) {
        formData.append('photo', eventPhoto)
      }

      const url = isEditing ? `/api/admin/events/${newEvent.id}` : '/api/events'
      const method = isEditing ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'add'} event`)
      }

      const eventData = await response.json()
      if (isEditing) {
        setEvents(prev => prev.map(event => event.id === eventData.id ? eventData : event))
      } else {
        setEvents(prev => [...prev, eventData])
      }
      resetForm()
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} event:`, error)
      setError(`Failed to ${isEditing ? 'update' : 'add'} event. Please try again.`)
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

  const handleEditEvent = (event: EventData) => {
    setNewEvent(event)
    setMarkerPosition({ lat: event.lat, lng: event.lng })
    setIsEditing(true)
    setShowAddEventForm(true)
  }

  const resetForm = () => {
    setNewEvent({
      id: '',
      name: '',
      date: '',
      frequency: '',
      location: '',
      description: '',
      lat: center.lat,
      lng: center.lng
    })
    setMarkerPosition(center)
    setShowAddEventForm(false)
    setIsEditing(false)
    setEventPhoto(null)
  }

  const handleEditAdmin = () => {
    setIsEditingAdmin(true)
  }

  const handleCancelEditAdmin = () => {
    setIsEditingAdmin(false)
    setEditedAdminData(adminData)
  }

  const handleSubmitAdminEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    try {
      const response = await fetch(`/api/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedAdminData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.message.includes('Email already in use')) {
          setEmailError(errorData.message);
          return;
        }
        throw new Error('Failed to update admin information');
      }

      const updatedAdmin = await response.json();
      setAdminData(updatedAdmin);
      setIsEditingAdmin(false);
    } catch (error) {
      console.error('Error updating admin information:', error);
      setError('Failed to update admin information. Please try again.');
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEventPhoto(e.target.files[0])
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!adminData) {
    return <div>No admin data found.</div>
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
                <Link href="/" className="text-white hover:text-pink-400 transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/opportunities"
                  className="text-white hover:text-pink-400 transition-colors duration-300"
                >
                  Opportunities
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white hover:text-pink-400 transition-colors duration-300">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-white hover:text-pink-400 transition-colors duration-300">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white hover:text-pink-400 transition-colors duration-300">
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white hover:text-pink-400 transition-colors duration-300"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="text-white hover:text-pink-400 transition-colors duration-300"
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
      <div className="flex-grow p-8 bg-gradient-to-br from-pink-50 via-white to-pink-100">
        <h1 className="text-4xl font-bold mb-8 text-pink-600">Admin Dashboard</h1>

        {adminData && (
          <Card className="mb-8 bg-gradient-to-br from-white to-pink-50 shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100 rounded-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 rounded-t-lg">
              <CardTitle className="flex justify-between items-center">
                Admin Information
                {!isEditingAdmin && (
                  <Button onClick={handleEditAdmin} variant="secondary" size="sm" className="text-pink-600 bg-white hover:bg-pink-100">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isEditingAdmin ? (
                <form onSubmit={handleSubmitAdminEdit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={editedAdminData?.name}
                      onChange={handleAdminInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={editedAdminData?.email}
                      onChange={handleAdminInputChange}
                      required
                    />
                    {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={editedAdminData?.description || ''}
                      onChange={handleAdminInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={editedAdminData?.address || ''}
                      onChange={handleAdminInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactDetails">Contact Details</Label>
                    <Input
                      id="contactDetails"
                      name="contactDetails"
                      value={editedAdminData?.contactDetails || ''}
                      onChange={handleAdminInputChange}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="submit">Save Changes</Button>
                    <Button type="button" variant="outline" onClick={handleCancelEditAdmin}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <p><strong>Name:</strong> {adminData.name}</p>
                  <p><strong>Email:</strong> {adminData.email}</p>
                  {adminData.description && <p><strong>Description:</strong> {adminData.description}</p>}
                  {adminData.address && <p><strong>Address:</strong> {adminData.address}</p>}
                  {adminData.contactDetails && <p><strong>Contact Details:</strong> {adminData.contactDetails}</p>}
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="mb-8 bg-gradient-to-br from-white to-pink-50 shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100 rounded-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 rounded-t-lg">
            <CardTitle>{isEditing ? 'Edit Event' : 'Add New Event'}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
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
              <div className="space-y-2">
                <Label htmlFor="photo">Event Photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
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
              <div className="flex justify-between mt-6">
                <Button type="submit" className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white transition-all duration-300 shadow-md hover:shadow-lg">
                  {isEditing ? 'Update Event' : 'Add Event'}
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={resetForm} className="border-pink-500 text-pink-600 hover:bg-pink-50">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Your Events</h2>
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="bg-gradient-to-br from-white to-pink-50 shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100 rounded-lg overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800">
                    <CardTitle className="text-lg font-semibold">{event.name}</CardTitle>
                    <p className="text-sm text-pink-600">{new Date(event.date).toLocaleDateString()}</p>
                  </CardHeader>
                  <CardContent className="p-4">
                    {event.photo && (
                      <div className="mb-4">
                        <Image
                          src={event.photo}
                          alt={event.name}
                          width={300}
                          height={200}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    )}
                    <p className="mt-2 text-gray-600">{event.description}</p>
                    <p className="mt-2 text-gray-600">Location: {event.location}</p>
                    <p className="mt-2 text-gray-600">Frequency: {event.frequency}</p>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button onClick={() => handleEditEvent(event)} className="bg-pink-100 text-pink-600 hover:bg-pink-200">Edit</Button>
                      <Button variant="destructive" onClick={() => handleDeleteEvent(event.id)} className="bg-red-500 hover:bg-red-600">Delete</Button>
                    </div>
                  </CardContent>
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