import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, ChevronDown, ChevronUp, Trash2, MapPin, LogOut, X, Edit, Users, CalendarIcon, AlertCircle } from 'lucide-react'
import Footer from '@/components/footer'
import Header from '@/components/header'

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
}

const SuperAdminDashboard: React.FC = () => {
  const router = useRouter()
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([])
  const [approvedAdmins, setApprovedAdmins] = useState<Admin[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [activeSection, setActiveSection] = useState<'admins' | 'events'>('admins')
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-100 via-white to-pink-100">
      <Header />

      <div className="flex-grow flex">
        {/* Side Pane */}
        <div className="w-64 bg-pink-50 p-6 space-y-4">
          <Button
            className={`w-full justify-start ${
              activeSection === 'admins' ? 'bg-pink-600' : 'bg-gradient-to-r from-pink-400 to-pink-500'
            } hover:from-pink-500 hover:to-pink-600 text-white transition-all duration-300 shadow-md hover:shadow-lg`}
            onClick={() => setActiveSection('admins')}
          >
            <Users className="mr-2 h-4 w-4" />
            Manage Admin Users
          </Button>
          <Button
            className={`w-full justify-start ${
              activeSection === 'events' ? 'bg-pink-600' : 'bg-gradient-to-r from-pink-400 to-pink-500'
            } hover:from-pink-500 hover:to-pink-600 text-white transition-all duration-300 shadow-md hover:shadow-lg`}
            onClick={() => setActiveSection('events')}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Manage Events
          </Button>
          <div className="pt-4 mt-auto">
            <Button
              variant="outline"
              className="w-full justify-start border-pink-400 text-pink-600 hover:bg-pink-100"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow p-8">
          <h1 className="text-4xl font-bold mb-8 text-pink-600">Super Admin Dashboard</h1>

          {activeSection === 'admins' && (
            <>
              {/* Admin Requests Section */}
              <Card className="mb-8 bg-gradient-to-br from-white to-pink-50 shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100 rounded-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 rounded-t-lg">
                  <CardTitle>Admin Signup Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {error.adminRequests && renderErrorMessage(error.adminRequests)}
                  
                  {loading.adminRequests ? (
                    renderLoadingState()
                  ) : adminRequests.length > 0 ? (
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
                          <TableRow key={request.id}>
                            <TableCell>{request.name}</TableCell>
                            <TableCell>{request.email}</TableCell>
                            <TableCell>{request.description}</TableCell>
                            <TableCell>{request.address}</TableCell>
                            <TableCell>{request.contactDetails}</TableCell>
                            <TableCell>
                              <Button
                                onClick={() => handleRequestAction(request.id, 'approve')}
                                className="mr-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleRequestAction(request.id, 'reject')}
                                variant="destructive"
                                className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                              >
                                Reject
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No pending admin requests found.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Approved Admins Section */}
              <Card className="mb-8 bg-gradient-to-br from-white to-pink-50 shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100 rounded-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 rounded-t-lg">
                  <CardTitle>Existing Admins</CardTitle>
                </CardHeader>
                <CardContent>
                  {error.approvedAdmins && renderErrorMessage(error.approvedAdmins)}
                  
                  {loading.approvedAdmins ? (
                    renderLoadingState()
                  ) : approvedAdmins.length > 0 ? (
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
                          <TableRow key={admin.id}>
                            <TableCell>{admin.name}</TableCell>
                            <TableCell>{admin.email}</TableCell>
                            <TableCell>{admin.description}</TableCell>
                            <TableCell>{admin.address}</TableCell>
                            <TableCell>{admin.contactDetails}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
            <Card className="mb-8 bg-gradient-to-br from-white to-pink-50 shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100 rounded-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 rounded-t-lg">
                <CardTitle>All Events</CardTitle>
              </CardHeader>
              <CardContent>
                {error.events && renderErrorMessage(error.events)}
                
                {loading.events ? (
                  renderLoadingState()
                ) : editingEvent ? (
                  <form onSubmit={handleUpdateEvent} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Event Name</Label>
                      <Input
                        id="name"
                        value={editingEvent.name}
                        onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={editingEvent.date}
                        onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={editingEvent.location}
                        onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <select
                        id="frequency"
                        value={editingEvent.frequency}
                        onChange={(e) => setEditingEvent({ ...editingEvent, frequency: e.target.value })}
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
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={editingEvent.description}
                        onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="submit"
                        className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        Update Event
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setEditingEvent(null)}
                        className="border-pink-500 text-pink-600 hover:bg-pink-50 transition-all duration-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : events.length > 0 ? (
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
                        <TableRow key={event.id}>
                          <TableCell>{event.name}</TableCell>
                          <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                          <TableCell>{event.location}</TableCell>
                          <TableCell>{event.frequency}</TableCell>
                          <TableCell>{event.adminName}</TableCell>
                          <TableCell>
                            <Button 
                              onClick={() => handleEditEvent(event)} 
                              className="mr-2 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                              Edit
                            </Button>
                            <Button 
                              onClick={() => handleDeleteEvent(event.id)} 
                              variant="destructive"
                              className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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