import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    try {
      const { id } = req.query
      const { action } = req.body

      if (action !== 'approve' && action !== 'reject') {
        return res.status(400).json({ message: 'Invalid action' })
      }

      const adminRequest = await prisma.adminrequests.findUnique({
        where: { id: String(id) }
      })

      if (!adminRequest) {
        return res.status(404).json({ message: 'Admin request not found' })
      }

      if (action === 'approve') {
        // Create a new admin entry
        await prisma.admins.create({
          data: {
            name: adminRequest.name,
            email: adminRequest.email,
            password: adminRequest.password,
            description: adminRequest.description,
            address: adminRequest.address,
            contactDetails: adminRequest.contactDetails,
            logo: adminRequest.logo,
            lat: adminRequest.lat,
            lng: adminRequest.lng,
          }
        })

        // Delete the admin request
        await prisma.adminrequests.delete({
          where: { id: String(id) }
        })

        res.status(200).json({ message: 'Admin request approved and admin created successfully' })
      } else {
        // If rejecting, just delete the admin request
        await prisma.adminrequests.delete({
          where: { id: String(id) }
        })

        res.status(200).json({ message: 'Admin request rejected and deleted successfully' })
      }
    } catch (error) {
      console.error('Error updating admin request:', error)
      res.status(500).json({ message: 'Error updating admin request' })
    }
  } else {
    res.setHeader('Allow', ['PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}