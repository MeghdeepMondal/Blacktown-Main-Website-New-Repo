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
import { Calendar, Users, Heart, MapPin, Briefcase, BookOpen, Info, Mail, LogOut, ExternalLink, User, Building2 } from 'lucide-react';
import { useState, useEffect } from "react";
import axios from 'axios';
import { motion } from "framer-motion";
import Layout from '@/components/Layout';

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

interface BlogPost {
  id: number;
  Title: string;
  Content: Array<{ type: string; children: Array<{ text: string }> }>;
  Author: string;
  PublishDate: string;
  Slug: string;
  FeaturedImage: {
    url?: string;
  };
}

interface Member {
  id: string;
  name: string;
  logo?: string | null;
  bannerPhoto?: string | null;
  address?: string | null;
  websiteLink?: string | null;
  description?: string | null;
}

// Add this CSS class to your global styles or as a styled component
const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Add these SVG components after your imports
const HeartSVG = () => (
  <motion.div
    className="absolute -z-10 opacity-20"
    style={{ top: '20%', right: '10%' }}
    animate={{
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0],
    }}
    transition={{ duration: 4, repeat: Infinity }}
  >
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="#ff69b4"
        stroke="none"
      />
    </svg>
  </motion.div>
);

const CrossSVG = () => (
  <motion.div
    className="absolute -z-10 opacity-10"
    style={{ top: '40%', left: '5%' }}
    animate={{
      rotate: [0, 180],
      scale: [1, 1.1, 1],
    }}
    transition={{ duration: 8, repeat: Infinity }}
  >
    <svg width="100" height="100" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L14 7H10L12 2Z M12 22L10 17H14L12 22Z M2 12L7 10V14L2 12Z M22 12L17 14V10L22 12Z"
        fill="#ffd700"
        stroke="none"
      />
    </svg>
  </motion.div>
);

const DoveSVG = () => (
  <motion.div
    className="absolute -z-10 opacity-15"
    style={{ top: '15%', left: '15%' }}
    {...floatingAnimation}
  >
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3ZM12 19C15.86 19 19 15.86 19 12C19 8.14 15.86 5 12 5C8.14 5 5 8.14 5 12C5 15.86 8.14 19 12 19Z"
        fill="#ffffff"
        stroke="#87ceeb"
        strokeWidth="0.5"
      />
    </svg>
  </motion.div>
);

// Add this new component for background shapes
const BackgroundShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(255,192,203,0.2)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'rgba(255,192,203,0.1)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'rgba(255,105,180,0.2)', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path d="M0,0 Q50,100 100,0 V100 H0 Z" fill="url(#grad1)" />
      <circle cx="80%" cy="60%" r="100" fill="rgba(255,192,203,0.2)" />
      <path d="M100,100 Q50,0 0,100 Z" fill="rgba(255,192,203,0.1)" />
      <path d="M0,50 Q50,0 100,50 T200,50" fill="none" stroke="url(#grad2)" strokeWidth="2" />
      <g transform="translate(50, 50)">
        <path d="M0,0 C10,20 30,20 40,0 C50,-20 70,-20 80,0" fill="none" stroke="rgba(255,105,180,0.3)" strokeWidth="2" />
        <animateTransform attributeName="transform" type="translate" from="0 0" to="0 20" dur="5s" repeatCount="indefinite" />
      </g>
      <g transform="translate(150, 150)">
        <path d="M0,0 L20,20 L40,0 L20,-20 Z" fill="rgba(255,192,203,0.2)" />
        <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="10s" repeatCount="indefinite" />
      </g>
    </svg>
  </div>
);

