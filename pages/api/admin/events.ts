// pages/api/admin/events.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { name, description, date, location, frequency, lat, lng, adminId } = req.body;

      const newEvent = await prisma.events.create({
        data: {
          name,
          description,
          date: new Date(date),
          location,
          frequency,
          lat,
          lng,
          adminId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      res.status(201).json(newEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Error creating event' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}