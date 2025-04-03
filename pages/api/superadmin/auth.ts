import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

// In a real application, you would store these securely in environment variables
// and use a proper database for user management
const SUPERADMIN_USERNAME = 'superadmin'
const SUPERADMIN_PASSWORD = 'oneheartblacktown2024'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { username, password } = req.body

    // Validate credentials
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' })
    }

    // Check if credentials match
    if (username !== SUPERADMIN_USERNAME || password !== SUPERADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        username,
        role: 'superadmin'
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    )

    // Return success with token
    return res.status(200).json({
      message: 'Authentication successful',
      token
    })
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}