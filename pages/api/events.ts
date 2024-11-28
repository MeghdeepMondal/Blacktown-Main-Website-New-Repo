import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import formidable from 'formidable'
import { v2 as cloudinary } from 'cloudinary'

const prisma = new PrismaClient()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const { page = '1', limit = '10', lat, lng, radius } = req.query
        const pageNumber = parseInt(page as string, 10)
        const limitNumber = parseInt(limit as string, 10)
        const skip = (pageNumber - 1) * limitNumber

        let whereClause = {}

        if (lat && lng && radius) {
          const userLat = parseFloat(lat as string)
          const userLng = parseFloat(lng as string)
          const radiusKm = parseFloat(radius as string)

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
          }
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
            photo: true,
            registrationLink: true,
            createdAt: true,
            updatedAt: true,
          },
          skip,
          take: limitNumber,
          orderBy: {
            date: 'asc',
          },
        })

        const totalEvents = await prisma.events.count({ where: whereClause })

        const formattedEvents = events.map(event => ({
          ...event,
          date: event.date.toISOString(),
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString(),
        }))

        res.status(200).json({
          events: formattedEvents,
          totalPages: Math.ceil(totalEvents / limitNumber),
          currentPage: pageNumber,
        })
      } catch (error) {
        console.error('Error fetching events:', error)
        res.status(500).json({ message: 'Error fetching events' })
      }
      break

    case 'POST':
      await new Promise((resolve, reject) => {
        const form = formidable()
        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Error parsing form:', err)
            res.status(500).json({ message: 'Error parsing form data' })
            return resolve(null)
          }

          try {
            const { name, date, frequency, location, description, lat, lng, adminId, registrationLink } = fields

            let photoUrl
            if (files.photo) {
              const file = Array.isArray(files.photo) ? files.photo[0] : files.photo
              const result = await cloudinary.uploader.upload(file.filepath, {
                folder: 'one-heart-blacktown/events',
              })
              photoUrl = result.secure_url
            }

            const now = new Date()

            const event = await prisma.events.create({
              data: {
                name: Array.isArray(name) ? name[0] : name,
                date: new Date(Array.isArray(date) ? date[0] : date),
                frequency: Array.isArray(frequency) ? frequency[0] : frequency,
                location: Array.isArray(location) ? location[0] : location,
                description: Array.isArray(description) ? description[0] : description,
                lat: parseFloat(Array.isArray(lat) ? lat[0] : lat),
                lng: parseFloat(Array.isArray(lng) ? lng[0] : lng),
                adminId: Array.isArray(adminId) ? adminId[0] : adminId,
                registrationLink: Array.isArray(registrationLink) ? registrationLink[0] : registrationLink,
                photo: photoUrl,
                createdAt: now,
                updatedAt: now,
              },
            })

            res.status(201).json({
              ...event,
              date: event.date.toISOString(),
              createdAt: event.createdAt.toISOString(),
              updatedAt: event.updatedAt.toISOString(),
            })
          } catch (error) {
            console.error('Error creating event:', error)
            res.status(500).json({ message: 'Error creating event' })
          }
          resolve(null)
        })
      })
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}