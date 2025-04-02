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
import { Calendar, ChevronDown, ChevronUp, Trash2, MapPin, LogOut, X, Edit, Users, Calendar as CalendarIcon } from 'lucide-react'
import Footer from '@/components/footer'
import Header from '@/components/header'

interface AdminRequest {
  id: string
  name: string
  email: string
  description: string
  address: string
  contactDetails: string
  status: 'pending' | 'approved' | 'rejected'
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

  useEffect(() => {
    fetchAdminRequests()
    fetchApprovedAdmins()
    fetchAllEvents()
  }, [])

  const fetchAdminRequests = async () => {
    try {
      const response = await fetch('/api/superadmin/adminrequests')
      if (!response.ok) throw new Error('Failed to fetch admin requests')
      const data = await response.json()
      setAdminRequests(data)
    } catch (error) {
      console.error('Error fetching admin requests:', error)
    }
  }

  const fetchApprovedAdmins = async () => {
    try {
      const response = await fetch('/api/superadmin/admins')
      if (!response.ok) throw new Error('Failed to fetch existing admins')
      const data = await response.json()
      setApprovedAdmins(data)
    } catch (error) {
      console.error('Error fetching existing admins:', error)
    }
  }

  const fetchAllEvents = async () => {
    try {
      const response = await fetch('/api/superadmin/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
      } else {
        console.error('Failed to fetch events')
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const handleRequestAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/superadmin/adminrequests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      if (!response.ok) throw new Error(`Failed to ${action} admin request`)
      fetchAdminRequests()
      if (action === 'approve') fetchApprovedAdmins()
    } catch (error) {
      console.error(`Error ${action}ing admin request:`, error)
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEvent) return

    try {
      const response = await fetch(`/api/superadmin/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editingEvent,
          date: new Date(editingEvent.date).toISOString().split('T')[0], // Format date as YYYY-MM-DD
        }),
      })

      if (response.ok) {
        const updatedEvent = await response.json()
        setEvents(prevEvents => prevEvents.map(event => event.id === updatedEvent.id ? updatedEvent : event))
        setEditingEvent(null)
      } else {
        const errorData = await response.json()
        console.error('Failed to update event:', errorData.message)
        // You may want to show an error message to the user here
      }
    } catch (error) {
      console.error('Error updating event:', error)
      // You may want to show an error message to the user here
    }
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/superadmin/events/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEvents(events.filter(event => event.id !== id))
      } else {
        console.error('Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const handleLogout = () => {
    // Handle logout logic (unchanged)
    router.push('/admin/auth')
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
                </CardContent>
              </Card>

              {/* Approved Admins Section */}
              <Card className="mb-8 bg-gradient-to-br from-white to-pink-50 shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100 rounded-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 rounded-t-lg">
                  <CardTitle>Existing Admins</CardTitle>
                </CardHeader>
                <CardContent>
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
                {editingEvent ? (
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
                ) : (
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