import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Fetching from Strapi URL:', STRAPI_URL);
    const response = await axios.get(`${STRAPI_URL}/api/blog-posts?populate=*`)
    console.log('Strapi response:', response.data);
    res.status(200).json(response.data)
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
    }
    res.status(500).json({ error: 'Error fetching blog posts', details: error.message, axiosError: error.response?.data })
  }
}