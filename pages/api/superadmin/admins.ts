import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const admins = await prisma.admins.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          description: true,
          address: true,
          contactDetails: true
        }
      })
      res.status(200).json(admins)
    } catch (error) {
      console.error('Error fetching admins:', error)
      res.status(500).json({ message: 'Error fetching admins' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}