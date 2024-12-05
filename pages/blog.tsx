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
  FeaturedImage?: {
    data?: {
      attributes?: {
        url?: string
        formats?: {
          thumbnail?: {
            url?: string
          }
        }
      }
    }
  }
}

interface BlogPageProps {
  blogPosts: BlogPost[]
}

export default function BlogPage({ blogPosts }: BlogPageProps) {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-100 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-center text-pink-800">Our Blog</h1>
          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="relative h-48 w-full mb-4">
                    {post.FeaturedImage?.data?.attributes?.formats?.thumbnail?.url ? (
                      <Image
                        src={`http://localhost:1337${post.FeaturedImage.data.attributes.formats.thumbnail.url}`}
                        alt={post.Title}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-lg"
                      />
                    ) : (
                      <div className="h-48 w-full bg-pink-200 flex items-center justify-center rounded-t-lg">
                        <BookOpen className="h-12 w-12 text-pink-500" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="flex items-center text-2xl font-bold text-pink-800">
                    <BookOpen className="mr-2 text-pink-500" />
                    {post.Title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <User className="mr-1 h-4 w-4" />
                    <span className="mr-4">{post.Author}</span>
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>{new Date(post.PublishDate).toISOString().split('T')[0]}</span>
                  </div>
                  <p className="mb-4 text-gray-700 line-clamp-3">
                    {post.Content[0].children[0].text}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href={`/blog/${post.Slug}`} passHref>
                    <Button className="w-full bg-pink-500 text-white hover:bg-pink-600 transition-colors duration-300">
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
    const response = await axios.get('http://localhost:3000/api/blog-posts')
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