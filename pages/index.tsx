'use client'

import Image from 'next/image'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Calendar, Users, Heart, MapPin, Briefcase, BookOpen, Info, Mail } from 'lucide-react'
import { useState, useEffect } from 'react'

const images = [
  '/caro4.png?height=1080&width=1920',
  '/caro1.jpg?height=1080&width=1920',
  '/caro2.jpg?height=1080&width=1920',
  '/caro3.jpg?height=1080&width=1920',
]

export default function Homepage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
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
        <li><a href="#opportunities" className="text-white hover:text-pink-500">Opportunities</a></li>
        <li><a href="#blog" className="text-white hover:text-pink-500">Blog</a></li>
        <li><a href="#events" className="text-white hover:text-pink-500">Events</a></li>
        <li><a href="#about" className="text-white hover:text-pink-500">About</a></li>
        <li><a href="#contact" className="text-white hover:text-pink-500">Contact</a></li>
      </ul>
    </nav>
  </div>
</header>

      <main>
        <section className="relative h-[600px] overflow-hidden">
          {images.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt={`Background ${index + 1}`}
              fill
              style={{
                objectFit: 'cover',
                opacity: index === currentImageIndex ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
              }}
              priority={index === 0}
            />
          ))}
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center px-4">
              <h1 className="text-4xl font-bold mb-4">"I will give them one heart and one purpose" Jer 32:39</h1>
              <p className="text-xl mb-8 max-w-3xl mx-auto">We're passionate about our city and making it a better place for all who live, work, and travel here – especially those who are in need of a hand.</p>
              <Button variant="outline" size="lg" className="bg-pink-500 text-white border-pink-500 hover:bg-pink-600 hover:border-pink-600">Join Our Mission</Button>
            </div>
          </div>
        </section>

        <section id="opportunities" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-black">Opportunities</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-black text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="mr-2 text-pink-500" />
                      Opportunity {i}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Description of opportunity {i}</p>
                    <Button className="mt-4 bg-pink-500 text-white hover:bg-pink-600">Learn More</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="blog" className="bg-gray-200 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-black">Latest Blog Posts</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <Card key={i} className="bg-black text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="mr-2 text-pink-500" />
                      Blog Post {i}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Summary of blog post {i}</p>
                    <Button className="mt-4 bg-pink-500 text-white hover:bg-pink-600">Read More</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="events" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-black">Upcoming Events</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-black text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 text-pink-500" />
                      Event {i}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Date: June {10 + i}, 2023</p>
                    <p>Time: 7:00 PM</p>
                    <p>Location: Church {i}</p>
                    <Button className="mt-4 bg-pink-500 text-white hover:bg-pink-600">Learn More</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="bg-gray-200 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-black">About One Heart Blacktown</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-black text-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 text-pink-500" />
                    Our Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Information about the member churches and organizations that make up One Heart Blacktown.</p>
                </CardContent>
              </Card>
              <Card className="bg-black text-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 text-pink-500" />
                    Our Shared Values
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>The core values that unite our members: Prayer, Unity, and Mission.</p>
                </CardContent>
              </Card>
              <Card className="bg-black text-white">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="mr-2 text-pink-500" />
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Overview of current and past projects undertaken by One Heart Blacktown.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="contact" className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8 text-black">Contact Us</h2>
            <p className="text-lg mb-8 text-black">Get in touch to learn more about our mission or to get involved.</p>
            <Button size="lg" className="flex items-center mx-auto bg-pink-500 text-white hover:bg-pink-600">
              <Mail className="mr-2" />
              Contact Us
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-black text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 One Heart Blacktown. All rights reserved.</p>
          <div className="mt-4 flex justify-center items-center">
            <MapPin className="mr-2" />
            <span>Blacktown, NSW, Australia</span>
          </div>
        </div>
      </footer>
    </div>
  )
}