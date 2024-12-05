import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Invalid slug parameter' })
  }

  try {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
    const response = await axios.get(`${strapiUrl}/api/blog-posts`, {
      params: {
        'filters[Slug][$eq]': slug,
        'populate': '*'
      }
    })

    const posts = response.data.data
    if (!posts || posts.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' })
    }

    const post = posts[0]
    res.status(200).json(post)
  } catch (error) {
    console.error('Error fetching blog post:', error)
    res.status(500).json({ error: 'Error fetching blog post' })
  }
}