import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button" 
import { BookOpen } from 'lucide-react'
import Layout from '../components/Layout';
const blogPosts = [
  { id: 1, title: "Community Outreach Success", summary: "Our recent community outreach program has shown great results..." },
  { id: 2, title: "Volunteer Spotlight: Jane Doe", summary: "Meet Jane Doe, one of our most dedicated volunteers..." },
  { id: 3, title: "Upcoming Charity Event", summary: "Join us for our annual charity gala next month..." },
  // Add more blog posts as needed
]

export default function BlogPage() {
  return (
    <Layout>
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Our Blog</h1>
        <div className="grid md:grid-cols-2 gap-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 text-pink-500" />
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{post.summary}</p>
                <Button className="bg-pink-500 text-white hover:bg-pink-600">Read More</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </Layout>
  )
}