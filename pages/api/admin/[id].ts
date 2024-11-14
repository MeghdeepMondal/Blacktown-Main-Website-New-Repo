// pages/api/admin/[id].ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid admin ID' });
  }

  if (req.method === 'GET') {
    try {
      const admin = await prisma.admins.findUnique({
        where: { id: id },
        select: {
          id: true,
          name: true,
          email: true,
          description: true,
          address: true,
          contactDetails: true,
          logo: true,
          lat: true,
          lng: true,
        },
      });

      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      const events = await prisma.events.findMany({
        where: { adminId: id },
        orderBy: { date: 'asc' },
      });

      res.status(200).json({ admin, events });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      res.status(500).json({ message: 'Error fetching admin data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}