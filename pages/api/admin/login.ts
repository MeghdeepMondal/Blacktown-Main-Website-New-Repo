import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    const admin = await prisma.admins.findUnique({ where: { email } })
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password)
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET!, { expiresIn: '1d' })
    return res.status(200).json({ message: 'Login successful', token, adminId: admin.id })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Error during login' })
  }
}
