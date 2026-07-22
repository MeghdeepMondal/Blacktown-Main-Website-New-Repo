import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, ChevronDown, ChevronUp, Trash2, MapPin, LogOut, X, Edit, Users, CalendarIcon, AlertCircle, Globe, Camera, ExternalLink, Loader2 } from 'lucide-react'
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api'
import RichTextEditor from '@/components/rich-text-editor'
import Footer from '@/components/footer'
import Header from '@/components/header'

const containerStyle = { width: '100%', height: '300px' }
const center = { lat: -33.7688, lng: 150.9051 }

interface AdminRequest {
  id: string
  name: string
  email: string
  description: string
  address: string
  contactDetails: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' // Updated to match actual database values
}

interface Admin {
  id: string
  name: string
  email: string
  description: string
  address: string
  contactDetails: string
}

interface Event {
  id: string
  name: string
  date: string
  location: string
  description: string
  adminId: string
  adminName: string
  frequency: string
  lat: number
  lng: number
  photo?: string
  registrationLink?: string
  hasOpportunity?: boolean
  opportunity?: string
}

const SuperAdminDashboard: React.FC = () => {
  const router = useRouter()
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([])
  const [approvedAdmins, setApprovedAdmins] = useState<Admin[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [activeSection, setActiveSection] = useState<'admins' | 'events'>('admins')
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const [markerPosition, setMarkerPosition] = useState(center)
  const [mapCenter, setMapCenter] = useState(center)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })
  const [loading, setLoading] = useState({
    adminRequests: true,
    approvedAdmins: true,
    events: true
  })
  const [error, setError] = useState({
    adminRequests: '',
    approvedAdmins: '',
    events: ''
  })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('superadminToken')
    
    if (!token) {
      router.push('/superadmin/login')
      return
    }
    
    // Verify token on the client side (basic check)
    try {
      // In a real app, you might want to verify the token with the server
      setIsAuthenticated(true)
      setAuthChecking(false)
      
      // Fetch data only if authenticated
      fetchAdminRequests()
      fetchApprovedAdmins()
      fetchAllEvents()
    } catch (error) {
      console.error('Authentication error:', error)
      localStorage.removeItem('superadminToken')
      router.push('/superadmin/login')
    }
  }, [router])

  const fetchAdminRequests = async () => {
    setLoading(prev => ({ ...prev, adminRequests: true }))
    setError(prev => ({ ...prev, adminRequests: '' }))
    
    try {
      const token = localStorage.getItem('superadminToken')
      console.log('Fetching admin requests...')
      const response = await fetch('/api/superadmin/adminrequests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Admin requests response status:', response.status)
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Handle authentication errors
          localStorage.removeItem('superadminToken')
          router.push('/superadmin/login')
          return
        }
        
        const errorData = await response.json()
        console.error('Failed to fetch admin requests:', errorData)
        throw new Error(errorData.message || 'Failed to fetch admin requests')
      }
      
      const data = await response.json()
      console.log('Admin requests data received:', data)
      
      setAdminRequests(data)
    } catch (error) {
      console.error('Error fetching admin requests:', error)
      setError(prev => ({ 
        ...prev, 
        adminRequests: error instanceof Error ? error.message : 'Failed to fetch admin requests' 
      }))
    } finally {
      setLoading(prev => ({ ...prev, adminRequests: false }))
    }
  }

  const fetchApprovedAdmins = async () => {
    setLoading(prev => ({ ...prev, approvedAdmins: true }))
    setError(prev => ({ ...prev, approvedAdmins: '' }))
    
    try {
      const token = localStorage.getItem('superadminToken')
      const response = await fetch('/api/superadmin/admins', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Handle authentication errors
          localStorage.removeItem('superadminToken')
          router.push('/superadmin/login')
          return
        }
        
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch existing admins')
      }
      
      const data = await response.json()
      setApprovedAdmins(data)
    } catch (error) {
      console.error('Error fetching existing admins:', error)
      setError(prev => ({ 
        ...prev, 
        approvedAdmins: error instanceof Error ? error.message : 'Failed to fetch existing admins' 
      }))
    } finally {
      setLoading(prev => ({ ...prev, approvedAdmins: false }))
    }
  }

  const fetchAllEvents = async () => {
    setLoading(prev => ({ ...prev, events: true }))
    setError(prev => ({ ...prev, events: '' }))
    
    try {
      const token = localStorage.getItem('superadminToken')
      const response = await fetch('/api/superadmin/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Handle authentication errors
          localStorage.removeItem('superadminToken')
          router.push('/superadmin/login')
          return
        }
        
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch events')
      }
      
      const data = await response.json()
      setEvents(data.events)
    } catch (error) {
      console.error('Error fetching events:', error)
      setError(prev => ({ 
        ...prev, 
        events: error instanceof Error ? error.message : 'Failed to fetch events' 
      }))
    } finally {
      setLoading(prev => ({ ...prev, events: false }))
    }
  }

  const handleRequestAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('superadminToken')
      const response = await fetch(`/api/superadmin/adminrequests/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      })
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Handle authentication errors
          localStorage.removeItem('superadminToken')
          router.push('/superadmin/login')
          return
        }
        
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${action} admin request`)
      }
      
      fetchAdminRequests()
      if (action === 'approve') fetchApprovedAdmins()
    } catch (error) {
      console.error(`Error ${action}ing admin request:`, error)
      alert(error instanceof Error ? error.message : `Error ${action}ing admin request`)
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    const eventLat = event.lat || center.lat
    const eventLng = event.lng || center.lng
    setMarkerPosition({ lat: eventLat, lng: eventLng })
    setMapCenter({ lat: eventLat, lng: eventLng })
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEvent) return

    try {
      const token = localStorage.getItem('superadminToken')
      const response = await fetch(`/api/superadmin/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editingEvent,
          date: new Date(editingEvent.date).toISOString().split('T')[0], // Format date as YYYY-MM-DD
        }),
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Handle authentication errors
          localStorage.removeItem('superadminToken')
          router.push('/superadmin/login')
          return
        }
        
        const errorData = await response.json()
        console.error('Failed to update event:', errorData.message)
        alert(`Failed to update event: ${errorData.message}`)
      } else {
        const updatedEvent = await response.json()
        setEvents(prevEvents => prevEvents.map(event => event.id === updatedEvent.id ? updatedEvent : event))
        setEditingEvent(null)
      }
    } catch (error) {
      console.error('Error updating event:', error)
      alert(error instanceof Error ? error.message : 'Error updating event')
    }
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      const token = localStorage.getItem('superadminToken')
      const response = await fetch(`/api/superadmin/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Handle authentication errors
          localStorage.removeItem('superadminToken')
          router.push('/superadmin/login')
          return
        }
        
        const errorData = await response.json()
        console.error('Failed to delete event:', errorData.message)
        alert(`Failed to delete event: ${errorData.message}`)
      } else {
        setEvents(events.filter(event => event.id !== id))
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert(error instanceof Error ? error.message : 'Error deleting event')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('superadminToken')
    router.push('/superadmin/login')
  }

  const renderErrorMessage = (message: string) => (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-start mb-4">
      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  )

  const renderLoadingState = () => (
    <div className="p-4 text-center text-gray-500">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
      <p>Loading...</p>
    </div>
  )

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login page
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-white to-pink-50">
      <Header />
      
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Side Pane */}
        <div className="w-full md:w-64 bg-pink-50/40 p-4 md:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-pink-100/50 gap-4 shrink-0">
          <div className="flex flex-row md:flex-col gap-2 md:gap-3 flex-wrap md:flex-nowrap">
            <Button
              className={`flex-1 md:flex-none justify-start ${
                activeSection === 'admins' ? 'bg-pink-600' : 'bg-gradient-to-r from-pink-400 to-pink-500'
              } hover:from-pink-500 hover:to-pink-600 text-white transition-all duration-300 shadow-md hover:shadow-lg`}
              onClick={() => setActiveSection('admins')}
            >
              <Users className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">Admin Users</span>
            </Button>
            <Button
              className={`flex-1 md:flex-none justify-start ${
                activeSection === 'events' ? 'bg-pink-600' : 'bg-gradient-to-r from-pink-400 to-pink-500'
              } hover:from-pink-500 hover:to-pink-600 text-white transition-all duration-300 shadow-md hover:shadow-lg`}
              onClick={() => setActiveSection('events')}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">Manage Events</span>
            </Button>
          </div>
          <div className="pt-2 md:pt-4 border-t border-pink-200/30 flex md:block mt-2 md:mt-auto">
            <Button
              variant="outline"
              className="w-full justify-start border-pink-400 text-pink-600 hover:bg-pink-100"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4 shrink-0" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow p-4 sm:p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-pink-900 tracking-tight text-center md:text-left">Super Admin Dashboard</h1>

          {activeSection === 'admins' && (
            <>
              {/* Admin Requests Section */}
              <Card className="mb-8 bg-gradient-to-br from-white to-pink-50/30 shadow-xl shadow-pink-100/40 hover:shadow-2xl transition-all duration-300 border border-pink-100/80 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100/80 border-b border-pink-200/60 text-pink-900 rounded-t-2xl px-6 py-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-pink-600 shrink-0" />
                    Admin Signup Requests
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {error.adminRequests && renderErrorMessage(error.adminRequests)}
                  
                  {loading.adminRequests ? (
                    renderLoadingState()
                  ) : adminRequests.length > 0 ? (
                    <div className="overflow-x-auto w-full -mx-6 px-6 md:mx-0 md:px-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Contact Details</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {adminRequests.map((request) => (
                            <TableRow key={request.id} className="hover:bg-pink-50/20">
                              <TableCell className="font-semibold text-gray-900 whitespace-nowrap">{request.name}</TableCell>
                              <TableCell className="text-gray-600 font-mono text-xs">{request.email}</TableCell>
                              <TableCell className="max-w-[220px] truncate text-gray-500 text-xs" title={request.description}>{request.description}</TableCell>
                              <TableCell className="max-w-[180px] truncate text-gray-500 text-xs" title={request.address}>{request.address}</TableCell>
                              <TableCell className="text-gray-600 text-xs whitespace-nowrap">{request.contactDetails}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={() => handleRequestAction(request.id, 'approve')}
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs h-8 px-3 transition-all duration-300 shadow-sm"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleRequestAction(request.id, 'reject')}
                                    variant="destructive"
                                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs h-8 px-3 transition-all duration-300 shadow-sm"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No pending admin requests found.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Approved Admins Section */}
              <Card className="mb-8 bg-gradient-to-br from-white to-pink-50/30 shadow-xl shadow-pink-100/40 hover:shadow-2xl transition-all duration-300 border border-pink-100/80 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100/80 border-b border-pink-200/60 text-pink-900 rounded-t-2xl px-6 py-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-pink-600 shrink-0" />
                    Approved Admin List
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {error.approvedAdmins && renderErrorMessage(error.approvedAdmins)}
                  
                  {loading.approvedAdmins ? (
                    renderLoadingState()
                  ) : approvedAdmins.length > 0 ? (
                    <div className="overflow-x-auto w-full -mx-6 px-6 md:mx-0 md:px-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Contact Details</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {approvedAdmins.map((admin) => (
                            <TableRow key={admin.id} className="hover:bg-pink-50/20">
                              <TableCell className="font-semibold text-gray-900 whitespace-nowrap">{admin.name}</TableCell>
                              <TableCell className="text-gray-600 font-mono text-xs">{admin.email}</TableCell>
                              <TableCell className="max-w-[220px] truncate text-gray-500 text-xs" title={admin.description}>{admin.description}</TableCell>
                              <TableCell className="max-w-[180px] truncate text-gray-500 text-xs" title={admin.address}>{admin.address}</TableCell>
                              <TableCell className="text-gray-600 text-xs whitespace-nowrap">{admin.contactDetails}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No approved admins found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === 'events' && (
            <Card className="mb-8 bg-gradient-to-br from-white to-pink-50/30 shadow-xl shadow-pink-100/40 hover:shadow-2xl transition-all duration-300 border border-pink-100/80 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100/80 border-b border-pink-200/60 text-pink-900 rounded-t-2xl px-6 py-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-pink-600 shrink-0" />
                  All Events
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {error.events && renderErrorMessage(error.events)}
                
                {loading.events ? (
                  renderLoadingState()
                ) : editingEvent ? (
                  <form onSubmit={handleUpdateEvent} className="space-y-4 max-w-2xl mx-auto">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Event Name</Label>
                      <Input
                        id="name"
                        value={editingEvent.name}
                        onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                        required
                        className="border-pink-300 hover:border-pink-400 focus:border-pink-500 focus:ring-pink-500/20 bg-white transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="date" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={editingEvent.date}
                          onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                          required
                          className="border-pink-300 hover:border-pink-400 focus:border-pink-500 focus:ring-pink-500/20 bg-white transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="frequency" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Frequency</Label>
                        <select
                          id="frequency"
                          value={editingEvent.frequency}
                          onChange={(e) => setEditingEvent({ ...editingEvent, frequency: e.target.value })}
                          required
                          className="w-full p-2 border border-pink-300 hover:border-pink-400 focus:border-pink-500 rounded-md bg-white transition-colors cursor-pointer text-sm focus:outline-none"
                        >
                          <option value="">Select Frequency</option>
                          <option value="Once Off">Once Off</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="location" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</Label>
                      <Input
                        id="location"
                        value={editingEvent.location}
                        onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                        required
                        className="border-pink-300 hover:border-pink-400 focus:border-pink-500 focus:ring-pink-500/20 bg-white transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="description" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</Label>
                      <RichTextEditor
                        value={editingEvent.description}
                        onChange={(value) => setEditingEvent({ ...editingEvent, description: value })}
                        placeholder="Describe the event..."
                        minHeight="180px"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="registrationLink" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Registration Link</Label>
                        <Input
                          id="registrationLink"
                          placeholder="https://forms.gle/..."
                          value={editingEvent.registrationLink || ''}
                          onChange={(e) => setEditingEvent({ ...editingEvent, registrationLink: e.target.value })}
                          className="border-pink-300 hover:border-pink-400 focus:border-pink-500 focus:ring-pink-500/20 bg-white transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="photo" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Photo URL</Label>
                        <Input
                          id="photo"
                          placeholder="https://cloudinary.com/..."
                          value={editingEvent.photo || ''}
                          onChange={(e) => setEditingEvent({ ...editingEvent, photo: e.target.value })}
                          className="border-pink-300 hover:border-pink-400 focus:border-pink-500 focus:ring-pink-500/20 bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                      <Switch 
                        id="hasOpportunity" 
                        checked={editingEvent.hasOpportunity || false} 
                        onCheckedChange={(checked) => setEditingEvent({ ...editingEvent, hasOpportunity: checked })} 
                      />
                      <Label htmlFor="hasOpportunity" className="font-medium text-sm">Add Volunteer Opportunity</Label>
                    </div>
                    {editingEvent.hasOpportunity && (
                      <div className="space-y-2 pl-4 border-l-2 border-pink-200">
                        <Label htmlFor="opportunity" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Opportunity Description</Label>
                        <RichTextEditor 
                          value={editingEvent.opportunity || ''} 
                          onChange={(value) => setEditingEvent({ ...editingEvent, opportunity: value })} 
                          placeholder="Describe the volunteer opportunity…" 
                          minHeight="140px" 
                        />
                        <p className="text-xs text-gray-400">This will be shown on the Opportunities page.</p>
                      </div>
                    )}

                    {isLoaded && (
                      <div className="space-y-1.5 pt-4 border-t border-gray-100">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Event Location (Click to set)</Label>
                        <GoogleMap 
                          mapContainerStyle={containerStyle} 
                          center={mapCenter} 
                          zoom={10}
                          onClick={(e) => {
                            if (e.latLng) {
                              const lat = e.latLng.lat()
                              const lng = e.latLng.lng()
                              setMarkerPosition({ lat, lng })
                              setEditingEvent({ ...editingEvent, lat, lng })
                            }
                          }}
                        >
                          <MarkerF position={markerPosition} />
                        </GoogleMap>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                      <Button 
                        type="submit"
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm h-9 px-4 transition-all duration-300 shadow-md"
                      >
                        Update Event
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setEditingEvent(null)}
                        className="border-pink-300 text-pink-600 hover:bg-pink-50 transition-all duration-300 text-sm h-9 px-4"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : events.length > 0 ? (
                  <div className="overflow-x-auto w-full -mx-6 px-6 md:mx-0 md:px-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Admin</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((event) => (
                          <TableRow key={event.id} className="hover:bg-pink-50/20">
                            <TableCell className="font-semibold text-gray-900 whitespace-nowrap">{event.name}</TableCell>
                            <TableCell className="text-gray-600 text-xs whitespace-nowrap">{new Date(event.date).toLocaleDateString()}</TableCell>
                            <TableCell className="max-w-[180px] truncate text-gray-500 text-xs" title={event.location}>{event.location}</TableCell>
                            <TableCell className="text-xs">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-700 border border-pink-100">
                                {event.frequency}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium text-gray-700 text-xs whitespace-nowrap">{event.adminName}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  onClick={() => handleEditEvent(event)} 
                                  className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-xs h-8 px-3 transition-all duration-300 shadow-sm"
                                >
                                  Edit
                                </Button>
                                <Button 
                                  onClick={() => handleDeleteEvent(event.id)} 
                                  variant="destructive"
                                  className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white text-xs h-8 px-3 transition-all duration-300 shadow-sm"
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No events found.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default SuperAdminDashboard