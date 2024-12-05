import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Image from 'next/image'

interface BlogPostData {
  attributes: {
    title: string
    content: string
    author: string
    publishDate: string
    featuredImage: {
      data: {
        attributes: {
          url: string
        }
      }
    }
  }
}

export default function BlogPostPage() {
  const router = useRouter()
  const { slug } = router.query
  const [blogPost, setBlogPost] = useState<BlogPostData | null>(null)

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (slug) {
        try {
          const response = await axios.get(`/api/blog-posts/${slug}`)
          setBlogPost(response.data.data[0])
        } catch (error) {
          console.error('Error fetching blog post:', error)
        }
      }
    }

    fetchBlogPost()
  }, [slug])

  if (!blogPost) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-100">
      <header className="bg-black text-white shadow">
        {/* Header content (unchanged) */}
      </header>

      <main className="container mx-auto px-4 py-8">
        <article className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-pink-800">{blogPost.attributes.title}</h1>
          <p className="text-gray-600 mb-4">By {blogPost.attributes.author} on {new Date(blogPost.attributes.publishDate).toLocaleDateString()}</p>
          {blogPost.attributes.featuredImage && (
            <div className="relative h-64 w-full mb-8">
              <Image
                src={blogPost.attributes.featuredImage.data.attributes.url}
                alt={blogPost.attributes.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blogPost.attributes.content }} />
        </article>
      </main>

      <footer className="bg-black text-white py-8 mt-12">
        {/* Footer content (unchanged) */}
      </footer>
    </div>
  )
}