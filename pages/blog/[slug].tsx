import React from 'react'
import { GetServerSideProps } from 'next'
import Image from 'next/image'
import axios from 'axios'
import Layout from '../../components/Layout'
import { format } from 'date-fns'
import { Button } from '../../components/ui/button'
import Link from 'next/link'
import { ChevronLeft, Calendar, User } from 'lucide-react'

interface BlogPost {
  id: number
  documentId: string
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
  }
}

interface BlogPostPageProps {
  post: BlogPost | null
  error?: string
}

export default function BlogPostPage({ post, error }: BlogPostPageProps) {
  if (error) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4 text-red-600">Error</h1>
          <p className="mb-4 text-lg">{error}</p>
          <Link href="/blog" passHref>
            <Button className="bg-pink-500 text-white hover:bg-pink-600 flex items-center">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Blog
            </Button>
          </Link>
        </div>
      </Layout>
    )
  }

  if (!post) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        </div>
      </Layout>
    )
  }

  const { Title, Content, Author, PublishDate, FeaturedImage } = post

  return (
    <Layout>
      <article className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/blog" passHref>
          <Button variant="ghost" className="mb-6 text-pink-600 hover:text-pink-700 flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-6 text-pink-800 leading-tight">{Title}</h1>
        <div className="flex items-center mb-8 text-gray-600">
          <User className="mr-2 h-4 w-4" />
          <span className="mr-4 text-sm">{Author}</span>
          <Calendar className="mr-2 h-4 w-4" />
          <span className="text-sm">{format(new Date(PublishDate), 'MMMM d, yyyy')}</span>
        </div>
        {FeaturedImage && FeaturedImage.url && (
          <div className="mb-10 relative h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${FeaturedImage.url}`}
              alt={Title}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
        <div className="prose prose-lg prose-pink max-w-none">
          {Content.map((section, index) => (
            <p key={index} className="mb-6 leading-relaxed text-gray-800">
              {section.children.map((child) => child.text).join('')}
            </p>
          ))}
        </div>
        <div className="mt-12 flex justify-between items-center">
          <Link href="/blog" passHref>
            <Button className="bg-pink-500 text-white hover:bg-pink-600 flex items-center">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Blog
            </Button>
          </Link>
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            variant="outline"
            className="text-pink-600 border-pink-600 hover:bg-pink-50"
          >
            Back to Top
          </Button>
        </div>
      </article>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string }

  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/blog-posts/${slug}`)
    const post = response.data

    if (!post || !post.Title) {
      console.error('Invalid post data:', post)
      return {
        props: {
          post: null,
          error: 'Blog post not found or invalid',
        },
      }
    }

    return {
      props: {
        post,
      },
    }
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return {
      props: {
        post: null,
        error: 'An error occurred while fetching the blog post',
      },
    }
  }
}