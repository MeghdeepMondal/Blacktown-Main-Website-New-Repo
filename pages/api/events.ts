import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const events = await prisma.events.findMany({
          select: {
            id: true,
            name: true,
            date: true,
            frequency: true,
            location: true,
            description: true,
            lat: true,
            lng: true,
          },
        })
        res.status(200).json(events)
      } catch (error) {
        console.error('Error fetching events:', error)
        res.status(500).json({ message: 'Error fetching events' })
      }
      break

    case 'POST':
      try {
        const { name, date, frequency, location, description, lat, lng } = req.body

        const event = await prisma.events.create({
          data: {
            name,
            date: new Date(date),
            frequency,
            location,
            description,
            lat,
            lng,
          },
        })

        res.status(201).json(event)
      } catch (error) {
        console.error('Error creating event:', error)
        res.status(500).json({ message: 'Error creating event' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}