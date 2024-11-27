import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const { page = '1', limit = '10', lat, lng, radius } = req.query;
        const pageNumber = parseInt(page as string, 10);
        const limitNumber = parseInt(limit as string, 10);
        const skip = (pageNumber - 1) * limitNumber;

        let whereClause = {};

        if (lat && lng && radius) {
          const userLat = parseFloat(lat as string);
          const userLng = parseFloat(lng as string);
          const radiusKm = parseFloat(radius as string);

          whereClause = {
            AND: [
              {
                lat: {
                  gte: userLat - radiusKm / 111.32,
                  lte: userLat + radiusKm / 111.32,
                },
              },
              {
                lng: {
                  gte: userLng - radiusKm / (111.32 * Math.cos(userLat * (Math.PI / 180))),
                  lte: userLng + radiusKm / (111.32 * Math.cos(userLat * (Math.PI / 180))),
                },
              },
            ],
          };
        }

        const events = await prisma.events.findMany({
          where: whereClause,
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
          skip,
          take: limitNumber,
          orderBy: {
            date: 'asc',
          },
        });

        const totalEvents = await prisma.events.count({ where: whereClause });

        const formattedEvents = events.map(event => ({
          ...event,
          date: event.date.toISOString(),
        }));

        res.status(200).json({
          events: formattedEvents,
          totalPages: Math.ceil(totalEvents / limitNumber),
          currentPage: pageNumber,
        });
      } catch (error) {
        console.error('Error fetching events:', error)
        res.status(500).json({ message: 'Error fetching events' })
      }
      break

    case 'POST':
      try {
        const { name, date, frequency, location, description, lat, lng } = req.body;

        const event = await prisma.events.create({
          data: {
            name,
            date: new Date(date),
            frequency,
            location,
            description,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
          },
        });

        res.status(201).json({
          ...event,
          date: event.date.toISOString(),
        });
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