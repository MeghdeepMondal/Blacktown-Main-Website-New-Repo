"use client";
import Link from 'next/link'
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Calendar, Users, Heart, MapPin, Briefcase, BookOpen, Info, Mail, LogOut } from 'lucide-react';
import { useState, useEffect } from "react";

const images = [
  "/caro4.png?height=1080&width=1920",
  "/caro2.jpg?height=1080&width=1920",
  "/caro1.jpg?height=1080&width=1920",
];

interface Event {
  id: string
  name: string
  description: string
  date: string
  location: string
  photo?: string
  registrationLink?: string
}

export default function Homepage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await fetch('/api/events?limit=3')
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        const data = await response.json()
        setUpcomingEvents(data.events)
      } catch (error) {
        console.error('Error fetching upcoming events:', error)
      }
    }

    fetchUpcomingEvents()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-100">
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
                <Link href="/" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/opportunities" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Opportunities
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white hover:text-pink-500 transition-colors duration-300">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Contact
                </Link>
              </li>
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
                objectFit: "cover",
                opacity: index === currentImageIndex ? 1 : 0,
                transition: "opacity 1s ease-in-out",
              }}
              priority={index === 0}
            />
          ))}
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center px-4">
              <h1 className="text-4xl font-bold mb-4">
                "I will give them one heart and one purpose" Jer 32:39
              </h1>
              <p className="text-xl mb-8 max-w-3xl mx-auto">
                We're passionate about our city and making it a better place for
                all who live, work, and travel here – especially those who are
                in need of a hand.
              </p>
              <Button
                variant="outline"
                size="lg"
                className="bg-pink-500 text-white border-pink-500 hover:bg-pink-600 hover:border-pink-600"
              >
                Join Our Mission
              </Button>
            </div>
          </div>
        </section>

        <section id="about" className="bg-gradient-to-br from-pink-100 to-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-pink-800">
              About One Heart Blacktown
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-200">
                <CardHeader className="bg-gradient-to-r from-pink-200 to-pink-300">
                  <CardTitle className="flex items-center text-pink-800">
                    <Users className="mr-2 text-pink-600" />
                    Our Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-pink-800">
                    Information about the member churches and organizations that
                    make up One Heart Blacktown.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-200">
                <CardHeader className="bg-gradient-to-r from-pink-200 to-pink-300">
                  <CardTitle className="flex items-center text-pink-800">
                    <Heart className="mr-2 text-pink-600" />
                    Our Shared Values
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-pink-800">
                    The core values that unite our members: Prayer, Unity, and
                    Mission.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-200">
                <CardHeader className="bg-gradient-to-r from-pink-200 to-pink-300">
                  <CardTitle className="flex items-center text-pink-800">
                    <Info className="mr-2 text-pink-600" />
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-pink-800">
                    Overview of current and past projects undertaken by One
                    Heart Blacktown.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-white to-pink-100 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-pink-800">
              Featured Video
            </h2>
            <div className="flex justify-center">
              <iframe 
                src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Foneheartblacktown%2Fvideos%2F414025854754518%2F&show_text=false&width=267&t=0" 
                width="267" 
                height="476" 
                style={{border: 'none', overflow: 'hidden'}}
                scrolling="no" 
                frameBorder="0" 
                allowFullScreen={true} 
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              ></iframe>
            </div>
          </div>
        </section>

        <section id="opportunities" className="bg-gradient-to-br from-pink-100 to-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-pink-800">
              Opportunities
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-200">
                  <CardHeader className="bg-gradient-to-r from-pink-200 to-pink-300">
                    <CardTitle className="flex items-center text-pink-800">
                      <Briefcase className="mr-2 text-pink-600" />
                      Opportunity {i}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-pink-800">Description of opportunity {i}</p>
                    <Button className="mt-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transition-all duration-300">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="blog" className="bg-gradient-to-br from-white to-pink-100 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-pink-800">
              Latest Blog Posts
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <Card key={i} className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-200">
                  <CardHeader className="bg-gradient-to-r from-pink-200 to-pink-300">
                    <CardTitle className="flex items-center text-pink-800">
                      <BookOpen className="mr-2 text-pink-600" />
                      Blog Post {i}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-pink-800">Summary of blog post {i}</p>
                    <Button className="mt-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transition-all duration-300">
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="events" className="bg-gradient-to-br from-pink-100 to-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-pink-800">
              Upcoming Events
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full">
                      <Image
                        src={event.photo || "/placeholder.svg?height=400&width=600"}
                        alt={event.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.location}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4">
                    <div className="flex gap-2 w-full">
                      <Link href={`/events/${event.id}`} passHref className="flex-1">
                        <Button
                          variant="default"
                          className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                        >
                          Learn More
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="flex-1 border-pink-500 text-pink-500 hover:bg-pink-50"
                        onClick={() => window.open(event.registrationLink, '_blank')}
                      >
                        Register
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="bg-gradient-to-br from-white to-pink-100 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8 text-pink-800">Contact Us</h2>
            <p className="text-lg mb-8 text-pink-700">
              Get in touch to learn more about our mission or to get involved.
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                className="flex items-center mx-auto bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transition-all duration-300"
              >
                <Mail className="mr-2" />
                Contact Us
              </Button>
            </Link>
          </div>
        </section>
      </main>

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
  );
}