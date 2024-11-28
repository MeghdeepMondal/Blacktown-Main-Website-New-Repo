import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

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
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  if (req.method === 'PUT') {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ message: 'Error updating event' });
      }

      try {
        const { name, description, date, location, frequency, lat, lng, adminId } = fields;

        let photoUrl = undefined;
        if (files.photo) {
          const photo = Array.isArray(files.photo) ? files.photo[0] : files.photo;
          const result = await cloudinary.uploader.upload(photo.filepath, {
            folder: 'one-heart-blacktown/events',
          });
          photoUrl = result.secure_url;
        }

        const updatedEvent = await prisma.events.update({
          where: { id },
          data: {
            name: Array.isArray(name) ? name[0] : name,
            description: Array.isArray(description) ? description[0] : description,
            date: new Date(Array.isArray(date) ? date[0] : date),
            location: Array.isArray(location) ? location[0] : location,
            frequency: Array.isArray(frequency) ? frequency[0] : frequency,
            lat: parseFloat(Array.isArray(lat) ? lat[0] : lat),
            lng: parseFloat(Array.isArray(lng) ? lng[0] : lng),
            adminId: Array.isArray(adminId) ? adminId[0] : adminId,
            photo: photoUrl,
            updatedAt: new Date(),
          },
        });

        res.status(200).json(updatedEvent);
      } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Error updating event' });
      }
    });
  } else if (req.method === 'DELETE') {
    try {
      await prisma.events.delete({
        where: { id },
      });

      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: 'Error deleting event' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}