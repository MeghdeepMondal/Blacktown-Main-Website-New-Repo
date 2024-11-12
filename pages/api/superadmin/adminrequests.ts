import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const adminRequests = await prisma.adminrequests.findMany({
        where: { status: 'pending' }
      })
      res.status(200).json(adminRequests)
    } catch (error) {
      console.error('Error fetching admin requests:', error)
      res.status(500).json({ message: 'Error fetching admin requests' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}