import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import formidable from 'formidable'
import { v2 as cloudinary } from 'cloudinary'

const prisma = new PrismaClient()

// Disable Next.js body parser — formidable handles multipart
export const config = {
  api: {
    bodyParser: false,
  },
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/** Upload a file to Cloudinary and return its secure URL, or undefined if no file. */
async function uploadToCloudinary(
  file: formidable.File | undefined
): Promise<string | undefined> {
  if (!file) return undefined
  const result = await cloudinary.uploader.upload(file.filepath, {
    folder: 'one-heart-blacktown/admins',
  })
  return result.secure_url
}

/** Extract the first string value from a formidable field (which may be an array). */
function field(value: string | string[] | undefined): string {
  if (!value) return ''
  return Array.isArray(value) ? value[0] : value
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const form = formidable({ multiples: false })

  let fields: formidable.Fields
  let files: formidable.Files

  try {
    ;[fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req, (err, f, fi) => {
          if (err) return reject(err)
          resolve([f, fi])
        })
      }
    )
  } catch (err) {
    console.error('Form parse error:', err)
    return res.status(400).json({ message: 'Failed to parse form data' })
  }

  const email = field(fields.email as string | string[])
  const password = field(fields.password as string | string[])
  const name = field(fields.name as string | string[])

  // Validate required fields
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Missing required fields: email, password, name' })
  }

  const description = field(fields.description as string | string[])
  const address = field(fields.address as string | string[])
  const contactDetails = field(fields.contactDetails as string | string[])
  const websiteLink = field(fields.websiteLink as string | string[])
  const lat = parseFloat(field(fields.lat as string | string[])) || 0
  const lng = parseFloat(field(fields.lng as string | string[])) || 0

  try {
    // Upload photos to Cloudinary (both optional)
    const logoFile = files.logo
      ? Array.isArray(files.logo)
        ? files.logo[0]
        : files.logo
      : undefined
    const bannerFile = files.bannerPhoto
      ? Array.isArray(files.bannerPhoto)
        ? files.bannerPhoto[0]
        : files.bannerPhoto
      : undefined

    const [logoUrl, bannerPhotoUrl] = await Promise.all([
      uploadToCloudinary(logoFile),
      uploadToCloudinary(bannerFile),
    ])

    const hashedPassword = await bcrypt.hash(password, 10)

    const newAdminRequest = await prisma.adminrequests.create({
      data: {
        name,
        email,
        password: hashedPassword,
        description,
        address,
        contactDetails,
        websiteLink: websiteLink || null,
        logo: logoUrl || null,
        bannerPhoto: bannerPhotoUrl || null,
        lat,
        lng,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    console.log('Admin request created:', newAdminRequest.id)
    return res.status(201).json({
      message: 'Admin request submitted successfully. Please wait for approval.',
      requestId: newAdminRequest.id,
    })
  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({
      message: 'Error creating admin request',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
