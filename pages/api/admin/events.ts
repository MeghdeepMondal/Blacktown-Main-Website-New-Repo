// pages/api/admin/events.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const form = formidable({});
    
    try {
      const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      const { name, description, date, location, frequency, lat, lng, adminId, registrationLink } = fields;

      // Upload photo to Cloudinary if provided
      let photoUrl = undefined;
      if (files.photo) {
        const file = Array.isArray(files.photo) ? files.photo[0] : files.photo;
        const result = await cloudinary.uploader.upload(file.filepath, {
          folder: 'one-heart-blacktown/events',
        });
        photoUrl = result.secure_url;
      }

      const newEvent = await prisma.events.create({
        data: {
          name: Array.isArray(name) ? name[0] : name,
          description: Array.isArray(description) ? description[0] : description,
          date: new Date(Array.isArray(date) ? date[0] : date),
          location: Array.isArray(location) ? location[0] : location,
          frequency: Array.isArray(frequency) ? frequency[0] : frequency,
          lat: parseFloat(Array.isArray(lat) ? lat[0] : lat),
          lng: parseFloat(Array.isArray(lng) ? lng[0] : lng),
          adminId: Array.isArray(adminId) ? adminId[0] : adminId,
          registrationLink: Array.isArray(registrationLink) ? registrationLink[0] : registrationLink,
          photo: photoUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      res.status(201).json(newEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Error creating event', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}