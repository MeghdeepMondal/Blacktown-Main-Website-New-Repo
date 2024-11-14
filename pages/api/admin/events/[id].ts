// pages/api/admin/events/[id].ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  if (req.method === 'PUT') {
    try {
      const { name, description, date, location, frequency, lat, lng, adminId } = req.body;

      const updatedEvent = await prisma.events.update({
        where: { id },
        data: {
          name,
          description,
          date: new Date(date),
          location,
          frequency,
          lat,
          lng,
          adminId,
          updatedAt: new Date(),
        },
      });

      res.status(200).json(updatedEvent);
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ message: 'Error updating event' });
    }
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