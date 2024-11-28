import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { parse } from 'url'
import { v2 as cloudinary } from 'cloudinary'
import formidable from 'formidable'
import fs from 'fs'

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
  const { query: { id } } = req

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid event ID' })
  }

  if (req.method === 'PUT') {
    const form = formidable({})
    
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err)
        return res.status(500).json({ message: 'Error parsing form data' })
      }

      try {
        const { name, date, frequency, location, description, lat, lng, registrationLink } = fields

        let photoUrl = undefined
        if (files.photo) {
          const file = Array.isArray(files.photo) ? files.photo[0] : files.photo
          const result = await cloudinary.uploader.upload(file.filepath, {
            folder: 'one-heart-blacktown/events',
          })
          photoUrl = result.secure_url
        }

        const updatedEvent = await prisma.events.update({
          where: { id },
          data: {
            name: Array.isArray(name) ? name[0] : name,
            date: new Date(Array.isArray(date) ? date[0] : date),
            frequency: Array.isArray(frequency) ? frequency[0] : frequency,
            location: Array.isArray(location) ? location[0] : location,
            description: Array.isArray(description) ? description[0] : description,
            lat: parseFloat(Array.isArray(lat) ? lat[0] : lat),
            lng: parseFloat(Array.isArray(lng) ? lng[0] : lng),
            registrationLink: Array.isArray(registrationLink) ? registrationLink[0] : registrationLink,
            ...(photoUrl && { photo: photoUrl }),
            updatedAt: new Date(),
          },
        })

        res.status(200).json(updatedEvent)
      } catch (error) {
        console.error('Error updating event:', error)
        res.status(500).json({ message: 'Error updating event' })
      }
    })
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