import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card"
import { Button } from "../components/ui/button" 
import { BookOpen, Calendar, User } from 'lucide-react'
import Layout from '../components/Layout'
import { GetServerSideProps } from 'next'
import axios from 'axios'

interface BlogPost {
  id: number
  Title: string
  Content: Array<{ type: string; children: Array<{ text: string }> }>
  Author: string
  PublishDate: string
  Slug: string
  FeaturedImage: {
    id: number
    documentId: string
    name: string
    url: string
    formats: {
      thumbnail: {
        url: string
      }
      small: {
        url: string
      }
      medium: {
        url: string
      }
    }
  }
}

interface BlogPageProps {
  blogPosts: BlogPost[]
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPage({ blogPosts }: BlogPageProps) {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-100 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-12 text-center text-pink-800 tracking-tight">Our Blog</h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative h-64 w-full">
                    {post.FeaturedImage?.url ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${post.FeaturedImage.url}`}
                        alt={post.Title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="h-64 w-full bg-gradient-to-r from-pink-300 to-purple-300 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-white" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-2xl font-bold text-pink-800 mb-3 line-clamp-2 hover:text-pink-600 transition-colors duration-300">
                    {post.Title}
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <User className="mr-1 h-4 w-4" />
                    <span className="mr-4 font-medium">{post.Author}</span>
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>{formatDate(post.PublishDate)}</span>
                  </div>
                  <p className="text-gray-700 line-clamp-3 mb-4">
                    {post.Content[0].children[0].text}
                  </p>
                </CardContent>
                <CardFooter className="bg-gray-50 px-6 py-4">
                  <Link href={`/blog/${post.Slug}`} passHref className="w-full">
                    <Button className="w-full bg-pink-500 text-white hover:bg-pink-600 transition-colors duration-300 font-semibold py-3 rounded-lg shadow-md hover:shadow-lg">
                      Read More
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/blog-posts?populate=*`)
    const blogPosts = response.data.data

    return {
      props: {
        blogPosts,
      },
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return {
      props: {
        blogPosts: [],
      },
    }
  }
}