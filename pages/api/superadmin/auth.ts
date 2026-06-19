import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
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
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'oneheartblacktown@gmail.com'
    if (!SUPERADMIN_EMAIL) {
      console.error('SUPERADMIN_EMAIL not set in environment.')
      return res.status(500).json({ message: 'Server configuration error' })
    }

    if (username !== SUPERADMIN_EMAIL) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check if there is an overridden password hash in the database
    const config = await prisma.superadminconfig.findUnique({
      where: { email: 'superadmin' }
    })

    // Ultimate fallback hash for 'Asdfghjkl@97329735' just in case .env loading fails
    const DEFAULT_HASH = '$2a$10$FBuxtuzXrUfDWamJL6mVuev4g9GhqmV5wT2anBSj9KHb4lnWR8hp2'
    const targetHash = config?.passwordHash || process.env.SUPERADMIN_PASSWORD_HASH || DEFAULT_HASH

    if (!targetHash) {
      console.error('Superadmin password hash not configured in env or DB.')
      return res.status(500).json({ message: 'Server configuration error' })
    }

    // Check if password matches the hash
    const isMatch = await bcrypt.compare(password, targetHash)

    if (!isMatch) {
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