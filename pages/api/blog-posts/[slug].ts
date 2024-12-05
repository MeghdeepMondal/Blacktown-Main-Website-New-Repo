import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query

  try {
    console.log('Fetching from Strapi URL:', STRAPI_URL);
    console.log('Fetching blog post with slug:', slug);
    const response = await axios.get(`${STRAPI_URL}/api/blog-posts?filters[slug][$eq]=${slug}&populate=*`)
    console.log('Strapi response:', response.data);
    res.status(200).json(response.data)
  } catch (error) {
    console.error('Error fetching blog post:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
    }
    res.status(500).json({ error: 'Error fetching blog post', details: error.message, axiosError: error.response?.data })
  }
}