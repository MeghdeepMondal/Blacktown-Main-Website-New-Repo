import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password, isLogin } = req.body

    if (isLogin) {
      // Login logic
      try {
        const admin = await prisma.admins.findUnique({ where: { email } })
        if (!admin) {
          return res.status(400).json({ message: 'Invalid credentials' })
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password)
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Invalid credentials' })
        }

        const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET!, { expiresIn: '1d' })
        res.status(200).json({ message: 'Login successful', token, adminId: admin.id })
      } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ message: 'Error during login' })
      }
    } else {
      // Signup logic
      try {
        console.log('Signup request received:', req.body);
        const { name, description, address, contactDetails, lat, lng, status } = req.body
        
        // Validate required fields
        if (!email || !password || !name) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)

        console.log('Creating admin request with data:', {
          name,
          email,
          description,
          address,
          contactDetails,
          lat,
          lng,
          status
        });

        const newAdminRequest = await prisma.adminrequests.create({
          data: {
            name,
            email,
            password: hashedPassword,
            description: description || '',
            address: address || '',
            contactDetails: contactDetails || '',
            lat: lat || 0,
            lng: lng || 0,
            status: status || 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })

        console.log('Admin request created successfully:', newAdminRequest);
        res.status(201).json({ 
          message: 'Admin request submitted successfully. Please wait for approval.',
          requestId: newAdminRequest.id
        })
      } catch (error) {
        console.error('Signup error details:', error)
        // Return more detailed error message
        res.status(500).json({ 
          message: 'Error creating admin request', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}