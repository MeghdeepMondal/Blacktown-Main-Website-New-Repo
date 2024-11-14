import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid event ID' })
  }

  if (req.method === 'PUT') {
    try {
      const { name, date, location, description, frequency, adminId } = req.body
      
      // Convert the date string to ISO-8601 format
      const isoDate = new Date(date).toISOString()

      const updatedEvent = await prisma.events.update({
        where: { id },
        data: { 
          name, 
          date: isoDate, // Use the converted ISO date
          location, 
          description, 
          frequency,
          adminId
        },
        include: {
          admin: {
            select: {
              name: true,
            },
          },
        },
      })

      // Add the adminName to the response
      const eventWithAdminName = {
        ...updatedEvent,
        adminName: updatedEvent.admin.name,
      }

      res.status(200).json(eventWithAdminName)
    } catch (error) {
      console.error('Error updating event:', error)
      res.status(500).json({ message: 'Error updating event' })
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.events.delete({
        where: { id },
      })
      res.status(200).json({ message: 'Event deleted successfully' })
    } catch (error) {
      console.error('Error deleting event:', error)
      res.status(500).json({ message: 'Error deleting event' })
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}