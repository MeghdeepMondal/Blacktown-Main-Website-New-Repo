import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Users, Heart, Info } from 'lucide-react'
import Layout from '../components/Layout';

export default function AboutPage() {
  return (
    <Layout>
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">About One Heart Blacktown</h1>
        <div className="max-w-3xl mx-auto mb-12">
          <p className="text-lg mb-4">
            One Heart Blacktown is a community-focused organization dedicated to making Blacktown a better place for all who live, work, and travel here. We believe in the power of unity and compassion to transform our city.
          </p>
          <p className="text-lg">
            Our mission is to call people to follow Jesus' words, works, and ways in Blacktown City, with churches serving the city and its people.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 text-pink-500" />
                Our Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>We are a partnership of local church leaders and community members committed to positive change in Blacktown.</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 text-pink-500" />
                Our Shared Values
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Our core values are Prayer (Dependence on God's enabling power), Unity (Embracing the diversity of the one body), and Mission (Action oriented through obedience to Jesus).</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 text-pink-500" />
                Our Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>We undertake various projects aimed at suburban transformation through restoration and healing of the city, aligning with God's desires for its people.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </Layout>
  )
}