import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { IncomingForm } from 'formidable'
import fs from 'fs/promises'

const prisma = new PrismaClient()

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const form = new IncomingForm()
    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve([fields, files])
      })
    })

    const { name, email, password, description, address, contactDetails, lat, lng } = fields

    if (fields.isLogin === 'true') {
      // Login logic
      try {
        const admin = await prisma.admins.findUnique({ where: { email: email[0] } })
        if (!admin) {
          return res.status(400).json({ message: 'Invalid credentials' })
        }

        const isPasswordValid = await bcrypt.compare(password[0], admin.password)
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Invalid credentials' })
        }

        const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET!, { expiresIn: '1d' })
        res.status(200).json({ message: 'Login successful', token })
      } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ message: 'Error during login' })
      }
    } else {
      // Signup logic
      try {
        const hashedPassword = await bcrypt.hash(password[0], 10)
        let logoBuffer: Buffer | undefined

        console.log('Files:', files);  // Debug log
        
        if (files && files.logo) {
          const logoFile = files.logo;
          console.log('Logo file:', logoFile);  // Debug log
          
          if ('filepath' in logoFile) {
            logoBuffer = await fs.readFile(logoFile.filepath);
          } else if (Array.isArray(logoFile) && logoFile[0]?.filepath) {
            logoBuffer = await fs.readFile(logoFile[0].filepath);
          }
        }

        const newAdmin = await prisma.admins.create({
          data: {
            name: name[0],
            email: email[0],
            password: hashedPassword,
            description: description[0],
            address: address[0],
            contactDetails: contactDetails[0],
            logo: logoBuffer || null,  // Make sure to handle null case
            lat: parseFloat(lat[0]),
            lng: parseFloat(lng[0]),
          },
        })

        const token = jwt.sign({ adminId: newAdmin.id }, process.env.JWT_SECRET!, { expiresIn: '1d' })
        res.status(201).json({ message: 'Admin created successfully', token })
      } catch (error) {
        console.error('Signup error:', error)
        res.status(500).json({ message: 'Error creating admin' })
      }
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}