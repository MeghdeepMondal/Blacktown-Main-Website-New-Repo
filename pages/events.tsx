import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Calendar } from 'lucide-react'
import Layout from '../components/Layout';
const events = [
  { id: 1, name: "Community Clean-up", date: "June 15, 2023", time: "9:00 AM", location: "Blacktown Park" },
  { id: 2, name: "Charity Fun Run", date: "July 1, 2023", time: "7:00 AM", location: "Blacktown Showground" },
  { id: 3, name: "Youth Mentoring Workshop", date: "July 10, 2023", time: "2:00 PM", location: "Blacktown Community Center" },
  // Add more events as needed
]

export default function EventsPage() {
  return (
    <Layout>
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Upcoming Events</h1>
        <div className="grid md:grid-cols-3 gap-8">
          {events.map((event) => (
            <Card key={event.id} className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 text-pink-500" />
                  {event.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Date:</strong> {event.date}</p>
                <p><strong>Time:</strong> {event.time}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <Button className="mt-4 bg-pink-500 text-white hover:bg-pink-600">Learn More</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </Layout>
  )
}