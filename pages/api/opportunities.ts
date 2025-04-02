import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Fetch all events that have hasOpportunity set to true
      const opportunities = await prisma.events.findMany({
        where: {
          hasOpportunity: true,
          // Only include future events or events happening today
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        select: {
          id: true,
          name: true,
          date: true,
          location: true,
          description: true,
          opportunity: true,
          photo: true,
          registrationLink: true,
          admin: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          date: 'asc'
        }
      })

      // Format the data for the frontend
      const formattedOpportunities = opportunities.map(opp => ({
        id: opp.id,
        name: opp.name,
        date: opp.date.toISOString(),
        location: opp.location,
        description: opp.description,
        opportunity: opp.opportunity || '',
        photo: opp.photo || undefined,
        registrationLink: opp.registrationLink || undefined,
        adminName: opp.admin.name
      }))

      res.status(200).json(formattedOpportunities)
    } catch (error) {
      console.error('Error fetching opportunities:', error)
      res.status(500).json({ message: 'Error fetching opportunities', error: error instanceof Error ? error.message : 'Unknown error' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}