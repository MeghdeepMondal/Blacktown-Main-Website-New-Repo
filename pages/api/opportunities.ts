import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Fetch all events that have opportunities
      const opportunities = await prisma.events.findMany({
        where: {
          hasOpportunity: true,
          opportunity: {
            not: null
          }
        },
        include: {
          admin: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          date: 'asc'
        }
      })

      return res.status(200).json({ opportunities })
    } catch (error) {
      console.error('Error fetching opportunities:', error)
      return res.status(500).json({ error: 'Failed to fetch opportunities' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}