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
        const { name, description, address, contactDetails, lat, lng } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)

        const newAdminRequest = await prisma.adminrequests.create({
          data: {
            name,
            email,
            password: hashedPassword,
            description,
            address,
            contactDetails,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            status: 'pending'
          },
        })

        res.status(201).json({ message: 'Admin request submitted successfully. Please wait for approval.' })
      } catch (error) {
        console.error('Signup error:', error)
        res.status(500).json({ message: 'Error creating admin request' })
      }
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}