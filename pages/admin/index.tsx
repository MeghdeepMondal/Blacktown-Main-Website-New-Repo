import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

// Updated mock data for existing events
const mockEvents = [
  {
    id: 1,
    name: "Community Cleanup",
    date: "2023-07-15",
    frequency: "Monthly",
    location: "Blacktown Park",
    description: "Join us for our monthly community cleanup event!",
    enrolledParticipants: [
      { id: 1, name: "John Doe", email: "john@example.com", phone: "0412345678" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "0423456789" },
    ]
  },
  {
    id: 2,
    name: "Food Drive",
    date: "2023-07-22",
    frequency: "Once Off",
    location: "Westpoint Shopping Centre",
    description: "Help us collect food donations for local families in need.",
    enrolledParticipants: [
      { id: 3, name: "Mike Johnson", email: "mike@example.com", phone: "0434567890" },
      { id: 4, name: "Sarah Brown", email: "sarah@example.com", phone: "0445678901" },
    ]
  }
]

const AdminDashboard: React.FC = () => {
  const router = useRouter()
  const [events, setEvents] = useState(mockEvents)
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
    frequency: '',
    location: '',
    description: ''
  })
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewEvent(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newEventWithId = {
      ...newEvent,
      id: events.length + 1,
      enrolledParticipants: []
    }
    setEvents(prev => [...prev, newEventWithId])
    setNewEvent({
      name: '',
      date: '',
      frequency: '',
      location: '',
      description: ''
    })
  }

  const toggleEventDetails = (eventId: number) => {
    setExpandedEventId(prev => prev === eventId ? null : eventId)
  }

  const handleDeleteEvent = (eventId: number) => {
    setEvents(prev => prev.filter(event => event.id !== eventId))
    if (expandedEventId === eventId) {
      setExpandedEventId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Event Name"
              name="name"
              value={newEvent.name}
              onChange={handleInputChange}
              required
            />
            <Input
              type="date"
              name="date"
              value={newEvent.date}
              onChange={handleInputChange}
              required
            />
            <select
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
            <Input
              placeholder="Location"
              name="location"
              value={newEvent.location}
              onChange={handleInputChange}
              required
            />
            <Textarea
              placeholder="Description"
              name="description"
              value={newEvent.description}
              onChange={handleInputChange}
              required
            />
            <Button type="submit" className="w-full bg-pink-500 text-white">Add Event</Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Existing Events</h2>
      {events.map(event => (
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
            <p><strong>Date:</strong> {event.date}</p>
            <p><strong>Frequency:</strong> {event.frequency}</p>
            <p><strong>Location:</strong> {event.location}</p>
            {expandedEventId === event.id && (
              <div className="mt-4">
                <p><strong>Description:</strong> {event.description}</p>
                <h3 className="font-bold mt-2">Enrolled Participants:</h3>
                <table className="w-full mt-2">
                  <thead>
                    <tr>
                      <th className="text-left">Name</th>
                      <th className="text-left">Email</th>
                      <th className="text-left">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.enrolledParticipants.map(participant => (
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
  )
}

export default AdminDashboard