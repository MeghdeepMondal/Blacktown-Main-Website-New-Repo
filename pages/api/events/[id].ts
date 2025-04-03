import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const event = await prisma.events.findUnique({
        where: { id: String(id) },
        select: {
          id: true,
          name: true,
          description: true,
          date: true,
          location: true,
          photo: true,
          registrationLink: true,
          hasOpportunity: true,
          opportunity: true,
          createdAt: true,
          updatedAt: true,
        }
      })
      
      if (event) {
        // Format dates for JSON response
        const formattedEvent = {
          ...event,
          date: event.date.toISOString(),
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString(),
        }
        
        res.status(200).json({ event: formattedEvent })
      } else {
        res.status(404).json({ message: 'Event not found' })
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      res.status(500).json({ message: 'Error fetching event' })
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.events.delete({
        where: { id: String(id) },
      })
      res.status(200).json({ message: 'Event deleted successfully' })
    } catch (error) {
      console.error('Error deleting event:', error)
      res.status(500).json({ message: 'Error deleting event' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}