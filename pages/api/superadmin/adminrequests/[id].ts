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

      const adminRequest = await prisma.adminrequests.update({
        where: { id: String(id) },
        data: { status: action === 'approve' ? 'approved' : 'rejected' }
      })

      if (action === 'approve') {
        await prisma.admins.create({
          data: {
            email: adminRequest.email,
            name: adminRequest.name,
            description: adminRequest.description,
            address: adminRequest.address,
            contactDetails: adminRequest.contactDetails,
            password: adminRequest.password // Note: In a real-world scenario, you'd want to hash this password
          }
        })
      }

      res.status(200).json({ message: `Admin request ${action}d successfully` })
    } catch (error) {
      console.error('Error updating admin request:', error)
      res.status(500).json({ message: 'Error updating admin request' })
    }
  } else {
    res.setHeader('Allow', ['PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}