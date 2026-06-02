import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import formidable from 'formidable'
import { v2 as cloudinary } from 'cloudinary'

const prisma = new PrismaClient()

export const config = {
  api: { bodyParser: false },
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function uploadFile(file: formidable.File): Promise<string> {
  const result = await cloudinary.uploader.upload(file.filepath, {
    folder: 'one-heart-blacktown/admins',
  })
  return result.secure_url
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid admin ID' })
  }

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
  } catch {
    return res.status(400).json({ message: 'Failed to parse upload' })
  }

  try {
    const updateData: { logo?: string; bannerPhoto?: string } = {}

    const logoFile = files.logo
      ? Array.isArray(files.logo) ? files.logo[0] : files.logo
      : undefined
    const bannerFile = files.bannerPhoto
      ? Array.isArray(files.bannerPhoto) ? files.bannerPhoto[0] : files.bannerPhoto
      : undefined

    if (logoFile) updateData.logo = await uploadFile(logoFile)
    if (bannerFile) updateData.bannerPhoto = await uploadFile(bannerFile)

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No photo files provided' })
    }

    const updatedAdmin = await prisma.admins.update({
      where: { id },
      data: { ...updateData, updatedAt: new Date() },
      select: {
        id: true, name: true, email: true, description: true,
        address: true, contactDetails: true, logo: true,
        bannerPhoto: true, websiteLink: true, lat: true, lng: true,
      },
    })

    return res.status(200).json(updatedAdmin)
  } catch (error) {
    console.error('Photo upload error:', error)
    return res.status(500).json({
      message: 'Error uploading photo',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
