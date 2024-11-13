import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { adminId: string }
    const { id } = req.query

    if (decoded.adminId !== id) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const admin = await prisma.admins.findUnique({
      where: { id: String(id) },
      select: {
        id: true,
        name: true,
        email: true,
        description: true,
        address: true,
        contactDetails: true,
      }
    })

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' })
    }

    res.status(200).json(admin)
  } catch (error) {
    console.error('Error verifying token:', error)
    res.status(401).json({ message: 'Invalid token' })
  }
}