// Add this helper function
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const DecorativeShapes = () => (
  <>
    {/* Cross Pattern */}
    <motion.div
      className="absolute top-10 right-10 opacity-20"
      animate={{
        rotate: [0, 360],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 15, repeat: Infinity }}
    >
      <svg width="50" height="50" viewBox="0 0 50 50">
        <path
          d="M25 0L30 20L50 25L30 30L25 50L20 30L0 25L20 20L25 0Z"
          fill="rgba(255,105,180,0.5)"
        />
      </svg>
    </motion.div>

    {/* Floating Hearts */}
    <motion.div
      className="absolute bottom-20 left-10 opacity-15"
      animate={{
        y: [-10, 10],
        x: [-5, 5],
      }}
      transition={{ duration: 4, repeat: Infinity, yoyo: true }}
    >
      <svg width="40" height="40" viewBox="0 0 24 24">
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="rgba(255,192,203,0.5)"
        />
      </svg>
    </motion.div>

    {/* Rotating Circle Pattern */}
    <motion.div
      className="absolute top-1/2 right-20 opacity-10"
      animate={{
        rotate: [0, -360],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="rgba(255,105,180,0.3)" strokeWidth="2" fill="none" />
        <circle cx="50" cy="10" r="5" fill="rgba(255,105,180,0.5)" />
        <circle cx="50" cy="90" r="5" fill="rgba(255,105,180,0.5)" />
        <circle cx="10" cy="50" r="5" fill="rgba(255,105,180,0.5)" />
        <circle cx="90" cy="50" r="5" fill="rgba(255,105,180,0.5)" />
      </svg>
    </motion.div>

    {/* Pulsing Dove */}
    <motion.div
      className="absolute bottom-40 right-40 opacity-20"
      animate={{
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      <svg width="60" height="60" viewBox="0 0 24 24">
        <path
          d="M12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3ZM12 19C15.86 19 19 15.86 19 12C19 8.14 15.86 5 12 5"
          stroke="rgba(135,206,235,0.5)"
          fill="none"
          strokeWidth="2"
        />
      </svg>
    </motion.div>
  </>
);

const stripHtmlTags = (html: string) => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}

export default function Homepage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [latestBlogPosts, setLatestBlogPosts] = useState<BlogPost[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

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

  useEffect(() => {
    const fetchLatestBlogPosts = async () => {
      try {
        const response = await axios.get('/api/blog-posts?limit=3');
        const sortedPosts = response.data.data
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, 3);
        setLatestBlogPosts(sortedPosts);
      } catch (error) {
        console.error('Error fetching latest blog posts:', error);
      }
    };

    fetchLatestBlogPosts();
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('/api/members');
        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }
        const data = await response.json();
        setMembers(data.members || []);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-100">
      <Layout>

        <main>
          <section className="relative h-[420px] sm:h-[600px] overflow-hidden">
            <HeartSVG />
            <CrossSVG />
            <DoveSVG />
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
              <motion.div 
                className="text-white text-center px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                <motion.h1 
                  className="text-2xl sm:text-4xl font-bold mb-4"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  &quot;I will give them one heart and one purpose&quot; Jer 32:39
                </motion.h1>
                <p className="text-base sm:text-xl mb-8 max-w-3xl mx-auto">
                  We&apos;re passionate about our city and making it a better place for
                  all who live, work, and travel here – especially those who are
                  in need of a hand.
                </p>
              </motion.div>
            </div>
            <div className="absolute bottom-0 left-0 w-full overflow-hidden">
              <svg 
                className="relative block w-full h-[100px] sm:h-[180px]" 
                viewBox="0 0 1200 120" 
                preserveAspectRatio="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Pink waves - extended past viewBox */}
                <path 
                  d="M1300,15 
                    C1150,75 1050,5 950,55
                    C800,105 700,35 600,75
                    C500,115 400,45 250,80
                    C150,115 50,65 -100,85
                    V120 H1300 Z" 
                  className="fill-pink-100/40 animate-wave"
                />
                <path 
                  d="M1300,25 
                    C1150,85 1050,15 950,65
                    C800,115 700,45 600,85
                    C500,125 400,55 250,90
                    C150,125 50,75 -100,95
                    V120 H1300 Z" 
                  className="fill-pink-200/20 animate-wave-slow"
                />
                <path 
                  d="M1300,35 
                    C1150,95 1050,25 950,75
                    C800,125 700,55 600,95
                    C500,135 400,65 250,100
                    C150,135 50,85 -100,105
                    V120 H1300 Z" 
                  className="fill-pink-300/10 animate-wave-slower"
                />

                {/* White waves - extended past viewBox */}
                <path 
                  d="M-100,25 
                    C50,85 150,15 300,65
                    C450,115 550,45 650,85
                    C800,125 900,55 1050,90
                    C1150,125 1250,75 1300,95
                    V120 H-100 Z" 
                  className="fill-white animate-wave-reverse"
                />
                <path 
                  d="M-100,45
                    C50,105 150,35 300,85
                    C450,135 550,65 650,105
                    C800,145 900,75 1050,110
                    C1150,145 1250,95 1300,115
                    V120 H-100 Z" 
                  className="fill-white/70 animate-wave-slow-reverse"
                />
                <path 
                  d="M-100,65
                    C50,125 150,55 300,105
                    C450,155 550,85 650,125
                    C800,165 900,95 1050,130
                    C1150,165 1250,115 1300,135
                    V120 H-100 Z" 
                  className="fill-white/50 animate-wave-slower-reverse"
                />
              </svg>
            </div>
          </section>

          <section id="about" className="bg-gradient-to-br from-pink-100 to-white py-16 relative overflow-hidden">
            <BackgroundShapes />
            <DecorativeShapes />
            <div className="container mx-auto px-4 relative z-10">
              <h2 className="text-3xl font-bold text-center mb-8 text-pink-800">
                About One Heart Blacktown
              </h2>
              
              <div className="relative w-full max-w-5xl mx-auto aspect-video rounded-lg overflow-hidden shadow-lg mb-12">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/rSFE8hweuWk?si=OZMeNdDqY1neBFNv" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                ></iframe>
              </div>

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

          <section id="blog" className="bg-gradient-to-br from-white to-pink-100 py-16 relative overflow-hidden">
            <BackgroundShapes />
            <DecorativeShapes />
            <div className="container mx-auto px-4 relative z-10">
              <h2 className="text-3xl font-bold text-center mb-8 text-pink-800">
                Latest Blog Posts
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {latestBlogPosts.map((post) => (
                  <Card key={post.id} className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full">
                        <Image
                          src={post.FeaturedImage?.url
                            ? `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${post.FeaturedImage.url}`
                            : "/placeholder.svg?height=400&width=600"}
                          alt={post.Title}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                      <h3 className="text-xl font-semibold mb-2">{post.Title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.Content[0].children[0].text}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(post.PublishDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {post.Author}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 flex justify-center">
                      <Link href={`/blog/${post.Slug}`} passHref>
                        <Button
                          variant="default"
                          className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                        >
                          Read More
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link href="/blog">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-pink-500 text-pink-500 hover:bg-pink-50"
                  >
                    View All Blog Posts
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section id="our-members" className="bg-gradient-to-br from-pink-100 to-white py-16 relative overflow-hidden">
            <BackgroundShapes />
            <DecorativeShapes />
            <div className="container mx-auto px-4 relative z-10">
              <h2 className="text-3xl font-bold text-center mb-8 text-pink-800">
                Our Members
              </h2>
              {membersLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[1, 2, 3].map((n) => (
                    <Card key={n} className="bg-white shadow-lg animate-pulse overflow-hidden">
                      <div className="h-48 bg-pink-100/50" />
                      <CardContent className="relative p-6 mt-12">
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-pink-50 rounded-full border-4 border-white" />
                        <div className="h-6 bg-pink-100/50 rounded w-2/3 mx-auto mb-4" />
                        <div className="h-4 bg-pink-100/30 rounded w-5/6 mx-auto mb-2" />
                        <div className="h-4 bg-pink-100/30 rounded w-4/5 mx-auto mb-6" />
                        <div className="h-10 bg-pink-200/50 rounded w-1/3 mx-auto" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-pink-700 text-lg">No active members found.</p>
                </div>
              ) : (
                <div className={
                  members.length === 1 
                    ? "grid grid-cols-1 max-w-md mx-auto" 
                    : members.length === 2 
                      ? "grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto" 
                      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                }>
                  {members.map((member) => (
                    <Card key={member.id} className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full overflow-hidden">
                      <div className="relative h-48 overflow-hidden bg-gradient-to-r from-pink-300 via-rose-300 to-pink-400 flex-shrink-0">
                        {member.bannerPhoto ? (
                          <Image
                            src={member.bannerPhoto}
                            alt={`${member.name} banner`}
                            fill
                            className="object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <CardContent className="relative p-6 flex flex-col flex-grow">
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                          <div className="w-24 h-24 relative bg-white rounded-full shadow-md overflow-hidden border-4 border-white flex items-center justify-center">
                            {member.logo ? (
                              <Image
                                src={member.logo}
                                alt={`${member.name} logo`}
                                fill
                                className="object-contain bg-white"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-pink-50">
                                <Building2 className="w-10 h-10 text-pink-300" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-12 flex flex-col flex-grow">
                          <h3 className="text-xl font-semibold text-center mb-2 text-pink-800">{member.name}</h3>
                          <p className="text-gray-600 text-center mb-6 line-clamp-4 flex-grow">{member.description || 'No description available.'}</p>
                          <div className="text-center mt-auto">
                            <Button
                              variant="default"
                              className="bg-pink-500 hover:bg-pink-600 text-white transition-colors duration-300 w-full sm:w-auto"
                              onClick={() => {
                                if (member.websiteLink) {
                                  window.open(member.websiteLink, '_blank');
                                } else {
                                  window.location.href = '/members';
                                }
                              }}
                            >
                              {member.websiteLink ? 'Visit Website' : 'Learn More'}
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              <div className="text-center mt-8">
                <Link href="/members">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-pink-500 text-pink-500 hover:bg-pink-50"
                  >
                    View All Members
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section id="events" className="bg-gradient-to-br from-white to-pink-100 py-16 relative overflow-hidden">
            <BackgroundShapes />
            <DecorativeShapes />
            <div className="container mx-auto px-4 relative z-10">
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
                      <p className="text-gray-600 mb-4 line-clamp-3">{stripHtmlTags(event.description)}</p>
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
                      <div className="flex flex-col gap-2 w-full">
                        <Link href={`/events/${event.id}`} passHref>
                          <Button
                            variant="default"
                            className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                          >
                            Learn More
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="w-full border-pink-500 text-pink-500 hover:bg-pink-50"
                          onClick={() => window.open(event.registrationLink, '_blank')}
                        >
                          Register
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link href="/events">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-pink-500 text-pink-500 hover:bg-pink-50"
                  >
                    View All Events
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section id="contact" className="bg-gradient-to-br from-pink-100 to-white py-16 relative overflow-hidden">
            <BackgroundShapes />
            <DecorativeShapes />
            <div className="container mx-auto px-4 text-center relative z-10">
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
      </Layout>
    </div>
  );
}