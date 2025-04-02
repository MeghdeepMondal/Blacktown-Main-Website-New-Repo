import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('Fetching admin requests...');
      
      // The issue is here - status is case-sensitive
      // Your database has "PENDING" but the query is looking for "pending"
      const adminRequests = await prisma.adminrequests.findMany({
        where: { 
          status: 'PENDING' // Changed from 'pending' to 'PENDING'
        }
      })
      
      console.log(`Found ${adminRequests.length} admin requests:`, adminRequests);
      res.status(200).json(adminRequests)
    } catch (error) {
      console.error('Error fetching admin requests:', error)
      res.status(500).json({ message: 'Error fetching admin requests', error: error instanceof Error ? error.message : 'Unknown error' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}