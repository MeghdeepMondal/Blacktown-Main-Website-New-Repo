import Layout from '../components/Layout';

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HeartHandshake, Users, Target, Lightbulb, Squirrel, Eye } from 'lucide-react'

export default function AboutPage() {
  return (
    <Layout>
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">About One Heart Blacktown</h1>
        
        <section className="mb-12">
        <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Squirrel className="mr-2 text-pink-500" />
                Our Story
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
              In a densely populated and diverse area of western Sydney, many churches are only involved in
            token or historical ways of engaging with the community, meeting surface level needs for
            attracting people to Sunday services. A new partnership between local church leaders has
            established a community hub in the heart of Blacktown. The hub&apos;s purpose is to motivate &quot;The
            Church&quot; of Blacktown to be immersed in the local community and to see gospel transformation in
            people&apos;s lives in the name of Jesus.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
        <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2 text-pink-500" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
              God&apos;s will to be done in Blacktown as it is in heaven: suburban transformation through
              restoration and healing of the city aligning with God&apos;s desires and heart for its people.
              </p>
            </CardContent>
          </Card>
        </section>


        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HeartHandshake className="mr-2 text-pink-500" />
                  Prayer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Dependence on God&apos;s enabling power</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 text-pink-500" />
                  Unity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Embracing the diversity of the one body, the bride of Christ</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 text-pink-500" />
                  Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Action orientated through obedience to Jesus and empowered by his Spirit</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Strategy</h2>
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="mr-2 text-pink-500" />
                Creating Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
                Create space (physical, social, relational, civil space) and opportunities for &quot;champions&quot;
                who align with the vision, mission, and values, and develop teams who serve the city.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
      </div>
    </Layout>
  )
}