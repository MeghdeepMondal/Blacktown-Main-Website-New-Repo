import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { email, otp } = req.body

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' })
  }

  try {
    const record = await prisma.passwordresetotp.findUnique({ where: { email } })

    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' })
    }

    // Check expiry
    if (new Date() > record.expiresAt) {
      await prisma.passwordresetotp.delete({ where: { email } })
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' })
    }

    // Compare provided OTP against the stored hash
    const isValid = await bcrypt.compare(otp, record.otp)
    if (!isValid) {
      return res.status(400).json({ message: 'Incorrect OTP. Please try again.' })
    }

    // OTP is valid — we intentionally do NOT delete it here so reset-password can re-verify
    return res.status(200).json({ verified: true, message: 'OTP verified successfully.' })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return res.status(500).json({ message: 'Error verifying OTP. Please try again.' })
  }
}
