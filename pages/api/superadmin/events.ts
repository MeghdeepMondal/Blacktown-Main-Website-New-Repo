import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const events = await prisma.events.findMany({
        include: {
          admin: {
            select: {
              name: true,
            },
          },
        },
      })

      const formattedEvents = events.map(event => ({
        ...event,
        adminName: event.admin.name,
      }))

      res.status(200).json({ events: formattedEvents })
    } catch (error) {
      console.error('Error fetching events:', error)
      res.status(500).json({ message: 'Error fetching events' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}