import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { superadminAuthMiddleware, AuthenticatedRequest } from '../middleware/superadmin-auth'

const prisma = new PrismaClient()

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const adminRequests = await prisma.adminrequests.findMany({
      where: {
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return res.status(200).json(adminRequests)
  } catch (error) {
    console.error('Error fetching admin requests:', error)
    return res.status(500).json({ message: 'Failed to fetch admin requests' })
  }
}

export default superadminAuthMiddleware(handler)